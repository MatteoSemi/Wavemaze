# Specification interpretation record

The source appendix is the authority for level IDs, order, private clue splits, solutions and dependencies. No puzzle solution has been intentionally changed.

The following are implementation choices where the design leaves interaction details open:

- Rooms use a shared 16×12 logical tile vocabulary. Separate lanes are two renderings of one coordinated simulation; network and board devices keep their explicitly separate positions.
- Crates use grid-snapped grab-and-follow movement. A grabbed crate follows its carrier’s tile; release leaves it supported at that location. There is no throwing or irreversible Sokoban corner trap. Only released/docked crates should provide support where required by the implementation.
- Crates A/B/C/D/E/F in room 13 weigh 1/2/3/4/5/7 respectively. The Cool channel reads A/C/E and Warm reads B/D/F. This assigns the source’s six weights neutral communication labels without changing the partition.
- Safe waiting nodes/islands are explicit. Bridge/phase changes are rejected while a traveller occupies an affected crossing; a closed restriction safely blocks rather than killing or resetting a player.
- Packet clocks advance only after both confirmations. The local packet reset clears queued packets, clock, received sequence and confirmations. It does not restart the campaign.
- The program board’s local reset returns both couriers to their starts and resets execution position; editing remains available. A room restart restores the full initial room, including its program.
- Level 24 assigns the source’s unspecified switch-4 operating phase to phase 1. Required solution phases remain exactly 0/1/0/1/0 for switches 1/2/3/5/6.

These choices must be verified against the final simulation and updated if its interaction differs. Source mathematical claims are not implementation-test evidence.
