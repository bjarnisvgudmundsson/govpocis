import fs from "fs";
import path from "path";
import https from "https";

const outDir = path.resolve("public/synth-faces");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const STABILITY_KEY = process.env.STABILITY_API_KEY;
if (!STABILITY_KEY) {
  console.error("❌ No STABILITY_API_KEY in .env.local");
  process.exit(1);
}

const ids = Array.from({ length: 35 }, (_, i) => `p-${String(i + 1).padStart(3, "0")}`);

async function generate(id: string): Promise<void> {
  const prompt = "photorealistic portrait of a fictional person, neutral background, plain lighting, head and shoulders, 3:4 ratio, no text, no watermark";

  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      prompt,
      output_format: "jpeg",
      seed: Math.floor(Math.random() * 1e9)
    });

    const req = https.request("https://api.stability.ai/v2beta/stable-image/generate/portrait", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STABILITY_KEY}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
      }
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const json = JSON.parse(data);
            const img = json.image || json.images?.[0];
            if (!img) {
              reject(new Error("No image returned"));
              return;
            }
            const buf = Buffer.from(img, "base64");
            fs.writeFileSync(path.join(outDir, `${id}.jpg`), buf);
            console.log("✅ Generated:", id);
            resolve();
          } catch (e) {
            reject(new Error(`Failed to parse JSON: ${data}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  for (const id of ids) {
    const f = path.join(outDir, `${id}.jpg`);
    if (fs.existsSync(f)) {
      console.log("⏩ Exists:", id);
      continue;
    }
    try {
      await generate(id);
    } catch (e) {
      console.error("❌ Failed:", id, e);
    }
    await new Promise(r => setTimeout(r, 3000)); // polite delay
  }
  console.log("✅ All portraits generated");
})();
