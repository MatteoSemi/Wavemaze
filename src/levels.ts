export interface LevelDefinition {
  id: number;
  title: string;
  objective: string;
  clues: [string[], string[]];
  tip: string;
}

// Only the matching channel is passed to a player's view.
export const levels: LevelDefinition[] = [
  {
    id: 1, title: 'The Missing Labels', objective: 'Read your inscription to your partner. Register both signals, then find the exits.',
    clues: [['Warm: C.'], ['Cool: B.']],
    tip: 'Move beside a button and interact. Correct signals remain registered.',
  },
  {
    id: 2, title: 'Meet in the Middle', objective: 'Stand on the two correct pads together until the shared meter fills.',
    clues: [['Warm must stand on D.'], ['Cool must stand on B.']],
    tip: 'Pressure pads respond to standing, not interaction. Hold together for one second.',
  },
  {
    id: 3, title: 'Taking Turns', objective: 'Exchange your partner’s sequence and alternate inputs without a mistake.',
    clues: [['Warm’s three inputs: B → A → C.'], ['Cool’s three inputs: A → C → B.']],
    tip: 'Cool starts. A wrong input restarts the sequence; there is no timer.',
  },
  {
    id: 4, title: 'The Shared Dictionary', objective: 'Translate the symbol strip and enter it on Cool’s buttons.',
    clues: [['Strip: CIRCLE → TRIANGLE → SQUARE → CIRCLE.'], ['Dictionary: CIRCLE = C; TRIANGLE = A; SQUARE = B.']],
    tip: 'One partner reads the symbols; the other supplies their meaning.',
  },
  {
    id: 5, title: 'Leave Something Behind', objective: 'Use both crates to maintain support and power each exit.',
    clues: [['Warm pad D powers Cool’s exit.'], ['Cool pad B powers Warm’s bridge. Cool pad C powers Warm’s exit.']],
    tip: 'Grab a crate, move it onto a pad, then release it. The far island stays safe if its bridge retracts.',
  },
  {
    id: 6, title: 'An Order Neither Player Knows', objective: 'Arrange all five rail tiles to satisfy both inscriptions, then submit.',
    clues: [['A before C. D before B.'], ['C before E. E before D.']],
    tip: 'Interact with a rail slot to select it, then another to swap their tiles. Rearrange freely before submission.',
  },
  {
    id: 7, title: 'Two Incomplete Maps', objective: 'Combine both maps and guide both travellers from the start to the far corner.',
    clues: [['Closed coordinates: (3,1), (1,2), (4,2).'], ['Closed coordinates: (4,1), (1,3), (2,3).']],
    tip: 'Coordinates begin at the upper-left. Hidden restrictions block safely; compare both maps.',
  },
  {
    id: 8, title: 'Your Right Is My Down', objective: 'Compare corner markers and navigate the same map in two orientations.',
    clues: [['Closed in original coordinates: (3,1), (1,2), (4,2).'], ['Closed in original coordinates: (4,1), (1,3), (2,3). Board rotated clockwise.']],
    tip: 'Warm’s complete board is rotated 90° clockwise. Movement follows the screen, not the unrotated map.',
  },
  {
    id: 9, title: 'Every Switch Changes Two Things', objective: 'Coordinate reversible switches until every private lamp target is satisfied.',
    clues: [['Targets: A ON, C OFF. Switch 1 toggles AB; switch 3 toggles CD.'], ['Targets: B ON, D ON. Switch 2 toggles BC; switch 4 toggles A.']],
    tip: 'A repeated operation reverses its effect. The shared history records operations, not hidden readings.',
  },
  {
    id: 10, title: 'The Passing Bay', objective: 'Exchange the two carts’ destinations without sharing a station.',
    clues: [['The siding at station 2 is usable. Station 3’s siding is closed.'], ['Cool’s destination is station 4. Warm’s destination is station 1.']],
    tip: 'Walk beside a station control and interact to move your own cart there. Only adjacent, unoccupied stations accept it.',
  },
  {
    id: 11, title: 'Hand Over the Bridge', objective: 'Take turns powering the two crossings and bring both travellers to R.',
    clues: [['Warm’s selector alternates power between L–M and M–R.'], ['Cool’s selector alternates power between L–M and M–R.']],
    tip: 'Selectors exist on L and R. M is safe. Switching is blocked while anyone occupies a crossing.',
  },
  {
    id: 12, title: 'The Junction Cannot Be Shared', objective: 'Choose two compatible beam routes, then commit the low-power preview.',
    clues: [['Cool routes: A–C or B–D. Your selector controls Warm’s route.'], ['Warm routes: A–D or C–E. Your selector controls Cool’s route.']],
    tip: 'Both routes must reach their receivers. A junction cannot carry both beams.',
  },
  {
    id: 13, title: 'Equal Weight, Different Information', objective: 'Place exactly three crates on each lift. Each lift needs exactly 11 units.',
    clues: [['Crate A weighs 1; C weighs 3; E weighs 5.'], ['Crate B weighs 2; D weighs 4; F weighs 7.']],
    tip: 'Use the three cradles on each platform. Bodies add no weight; remove and rearrange crates freely.',
  },
  {
    id: 14, title: 'Coupled Gears', objective: 'Operate the coupled levers until all three dials match their private targets.',
    clues: [['Your lever advances A and B. Target A = 3; target B = 1.'], ['Your lever advances B and C. Target C = 2.']],
    tip: 'Every dial wraps from 3 to 0. Read your visible dials aloud; the operation order is unrestricted.',
  },
  {
    id: 15, title: 'Arrive Together, Start Apart', objective: 'Launch packets so the three requested pairs arrive together and in order.',
    clues: [['Cool requests: GREEN → BLUE → GREEN. Your travel time is 3 ticks.'], ['Warm requests: RED → AMBER → AMBER. Your travel time is 2 ticks.']],
    tip: 'Choose a launch or wait, then both confirm the next tick. Local reset clears this attempt.',
  },
  {
    id: 16, title: 'The Door of Exclusions', objective: 'Share the four rules, set the switches, then explicitly submit the configuration.',
    clues: [['Exactly TWO switches are ON. A and B differ: A ≠ B.'], ['D and B differ: D ≠ B. If C is ON, A must be ON: C ⇒ A.']],
    tip: 'Changing switches alone does not submit. Discuss the rules before testing your complete setting.',
  },
  {
    id: 17, title: 'A Charge That Changes Colour', objective: 'Guide the shared charged courier from S to T using the appropriate connections.',
    clues: [['GREEN links: A → C and D → T.'], ['RED links: S → A, S → B, B → S and C → D.']],
    tip: 'Interact with a destination node to send the shared courier there. Charge starts red; A, C and D exchange its colour.',
  },
  {
    id: 18, title: 'The Complementary Bridge', objective: 'Make all five bridge sections receive exactly one colour, then cross together.',
    clues: [['Cool stencils: A 11000; B 10110; C 00111. Your selector advances both by 1.'], ['Warm stencils: A 00101; B 01001; C 11010. Your selector advances Cool by 2 and Warm by 1.']],
    tip: 'Start selections are A/B. Selectors wrap A–B–C; inspect the safe preview before entering.',
  },
  {
    id: 19, title: 'Enough Power for Both', objective: 'Power two compatible routes within the shared five-unit budget.',
    clues: [['Cool upper: 2 units, uses H. Cool lower: 4 units, avoids H.'], ['Warm upper: 2 units, uses H. Warm lower: 3 units, avoids H.']],
    tip: 'The hub H cannot carry two routes at once. Select and compare routes before committing.',
  },
  {
    id: 20, title: 'Return to the Same Place Differently', objective: 'Retrieve and deliver the key, then use the far control to guide your partner through.',
    clues: [['Phase 0 connections: S–H and H–M.'], ['Phase 1 connections: H–K and M–E.']],
    tip: 'Wait at neutral safe nodes for phase changes. Delivering the key latches the exit lock. Controls are at S and E.',
  },
  {
    id: 21, title: 'Borrowed Support', objective: 'Make the temporary supply permanent, then rearrange both supports for departure.',
    clues: [['Warm Q supplies Cool’s tool room and both final routes. Warm R powers Cool’s exit.'], ['Cool P powers Warm’s first bridge. Cool S powers Warm’s final bridge.']],
    tip: 'A key in the powered tool room can latch Q’s supply. Both final routes still require that supply.',
  },
  {
    id: 22, title: 'Nobody Can Finish First', objective: 'Pass through the shared junction and exchange sides while keeping space for both couriers.',
    clues: [['Warm’s exit needs BOTH couriers to have visited H. Warm travels start–B–H–A–exit.'], ['Cool’s exit needs BOTH couriers to have visited H. Cool travels start–A–H–B–exit.']],
    tip: 'Operate a destination node to move your courier. A, H and B each hold one; bay P yields space. Reset reopens entry gates.',
  },
  {
    id: 23, title: 'One Program, Two Mazes', objective: 'Write one 12-command program that leaves both couriers on their goals.',
    clues: [['Cool board closures: (2,2), (3,2), (4,2).'], ['Warm board closures: (2,2), (3,2), (3,3).']],
    tip: 'Interact with slots to cycle R/D/L/U. Step runs one command for both; blocked commands wait. Rewind keeps edits. Goals do not freeze movement.',
  },
  {
    id: 24, title: 'A Circuit You Must Walk Through', objective: 'Navigate powered access gates and alternate phases to satisfy the six-lamp target.',
    clues: [['Targets A OFF, C OFF, E ON. Effects: 1 AB; 3 CD; 5 EF. Access: 2 needs B, 5 needs D.'], ['Targets B OFF, D ON, F ON. Effects: 2 BC; 4 DE; 6 A. Access: 3 needs C, 6 needs E.']],
    tip: 'Switch phases: 1/3/6 use 0; 2/4/5 use 1. Neutral return passages and safe islands let you recover.',
  },
  {
    id: 25, title: 'Keep Both Exits Open', objective: 'Power the supply, route it, obtain both crates, and maintain both exit docks across phases.',
    clues: [['Effects: 1 AB; 3 CD; 5 A. Cool upper costs 2 through H; lower costs 4 without H. Dock P accepts Cool’s crate in phase 0.'], ['Effects: 2 BC; 4 DE. Warm upper costs 2 through H; lower costs 3 without H. Dock Q accepts Warm’s crate in phase 1.']],
    tip: 'All five lamps power the five-unit supply. Routes cannot share H. Dock latches survive phase changes only while their crates remain in place.',
  },
];
