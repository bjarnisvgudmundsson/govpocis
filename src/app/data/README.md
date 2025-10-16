# Prisoner Photo Data

This directory contains mapping data for synthetic prisoner portraits.

## Important Notice

**These portraits are synthetic and AI-generated.** They do **not** depict real people. They are generated using Stability AI or Replicate APIs with prompts designed to create fictional, non-real person representations. These images are used solely for demo visualization in the Fangelsismálastofnun (Prison Administration) project.

## Files

- `prisonerPhotos.json` - Maps prisoner IDs to their synthetic portrait paths

## Generating Synthetic Portraits

The system works immediately with placeholder images. To generate unique photorealistic synthetic portraits:

### Setup

1. Copy `.env.local.example` to `.env.local`
2. Add your API key(s):
   - **Stability AI** (preferred): Get key from https://platform.stability.ai/
   - **Replicate** (fallback): Get token from https://replicate.com/account/api-tokens

### Generate Portraits

```bash
npm run gen:faces
```

This script will:
- Check for existing images and skip them
- Generate new synthetic portraits for missing prisoner IDs
- Save them as JPG files in `public/synth-faces/`
- Update the mapping in `prisonerPhotos.json`

### Without API Keys

If no API keys are provided, the system will:
- Use the existing placeholder images
- Still show the "Gervimynd (AI)" badge
- Work perfectly for development and testing

## Usage in Code

The mapping is imported and used in the stjori page:

```typescript
import photoMap from '@/app/data/prisonerPhotos.json';

// Map photos to prisoners
const withPhotos = rows.map(p => {
  const mapped = (photoMap as Record<string,string>)[p.id];
  const base = process.env.NEXT_PUBLIC_PHOTO_BASE ?? '';
  const url = mapped ? `${base}${mapped}` : undefined;
  return {
    ...p,
    photoUrl: url || fallbackUrl,
    syntheticPhoto: Boolean(mapped)
  };
});
```

## Accessibility

All synthetic portraits include:
- Proper alt text: "Gervimynd af [Name] (ekki raunveruleg manneskja)"
- Visual badge: "Gervimynd (AI)" in the modal view
- Tooltip explaining the image is AI-generated

## Maintenance

- To regenerate specific portraits: Delete the corresponding JPG file and run `npm run gen:faces`
- To regenerate all: Delete all JPG files in `public/synth-faces/` and run `npm run gen:faces`
- The generator respects existing files to avoid unnecessary API calls

## Ethics & Privacy

These synthetic portraits are generated specifically to:
- Avoid using any real person's likeness
- Prevent privacy concerns in demo/test environments
- Provide realistic UI testing without real PII
- Clearly label all images as artificial

**Never use real prisoner photos in this system.**
