# Codex implementation prompt — Colour Spectrum Co-op

@ponytail
@Reference Design Style

Build a complete, playable web-based two-player cooperative puzzle game from this specification and the 25-level design document included below. Implement and verify the game, rather than stopping at a plan, mockup, engine prototype, or a few sample levels.

## 1. Skills, sources, and working approach

- Read and apply the installed `ponytail` skill in its default full mode: build the smallest complete implementation, reuse existing code and platform features, avoid unnecessary dependencies and abstractions, and verify important behavior. Simplicity must not remove requested mechanics, levels, visual quality, accessibility, or checks.
- Find and read the installed skill named `Reference Design Style` or `reference-design-style`, including its actual reference assets and any applicable instructions. Apply its concrete rules to the game, UI, characters, environments, and interactive objects.
- If that design skill is missing, unfinished, or contains only template placeholders, state this honestly. Use supplied visual references if available; otherwise use the explicit pixel-art fallback in section 6. Do not claim to have applied rules that do not exist. Do not stop implementation solely because this optional style source is incomplete.
- Read `colour-spectrum-coop-puzzle-design.md` in full. Its complete contents are also reproduced in the appendix so this prompt can be reused without losing the puzzle definitions. Keep its level IDs, sequence, clue splits, mechanics, and logical solutions. Treat designer solutions as development material, hidden from normal gameplay.
- The requirements in this prompt govern the product; the design document governs individual puzzle logic. Preserve intentional differences between levels. Resolve minor layout omissions with documented, testable choices. If a contradiction makes a level impossible, explain and make the smallest correction that preserves its cooperative reasoning; record the change.
- Inspect any existing project and repository instructions first. Reuse its stack and conventions where suitable. If starting fresh, prefer TypeScript, Canvas 2D for the world, ordinary HTML/CSS for accessible menus, and lightweight local development tooling. Use a game library only if it materially reduces complexity.
- Make routine implementation choices independently. Ask only for missing information that blocks a correct implementation. Finish all 25 levels; checkpoints are progress records, not a substitute for completion.

## 2. Core game and scope

Create a 2D, top-down, pixel-art puzzle adventure for two people playing simultaneously on one computer with one keyboard. This is local cooperative multiplayer, with two side-by-side views in the same browser window. Remote networking, accounts, matchmaking, chat, and a backend are outside this request.

There are two persistent roles:

- **Player 1 — Cool:** left screen; perceives blue and green puzzle information.
- **Player 2 — Warm:** right screen; perceives red and amber/yellow puzzle information.

They share a coordinated game state. A switch, crate, route selection, phase change, or action in one player's area must genuinely affect the relevant machinery or routes in the other player's area. Render both views from the same simulation, including explicitly separate boards or lanes where a level calls for them. Do not implement two unrelated games or two copies that drift apart.

Cooperation must depend on exchanging information and taking useful actions. One player must not be able to complete the campaign alone through an obvious UI shortcut. Some puzzles intentionally emphasize one operator while the other interprets clues; preserve this and alternate responsibilities across the campaign.

## 3. Asymmetric colour perception

Implement visibility as an explicit, consistent rule attached to puzzle information and entities, not merely a warm or cool overlay on the screen.

- Both players see neutral floors, walls, collision boundaries, object bodies, junction identifiers, doors, and safe waiting areas.
- Cool sees cool-channel clues and readings. Warm sees warm-channel clues and readings. A clue visible to one player may describe a device the other player controls.
- An unreadable marking may appear as a neutral plate or unlit indicator when its physical presence matters. It must not reveal its hidden text, value, state, or colour through a tooltip, outline, animation, contrast difference, shared HUD, accessibility label, or ordinary manual.
- Keep private information private within each view. Shared progress indicators may show only information intended to be shared by the level design.
- Geometry remains visible, but colour-specific restrictions, connectivity, permissions, and states may require the partner's explanation. Unseen restrictions must safely block movement; do not introduce invisible lethal obstacles.
- Use neutral letters, numbers, shapes, and junction markers as a vocabulary for communication. Redundant shapes and labels may clarify information a player is allowed to see, but must not expose the other channel's clues.
- Do not let tinting, shaders, decorative lighting, or palette substitutions make hidden-channel information readable or make allowed information indistinguishable.
- Keep these abilities stable across all levels. Explain that a shared monitor cannot physically prevent looking at the partner's view; cooperation is the intended play style.

## 4. Input and interaction

Use the following defaults and display them in the manual and relevant on-screen prompts:

| Action | Player 1 — Cool | Player 2 — Warm |
|---|---|---|
| Move | W, A, S, D | Arrow keys |
| Interact / confirm / operate nearest device | E | Enter |
| Grab / release movable object | Q | Right Shift |

Shared controls: Escape pauses or resumes; H opens the manual and pauses; a visible Restart Room button asks for confirmation before resetting the shared room. Use a separate local puzzle-reset interaction where the design specifies one. Avoid single-key destructive resets during ordinary movement.

- Both players must move and interact at once without one input blocking the other.
- Register movement continuously, and one-shot interactions on key press so holding a key does not toggle a switch repeatedly.
- Give a clear focus or highlight for the nearest usable device and its action. Define interaction range and priority consistently; wall-separated devices cannot be operated through walls.
- Implement crate movement and grabbing consistently. Grid-snapped pushes/pulls or constrained dragging are acceptable if every required placement is achievable and reversible. Respect special cart, courier, rail, and command-board controls where specified.
- In rotated-board levels, movement is screen-relative and follows the specified rotation.
- Prevent arrow-key scrolling while gameplay has focus. Preserve normal keyboard navigation in menus and text controls. Clear held inputs on pause, blur, and tab changes to prevent stuck movement; do not replay stale inputs after resuming.
- Provide a simple key-remapping option and show the actual bindings in prompts. Reject conflicting bindings. Keep the defaults above. Browser key reporting should be considered when handling right Shift and different keyboard layouts.
- Include a short simultaneous-input check in the manual because physical keyboard rollover can limit some key combinations.

## 5. Campaign, rooms, and joint progression

Implement all 25 levels in the supplied order. Build recognisable top-down rooms with visible doors, machines, routes, and meaningful traversal. Logic boards may be devices within rooms; the whole game must not become a sequence of disconnected form panels.

- Introduce one mechanic clearly before combining it with others. Preserve the document's gradual progression and changing support roles.
- A room has a clear objective, appropriate player-specific clues, feedback for device changes, and a recoverable starting state.
- When puzzle conditions are met, show which exit conditions are satisfied. Follow the source's exact door-latching and temporary-power rules; do not make every door permanently open after one successful condition.
- A player may reach a safe exit waiting area first, but cannot advance to the next level alone. Transition only after both players satisfy their respective exit conditions and reach their exit zones. Recheck any conditions that must remain active at departure.
- Retain control for a waiting player if they may still be needed to help their partner. Do not freeze a character at an intermediate destination unless the level explicitly requires it; Level 23 couriers must remain subject to commands after touching a goal.
- Use a coordinated door transition so both players enter the next room together. Finish Level 25 with a joint completion screen.
- Pause freezes the shared simulation and any timers for both players. Manual, settings, reset dialogs, and room transitions must not let the world continue advancing behind them.
- Save unlocked progress and settings locally, preferably at completed-room boundaries. Continue starts both players in a consistent room state. Explain what is saved. Handle unavailable or corrupted browser storage without preventing play.
- Supply Start, Continue when available, manual/settings access, pause/resume, restart room, return to menu, and a replay selector for unlocked levels. Keep full campaign access available through a separate development mode for testing.

Required level inventory; consult the appendix for every exact rule and solution:

| ID | Level | Main implementation requirement |
|---|---|---|
| 01 | The Missing Labels | Cross-readable button clues and individually latched correct inputs |
| 02 | Meet in the Middle | Two correct occupied pads held together for one second |
| 03 | Taking Turns | Alternating six-input sequence and precise mistake feedback |
| 04 | The Shared Dictionary | Symbol-to-button translation distributed across views |
| 05 | Leave Something Behind | Crate support, retractable bridge, safe destination island |
| 06 | An Order Neither Player Knows | Five freely rearrangeable tiles and split ordering constraints |
| 07 | Two Incomplete Maps | Combined restrictions on matching 4-by-3 grids |
| 08 | Your Right Is My Down | Correctly rotated map, markers, and screen-relative movement |
| 09 | Every Switch Changes Two Things | Reversible lamp toggles and operation history |
| 10 | The Passing Bay | Stepwise carts, track occupancy, and usable siding |
| 11 | Hand Over the Bridge | Two selectors, alternating bridge power, safe crossings |
| 12 | The Junction Cannot Be Shared | Cross-operated route selection and junction conflicts |
| 13 | Equal Weight, Different Information | Six labelled crates, two three-cradle platforms, discrete weights |
| 14 | Coupled Gears | Three modulo-four dials and coupled lever effects |
| 15 | Arrive Together, Start Apart | Unequal packet delays and jointly confirmed discrete ticks |
| 16 | The Door of Exclusions | Split logical rules and explicit configuration submission |
| 17 | A Charge That Changes Colour | Charge-state-dependent routing and recoverable dead end |
| 18 | The Complementary Bridge | Complementary stencils, coupled selectors, safe preview |
| 19 | Enough Power for Both | Shared-hub conflict and five-unit routing budget |
| 20 | Return to the Same Place Differently | Key, safe phase switching, far-side control, both traversals |
| 21 | Borrowed Support | Temporary crate support becoming permanent through a key latch |
| 22 | Nobody Can Finish First | Occupied junctions, parking bay, shared visit condition, entry gates |
| 23 | One Program, Two Mazes | Shared editable 12-command program, blocked-command waits, step preview |
| 24 | A Circuit You Must Walk Through | Coupled lamp states, powered access gates, alternating phases |
| 25 | Keep Both Exits Open | Combined circuit, routing budget, phase-specific crate docking and persistent latches |

## 6. Art direction and readability

Follow the completed Reference Design Style skill and supplied references wherever applicable. Extract concrete decisions into a short `docs/art-direction.md`: palette, tile/sprite dimensions, outline treatment, shading, typography, spacing, and device states. Use one coherent style across menus and gameplay.

If no usable style guidance exists, apply this fallback:

- Crisp, top-down pixel art with a consistent logical pixel grid; use 16-by-16 or 32-by-32 tiles and compatible character sprites.
- Neutral dark stone/metal rooms, restrained material shading, readable silhouettes, a limited palette, cool blue/green and warm red/amber machinery accents.
- Use real pixel-sized clusters and stepped contours. Disable canvas image smoothing and use nearest-neighbour sprite scaling. Fit viewports with letterboxing when necessary to avoid stretched pixels or clipped HUDs.
- Keep a stable camera scale and matching apparent pixel sizes on both halves. Distinguish the characters by silhouette or emblem as well as colour.
- Doors, crates, buttons, pressure pads, handles, levers, bridges, and consoles must be immediately distinguishable. Define idle, focused, pressed, powered, blocked, latched, and complete states wherever relevant.
- Use modest animations for walking, switching, power transmission, door opening, and shared transitions. Feedback must reveal allowed information only. Avoid visual clutter and distracting flashes.
- Use a readable locally bundled font with proper licensing. Menus and manual text may use a readable companion font. Keep interface text legible at laptop scale.
- No emoji substitutes for final game assets, blurred raster enlargements, inconsistent icon sets, remote font dependencies, or placeholder rectangles in the delivered game.

Keep the split-screen divider clear, with player name/role and current controls on the appropriate side. Show level number, title, and concise objectives without giving away private clues. Test the interface at 1280-by-720 and 1920-by-1080, plus a smaller desktop viewport; preserve both views and all controls. If a minimum window size is necessary, give a useful resize message. Mobile touch controls are outside scope.

## 7. Manual, help, and feedback

Provide an in-game manual accessible from a clearly labelled book/help control on the menu and during play, plus a `MANUAL.md` file.

Explain movement, interaction, grabbing, special board controls, pause, restart, saving, both-exit progression, and the colour-perception rules. Teach how neutral labels support communication. Include keyboard rollover and focus troubleshooting.

Use contextual onboarding for new mechanics. Explain what an object does without disclosing the solution. Keep clues inspectable and instructions available. Normal help and the manual must not contain designer solutions. Put full solutions in a separate developer document. Optional hints, if implemented, must be explicitly requested and staged.

Successful actions, invalid actions, unavailable routes, and reset effects need understandable feedback. Timed cooperation should use generous windows; retain discrete jointly confirmed steps where the source specifies them. Do not replace reasoning puzzles with precision platforming or reflex challenges.

## 8. Maintainable implementation

Keep the source easy to edit in later iterations, without creating an oversized engine. Separate simulation from rendering so puzzle logic can be tested without drawing a frame.

Suggested boundaries, adapting names and grouping to the actual project:

- `src/game/`: shared state, update loop, movement/collision, interaction, reset and completion rules.
- `src/render/`: drawing, cameras, assets, player-specific visibility and feedback.
- `src/levels/`: ordered room definitions, clue-channel assignments, geometry, device configuration, and genuinely unique level rules.
- `src/ui/`: menus, HUD, manual, pause, settings, and progress selection.
- `src/input/` and `src/storage/`: keep these separate only if their size warrants it.
- `assets/`: local sprites, tiles, fonts, and any audio, with provenance/licences.
- `tests/`: meaningful logic, progression, and browser checks.
- `docs/`: architecture/editing guide, art direction, developer solutions, validation report, and progress checkpoint.

Use typed, declarative level data for repeating mechanisms. Reuse devices such as switches, pads, crates, doors, selectors, and phase gates. Keep specialized logic straightforward; avoid both 25 copied engines and an elaborate generic scripting language.

Keep clue visibility, collision geometry, and logical device state distinct. Centralize tile sizing and colour rules. State changes should be deterministic for a given input sequence. Render animations must not decide logical completion. Crate weights, simultaneous actions, gate occupancy, and latch behavior must have explicit rules.

Document where to change colours and sprites, movement and bindings, room layouts and clues, puzzle conditions, and the level order. Include a worked guide for editing one existing room and adding another using existing components.

## 9. Browser behavior and local operation

Provide a complete source project with exact install, development, production-build, preview, and test commands, and a lockfile for dependencies. Use straightforward commands such as `npm install`, `npm run dev`, `npm run build`, and `npm run test`, adapting them to the chosen stack.

The game must run locally in a desktop browser. A small local static/dev server is acceptable; explain that setup rather than promising `file://` support unless it is actually tested. After installation, all gameplay assets must be local and gameplay must not require external services or internet access. Do not publish or deploy this project as part of this task.

Check available Chrome/Chromium, Firefox, and Safari/WebKit targets when tooling supports them. State the exact browser engines tested and any untested targets; do not claim Safari coverage from Chromium alone. Handle resize, device pixel ratio, focus loss, pause, and background tabs without broken rendering, teleporting movement, or runaway timers.

## 10. Verification: logic, traversal, input, and visual checks

Run actual checks against the implementation, fix failures, and rerun affected checks. The source document's mathematical verification is useful input, not evidence that your implementation works.

### Logic and campaign checks

- Execute each level's documented solution using the real game rules and establish that both players can leave.
- Cover all 25 levels in a validation matrix: source ID, implemented status, solution replay result, joint-exit check, reset/recovery result, and known issues.
- Validate finite state puzzles by enumeration or search where practical, particularly Levels 6, 9, 12–14, 16, 18–19, and the circuits in 24–25. Verify the Level 23 shared-program goal and 12-command minimum under its actual rules. Distinguish parity sets from unique action orderings.
- Test wrong inputs, reversals, incomplete submissions, duplicate/held interactions, phase changes, occupied routes, and switches operated near-simultaneously.
- Verify Level 15 tick travel and matching arrivals; Level 18 coupled-selector transitions; Level 20 key delivery and second-player traversal; Level 21 permanent supply latch; Level 24 gate access during intermediate states; and Level 25 crate-supported exits across phases.
- Confirm that one player at an exit never advances the room alone, and that final required supports remain effective when both leave.
- Confirm full room restart restores both players, movable objects, device states, clocks, attempt gates, and transient animations. Local puzzle resets must have a clear, appropriate scope.

### Traversal and browser checks

- Test actual movement, collision, interaction range, reachable controls, crate routes, safe islands, and both exit paths. An abstract solver that teleports players or bypasses gates is not a traversal test.
- Use browser automation through real inputs for representative movement and simultaneous cooperation, menu/manual/pause flows, room reset, progression, and saving/resume. Exercise every room's traversal through the simulation or browser; state which route each check uses.
- Check both colour views for correct clue visibility and unintended information leakage, including HUDs, tooltips, accessibility labels, and animation states.
- Check keyboard focus, simultaneous held inputs, one-shot interactions, remapping, blur/resume, repeated room transitions, resize, and storage failures.
- Run type checks, production build, and relevant automated tests. Fix missing assets, uncaught errors, and warnings that indicate broken behavior.

### Visual and usability review

- Inspect actual rendered screens at the specified viewport sizes. Review both split views, early and late rooms, rotated boards, active machinery, menus, manual, and completion state.
- Check pixel sharpness, sprite consistency, allowed-colour distinction, contrast, text clipping, label readability, interaction feedback, camera bounds, and reachable UI controls.
- Inspect every room for unclear objectives, misleading feedback, excessive walking, unrecoverable crate placement, deadlocks, and accidental shortcuts that remove the need for the partner's information. Revise and record meaningful fixes.
- Judge difficulty separately from mathematical solvability. Human two-player playtesting is needed to establish enjoyment and the real difficulty curve. If no human testers are available, give a concrete two-person playtest checklist and identify unverified assumptions; do not invent playtest findings.

Keep automated checks proportional and meaningful. Prefer tests of shared mechanics and actual per-level rules over brittle pixel snapshots or tests that merely repeat implementation constants. Any test-only controls must be separated from ordinary play and must not replace input or traversal checks.

## 11. Milestones and continuity

Work through a complete vertical slice first: one playable room, two independent controls, shared effects, asymmetric clues, real collisions, and a coordinated door transition. Validate it, then implement the remaining rooms in manageable groups and finish with campaign, visual, and browser verification.

Maintain `docs/PROGRESS.md` after meaningful milestones. Record completed levels/features, relevant source paths, commands and results, known failures, unresolved decisions, and the exact next steps. Preserve source and working assets, not just a narrative summary. Commit milestones when working in a suitable Git repository, without overwriting unrelated work. If interrupted, leave an honest runnable checkpoint and resume from it when work continues; never label a partial campaign complete.

## 12. Deliverables and completion criteria

Deliver:

1. The full runnable source and local assets, with all 25 playable rooms.
2. A concise README with exact setup/run/build/test commands and the verified runtime version.
3. In-game manual and `MANUAL.md`.
4. Architecture and level-editing documentation, including the worked example.
5. Developer-only puzzle solutions and a record of any necessary specification corrections.
6. A validation report with the 25-level matrix, actual command results, tested browsers/viewports, representative visual-review findings, known limitations, and a human playtest checklist where needed.
7. An updated progress checkpoint.

Completion means: both players can play simultaneously, receive genuinely different information, affect each other's puzzle state, solve and traverse all 25 rooms, and advance together; the visual style and UI are consistent; the code is structured for modification; and important behavior has been checked with recorded evidence.

Conclude with how to run the game, what was verified, and a short statement of anything untested or still risky. Do not promise bug-free behavior or proven difficulty/enjoyment without evidence. Keep working until the requested implementation and checks are complete, unless an actual blocker prevents further progress and is clearly documented.

---

# Appendix — Complete 25-level source specification

The following is the supplied `colour-spectrum-coop-puzzle-design.md`, preserved in full. Its historical verification claims describe the design document; independently check the game implementation as required above.


# Colour Spectrum Co-op Puzzle Game — 25-Level Design

**Date:** 30 October 2026  
**Status:** Puzzle design proposal; not implemented or playtested.

## Project brief

Design a small two-player, two-dimensional cooperative game with split-screen views. One player uses WASD and the other the arrow keys, with separate interaction or grab keys where required. Players perceive different parts of the colour spectrum and must communicate to solve puzzles. The game should have approximately 25 increasingly demanding but solvable levels.

This document contains the complete proposed progression, including each level's appearance, information split, logic, designer solution, purpose and implementation requirements. Solutions are development notes, not instructions to show players.

## Shared rules and assumptions

Use **two consistent colour filters**: one player sees green and blue (“Cool”), the other sees red and amber (“Warm”). Keep these abilities throughout the game so players can develop a shared vocabulary.

- **Geometry remains visible to both players.** Colour hides information about machinery, routes and permissions, rather than hiding unexpected lethal obstacles.
- **Clues can describe the other player's controls.** For example, an amber inscription might tell Warm which button Cool must press.
- **Use neutral identifiers:** letters on switches, symbols on objects and recognisable junction markers. Players need a way to describe what their partner cannot see.
- **Allow local resets, persistent clues and safe waiting places.** Timing puzzles should use generous windows or discrete steps.
- **Both players must reach the exit.** Alternate who interprets information, operates machinery and travels through the room.

These designs suit top-down 2D rooms with movable crates and grid-based machinery. This is a proposed implementation direction, not a requirement of the original brief. A shared split screen encourages communication, although it cannot prevent players from looking at their partner's view.

The progression increases the amount of information and the number of interacting rules. The exact difficulty curve remains a playtesting question.

## Level 1 — The Missing Labels

- **Layout and information:** Each player faces three neutral buttons, A–C. Warm sees an inscription identifying Cool's correct button; Cool sees the equivalent instruction for Warm.
- **Logic and checked solution:** Warm's inscription says “Cool: B”; Cool's says “Warm: C.” Pressing those two buttons opens the exits. Each correct input stays registered.
- **Purpose and implementation:** Establish the central discovery: something meaningless on your screen can be useful on your partner's. Give clear, separate confirmation for each correct button.

## Level 2 — Meet in the Middle

- **Layout and information:** Each lane contains four pressure pads, A–D. Again, the correct pad for each player is identified only in their partner's colours.
- **Logic and checked solution:** Cool must occupy B while Warm occupies D. Both pads must remain occupied together for one second, after which the doors latch open.
- **Purpose and implementation:** Introduce simultaneous cooperation. Make the pads large enough that standing still is easy, and show a shared filling indicator while both conditions are satisfied.

## Level 3 — Taking Turns

- **Layout and information:** Both players have buttons A–C. Each can read their partner's three-button sequence. A neutral indicator shows whose turn comes next.
- **Logic and checked solution:** Cool's sequence is A–C–B; Warm's is B–A–C. The combined input must be **Cool A → Warm B → Cool C → Warm A → Cool B → Warm C**.
- **Purpose and implementation:** Introduce ordered communication and turn-taking. There is no time limit. An incorrect input resets this sequence and clearly identifies where it failed.

## Level 4 — The Shared Dictionary

- **Layout and information:** Cool sees four coloured symbols: circle, triangle, square, circle. Warm sees a legend connecting those symbols to Cool's neutral buttons.
- **Logic and checked solution:** The legend says circle = C, triangle = A, square = B. Cool therefore enters **C–A–B–C**.
- **Purpose and implementation:** Players must translate information rather than simply read out a button label. Keep the symbol strip and dictionary available throughout; use distinct outlines so describing a symbol is straightforward.

## Level 5 — Leave Something Behind

- **Layout and information:** Each player has one movable crate. Cool has pads B and C. Across a retractable bridge, Warm has pad D. Their functions are described in the other player's colours.
- **Logic and checked solution:** Cool puts their crate on B, opening Warm's bridge. Warm crosses with their crate and places it on D, opening Cool's exit. Cool then moves their crate from B to C, opening Warm's exit.
- **Purpose and implementation:** Introduce planning through changing dependencies. Warm's destination is a stable island, so retracting the first bridge leaves them safe and able to exit.

## Level 6 — An Order Neither Player Knows

- **Layout and information:** Five neutral tiles, A–E, must be arranged on a rail. Cool sees “A before C” and “D before B.” Warm sees “C before E” and “E before D.”
- **Logic and checked solution:** Combining the clues produces the unique order **A–C–E–D–B**.
- **Purpose and implementation:** Require both players to assemble a shared explanation. Tiles remain freely rearrangeable. Provide a neutral five-slot planning rail so they can test an order before submitting it.

## Level 7 — Two Incomplete Maps

- **Layout and information:** Both players navigate matching grids, four columns by three rows. Each sees a different subset of closed energy tiles. Coordinates below count from the upper-left corner.
- **Logic and checked solution:** Cool sees closures at (3,1), (1,2), (4,2); Warm sees closures at (4,1), (1,3), (2,3). From (1,1) to (4,3), the sole safe route is **right → down → right → down → right**.
- **Purpose and implementation:** Neither map alone identifies the route. Players must combine their observations. Closed tiles block movement safely; they do not kill or reset the traveller.

## Level 8 — Your Right Is My Down

- **Layout and information:** Retain the split map information from Level 7, but display Warm's board rotated 90 degrees clockwise. Neutral corner symbols allow the players to establish its orientation.
- **Logic and checked solution:** Cool's route remains **right–down–right–down–right**. With screen-relative controls, Warm's equivalent route is **down–left–down–left–down**.
- **Purpose and implementation:** Add spatial translation to an established task. Rotate the complete board, including its markers, consistently. Players should be able to derive the relationship from the corner symbols.

## Level 9 — Every Switch Changes Two Things

- **Layout and information:** Four lamps, A–D, begin off. Cool sees A and C; Warm sees B and D. Switches toggle these groups: 1 = AB, 2 = BC, 3 = CD, 4 = A. Distribute the effect diagrams between both views.
- **Logic and checked solution:** The target is A, B and D on, C off. Press **2, 3 and 4** once each: BC → BD → ABD.
- **Purpose and implementation:** Introduce interacting effects and deliberate cancellation. Pressing a switch again reverses its effect. Keep a visible record of switch operations so players can explain what changed.

## Level 10 — The Passing Bay

- **Layout and information:** Two carts occupy opposite ends of a single track: **1–2–3–4**. There are sidings at stations 2 and 3, but only the siding at 2 is usable. Cool can identify the usable siding; Warm can read the destination labels.
- **Logic and checked solution:** The carts must exchange ends. Cool moves **1 → 2 → siding**. Warm moves **4 → 3 → 2 → 1**. Cool then moves **siding → 2 → 3 → 4**.
- **Purpose and implementation:** Teach yielding space and planning another player's route. Carts move in deliberate steps and can wait indefinitely.

## Level 11 — Hand Over the Bridge

- **Layout and information:** Both players start on island L. Island M lies between L and the exit island R. One power selector activates either bridge L–M or bridge M–R. Selector controls exist at L and R; their diagrams require the other player's interpretation.
- **Logic and checked solution:** Cool operates the selector while Warm crosses **L → M → R**. Warm then operates the far selector while Cool makes the same journey.
- **Purpose and implementation:** Make leadership and support roles change within one puzzle. M must always be safe. Prevent bridge switching while a character is actually crossing.

## Level 12 — The Junction Cannot Be Shared

- **Layout and information:** Two coloured light networks must reach separate receivers. Cool's possible routes use junctions **A–C** or **B–D**. Warm's use **A–D** or **C–E**. Each sees their own network but operates their partner's route selector.
- **Logic and checked solution:** A junction cannot carry both beams. The only compatible combination is **Cool: B–D; Warm: C–E**. Every other pairing shares a junction.
- **Purpose and implementation:** Introduce conflicting plans: a route can work individually and still prevent the joint solution. Let players inspect a low-power preview before committing.

## Level 13 — Equal Weight, Different Information

- **Layout and information:** Two lifting platforms each have three crate cradles. Six crates weigh **1, 2, 3, 4, 5 and 7** units, with their weight markings divided between the two colour filters.
- **Logic and checked solution:** Each platform needs exactly three crates totalling 11 units. The partition is **1 + 3 + 7** and **2 + 4 + 5**. Either group may occupy either platform.
- **Purpose and implementation:** Combine information sharing with physical arrangement. Use discrete weight sensors; player bodies do not contribute weight. Crates can always be removed and rearranged.

## Level 14 — Coupled Gears

- **Layout and information:** Three dials, A–C, have positions 0–3 and wrap around. Cool's lever advances A and B one position; Warm's advances B and C. Readings and target markings are distributed between their views.
- **Logic and checked solution:** Starting at (0,0,0), the target is **(3,1,2)**. Cool presses three times and Warm twice. The middle dial advances five times, wrapping to 1.
- **Purpose and implementation:** Extend the earlier switch puzzle into cyclic states. Show every movement clearly. Order does not matter here, allowing players to concentrate on the shared effect.

## Level 15 — Arrive Together, Start Apart

- **Layout and information:** Players launch coloured packets towards a receiver. Cool's packets travel for three ticks; Warm's for two. The receiver requests these pairs in order: **green/red, blue/amber, green/amber**.
- **Logic and checked solution:** Cool launches green, blue, green on ticks **1, 3, 5**. Warm launches red, amber, amber on **2, 4, 6**. Matching pairs arrive together on **4, 6, 8**.
- **Purpose and implementation:** Introduce anticipation and unequal delays. Each player sees only their half of the requested pairs. Advance the clock through shared confirmation, allowing timing to be planned rather than executed with fast reflexes.

## Level 16 — The Door of Exclusions

- **Layout and information:** Four switches, A–D, must satisfy four rules divided between the players: exactly two are on; A and B differ; D and B differ; C being on requires A to be on.
- **Logic and checked solution:** The unique solution is **A and D on; B and C off**. If B were on, A and D would be off, and C could not supply the required second active switch.
- **Purpose and implementation:** Require players to eliminate possibilities and explain contradictions. Represent each rule with a small mechanical diagram as well as text. Test the complete configuration only when requested.

## Level 17 — A Charge That Changes Colour

- **Layout and information:** A courier carries a red charge through a network. Warm sees red connections; Cool sees green connections. Converters at A, C and D automatically exchange red and green.
- **Logic and checked solution:** Provide connections **S→A red, S→B red, B→S red, A→C green, C→D red, D→T green**. The successful route is **S–A–C–D–T**, with charge states red → green → red → green. B is a recoverable dead end.
- **Purpose and implementation:** Players must reason about location and changing state together. Keep converter behaviour fixed and visible, and permit a safe return from the misleading branch.

## Level 18 — The Complementary Bridge

- **Layout and information:** Five bridge sections work only when each receives exactly one colour. Each player selects a five-cell stencil, where 1 means charged. Cool's options are **A:11000, B:10110, C:00111**; Warm's are **A:00101, B:01001, C:11010**.
- **Logic and checked solution:** Only **B/B** covers every section without overlap. The selectors are coupled: Cool advances both one position; Warm advances Cool two positions and Warm one. Starting at **A/B**, use **Cool → Cool → Warm** to reach B/B.
- **Purpose and implementation:** Combine complementary information with cyclic controls. Show a safe bridge preview and keep the selectors reversible.

## Level 19 — Enough Power for Both

- **Layout and information:** Each player has an upper and lower light route. Cool's upper costs 2 units and uses shared hub H; the lower costs 4 and avoids H. Warm's upper costs 2 and uses H; the lower costs 3 and avoids H. The routing supply has 5 units.
- **Logic and checked solution:** Both upper routes conflict at H. Cool lower plus Warm upper costs 6. Both lower cost 7. The sole valid pairing is **Cool upper + Warm lower**, costing 5.
- **Purpose and implementation:** Combine spatial compatibility with a shared resource limit. Each player sees their own coloured network and costs; neither can select a route independently.

## Level 20 — Return to the Same Place Differently

- **Layout and information:** A phase-controlled maze contains start S, hub H, key room K, midpoint M and exit E. Connections S–H and H–M require phase 0; H–K and M–E require phase 1. The connection markings are split between players.
- **Logic and checked solution:** One player operates the phase control while the other travels **S→H; phase 1; H→K→H; phase 0; H→M; phase 1; M→E**. Delivering the key latches the exit lock open. The traveller then operates the far control to guide their partner through.
- **Purpose and implementation:** Introduce revisiting a location under a different state. Phase changes occur only while the traveller occupies a safe waiting node.

## Level 21 — Borrowed Support

- **Layout and information:** Each player has one crate. Cool's pad P opens Warm's first bridge. Warm's pad Q powers Cool's tool-room door and the main-exit circuit. Inside the tool room is a key that can latch Q's power supply on permanently.
- **Logic and checked solution:** **Cool crate→P; Warm crosses and crate→Q; Cool retrieves the key and latches Q; Warm crate Q→R; Cool crate P→S.** R opens Cool's exit, while S opens Warm's final bridge.
- **Purpose and implementation:** Require players to distinguish temporary support from a condition that has become permanent. Both final routes require the latched Q supply. Put clear coloured dependency diagrams beside the pads.

## Level 22 — Nobody Can Finish First

- **Layout and information:** Cool's route is **start→A→H→B→exit**; Warm's is **start→B→H→A→exit**. A, H and B each hold one courier. A parking bay P branches off H. Entry gates close behind the couriers during an attempt.
- **Logic and checked solution:** Both exits remain locked until both couriers have visited H. Cool moves **A→H→P**. Warm moves **B→H→A→exit**. Cool then moves **P→H→B→exit**.
- **Purpose and implementation:** Revisit the passing-bay idea with a shared progress condition. Each player sees the other's exit requirement. Entry gates prevent using the starting rooms as unintended passing bays; reset restores them.

## Level 23 — One Program, Two Mazes

- **Layout and information:** Two couriers obey the same movement program. Both boards are four columns by three rows, starting at (1,1) and ending at (4,3). Cool's closed tiles are **(2,2), (3,2), (4,2)**. Warm's are **(2,2), (3,2), (3,3)**.
- **Logic and checked solution:** A command into a closed tile or boundary makes that courier wait. The shortest joint solution has 12 commands: **RRR–D–LLL–DD–RRR**.
- **Purpose and implementation:** Players must exploit their different environments to make identical instructions produce different movements. Give them 12 editable command slots, a single-step preview and an immediate local reset.
- **Notation:** R = right, D = down, L = left, U = up. Both couriers must occupy their goals after the final command; reaching a goal does not independently freeze a courier.

## Level 24 — A Circuit You Must Walk Through

- **Layout and information:** Six lamps A–F begin off. Switch effects are **1:AB, 2:BC, 3:CD, 4:DE, 5:EF, 6:A**. Players see different lamp readings and diagrams. Later switches sit behind powered access gates.
- **Logic and checked solution:** The target is **D, E and F on; A, B and C off**. Use **1→2→3→5→6**. The intermediate lit sets are AB → AC → AD → ADEF → DEF. Access to switches 2, 3, 5 and 6 requires B, C, D and E respectively.
- **Purpose and implementation:** Combine circuit reasoning with traversal and phase changes. Those five operations require phases **0→1→0→1→0**. Safe islands and neutral return passages keep unsuccessful experiments recoverable.

## Level 25 — Keep Both Exits Open

- **Layout and information:** One connected room combines a circuit, two powered routes and two crate-operated exit latches. Clues for each device are distributed across both views. All mechanics have appeared earlier.
- **Logic and checked solution:** First light five lamps using switches **1:AB, 2:BC, 3:CD, 4:DE, 5:A**. From all off, **2, 4 and 5** uniquely light all five. This enables the 5-unit routing supply from Level 19: choose **Cool upper, Warm lower**. Each route provides a crate. Cool docks their crate at P during phase 0, latching Cool's exit; then Warm docks theirs at Q during phase 1, latching Warm's exit. Both leave their crates in place and escape.
- **Purpose and implementation:** Test whether players can build and maintain one shared plan across several systems. Each exit remains latched across phase changes while its crate stays docked. Provide a persistent neutral diagram of the room's dependencies.

## Verification status and practical limits

- The intended solution paths were checked against the stated puzzle rules.
- Finite order, switch, stencil, balance and route combinations were exhaustively enumerated where specified.
- Level 6's ordering is unique.
- Level 7's combined map has the stated sole simple safe route; Level 8's rotated directions were checked.
- Level 9's target has the unique switch parity set 2, 3, 4.
- Level 12 has one compatible route pairing.
- Level 13's partition is unique apart from exchanging the two platforms.
- Level 14's proposed dial counts reach the target; additional full rotations give equivalent solutions.
- Level 15's proposed launches produce matching arrivals on ticks 4, 6 and 8.
- Level 16's switch assignment is unique.
- Level 18 has one complementary stencil pairing; the proposed coupled-selector operations reach it.
- Level 19 has one route pairing satisfying both constraints.
- Level 20's key-and-phase traversal was checked as a state path.
- Level 23's shared movement program was verified by breadth-first search to have minimum length 12.
- Level 24's target has the unique switch parity set 1, 2, 3, 5, 6; its stated intermediate lamp states were checked.
- Level 25's opening circuit has the unique switch parity set 2, 4, 5.

“Unique switch parity set” means which switches must be pressed an odd number of times. It does not imply a unique action sequence: pressing any switch twice cancels its effect.

**Logical solvability is established for the stated abstract rules.** This is not a tested game implementation, a collision-layout audit, or evidence of player enjoyment. Enjoyment and the exact difficulty curve still need two-player playtesting. In those tests, distinguish productive discussion from confusion about what a device does—the latter calls for clearer feedback.

