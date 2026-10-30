# Validation evidence

This report distinguishes independent mathematical checks, simulation replays, traversal checks and browser checks. A source-document proof is not treated as an implementation test. Results below are updated only after commands finish.

## Current run

Simulation run completed on 30 October 2026 using Node 24.19.0: `node --import tsx tests/game.test.ts` — **45 named tests passed, 0 failed, 0 skipped**. The test process completed with exit code 0. Browser and rendering evidence is recorded separately below by the main implementer; simulation success alone is not browser or human-playtest evidence.

## Test method

- Finite-state checks independently enumerate ordering constraints, switch parity sets, route pairs, three-crate partitions, switch assignments and complementary stencils.
- Breadth-first search explores the actual two-courier state space for the shared movement program; it keeps couriers active after touching goals.
- Per-room solution replays will use public simulation actions. Joint exits must remain incomplete with one player waiting, then complete only after both arrive with active final conditions.
- Grid traversal checks will drive the movement API along collision-checked routes, rather than teleporting players.
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
