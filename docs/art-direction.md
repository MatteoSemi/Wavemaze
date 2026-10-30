# Art direction

The supplied door image is the primary visual source, matching the skill’s R03 detailed material-sprite family. Directly observed construction: a stepped masonry arch, blue-grey stone chips and dark joints, vertical wooden planks, two gold straps with square rivets, a small ring handle, and material-coloured boundaries rather than a uniform black contour. Source-image compression means sampled colours are approximate style representatives, not recovered authoring colours.

The reference-design-style specification, component guide, inventory, tokens and verification checklist were read. Its skill-hosted original binary files and detail crops were not accessible through the skill reader in this environment; the attached door was inspected in the conversation instead. R07’s documented top-down dungeon composition and R08’s documented hard metal UI are secondary proposed adaptations, not claims of original-image inspection.

## Production decisions

- Rooms use 16×16 logical-pixel tiles and a 256×192 canvas per player. The title illustration uses 512×240 logical pixels. Canvas image smoothing is disabled. CSS uses nearest-neighbour rendering and matching integer scales for both player views.
- Stone: `#abb7c5`, `#8294a5`, `#596b7e`, mortar `#374654`. Wood: `#ca8762`, `#b56f55`, `#6e3d38`. Fittings: `#feae33`, `#f4e25a`.
- Quiet neutral blue-slate floors (`#29353d`, `#303d45`, `#253139`) and dark exterior (`#111a22`) are a proposed adaptation to keep movement and machinery clear. They intentionally avoid saturating large surfaces.
- Cool accents use turquoise `#72d2c3` / `#397e8d`; Warm uses amber `#efa55b` / `#a65c47`. These are new communication colours. Accent area stays small. Hidden-channel markings render as neutral physical bodies; hidden values and powered colours are omitted.
- Doors retain stepped stone, vertical grain, two straps, square rivets and ring negative space. Crates use the same wood/metal ramps. Levers, consoles, pressure plates, keys, rails, carts and gates have separate silhouettes.
- Characters are original 16-pixel adventurers with distinct silhouettes: Cool has a hood and diamond chest emblem; Warm has a cap and square emblem. These are small dungeon characters, not copies of the large R01/R02 mascots.
- Canvas labels use an original built-in 5×7 uppercase bitmap alphabet with one-pixel tracking. No source font identity is claimed. HTML text uses the separately bundled interface font.
- Flat colour regions, rectangular chips, filled right-angle shapes and hard material shadows only. No gradients, bloom, soft shadows, antialiased contours or remote assets. Torch animation changes discrete pixels at a modest rate.
- Nearest-device focus uses four hard cream corner markers. Powered states use channel-coloured face pixels; unpowered uses neutral grey. Open doors show a dark opening and retracted wooden leaf. Exit support is always derived from current simulation conditions.

## Editing

Colours, sprites and canvas typography live in `src/render.ts`. `C` holds the finite material ramps. `door`, `character`, `crate` and `device` build original pixel shapes; `floor` and `stone` build deterministic tile textures. Keep integer coordinates and preserve material-coloured edges when changing them. `drawTitle` is original decorative artwork and contains no puzzle solution.

Visual verification results and unresolved limitations belong in `docs/validation.md`; this design document alone does not establish screenshot fidelity or usability.
