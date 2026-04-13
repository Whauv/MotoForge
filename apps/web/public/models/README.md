# MotoForge 3D Asset Library

This folder is the canonical home for production motorcycle and mod-part `.glb`
assets used by the MotoForge viewer.

## Structure

```text
public/models/
├── asset-manifest.json
├── bikes/
│   └── *.glb
└── parts/
    └── *.glb
```

## Current Runtime Behavior

- The app still uses placeholder model URLs from the seeded database.
- The viewer falls back to procedural placeholder geometry when a seeded URL points
  at the placeholder CDN domain.
- Once real assets are ready, update the seed data to use the matching local URLs
  from `asset-manifest.json`, reseed the database, and restart the API.

## Naming Rules

- Use lowercase kebab-case filenames.
- Keep one base bike model per seeded motorcycle.
- Keep one `.glb` file per mod part when possible.
- If a part is reused across multiple bikes, keep a single shared file in
  `public/models/parts/`.

## Alignment Rules

- Bike models should be centered near the world origin.
- Front wheel should face positive X, and the bike should stand upright on Y.
- Mod part origins must line up to the same coordinate space as the target bike.
- Scale all assets consistently before export so overlays do not float or clip.

## Next Activation Step

1. Place the real `.glb` files into `bikes/` and `parts/`.
2. Update `apps/api/seed/seed.py` model URLs to the matching `/models/...` paths.
3. Rerun `python seed/seed.py`.
4. Restart both API and web servers.
