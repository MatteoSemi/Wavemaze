import { levels } from './levels';
export type PlayerId = 0 | 1;
export type Point = { x: number; y: number };
export type Entity = Point & { id: string; kind: string; label: string; owner?: PlayerId; channel?: PlayerId; value?: string | number; on?: boolean; data?: any };
export type Player = Point & { grab?: string };
export type Game = { level: number; players: [Player, Player]; entities: [Entity[], Entity[]]; state: any; elapsed: number; solved: boolean; complete: boolean; exits: boolean[]; feedback: string[]; history: string[] };
export const WIDTH = 16, HEIGHT = 12;
const names = ['Cool', 'Warm'];
const eq = (a: Point, b: Point) => a.x === b.x && a.y === b.y;
const at = (x: number, y: number) => ({ x, y });
const clone = <T>(a: T): T => JSON.parse(JSON.stringify(a));
const exit = at(13, 2);
function add(g: Game, p: PlayerId, id: string, kind: string, label: string, x: number, y: number, extra: Partial<Entity> = {}) { const e = { id, kind, label, x, y, owner: p, ...extra }; g.entities[p].push(e); return e; }
function both(g: Game, id: string, kind: string, label: string, x: number, y: number, extra: Partial<Entity> = {}) { for (const p of [0, 1] as const) add(g, p, id, kind, label, x, y, extra); }
function buttons(g: Game, labels: string[], players: PlayerId[] = [0, 1]) { for (const p of players) labels.forEach((label, i) => add(g, p, label, 'button', label, 3 + i * 2, 5)); }
function lamps(g: Game, n: number) { for (const p of [0, 1] as const) for (let i = 0; i < n; i++) add(g, p, 'lamp' + i, 'lamp', String.fromCharCode(65 + i), 3 + i * 2, 3, { channel: i % 2 as PlayerId, on: false }); }
function crate(g: Game, p: PlayerId, id: string, x: number, y: number, extra: Partial<Entity> = {}) { add(g, p, id, 'crate', id, x, y, extra); }
function pad(g: Game, p: PlayerId, id: string, x: number, y: number) { add(g, p, id, 'pad', id, x, y); }
function resetDevice(g: Game) { both(g, 'reset', 'reset', 'Reset board', 2, 8); }
export function createGame(level: number): Game {
  if (!Number.isInteger(level) || level < 1 || level > 25) throw new RangeError('Room must be 1–25');
  const g: Game = { level, players: [at(2, 9), at(2, 9)], entities: [[], []], state: {}, elapsed: 0, solved: false, complete: false, exits: [false, false], feedback: ['', ''], history: [] };
  const s = g.state;
  switch (level) {
    case 1: buttons(g, ['A', 'B', 'C']); s.correct = [false, false]; break;
    case 2: for (const p of [0, 1] as const) ['A', 'B', 'C', 'D'].forEach((v, i) => pad(g, p, v, 3 + i * 3, 5)); s.hold = 0; break;
    case 3: buttons(g, ['A', 'B', 'C']); s.index = 0; break;
    case 4: buttons(g, ['A', 'B', 'C'], [0]); s.index = 0; break;
    case 5: crate(g, 0, 'crate', 3, 8); crate(g, 1, 'crate', 3, 8); pad(g, 0, 'B', 5, 7); pad(g, 0, 'C', 8, 7); pad(g, 1, 'D', 11, 6); break;
    case 6: s.order = ['E', 'D', 'C', 'B', 'A']; s.selected = [null, null]; for (const p of [0, 1] as const) s.order.forEach((v: string, i: number) => add(g, p, 'slot' + i, 'rail', String(i + 1), 3 + i * 2, 5, { value: v })); both(g, 'submit', 'console', 'Submit order', 7, 8); break;
    case 7: case 8: g.players = [at(5, 5), level === 8 ? at(7, 4) : at(5, 5)]; s.mapDone = [false, false]; break;
    case 9: s.mask = 0; buttons(g, ['1', '2', '3', '4']); lamps(g, 4); resetDevice(g); break;
    case 10: s.carts = ['1', '4']; s.selected = [0, 0]; for (const p of [0, 1] as const) { ['1', '2', '3', '4', 'S2', 'S3'].forEach((v, i) => add(g, p, v, 'node', v, i < 4 ? 4 + i * 2 : i === 4 ? 6 : 8, i < 4 ? 5 : 3)); add(g, p, 'cart0', 'cart', 'C', 4, 5, { channel: 0 }); add(g, p, 'cart1', 'cart', 'W', 10, 5, { channel: 1 }); } resetDevice(g); break;
    case 11: for(const p of[0,1] as const)for(const [label,x] of[['L',3],['M',7],['R',12]] as const)add(g,p,'marker'+label,'marker',label,x,4); s.bridge = 0; both(g, 'selectL', 'selector', 'Bridge L', 3, 7); both(g, 'selectR', 'selector', 'Bridge R', 12, 7); break;
    case 12: s.routes = [0, 0]; both(g, 'route', 'selector', 'Partner route', 6, 6); both(g, 'submit', 'console', 'Commit beams', 9, 6); break;
    case 13: s.weights = [1, 2, 3, 4, 5, 7]; for (const p of [0, 1] as const) { s.weights.forEach((v: number, i: number) => crate(g, p, String.fromCharCode(65 + i), 3 + i * 2, 8, { value: v, channel: i % 2 as PlayerId, data: { shared: true } })); for (let i = 0; i < 3; i++) { add(g, p, 'L' + i, 'cradle', 'L' + (i + 1), 4 + i * 2, 4); add(g, p, 'R' + i, 'cradle', 'R' + (i + 1), 4 + i * 2, 6); } } break;
    case 14: s.dials = [0, 0, 0]; both(g, 'lever', 'lever', 'Advance gears', 7, 6); break;
    case 15: s.clock = 0; s.queued = [null, null]; s.confirm = [false, false]; s.packets = []; s.received = 0; buttons(g, ['colour0', 'colour1']); for (const p of [0, 1] as const) { g.entities[p][0].label = p ? 'Red' : 'Green'; g.entities[p][1].label = p ? 'Amber' : 'Blue'; add(g, p, 'confirm', 'console', 'Confirm tick', 9, 6); } resetDevice(g); break;
    case 16: s.mask = 0; buttons(g, ['A', 'B', 'C', 'D']); both(g, 'submit', 'console', 'Test rules', 7, 8); break;
    case 17: s.node = 'S'; s.charge = 'red'; for (const p of [0, 1] as const) { [['S', 3, 6], ['A', 6, 4], ['B', 6, 8], ['C', 9, 4], ['D', 11, 6], ['T', 12, 4]].forEach(([v, x, y]) => add(g, p, v as string, 'node', v as string, x as number, y as number)); add(g, p, 'courier', 'cart', 'Charge', 3, 6); } resetDevice(g); break;
    case 18: s.stencils = [0, 1]; both(g, 'select', 'selector', 'Coupled stencil', 5, 7); for (const p of [0, 1] as const) for (let i = 0; i < 5; i++) add(g, p, 'section' + i, 'stencil', String(i + 1), 7 + i, 5, { channel: p }); break;
    case 19: s.routes = [0, 0]; both(g, 'route', 'selector', 'Choose route', 6, 6); both(g, 'submit', 'console', 'Supply routes', 9, 6); break;
    case 20: s.phase = 0; s.key = false; s.keyCarrier = null; s.delivered = false; s.travelled = [false, false]; g.players = [at(3, 9), at(3, 9)]; both(g, 'phaseS', 'phase', 'Phase control S', 3, 9); both(g, 'phaseE', 'phase', 'Phase control E', 13, 3); both(g, 'key', 'key', 'Key', 8, 3); for(const p of[0,1] as const)for(const[label,x,y]of[['S',3,9],['H',8,6],['K',8,3],['M',13,6],['E',13,3]] as const)add(g,p,'marker'+label,'marker',label,x,y); break;
    case 21: s.latch = false; s.key = false; crate(g, 0, 'crate', 3, 8); crate(g, 1, 'crate', 3, 8); pad(g, 0, 'P', 5, 7); pad(g, 0, 'S', 7, 7); pad(g, 1, 'Q', 10, 6); pad(g, 1, 'R', 11, 4); add(g, 0, 'key', 'key', 'Supply key', 11, 5); add(g, 0, 'latch', 'console', 'Latch supply', 10, 7); break;
    case 22: s.carts = ['start0', 'start1']; s.visited = [false, false]; s.entry = [false, false]; for (const p of [0, 1] as const) { [['A', 4, 5], ['H', 7, 5], ['B', 10, 5], ['P', 7, 3], ['exit0', 12, 3], ['exit1', 3, 3]].forEach(([v, x, y]) => add(g, p, v as string, 'node', v === 'exit0' ? 'E-C' : v === 'exit1' ? 'E-W' : v as string, x as number, y as number)); add(g, p, 'cart0', 'cart', 'C', 2, 7); add(g, p, 'cart1', 'cart', 'W', 12, 7); } resetDevice(g); break;
    case 23: s.program = Array(12).fill('R'); s.pc = 0; s.couriers = [at(0, 0), at(0, 0)]; for (const p of [0, 1] as const) { for (let i = 0; i < 12; i++) add(g, p, 'cmd' + i, 'slot', String(i + 1), 2 + (i % 6) * 2, 3 + Math.floor(i / 6) * 2, { value: 'R' }); add(g, p, 'step', 'console', 'Step program', 7, 8); add(g, p, 'rewind', 'reset', 'Rewind couriers', 10, 8); } break;
    case 24: s.phase = 0; s.mask = 0; lamps(g, 6); for (const p of [0, 1] as const) for (let i = 0; i < 6; i++) add(g, p, String(i + 1), 'lever', String(i + 1), 3 + i * 2, 6); both(g, 'phase', 'phase', 'Change phase', 2, 9); resetDevice(g); break;
    case 25: s.mask = 0; s.phase = 0; s.routes = [0, 0]; s.docked = [false, false]; lamps(g, 5); buttons(g, ['1', '2', '3', '4', '5']); both(g, 'phase', 'phase', 'Change phase', 2, 9); both(g, 'route', 'selector', 'Choose route', 11, 7); both(g, 'submit', 'console', 'Supply routes', 13, 7); pad(g, 0, 'P', 8, 8); pad(g, 1, 'Q', 8, 8); break;
  }
  refresh(g); return g;
}
function tell(g: Game, p: PlayerId, message: string) { g.feedback[p] = message; }
function record(g: Game, p: PlayerId, id: string) { g.history.push(`${names[p]} ${id}`); if (g.history.length > 16) g.history.shift(); }
function find(g: Game, p: PlayerId, id: string) { return g.entities[p].find(e => e.id === id); }
function supported(g: Game, p: PlayerId, id: string) { const target = find(g, p, id); return !!target && g.entities[p].some(e => e.kind === 'crate' && !g.players[p].grab && eq(e, target)); }
function occupied(g: Game, p: PlayerId, id: string) { const e = find(g, p, id); return !!e && (eq(g.players[p], e) || supported(g, p, id)); }
const mapClosed = [[[2, 0], [0, 1], [3, 1]], [[3, 0], [0, 2], [1, 2]]];
const programClosed = [[[1, 1], [2, 1], [3, 1]], [[1, 1], [2, 1], [2, 2]]];
function boardPoint(g: Game, p: PlayerId, pt: Point) { if (g.level === 8 && p === 1) return at(pt.y - 4, 7 - pt.x); return at(pt.x - 5, pt.y - 5); }
function boardWorld(g: Game, p: PlayerId, pt: Point) { return g.level === 8 && p === 1 ? at(7 - pt.y, 4 + pt.x) : at(5 + pt.x, 5 + pt.y); }
function onMap(g: Game, p: PlayerId, pt: Point) { const q = boardPoint(g, p, pt); return q.x >= 0 && q.x < 4 && q.y >= 0 && q.y < 3; }
function mapBlocked(g: Game, p: PlayerId, pt: Point, visibleOnly = false) { const q = boardPoint(g, p, pt); const sets = visibleOnly ? [mapClosed[p]] : mapClosed; return sets.some(set => set.some(([x, y]) => q.x === x && q.y === y)); }
function phasePath(g: Game, p: PlayerId, x: number, y: number) { const s = g.state; if ((x === 3 && y >= 6 && y <= 9) || (y === 6 && x >= 3 && x <= 8)) return s.phase === 0; if ((x === 8 && y >= 3 && y <= 6)) return s.phase === 1; if (y === 6 && x >= 8 && x <= 13) return s.phase === 0; if (x === 13 && y >= 2 && y <= 6) return s.phase === 1; return false; }
function safeNode(x: number, y: number) { return [[3, 9], [8, 6], [8, 3], [13, 6], [13, 3], [13, 2]].some(([a, b]) => a === x && b === y); }
export function worldTile(g: Game, p: PlayerId, x: number, y: number): string {
  if (x <= 0 || x >= WIDTH - 1 || y <= 0 || y >= HEIGHT - 1) return 'wall';
  if (x === exit.x && y === exit.y) return g.exits[p] ? 'exit' : 'closed';
  if (g.level === 7 || g.level === 8) { if (onMap(g, p, at(x, y))) return mapBlocked(g, p, at(x, y), true) ? 'closed' : 'floor'; const goal = boardWorld(g, p, at(3, 2)); if (g.state.mapDone[p] && ((x === goal.x && y === goal.y + 1) || (y === goal.y + 1 && x >= goal.x && x <= 13) || (x === 13 && y >= 2 && y <= goal.y + 1))) return 'floor'; return 'void'; }
  if (g.level === 20) return safeNode(x, y) ? 'floor' : phasePath(g, p, x, y) ? 'bridge' : 'void';
  if (g.level === 11) { if ((x === 5 || x === 9) && y >= 2 && y <= 9) return y === 6 && g.state.bridge === (x === 5 ? 0 : 1) ? 'bridge' : 'void'; }
  if ((g.level === 5 && p === 1) || (g.level === 21 && p === 1)) { if (x === 7 && y >= 1 && y <= 10) return y === 7 && supported(g, 0, g.level === 5 ? 'B' : 'P') ? 'bridge' : 'void'; }
  if (g.level === 21 && p === 1 && x === 12) return y === 7 && g.state.latch && supported(g,0,'S') ? 'bridge' : 'void';
  if (g.level === 21 && p === 0 && x === 9 && y >= 1 && y <= 10) return y === 7 && (g.state.latch || supported(g, 1, 'Q')) ? 'bridge' : 'wall';
  if (g.level === 18 && x >= 6 && x <= 10) return y === 5 && g.state.coverage?.[x - 6] === 1 ? 'bridge' : 'void';
  if (g.level === 24 && y === 5 && x !== 1) return 'wall';
  if (g.level === 24 && (y === 6 || y === 7) && x % 2 === 0) return 'wall';
  if (g.level === 24 && y === 7 && [5, 7, 11, 13].includes(x)) { const req = ({5:1,7:2,11:3,13:4} as Record<number,number>)[x]; return g.state.mask & (1 << req) ? 'bridge' : 'closed'; }
  return 'floor';
}
export function canWalk(g: Game, p: PlayerId, x: number, y: number): boolean {
  if (!Number.isInteger(x) || !Number.isInteger(y)) return false;
  if(g.level===24 && g.players[p].y===6 && g.players[p].x===x && y===7) return true;
  if ((g.level === 7 || g.level === 8) && onMap(g, p, at(x, y)) && mapBlocked(g, p, at(x, y))) return false;
  return !['wall', 'void', 'closed'].includes(worldTile(g, p, x, y));
}
export function move(g: Game, p: PlayerId, dx: number, dy: number) {
  if (g.complete || Math.abs(dx) + Math.abs(dy) !== 1) return;
  const player = g.players[p], next = at(player.x + dx, player.y + dy);
  if (!canWalk(g, p, next.x, next.y)) { tell(g, p, 'Route blocked. Ask your partner about its marking.'); return; }
  const box = g.entities[p].find(e => e.kind === 'crate' && e.id !== player.grab && eq(e, next));
  if (box && g.level===13 && g.players[(1-p) as PlayerId].grab===box.id) {tell(g,p,'Your partner is carrying that crate.');return;}
  if (box) { const beyond = at(box.x + dx, box.y + dy); if (!canWalk(g, p, beyond.x, beyond.y) || g.entities[p].some(e => e.kind === 'crate' && eq(e, beyond))) { tell(g, p, 'Crate blocked. Grab it to carry it back.'); return; } Object.assign(box, beyond); syncCrate(g, p, box); }
  Object.assign(player, next);
  if (player.grab) { const c = find(g, p, player.grab); if (c) { Object.assign(c, next); syncCrate(g, p, c); } }
  if ([7, 8].includes(g.level)) { const q = boardPoint(g, p, next); if (q.x === 3 && q.y === 2) g.state.mapDone[p] = true; }
  if (g.level === 20) { if (eq(next, at(8, 3)) && !g.state.key) { g.state.key = true; g.state.keyCarrier = p; for(const role of[0,1] as const)g.entities[role]=g.entities[role].filter(e=>e.id!=='key'); tell(g, p, 'Key collected. Deliver it at E.'); } if (eq(next, at(13, 3))) { if (g.state.keyCarrier === p) g.state.delivered = true; g.state.travelled[p] = true; } }
  refresh(g);
}
function syncCrate(g: Game, p: PlayerId, box: Entity) { if (g.level === 13) { const other = find(g, (1 - p) as PlayerId, box.id); if (other) Object.assign(other, {x:box.x,y:box.y}); } }
export function nearest(g: Game, p: PlayerId): Entity | undefined {
  const player = g.players[p];
  return g.entities[p].filter(e => !['lamp', 'cart', 'stencil', 'cradle', 'pad', 'crate', 'marker'].includes(e.kind) && Math.abs(e.x - player.x) + Math.abs(e.y - player.y) <= 1 && (eq(e, player) || canWalk(g,p,e.x,e.y))).sort((a,b) => (Math.abs(a.x-player.x)+Math.abs(a.y-player.y))-(Math.abs(b.x-player.x)+Math.abs(b.y-player.y)) || a.id.localeCompare(b.id))[0];
}
export function interact(g: Game, p: PlayerId) { const e = nearest(g, p); if (e) act(g, p, e.id); else tell(g, p, 'Stand beside a device to operate it.'); }
export function grab(g: Game, p: PlayerId) {
  const player = g.players[p]; if (player.grab) { const c = find(g,p,player.grab); if (c) Object.assign(c, at(player.x,player.y)); player.grab = undefined; tell(g,p,'Crate released.'); refresh(g); return; }
  const c = g.entities[p].filter(e=>e.kind==='crate' && Math.abs(e.x-player.x)+Math.abs(e.y-player.y)<=1 && (eq(e,player)||canWalk(g,p,e.x,e.y))).sort((a,b)=>a.id.localeCompare(b.id))[0];
  if (!c) { tell(g,p,'No crate in reach.'); return; }
  if (g.level === 13 && g.players[(1-p) as PlayerId].grab === c.id) { tell(g,p,'Your partner is carrying that crate.'); return; }
  player.grab=c.id; Object.assign(c,at(player.x,player.y)); syncCrate(g,p,c); tell(g,p,'Carrying crate. Grab again to release.'); refresh(g);
}
function toggle(g: Game, p: PlayerId, id: string, effects: number[]) { const i=Number(id)-1; if(i<0||i>=effects.length)return; g.state.mask ^= effects[i]; record(g,p,id); }
function routesValid(g: Game) { return g.state.routes[0]===0 && g.state.routes[1]===1; }
function localReset(g: Game) { const fresh=createGame(g.level); const players=clone(g.players); Object.assign(g, fresh); g.players=players; g.feedback=['Board reset; room positions retained.','Board reset; room positions retained.']; refresh(g); }
export function act(g: Game, p: PlayerId, id: string, value?: any) {
  if(g.complete)return;
  const e=find(g,p,id); if(!e||e.owner!==undefined&&e.owner!==p)return;
  const s=g.state;
  if(id==='reset') { localReset(g); return; }
  tell(g,p,'Device operated.');
  switch(g.level) {
    case 1: if(id===(p===0?'B':'C')) {s.correct[p]=true;tell(g,p,'Input latched.');} else tell(g,p,'This input did not latch.'); break;
    case 3: {const seq=['A','B','C','A','B','C']; if(s.index<6&&p===s.index%2&&id===seq[s.index])s.index++;else {const step=s.index+1;s.index=0;tell(g,p,`Sequence failed at step ${step}; restart from step 1.`);}break;}
    case 4: if(p===0){if(id==='CABC'[s.index])s.index++;else{s.index=0;tell(g,p,'Translation sequence reset.');}}break;
    case 6: if(id.startsWith('slot')){const i=Number(id.slice(4));if(s.selected[p]===null){s.selected[p]=i;tell(g,p,'Tile selected. Operate another slot to swap.');}else{const j=s.selected[p];[s.order[i],s.order[j]]=[s.order[j],s.order[i]];s.selected[p]=null;}}else if(id==='submit'){g.solved=s.order.join('')==='ACEDB';tell(g,p,g.solved?'Order accepted.':'Order violates at least one inscription.');}break;
    case 9: toggle(g,p,id,[3,6,12,1]);break;
    case 10: {const links:Record<string,string[]>={'1':['2'],'2':['1','3','S2'],'3':['2','4','S3'],'4':['3'],S2:['2'],S3:['3']};if(id==='S3'){tell(g,p,'That siding is unavailable.');break;}if(links[s.carts[p]].includes(id)&&s.carts[1-p]!==id)s.carts[p]=id;else tell(g,p,'Track blocked or station not adjacent.');break;}
    case 11: if(id.startsWith('select')){if(g.players.some(a=>a.x===5||a.x===9)){tell(g,p,'Wait until both travellers reach an island.');break;}s.bridge=1-s.bridge;}break;
    case 12: if(id==='route')s.routes[1-p]=1-s.routes[1-p];if(id==='submit'){g.solved=s.routes[0]===1&&s.routes[1]===1;tell(g,p,g.solved?'Both receivers powered.':'Junction conflict. Preview another pairing.');}break;
    case 14: s.dials[p]=(s.dials[p]+1)%4;s.dials[p+1]=(s.dials[p+1]+1)%4;break;
    case 15: if(id.startsWith('colour')){s.queued[p]=Number(id.slice(6));tell(g,p,'Packet queued for next confirmed tick.');}else if(id==='confirm'){s.confirm[p]=true;if(s.confirm.every(Boolean))packetTick(g);}break;
    case 16: if(id==='submit'){g.solved=s.mask===9;tell(g,p,g.solved?'All four rules satisfied.':'Configuration rejected. Recheck both inscriptions.');}else if('ABCD'.includes(id))s.mask^=1<<'ABCD'.indexOf(id);break;
    case 17: {const edges:Record<string,[string,string][]>={S:[['A','red'],['B','red']],B:[['S','red']],A:[['C','green']],C:[['D','red']],D:[['T','green']],T:[]};const edge=edges[s.node].find(([n,c])=>n===id&&c===s.charge);if(edge){s.node=id;if(['A','C','D'].includes(id))s.charge=s.charge==='red'?'green':'red';}else tell(g,p,'No compatible connection from the charge’s current node.');break;}
    case 18: if(id==='select'){if(g.players.some(a=>a.x>=6&&a.x<=10&&a.y===5)){tell(g,p,'Wait until both travellers reach safe ground.');break;}s.stencils[0]=(s.stencils[0]+(p===0?1:2))%3;s.stencils[1]=(s.stencils[1]+1)%3;}break;
    case 19: if(id==='route')s.routes[p]=1-s.routes[p];if(id==='submit'){g.solved=routesValid(g);tell(g,p,g.solved?'Both routes supplied.':'Hub conflict or supply exceeded.');}break;
    case 20: if(id.startsWith('phase')){const control=id==='phaseS'?at(3,9):at(13,3);if(!eq(g.players[p],control)&&Math.abs(g.players[p].x-control.x)+Math.abs(g.players[p].y-control.y)>1){tell(g,p,'Operate a phase control from S or E.');break;}if(!g.players.every(a=>safeNode(a.x,a.y))){tell(g,p,'Phase change blocked: wait at safe nodes.');break;}s.phase=1-s.phase;}break;
    case 21: if(id==='key'){if(s.latch||supported(g,1,'Q')){s.key=true;g.entities[0]=g.entities[0].filter(a=>a.id!=='key');tell(g,p,'Supply key collected.');}else tell(g,p,'Tool-room supply is off.');}if(id==='latch'){if(s.key&&(s.latch||supported(g,1,'Q'))){s.latch=true;tell(g,p,'Supply permanently latched.');}else tell(g,p,'A key and active supply are required.');}break;
    case 22: {const current=s.carts[p];const links:Record<string,string[]>={start0:['A'],start1:['B'],A:['H',...(p===1?['exit1']:[])],B:['H',...(p===0?['exit0']:[])],H:['A','B','P'],P:['H'],exit0:['B'],exit1:['A']};if(!links[current].includes(id)||s.carts[1-p]===id){tell(g,p,'Junction occupied or not adjacent.');break;}if(id.startsWith('exit')&&!s.visited.every(Boolean)){tell(g,p,'Both couriers must visit H before either exits.');break;}s.carts[p]=id;s.entry[p]=true;if(id==='H')s.visited[p]=true;break;}
    case 23: if(id.startsWith('cmd')){if(s.pc!==0){tell(g,p,'Rewind before editing the program.');break;}const i=Number(id.slice(3));const commands=['R','D','L','U'];s.program[i]=value&&commands.includes(value)?value:commands[(commands.indexOf(s.program[i])+1)%4];}else if(id==='rewind'){s.pc=0;s.couriers=[at(0,0),at(0,0)];g.solved=false;}else if(id==='step'){if(s.pc<12){const d:Record<string,number[]>={R:[1,0],D:[0,1],L:[-1,0],U:[0,-1]};const[dx,dy]=d[s.program[s.pc]];for(const q of [0,1] as const){const a=s.couriers[q];const nx=a.x+dx,ny=a.y+dy;if(nx>=0&&nx<4&&ny>=0&&ny<3&&!programClosed[q].some(([x,y])=>x===nx&&y===ny))Object.assign(a,at(nx,ny));}s.pc++;}}break;
    case 24: if(id==='phase'){s.phase=1-s.phase;break;}if(/^\d$/.test(id)){const i=Number(id)-1;const gates=[-1,1,2,-1,3,4];const phases=[0,1,0,1,1,0];if(s.phase!==phases[i]||(gates[i]>=0&&!(s.mask&(1<<gates[i])))){tell(g,p,'Switch access needs its marked phase and powered gate.');break;}toggle(g,p,id,[3,6,12,24,48,1]);}break;
    case 25: if(id==='phase'){s.phase=1-s.phase;break;}if(id==='route'){s.routes[p]=1-s.routes[p];s.supply=false;break;}if(id==='submit'){s.supply=s.mask===31&&routesValid(g);if(s.supply){for(const q of[0,1] as const)if(!find(g,q,'crate'))crate(g,q,'crate',12,8);}tell(g,p,s.supply?'Routes powered; collect the crates.':'Supply requires all lamps and compatible routes.');break;}toggle(g,p,id,[3,6,12,24,1]);break;
  }
  refresh(g);
}
function packetTick(g:Game){const s=g.state;s.clock++;for(const p of[0,1] as const)if(s.queued[p]!==null)s.packets.push({p,colour:s.queued[p],arrival:s.clock+(p===0?3:2)});s.queued=[null,null];s.confirm=[false,false];const arrivals=s.packets.filter((a:any)=>a.arrival===s.clock);if(arrivals.length){const expected=[[0,0],[1,1],[0,1]][s.received];if(expected&&arrivals.length===2&&[0,1].every(p=>arrivals.some((a:any)=>a.p===p&&a.colour===expected[p])))s.received++;else{g.feedback=['Arrival mismatch. Use the local board reset to retry.','Arrival mismatch. Use the local board reset to retry.'];s.failed=true;}}}
export function tick(g:Game,dt:number){if(g.complete)return;g.elapsed+=Math.max(0,Math.min(dt,0.1));if(g.level===2&&!g.solved){g.state.hold=occupied(g,0,'B')&&occupied(g,1,'D')?g.state.hold+Math.max(0,Math.min(dt,0.1)):0;if(g.state.hold>=1-1e-8)g.solved=true;}refresh(g);}
function refresh(g:Game){const s=g.state;switch(g.level){
  case 1:g.solved=s.correct.every(Boolean);break;
  case 3:g.solved=s.index===6;break;case 4:g.solved=s.index===4;break;
  case 5:g.exits=[supported(g,1,'D'),supported(g,0,'C')];break;
  case 6:for(const p of[0,1]as const)for(let i=0;i<5;i++)find(g,p,'slot'+i)!.value=s.order[i];break;
  case 7:case 8:g.solved=s.mapDone.every(Boolean);break;
  case 9:g.solved=s.mask===11;break;
  case 10:g.solved=s.carts[0]==='4'&&s.carts[1]==='1';syncCarts(g);break;
  case 11:g.solved=g.players.every(a=>a.x>9);break;
  case 13:{const crates=g.entities[0].filter(e=>e.kind==='crate');const groups=[4,6].map(y=>crates.filter(e=>e.y===y&&[4,6,8].includes(e.x)&&!g.players.some(a=>a.grab===e.id)));g.solved=groups.every(a=>a.length===3&&a.reduce((v,e)=>v+Number(e.value),0)===11);break;}
  case 14:g.solved=s.dials.join(',')==='3,1,2';break;
  case 15:g.solved=s.received===3&&!s.failed;break;
  case 17:g.solved=s.node==='T';for(const p of[0,1]as const){const a=find(g,p,s.node),c=find(g,p,'courier');if(a&&c){Object.assign(c,at(a.x,a.y));c.channel=s.charge==='green'?0:1;}}break;
  case 18:{const stencils=[['11000','10110','00111'],['00101','01001','11010']];s.coverage=Array.from({length:5},(_,i)=>Number(stencils[0][s.stencils[0]][i])+Number(stencils[1][s.stencils[1]][i]));g.solved=s.coverage.every((v:number)=>v===1);for(const p of[0,1]as const)for(let i=0;i<5;i++)find(g,p,'section'+i)!.on=stencils[p][s.stencils[p]][i]==='1';break;}
  case 20:g.solved=s.delivered&&s.travelled.every(Boolean);break;
  case 21:g.exits=[s.latch&&supported(g,1,'R'),s.latch&&supported(g,0,'S')];break;
  case 22:g.solved=s.carts[0]==='exit0'&&s.carts[1]==='exit1'&&s.visited.every(Boolean);syncCarts(g);break;
  case 23:g.solved=s.pc===12&&s.couriers.every((a:Point)=>a.x===3&&a.y===2);for(const p of[0,1]as const)for(let i=0;i<12;i++)find(g,p,'cmd'+i)!.value=s.program[i];break;
  case 24:g.solved=s.mask===56;break;
  case 25:for(const p of[0,1]as const){const support=supported(g,p,p===0?'P':'Q');if(!support)s.docked[p]=false;else if(s.phase===p&&s.supply&&s.mask===31&&routesValid(g))s.docked[p]=true;}g.exits=s.docked.map((v:boolean)=>v&&s.supply&&s.mask===31&&routesValid(g));break;
}
if(![5,21,25].includes(g.level))g.exits=[g.solved,g.solved];
if(s.mask!==undefined)for(const p of[0,1]as const)for(const e of g.entities[p])if(e.kind==='lamp')e.on=!!(s.mask&(1<<Number(e.id.slice(4))));
for(const p of[0,1]as const)for(const e of g.entities[p])if(e.kind==='pad')e.on=occupied(g,p,e.id);
g.complete=g.exits.every(Boolean)&&g.players.every(a=>eq(a,exit));
}
function syncCarts(g:Game){for(const p of[0,1]as const)for(const q of[0,1]as const){const cart=find(g,p,'cart'+q),node=find(g,p,g.state.carts[q]);if(cart&&node)Object.assign(cart,at(node.x,node.y));}}
export function getView(g:Game,p:PlayerId):{clues:string[];status:string[];objective:string;tip:string}{const level=levels[g.level-1],s=g.state;const status:string[]=[];
if(g.level===1)status.push(`Your input: ${s.correct[p]?'latched':'waiting'}`);
if(g.level===2)status.push(`Joint hold: ${Math.min(100,Math.floor(s.hold*100))}%`);
if(g.level===3)status.push(s.index===6?'Sequence complete':`Step ${s.index+1}/6 · ${names[s.index%2]}'s turn`);
if(g.level===4)status.push(`Translation: ${s.index}/4`);
if(g.level===6)status.push(`Rail: ${s.order.join('–')}`,s.selected[p]===null?'Select two slots to swap.':`Slot ${s.selected[p]+1} selected.`);
if([9,24,25].includes(g.level))status.push('Lamps: '+Array.from({length:g.level===9?4:g.level===24?6:5},(_,i)=>i%2===p?`${String.fromCharCode(65+i)} ${s.mask&(1<<i)?'ON':'off'}`:null).filter(Boolean).join(' · '));
if([10,22].includes(g.level))status.push(`C at ${s.carts[0]} · W at ${s.carts[1]}`);
if(g.level===11)status.push(`Powered bridge: ${s.bridge===0?'L–M':'M–R'}`);
if(g.level===12)status.push(`Your beam: ${p===0?['A–C','B–D'][s.routes[0]]:['A–D','C–E'][s.routes[1]]}`);
if(g.level===13)status.push('Only crates in the six cradles count.');
if(g.level===14)status.push(p===0?`Dials A ${s.dials[0]} · B ${s.dials[1]}`:`Dial C ${s.dials[2]}`);
if(g.level===15)status.push(`Tick ${s.clock} · pairs received ${s.received}/3`,s.confirm[p]?'Tick confirmed; waiting for partner.':`Queued: ${s.queued[p]===null?'none':(p===0?['green','blue']:['red','amber'])[s.queued[p]]}`);
if(g.level===16)status.push('Switches: '+Array.from('ABCD',(c,i)=>`${c} ${s.mask&(1<<i)?'ON':'off'}`).join(' · '));
if(g.level===17)status.push(`Courier at ${s.node}`,s.charge===(p===0?'green':'red')?`Charge: ${s.charge}`:'Charge unreadable in your channel.');
if(g.level===18)status.push(`Your stencil: ${'ABC'[s.stencils[p]]}`);
if([19,25].includes(g.level))status.push(`Your route: ${s.routes[p]===0?'upper':'lower'}`);
if([20,24,25].includes(g.level))status.push(`Phase ${s.phase}`);
if(g.level===20)status.push(s.delivered?'Key delivered.':'Exit key not delivered.');
if(g.level===21)status.push(s.latch?'Q supply permanently latched.':'Q supply requires temporary support.');
if(g.level===23)status.push(`Program ${s.program.join('')} · step ${s.pc}/12`,`Your courier: (${s.couriers[p].x+1},${s.couriers[p].y+1})`);
status.push(g.exits[p]?'Your exit is powered. Reach the doorway.':'Your exit is waiting for its conditions.');
return {clues:level.clues[p],status,objective:level.objective,tip:level.tip};}
