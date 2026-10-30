# Local asset provenance

- `archive-pixel.ttf`: original 5×7 bitmap alphabet authored in `src/render.ts`, converted with `scripts/make-font.py`. Generated font and new pixel illustrations are original project assets; no source-reference image or watermark was extracted.
- `field-mono.ttf`: DejaVu Sans Mono from the environment's fonts package. See `FONT-LICENSE.txt` for copyright, redistribution terms and upstream license.
- Pixel-art sprites, room tiles and title art are deterministic original Canvas code in `src/render.ts`. Visual guidance comes from the user's supplied door, lever, dungeon, foliage, key, character and UI reference images. Reference art itself is not bundled as game art.
