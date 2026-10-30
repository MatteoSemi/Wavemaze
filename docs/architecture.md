# Architecture and editing guide

The game is a small deterministic shared-state simulation with an independent Canvas renderer and an HTML interface. There is no backend, network multiplayer, runtime art service or game framework.

## Files and ownership

| File | What to edit |
|---|---|
| `src/game.ts` | Shared state, factory, spatial movement/collision, carrying, actions, timers, reset and completion |
| `src/levels.ts` | Ordered IDs, exact room titles, objective, private clue arrays and contextual tips |
| `src/render.ts` | Palette `C`, sprites, tile texture, private visual states, room and title rendering |
| `src/main.ts` | Menus, manual/settings, two canvases, controls, input clearing, pause, transitions and save boundaries |
| `src/storage.ts` | Defaults, physical-key names, guarded local storage and save validation |
| `src/style.css` | HTML layout, stepped/hard material controls, fonts and responsive sizes |
| `tests/game.test.ts` | All-room solution replay, collision-checked physical walking, adversarial cases and search/enumeration |
| `tests/browser.mjs` | Real browser input, menus, save/remap, responsive screenshots and storage-failure checks |

`Game` holds both roles and all machinery. Room definitions use two clue arrays; `getView(game, player)` only returns that player's permitted clues/readings. Neutral operation history can be shared. Keep private state out of entity labels, shared HUDs, accessible labels and feedback. `worldTile` supplies visible geometry; `canWalk` additionally enforces unseen map restrictions. Rendering never decides puzzle completion.

The 16×12 grid uses 16-pixel tiles. Movement is discrete and repeats while held. `nearest` chooses a usable device on the player's tile or one orthogonal tile away, preferring distance then ID, and excludes wall-separated devices. `interact` uses it; `act` is the deterministic operation handler used by both real interaction and tests. `act` itself does not enforce distance, so ordinary UI must call `interact`, not expose arbitrary `act` calls. Tests traverse to devices and use `interact` except explicit program editing and state-space enumeration.

Crates share their carrier's tile while held and only provide support after release. The six balance-room crates synchronize positions between both views. The other rooms have explicitly separate lanes but shared dependencies. Screen-relative movement rotates the full Warm board in room 8. Paths and phase controls provide stable waiting nodes.

`tick` receives seconds and caps elapsed steps to avoid background time jumps. Pause/manual/settings/confirmation/transition states stop `tick` and all input. Held keys clear on blur, visibility change and every overlay. Browser repeat events cannot trigger repeated one-shot operations. The next room loads only when both exit conditions hold and both positions occupy exits. Long press resets are not implemented.

## Edit an existing room: room 1

1. In `levels.ts`, change room 1's clue text only if the intended input changes. `clues[0]` is what Cool can read; it describes Warm's controls. `clues[1]` describes Cool's controls.
2. In `createGame` case 1, `buttons` defines A/B/C geometry. Change coordinates there or extend `buttons` if the controls need a different arrangement. Keep them collision-reachable.
3. In `act` case 1, the correct Cool and Warm inputs latch separately. If changing the answer, update both the actual condition and its partner's clue.
4. `refresh` case 1 opens exits when both latches are set. The common completion rule still requires both adventurers in their doorways; never bypass this.
5. Update the room 1 solution replay and its wrong-input assertions. Run `npm test`, then use both real keyboard controls in the browser. Check each view for private clue leakage and inspect a screenshot.

Changing only the clue or only the logic would create an inconsistent puzzle; the replay is designed to catch that.

## Add another room using existing components

This deliverable keeps exactly 25 rooms. For a future extension, append a `LevelDefinition`, extend the factory's allowed range and add a straightforward switch case using existing `button`, `pad`, `crate`, `both`, `lamps` helpers. Add only the state needed for that mechanic. Define `act` changes and derive live exits in `refresh`. Reuse the common collision, crate, pause and joint-exit rules rather than copying an engine.

Titles flow into the UI from `levels.ts`; update the fixed replay/save range validation and developer selection, and write a collision-checked replay in `tests/game.test.ts`. Update the campaign matrix and designer-only solution. If the new room uses an existing device kind, the renderer already handles it; new kinds need a distinct silhouette and private-channel policy. Document any changed campaign length in the README and local-save format before release.

## Art, fonts and local operation

Original sprites are deterministic drawing functions. Alter `door`, `character`, `crate`, `device`, `stone` and `floor` for their specific subjects. Do not smooth contours or introduce CSS gradients. `scripts/make-font.py` turns the renderer's original 5×7 alphabet into `public/assets/archive-pixel.ttf`; FontTools is needed only to regenerate it, not to run or build the game. The readable companion font is DejaVu Sans Mono; its license is bundled.

`npm ci` is the repeatable installation path. `npm run build` type-checks and bundles imports; Vite copies `public` assets. The production `dist` folder can be served by any local static server. Gameplay makes no outbound requests. Do not create another worktree for normal cloud tasks: each environment is already isolated; use the existing `/workspace/Wavemaze` checkout.
