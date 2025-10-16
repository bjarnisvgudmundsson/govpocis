/**
 * Batch-generate synthetic portraits for prisoner IDs.
 * Uses Stability.AI by default, Replicate as fallback.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const synthDir = path.resolve('public/synth-faces');
const mapPath = path.resolve('src/app/data/prisonerPhotos.json');
const ids = Array.from({ length: 35 }, (_, i) => `p-${String(i + 1).padStart(3, '0')}`);

const STABILITY_KEY = process.env.STABILITY_API_KEY;
const REPLICATE_KEY = process.env.REPLICATE_API_TOKEN;

const promptBase =
  'photorealistic passport-style portrait of a fictional person, neutral background, soft lighting, evenly-lit, no watermark, no text, 3:4 ratio';

interface StabilityResponse {
  image?: string;
  images?: string[];
}

interface ReplicateResponse {
  output?: string[];
}

async function fetchJSON(url: string, options: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse JSON: ${data}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function fetchBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function generateStability(id: string): Promise<void> {
  if (!STABILITY_KEY) throw new Error('STABILITY_API_KEY not set');

  const body = JSON.stringify({
    prompt: promptBase,
    output_format: 'jpeg',
    seed: Math.floor(Math.random() * 1e9)
  });

  const json = await fetchJSON('https://api.stability.ai/v2beta/stable-image/generate/portrait', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STABILITY_KEY}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    },
    body
  }) as StabilityResponse;

  const b64 = json.image || json.images?.[0];
  if (!b64) throw new Error('No image returned from Stability AI');

  const buf = Buffer.from(b64, 'base64');
  fs.writeFileSync(path.join(synthDir, `${id}.jpg`), buf);
  console.log('✅ Generated via Stability:', id);
}

async function generateReplicate(id: string): Promise<void> {
  if (!REPLICATE_KEY) throw new Error('REPLICATE_API_TOKEN not set');

  const body = JSON.stringify({
    version: 'tstramer/realistic-vision-v6',
    input: { prompt: promptBase }
  });

  const json = await fetchJSON('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${REPLICATE_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    },
    body
  }) as ReplicateResponse;

  const url = json.output?.[0];
  if (!url) throw new Error('No output URL from Replicate');

  const buf = await fetchBuffer(url);
  fs.writeFileSync(path.join(synthDir, `${id}.jpg`), buf);
  console.log('✅ Generated via Replicate:', id);
}

async function main() {
  if (!fs.existsSync(synthDir)) {
    fs.mkdirSync(synthDir, { recursive: true });
  }

  const map: Record<string, string> = {};
  const placeholderPath = path.join(synthDir, 'placeholder.jpg');

  for (const id of ids) {
    const file = path.join(synthDir, `${id}.jpg`);
    if (fs.existsSync(file)) {
      map[id] = `/synth-faces/${id}.jpg`;
      console.log('⏭️  Skipping existing:', id);
      continue;
    }

    try {
      if (STABILITY_KEY) {
        await generateStability(id);
      } else if (REPLICATE_KEY) {
        await generateReplicate(id);
      } else {
        // No API keys available, use placeholder
        if (fs.existsSync(placeholderPath)) {
          fs.copyFileSync(placeholderPath, file);
          console.log('⚪ Placeholder for', id);
        } else {
          console.warn('⚠️  No placeholder available for', id);
        }
      }
      map[id] = `/synth-faces/${id}.jpg`;
    } catch (e) {
      console.error('❌ Error generating', id, e);
    }

    // Polite delay to avoid rate limits
    await new Promise(r => setTimeout(r, 3000));
  }

  // Update mapping file
  const mapDir = path.dirname(mapPath);
  if (!fs.existsSync(mapDir)) {
    fs.mkdirSync(mapDir, { recursive: true });
  }
  fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));
  console.log('✅ Mapping updated:', mapPath);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
