# Synthetic Face Placeholders

This directory contains synthetic portrait placeholders for the prisoner directory.

## Setup

1. Download or generate a neutral synthetic portrait (photorealistic, passport-style)
2. Save it as `placeholder.jpg` in this directory
3. The generator script will use this as a template for all prisoner IDs

## Generating Real Portraits

Run the generator script with API keys:

```bash
# Add keys to .env.local
STABILITY_API_KEY=your_key_here
# OR
REPLICATE_API_TOKEN=your_key_here

# Generate portraits
npm run gen:faces
```

The script will:
- Generate unique synthetic portraits for each prisoner ID
- Save them as `p-001.jpg`, `p-002.jpg`, etc.
- Update the mapping in `src/app/data/prisonerPhotos.json`

## Current Status

The system works with placeholders (SVG or duplicate JPG files).
Each prisoner will show the placeholder until real synthetic portraits are generated.
