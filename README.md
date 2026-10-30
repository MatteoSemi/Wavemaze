# Colour Spectrum

A complete 25-room, two-player cooperative puzzle adventure. Two side-by-side views share one simulation. Cool reads blue/green information; Warm reads red/amber. Talk to your partner, operate the machines, and reach both exits together.

## Play online

Once GitHub Pages is enabled, open https://matteosemi.github.io/Wavemaze/ in a desktop browser. No installation is needed. Two players share one keyboard; click Enter the archive to begin.

One-time repository-owner setup: open https://github.com/MatteoSemi/Wavemaze/settings/pages, choose **Deploy from a branch**, select **gh-pages** and **/ (root)**, then Save. Wait for GitHub's Pages deployment to finish before opening the game link. If GitHub reports that the repository's visibility or plan does not support Pages, follow its hosting eligibility instructions.

The `main` branch contains source; `gh-pages` contains the built website. `npm run build:pages` produces a build with the correct `/Wavemaze/` asset paths for this hosting location. Future releases must rebuild and update the `gh-pages` branch.

## Run locally

Verified with **Node 24.19.0**, npm 11.9.0 and Chromium on Linux. Node 22.12+ or 24 is recommended.

```sh
npm ci
npm run dev
```

Open the address printed by Vite in a desktop browser. This is a local web application, not a tested `file://` application. No account, backend or gameplay network connection is required. All fonts and artwork are local. The project has not been deployed.

```sh
npm run build       # TypeScript check and production build into dist/
npm run preview     # Serve the production build locally
npm test            # Named logic, all-room solution and physical traversal checks
npm run test:browser # Chromium interaction, storage and viewport checks; dev server must run
```

Browser checks use Playwright. They select `CHROMIUM_PATH` when set, `/usr/bin/chromium` when available, otherwise Playwright's installed Chromium. On a machine without a browser, run `npx playwright install chromium` first. `GAME_URL` overrides the default test address on port 5173. Firefox and Safari/WebKit have not been tested.

## Play

| | Cool, left | Warm, right |
|---|---|---|
| Move | W A S D | Arrow keys |
| Interact | E | Enter |
| Grab / release crate | Q | Right Shift |

**H** opens the field guide and pauses both players. **Escape** pauses/resumes. Restart Room asks for confirmation. Settings supports conflict-checked physical-key remapping. Completed rooms and settings save on this device; in-room moves reset when continuing. Storage failure does not prevent play.

Use a desktop window at least **960×640**. The views fit at matching integer pixel scales; shorter windows use 1× room canvases. Larger windows provide more room detail. Long inscriptions and controls remain scrollable if needed. Mobile controls are outside scope.

The Field guide is available on the menu and during play; [MANUAL.md](MANUAL.md) has the same rules. A shared monitor cannot stop looking at the other view; sharing clues is the intended play style.

## Editing and verification

- [Architecture and worked room-editing guide](docs/architecture.md)
- [Art direction and reference adaptation](docs/art-direction.md)
- [Validation evidence and 25-room matrix](docs/validation.md)
- [Progress checkpoint and resume steps](docs/PROGRESS.md)
- [Specification interpretations](docs/spec-corrections.md)

Designer solutions are deliberately separate in `docs/developer-solutions.md`. They do not appear in ordinary help. To inspect any room during development, add `?dev=1` to the local address and use the Developer room selector. This mode also exposes `window.spectrum` for testing; ordinary play exposes no test controls.

No human two-person playtest has yet established enjoyment, difficulty, or keyboard rollover on your hardware. Use the checklist in the validation report.
