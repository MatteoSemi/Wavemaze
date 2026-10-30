# Validation evidence

This report distinguishes independent mathematical checks, simulation replays, traversal checks and browser checks. A source-document proof is not treated as an implementation test. Results below are updated only after commands finish.

## Current run

Simulation run completed on 30 October 2026 using Node 24.19.0: `npm test` (`node --import tsx tests/game.test.ts`) — **47 named tests passed, 0 failed, 0 skipped**. The test process completed with exit code 0. Browser and rendering evidence is recorded separately below by the main implementer; simulation success alone is not browser or human-playtest evidence.

## Test method

- Finite-state checks independently enumerate ordering constraints, switch parity sets, route pairs, three-crate partitions, switch assignments and complementary stencils.
- Breadth-first search explores the actual two-courier state space for the shared movement program; it keeps couriers active after touching goals.
- Per-room solution replays use public simulation actions. Joint exits must remain incomplete with one player waiting, then complete only after both arrive with active final conditions.
- Grid traversal checks drive the movement API along collision-checked routes, rather than teleporting players.
- Full restart uses a fresh `createGame(level)` state, matching the UI restart implementation. Factory determinism and absence of cross-instance state leakage are checked for every room. Local reset scopes and recovery receive extra assertions for the packet and program boards, reversible switches, wrong sequences, charge dead end, routing, phased key delivery and crate supports.
- Browser automation and visual review are maintained by the main implementer. Their results must not be inferred from these Node tests.

## Campaign matrix

| ID | Source mechanic | Solution replay | Joint exit | Reset/recovery | Traversal |
|---|---|---|---|---|---|
| 01 | Cross-readable buttons | Pass | Pass | Fresh room | Pass |
| 02 | Simultaneous pads | Pass | Pass | Fresh room | Pass |
| 03 | Alternating sequence | Pass | Pass | Fresh room | Pass |
| 04 | Split dictionary | Pass | Pass | Fresh room | Pass |
| 05 | Retractable bridge and crates | Pass | Pass | Fresh room | Pass |
| 06 | Freely rearrangeable rail | Pass | Pass | Fresh room | Pass |
| 07 | Combined map | Pass | Pass | Fresh room | Pass |
| 08 | Rotated board | Pass | Pass | Fresh room | Pass |
| 09 | Coupled lamp toggles | Pass | Pass | Fresh room | Pass |
| 10 | Passing bay | Pass | Pass | Fresh room | Pass |
| 11 | Alternating bridge power | Pass | Pass | Fresh room | Pass |
| 12 | Shared-junction exclusion | Pass | Pass | Fresh room | Pass |
| 13 | Two balanced platforms | Pass | Pass | Fresh room | Pass |
| 14 | Modulo-four gears | Pass | Pass | Fresh room | Pass |
| 15 | Delayed packets and confirmed ticks | Pass | Pass | Fresh room | Pass |
| 16 | Explicit logical submission | Pass | Pass | Fresh room | Pass |
| 17 | Charge conversions | Pass | Pass | Fresh room | Pass |
| 18 | Coupled complementary stencils | Pass | Pass | Fresh room | Pass |
| 19 | Routing budget | Pass | Pass | Fresh room | Pass |
| 20 | Key and phased traversals | Pass | Pass | Fresh room | Pass |
| 21 | Temporary-to-permanent supply | Pass | Pass | Fresh room | Pass |
| 22 | Occupied junctions and parking | Pass | Pass | Fresh room | Pass |
| 23 | Shared 12-command program | Pass | Pass | Fresh room | Pass |
| 24 | Powered access gates | Pass | Pass | Fresh room | Pass |
| 25 | Circuit, routing and dock latches | Pass | Pass | Fresh room | Pass |

## Recorded implementation checks

All 25 solution replays use collision-checked BFS paths and the real `move` API for character traversal, `interact` for physical controls, and `grab` for physical crate placements. No replay teleports players or sets a solved flag. The program board uses public `act` with explicit command values for editing; execution still uses the real interpreter and physical step console. Each replay powers both exits, puts Cool in its exit and asserts no completion, then puts Warm in its exit and asserts joint completion.

The factory/reset test checks fresh consistent initial state for all 25 rooms; it does not imply that every possible wrong plan has been searched. Additional reset/recovery cases cover room 3/4 mistakes, room 9 reversals, rejected submissions, room 10/22 occupied routes, room 15 bad arrival and local reset, room 17 dead end, room 20 phase safety and key handoff, room 21 permanent support, room 23 rewind, room 24 return corridors, and room 25 crate/power withdrawal.

Independent enumeration verifies the unique order (6), crate partition (13), switch assignments (16), compatible routes (12/19), gear counts modulo four (14), stencil complement (18), and switch parity sets (9/24/25). The real game handlers are additionally enumerated for 6/9/12/14/16/18/19. A finite state search through actual gated/phase switch handlers checks room 24. The room 23 shortest-path claim is verified both independently and by replaying candidate programs through the actual game interpreter: minimum length is 12. Parity uniqueness does not mean unique operation ordering.

Adversarial checks include a joint pressure hold interrupted before one second, repeated tick confirmation by one role, unavailable siding, incomplete submissions, an occupied cart node, unsafe phase change, blocked command waits, continuing courier movement at a goal, grabbing/pushing another role's held crate, ignored carried weight, bridge selector lock during crossing, removal of final dock support, wrong-phase re-docking, and circuit/route supply loss.

## Traversal defects found and repaired

- Room 8: Warm's rotated goal originally led through blocked map cells. The exit corridor now leaves the goal below the board before turning toward the exit.
- Room 21: the final bridge initially placed R beyond a support dependency. R now sits on the stable middle island; Q→R happens before P→S, preserving the source solution.
- Room 24: a switch could extinguish its own access gate and trap its operator. A neutral one-way return permits leaving the control alcove while powered entry remains enforced.

All three failed physical replays were rerun after their fixes and now pass. Room 18 was also tightened to require a contiguous five-section crossing, and crossing-time selector changes are rejected.

## Limits of this test layer

- All rooms are traversed through simulation controls; only representative scenarios are expected to receive real browser keyboard automation.
- Spatial layouts are implementation choices, not pixel-for-pixel source maps. See `spec-corrections.md`.
- The test script deliberately avoids the `tsx` CLI's IPC server because this sandbox rejects its socket. Direct Node loading runs and reports all named tests.
- Browser viewport/font/colour-channel rendering, focus, held-input deduplication, pause overlays, storage failures and browser-engine coverage require the separate browser report. No human testers have yet established enjoyment or difficulty.

## Two-person playtest checklist

Human enjoyment, communication quality and difficulty have not been established by automation. A human session should check:

1. Play rooms 1–5 without developer solutions. Can each person explain what only they can read and identify their partner's devices with neutral labels?
2. Try moving both characters while both action keys are held. Note keyboard combinations that fail because of physical rollover; remap if necessary.
3. Deliberately choose a wrong sequence, retract a bridge, move a crate off a support and take the charge courier to its dead end. Can both players recover using visible feedback?
4. In rooms 7–8, can partners establish coordinates and rotation without looking across the divider?
5. In rooms 11, 20 and 21, does the leading player understand when to become the supporting operator?
6. In rooms 15 and 23, can partners plan deliberate steps without interpreting a timer as a reflex challenge?
7. In rooms 24–25, verify that gated controls and final crate supports are understandable, reachable and maintainable.
8. Test both 1280×720 and a smaller desktop window, long play sessions, pause/manual, background tabs, restart confirmation and Continue after closing the browser.
9. Record per-room completion time, requests for help, misleading feedback, accidental solo shortcuts, recovery difficulty and moments of useful discussion. Judge productive reasoning separately from interface confusion.

## Production and browser verification

- `npm ci --ignore-scripts` completed from the lockfile (21 packages). This is also the saved environment install command.
- `npm run build` passed TypeScript and Vite production bundling. The final build has local CSS, JavaScript, two fonts and favicon; no gameplay service is required.
- `npm test` completed with 47 named tests, 0 failures and 0 skips.
- `GAME_URL=http://127.0.0.1:4173 npm run test:browser` exercises the production preview. The final run reports 13 checks, Chromium 154.0.8037.57, and no uncaught page or console errors. Its machine-readable evidence is `browser-results.json`.

Browser checks cover simultaneous held movement, one-shot action deduplication, two nearly simultaneous shared switch operations, pause/manual timer freezing, held-input clearing, restart cancellation and confirmation, a complete real-keyboard Room 1 solution with one-player waiting and joint progression to Room 2, saved Continue, duplicate-key rejection/remapping, blocked/corrupted storage, all 25 rooms rendered at 1280×720, 1920×1080 and 960×640, blur pause, and high-DPI rendering at device scale factor 2. No horizontal clipping was observed in those 75 room/viewport combinations. Long private text remains vertically scrollable when needed.

The channel test compares the actual Cool canvas pixels for hidden lamp B before/after its state changes and asserts unchanged pixels and absence of the private ON reading in Cool's status. Private inscription arrays remain distinct across every room. This is a representative leakage test; code inspection also checks hidden entity values/on states and route diagrams. It is not a formal information-flow proof.

The browser completion screenshot uses an explicit development-state rendering fixture, clearly separated from the real solution/traversal tests. It proves the final overlay renders, not that a human completed the campaign. Manual/settings screenshots and high-DPI output were also inspected. Firefox and Safari/WebKit were unavailable and are **untested**; Chromium does not establish their compatibility.

## Visual review

Actual rendered menu, rooms 1/8/23/25 at the three desktop sizes, and preview rooms 12/13/17/19/25 at 1920×1080 were inspected. The manual, settings and completion fixture were reviewed separately. The art uses material-coloured stone/wood edges, two gold door straps with square rivets, a stepped arch and ring handle; dungeon sprites and floors adapt the references to a coherent small grid. Both views use identical integer canvas scale with smoothing disabled. Cool's hood/diamond and Warm's cap/square provide redundant character identity. There are no stock watermarks, remote fonts, gradients or soft lighting effects in new assets.

Issues found and corrected: a missing favicon caused one browser console error; fixed with a local icon. Full-width fractional title-canvas scaling was capped to native 512 pixels at desktop sizes. The first 2× laptop layout pushed key controls far below the fold; short windows now use matching 1× room canvases. Small explanatory type now uses the companion font. Slot/cradle/station IDs were clarified. Route wires were rerouted around unrelated junctions. Manual focus previously scrolled its initial view to the bottom; it now focuses the dialog at scroll position zero.

**Remaining visual/usability limits:** 1× room labels are small in short windows, with the nearest-device HUD providing readable names; use a taller window for 2× art. Very long late-room status/history or inscriptions may require vertical scrolling, with both views retained side by side. The documented palette is an intentional blue-slate adaptation rather than an exact copy of the purple dungeon reference. Bundled GIF frame-by-frame and skill integrity checks were unavailable; source reference matching is visual, not a claim of recovered exact texels. No human two-person testing, physical keyboard rollover, long-session difficulty or enjoyment study has been performed.
