# Specification interpretation record

The source appendix is the authority for level IDs, order, private clue splits, solutions and dependencies. No puzzle solution has been intentionally changed.

The following are implementation choices where the design leaves interaction details open:

- Rooms use a shared 16×12 logical tile vocabulary. Separate lanes are two renderings of one coordinated simulation; network and board devices keep their explicitly separate positions.
- Crates use grid-snapped grab-and-follow movement. A grabbed crate follows its carrier’s tile; release leaves it supported at that location. There is no throwing or irreversible Sokoban corner trap. Only released/docked crates provide pad support or lift weight; carried crates do not.
- Crates A/B/C/D/E/F in room 13 weigh 1/2/3/4/5/7 respectively. The Cool channel reads A/C/E and Warm reads B/D/F. This assigns the source’s six weights neutral communication labels without changing the partition.
- Safe waiting nodes/islands are explicit. Bridge/phase changes are rejected while a traveller occupies an affected crossing; a closed restriction safely blocks rather than killing or resetting a player.
- Packet clocks advance only after both confirmations. The local packet reset clears queued packets, clock, received sequence and confirmations. It does not restart the campaign.
- The program board’s local reset returns both couriers to their starts and resets execution position; editing remains available. A room restart restores the full initial room, including its program.
- Level 24 assigns the source’s unspecified switch-4 operating phase to phase 1. Required solution phases remain exactly 0/1/0/1/0 for switches 1/2/3/5/6.

Implementation checks are recorded in validation.md, including actual movement and interactions through every source solution. Source mathematical claims are not used as a substitute for those checks.

Successful submissions in Rooms 6 and 16 latch the accepted order/configuration. Rooms 12 and 19 use committed live networks: changing either selector clears the commit and closes both exits until a valid pairing is submitted again. Rooms 5, 21 and 25 continuously recheck their physical crate supports at departure.

Room 24 uses one-way neutral escape through each access threshold after its lamp powers down. Entry still requires the powered lamp, and operating the switch still requires its phase. This prevents trapping the operator when switch 2 turns B off. Room 21 places pad R before the final bridge to avoid making S a prerequisite of R.
