# Asset provenance

All final raster scenes were generated through the required Aigram transit endpoint:

```text
POST https://chat.aiwaves.tech/aigram/api/gen-image
Origin: https://aigram.app
```

The only source references were single-character crops from the user-supplied `/Users/yin/Desktop/UMe品牌手册.pdf` or a transit-generated UMe scene derived from those crops. No ComfyUI or local generation workflow was used.

## Character reference uploads

- Pink rabbit: `https://images.aiwaves.tech/uploads/1784396382160-k04sji1k7zd.jpg`
- MelonMick: `https://images.aiwaves.tech/uploads/1784396383830-tt0k1opksjm.jpg`
- LemonShark: `https://images.aiwaves.tech/uploads/1784396385389-bqpu7v81dgf.jpg`
- GuacPiggy: `https://images.aiwaves.tech/uploads/1784396386784-7c4axgzm258.jpg`
- MangoChick: `https://images.aiwaves.tech/uploads/1784396388766-q3paajpmh7.jpg`
- BubblePearl: `https://images.aiwaves.tech/uploads/1784396390133-s2sj1jce6br.jpg`

## Transit outputs adopted in the game

- Initial pink-rabbit scene (superseded) → `_production/rejected/hero-original.png`: `https://cdn.aiwaves.tech/prod/telegram/avatar/0/1784396420787278.webp`
- Revised pink-rabbit scene → `public/hero.png`: `https://cdn.aiwaves.tech/prod/telegram/avatar/0/1784398587356675.webp`
- MelonMick branch → `public/frames/end_melon.png`: `https://cdn.aiwaves.tech/prod/telegram/avatar/0/1784396511103790.webp`
- LemonShark branch → `public/frames/end_lemon.png`: `https://cdn.aiwaves.tech/prod/telegram/avatar/0/1784396520556759.webp`
- GuacPiggy branch → `public/frames/end_guac.png`: `https://cdn.aiwaves.tech/prod/telegram/avatar/0/1784396530076653.webp`
- MangoChick branch → `public/frames/end_mango.png`: `https://cdn.aiwaves.tech/prod/telegram/avatar/0/1784396540086344.webp`
- BubblePearl branch → `public/frames/end_pearl.png`: `https://cdn.aiwaves.tech/prod/telegram/avatar/0/1784396550382418.webp`
- Pink rabbit catches the cup → `public/frames/end_climax.png`: `https://cdn.aiwaves.tech/prod/telegram/avatar/0/1784396627080565.webp`
- Customer receives the cup → `public/frames/result_delivered.png`: `https://cdn.aiwaves.tech/prod/telegram/avatar/0/1784396668471057.webp`
- Poster base → `public/poster.png`: `https://cdn.aiwaves.tech/prod/telegram/avatar/0/1784397379072508.webp`

The final poster remains a transit-generated raster scene. `_production/finish_poster.py` only adds the exact game title and exports the 160 × 160 review thumbnail; it does not construct the poster artwork.

## Rejected or superseded assets

- Empty van background `1784395481684610.webp` and programmatically composed mascot layers were superseded after user review because the character layers looked pasted onto the scene.
- Multi-character collage frames are not used by the final game.
- A transit-generated milk-tea macro remains the final results image; a family group shot is intentionally not required.
