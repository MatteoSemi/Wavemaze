# Developer solutions — keep outside ordinary gameplay

These are source-design solutions, intended for implementation and replay verification. The normal manual and per-player views must not reproduce this document. Switch solutions specify odd parity, not a unique order unless access or turn rules impose one.

| ID | Room | Intended solution and departure rule |
| --- | --- | --- |
| 01 | The Missing Labels | Cool B; Warm C. Each correct signal latches. Both enter their exits. |
| 02 | Meet in the Middle | Cool occupies B and Warm D together for one second. Doors then latch. |
| 03 | Taking Turns | Cool A, Warm B, Cool C, Warm A, Cool B, Warm C. A mistake restarts the six inputs. |
| 04 | The Shared Dictionary | Cool C–A–B–C, translating circle–triangle–square–circle with Warm’s dictionary. |
| 05 | Leave Something Behind | Cool crate B; Warm crosses with crate and docks D; Cool moves crate B→C. Warm remains safely on the destination island. Keep D/C supported to leave. |
| 06 | An Order Neither Player Knows | A–C–E–D–B; explicitly submit. The tiles stay freely rearrangeable. |
| 07 | Two Incomplete Maps | Both take R–D–R–D–R through the union of both maps’ closures. |
| 08 | Your Right Is My Down | Cool R–D–R–D–R; Warm D–L–D–L–D in screen coordinates. The full Warm map and its markers rotate clockwise. |
| 09 | Every Switch Changes Two Things | Press 2, 3, 4 once. Lamp sets BC→BD→ABD. Target A/B/D on, C off. |
| 10 | The Passing Bay | Cool 1→2→siding; Warm 4→3→2→1; Cool siding→2→3→4. Occupancy is exclusive. |
| 11 | Hand Over the Bridge | Cool at L selects L–M, Warm reaches M; select M–R, Warm reaches R. Warm selects L–M, Cool reaches M; select M–R, Cool reaches R. Never switch during a crossing. |
| 12 | The Junction Cannot Be Shared | Select Cool B–D and Warm C–E, using each partner’s selector. Preview and commit. Other combinations conflict. |
| 13 | Equal Weight, Different Information | Crates weighing 1/3/7 on one three-cradle platform; 2/4/5 on the other. Both sum to 11. Platforms can exchange these sets. |
| 14 | Coupled Gears | Cool lever three times; Warm twice. Dials finish (3,1,2) modulo four. Any interleaving works. |
| 15 | Arrive Together, Start Apart | Cool launches green/blue/green at ticks 1/3/5; Warm launches red/amber/amber at 2/4/6. Jointly confirm ticks. Pair arrivals are 4/6/8. |
| 16 | The Door of Exclusions | A/D ON, B/C OFF. Explicitly submit. |
| 17 | A Charge That Changes Colour | S→A (red), A→C (green), C→D (red), D→T (green). B is a recoverable red dead end with B→S. |
| 18 | The Complementary Bridge | From A/B, Cool selector twice then Warm once reaches B/B. 10110 XOR 01001 = 11111 with no overlap. |
| 19 | Enough Power for Both | Cool upper + Warm lower costs 2+3=5 and uses H only once. |
| 20 | Return to the Same Place Differently | First traveller S→H in phase 0; phase 1 H→K→H to get the key; phase 0 H→M; phase 1 M→E and deliver key. First traveller operates far control for the partner’s S→H→M→E journey. |
| 21 | Borrowed Support | Cool crate P; Warm crosses with crate to Q; Cool retrieves key and latches Q supply; Warm crate Q→R; Cool crate P→S. Both final routes need permanent Q. |
| 22 | Nobody Can Finish First | Cool A→H→P. Warm B→H→A→exit. Cool P→H→B→exit. Both H visit flags are required; entry gates cannot serve as passing bays. |
| 23 | One Program, Two Mazes | RRRDLLLDDRRR, 12 commands. A blocked command waits. Both must occupy (4,3) after the final command; touching a goal never freezes a courier. |
| 24 | A Circuit You Must Walk Through | Switches 1→2→3→5→6 in phases 0→1→0→1→0. Lamp sets AB→AC→AD→ADEF→DEF. Access to 2/3/5/6 requires B/C/D/E respectively. |
| 25 | Keep Both Exits Open | Switches 2/4/5 light all five lamps. Route Cool upper + Warm lower. Collect the route crates. Cool docks P in phase 0; Warm docks Q in phase 1. Leave both crates docked, preserve supply and routing, then depart together. |

# Mathematical checks worth running against actual code

Enumerate rail permutations (06), four-bit switch parity (09), route pairings (12/19), three-of-six weight partitions (13), modulo-four lever counts (14), four-bit configurations (16), nine stencil pairings and coupled transitions (18), and circuit parity (24/25). Use breadth-first search on paired courier positions for the 12-command minimum (23). Such searches supplement actual traversal and browser-input tests; they do not replace them.
