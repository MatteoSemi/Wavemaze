import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, move, interact, grab, tick, act, canWalk, worldTile, getView } from '../src/game.ts';

type P = 0 | 1;
type G = ReturnType<typeof createGame>;
const directions = [[1,0],[-1,0],[0,1],[0,-1]] as const;
function permutations<T>(a:T[]):T[][] { return a.length ? a.flatMap((v,i)=>permutations(a.filter((_,j)=>j!==i)).map(rest=>[v,...rest])) : [[]]; }
function paritySolutions(effects:number[],target:number):number[] { return Array.from({length:2**effects.length},(_,bits)=>bits).filter(bits=>effects.reduce((sum,e,i)=>bits&(1<<i)?sum^e:sum,0)===target); }

test('finite-state source constraints: unique ordering, partition, switches, routes and complements',()=>{
  const orders=permutations(['A','B','C','D','E']).filter(a=>[['A','C'],['D','B'],['C','E'],['E','D']].every(([x,y])=>a.indexOf(x)<a.indexOf(y)));
  assert.deepEqual(orders,[['A','C','E','D','B']]);
  const weights=[1,2,3,4,5,7];
  const groups:number[][]=[];
  for(let a=0;a<6;a++)for(let b=a+1;b<6;b++)for(let c=b+1;c<6;c++)if(weights[a]+weights[b]+weights[c]===11)groups.push([weights[a],weights[b],weights[c]]);
  assert.deepEqual(groups,[[1,3,7],[2,4,5]]);
  assert.deepEqual(paritySolutions([3,6,12,1],11),[14]);
  assert.deepEqual(paritySolutions([3,6,12,24,48,1],56),[55]);
  assert.deepEqual(paritySolutions([3,6,12,24,1],31),[26]);
  const cool=['AC','BD'],warm=['AD','CE'];
  assert.deepEqual(cool.flatMap((a,i)=>warm.flatMap((b,j)=>[...a].some(x=>b.includes(x))?[]:[[i,j]])),[[1,1]]);
  const cs=['11000','10110','00111'],ws=['00101','01001','11010'];
  assert.deepEqual(cs.flatMap((a,i)=>ws.flatMap((b,j)=>[...a].every((x,k)=>x!==b[k])?[[i,j]]:[])),[[1,1]]);
  assert.deepEqual([0,1].flatMap(a=>[0,1].flatMap(b=>(a===0&&b===0)||[2,4][a]+[2,3][b]>5?[]:[[a,b]])),[[0,1]]);
  assert.deepEqual(Array.from({length:16},(_,n)=>[0,1,2,3].map(i=>!!(n&(1<<i)))).filter(([a,b,c,d])=>Number(a)+Number(b)+Number(c)+Number(d)===2&&a!==b&&d!==b&&(!c||a)),[[true,false,false,true]]);
});

test('shared-program joint BFS has minimum 12 and goal couriers keep obeying commands',()=>{
  const blocked=[new Set(['1,1','2,1','3,1']),new Set(['1,1','2,1','2,2'])];
  const advance=(p:number[],d:readonly number[])=>p.flatMap((_,i)=>i%2?[]:(()=>{const x=p[i]+d[0],y=p[i+1]+d[1];return x<0||x>3||y<0||y>2||blocked[i/2].has(`${x},${y}`)?[p[i],p[i+1]]:[x,y]})());
  let q:[number[],string][]=[[[0,0,0,0],'']];const seen=new Set(['0,0,0,0']);let found='';
  for(let head=0;head<q.length;head++){const [p,s]=q[head];if(p.join(',')==='3,2,3,2'){found=s;break;}for(const [i,d]of directions.entries()){const n=advance(p,d),key=n.join(',');if(!seen.has(key)){seen.add(key);q.push([n,s+'RLDU'[i]])}}}
  assert.equal(found.length,12);
  const end=[...'RRRDLLLDDRRR'].reduce((p,c)=>advance(p,directions['RLDU'.indexOf(c)]),[0,0,0,0]);
  assert.deepEqual(end,[3,2,3,2]);
  assert.deepEqual(advance(end,[-1,0]),[2,2,3,2]);
});

test('combined map has sole simple safe route and clockwise directions agree',()=>{
  const blocked=new Set(['2,0','0,1','3,1','3,0','0,2','1,2']);
  const routes:string[]=[];
  function visit(x:number,y:number,path:string,seen:Set<string>){if(x===3&&y===2){routes.push(path);return;}for(const [i,[dx,dy]]of directions.entries()){const nx=x+dx,ny=y+dy,k=`${nx},${ny}`;if(nx>=0&&nx<4&&ny>=0&&ny<3&&!blocked.has(k)&&!seen.has(k))visit(nx,ny,path+'RLDU'[i],new Set([...seen,k]));}}
  visit(0,0,'',new Set(['0,0']));assert.deepEqual(routes,['RDRDR']);
  assert.equal([...routes[0]].map(c=>({R:'D',D:'L',L:'U',U:'R'}[c])).join(''),'DLDLD');
});

test('coupled gears and stencils have reachable target states without timing',()=>{
  const states=[];
  for(let cool=0;cool<4;cool++)for(let warm=0;warm<4;warm++)if(cool===3&&(cool+warm)%4===1&&warm===2)states.push([cool,warm]);
  assert.deepEqual(states,[[3,2]]);
  let selectors=[0,1];
  for(const p of [0,0,1])selectors=[(selectors[0]+(p===0?1:2))%3,(selectors[1]+1)%3];
  assert.deepEqual(selectors,[1,1]);
});

test('all room factories are deterministic, reset both roles and expose only their channel clues',()=>{
  for(let level=1;level<=25;level++){
    const a=createGame(level),b=createGame(level);
    assert.equal(a.level,level);assert.equal(a.complete,false);
    assert.deepEqual(a,b,`Room ${level} starts deterministically`);
    const cool=getView(a,0),warm=getView(a,1);
    assert.ok(cool.objective.length>0);assert.ok(warm.objective.length>0);
    assert.ok(cool.clues.length>0);assert.ok(warm.clues.length>0);
    assert.notDeepEqual(cool.clues,warm.clues,`Room ${level} needs a genuine information split`);
    act(a,0,'not-a-real-device');
    assert.equal(a.complete,false,`Invalid action cannot complete room ${level}`);
    assert.deepEqual(createGame(level),b,`Room ${level} full restart restores initial state`);
  }
});

function path(g:G,p:P,x:number,y:number):number[][]|undefined {
  const start=g.players[p],q:{x:number,y:number,steps:number[][]}[]=[{x:start.x,y:start.y,steps:[]}],seen=new Set([`${start.x},${start.y}`]);
  for(let i=0;i<q.length;i++){
    const n=q[i];if(n.x===x&&n.y===y)return n.steps;
    for(const [dx,dy]of directions){const nx=n.x+dx,ny=n.y+dy,k=`${nx},${ny}`;
      if(seen.has(k)||!canWalk(g,p,nx,ny)||g.entities[p].some(e=>e.kind==='crate'&&e.id!==g.players[p].grab&&e.x===nx&&e.y===ny))continue;
      seen.add(k);q.push({x:nx,y:ny,steps:[...n.steps,[dx,dy]]});}
  }
}
function walk(g:G,p:P,x:number,y:number){
  const steps=path(g,p,x,y);assert.ok(steps,`Room ${g.level} role ${p}: no path from ${g.players[p].x},${g.players[p].y} to ${x},${y}`);
  for(const[dx,dy]of steps){const before={...g.players[p]};move(g,p,dx,dy);assert.deepEqual({x:g.players[p].x,y:g.players[p].y},{x:before.x+dx,y:before.y+dy},`Room ${g.level} movement was rejected`);}
}
function operate(g:G,p:P,id:string,value?:string){const e=g.entities[p].find(e=>e.id===id);assert.ok(e,`Room ${g.level} missing ${id}`);walk(g,p,e.x,e.y);if(value!==undefined)act(g,p,id,value);else interact(g,p);}
function carry(g:G,p:P,id:string,x:number,y:number){
  const box=g.entities[p].find(e=>e.id===id&&e.kind==='crate');assert.ok(box,`Room ${g.level} missing crate ${id}`);
  const targets=directions.map(([dx,dy])=>({x:box.x+dx,y:box.y+dy})).filter(n=>canWalk(g,p,n.x,n.y)&&g.entities[p].filter(e=>e.kind==='crate'&&Math.abs(e.x-n.x)+Math.abs(e.y-n.y)<=1).sort((a,b)=>a.id.localeCompare(b.id))[0]?.id===id).map(n=>({...n,steps:path(g,p,n.x,n.y)})).filter(n=>n.steps).sort((a,b)=>a.steps!.length-b.steps!.length);
  assert.ok(targets[0],`Room ${g.level} cannot reach crate ${id}`);walk(g,p,targets[0].x,targets[0].y);grab(g,p);assert.equal(g.players[p].grab,id);walk(g,p,x,y);grab(g,p);assert.equal(g.players[p].grab,undefined);
}
function carryTo(g:G,p:P,id:string,pad:string){const e=g.entities[p].find(e=>e.id===pad);assert.ok(e);carry(g,p,id,e.x,e.y);}
function jointExit(g:G){
  assert.deepEqual(g.exits,[true,true],`Room ${g.level}: conditions must power both exits`);
  walk(g,0,13,2);assert.equal(g.complete,false,`Room ${g.level}: Cool cannot advance alone`);
  walk(g,1,13,2);assert.equal(g.complete,true,`Room ${g.level}: both roles must depart together`);
}
function solve(g:G){
  const n=g.level;
  switch(n){
    case 1:operate(g,0,'B');operate(g,1,'C');break;
    case 2:walk(g,0,6,5);walk(g,1,12,5);for(let i=0;i<10;i++)tick(g,0.1);break;
    case 3:for(const[p,id]of [[0,'A'],[1,'B'],[0,'C'],[1,'A'],[0,'B'],[1,'C']]as[P,string][])operate(g,p,id);break;
    case 4:for(const id of 'CABC')operate(g,0,id);break;
    case 5:carry(g,0,'crate',5,7);carry(g,1,'crate',11,6);carry(g,0,'crate',8,7);break;
    case 6:for(let i=0;i<5;i++){const j=g.state.order.indexOf('ACEDB'[i]);if(i!==j){operate(g,0,'slot'+i);operate(g,0,'slot'+j);}}operate(g,1,'submit');break;
    case 7:case 8:for(const p of[0,1]as const){for(const c of n===8&&p===1?'DLDLD':'RDRDR'){const d=directions['RLDU'.indexOf(c)];move(g,p,d[0],d[1]);}}break;
    case 9:for(const id of['2','3','4'])operate(g,Number(id)%2 as P,id);break;
    case 10:for(const[p,id]of[[0,'2'],[0,'S2'],[1,'3'],[1,'2'],[1,'1'],[0,'2'],[0,'3'],[0,'4']]as[P,string][])operate(g,p,id);break;
    case 11:walk(g,1,7,6);operate(g,0,'selectL');walk(g,1,12,6);operate(g,1,'selectR');walk(g,0,7,6);operate(g,1,'selectR');walk(g,0,12,6);break;
    case 12:operate(g,0,'route');operate(g,1,'route');operate(g,0,'submit');break;
    case 13:for(const[id,x,y]of[['A',4,4],['C',6,4],['F',8,4],['B',4,6],['D',6,6],['E',8,6]]as[string,number,number][])carry(g,0,id,x,y);break;
    case 14:for(let i=0;i<3;i++)operate(g,0,'lever');for(let i=0;i<2;i++)operate(g,1,'lever');break;
    case 15:for(let clock=1;clock<=8;clock++){if([1,3,5].includes(clock))operate(g,0,clock===3?'colour1':'colour0');if([2,4,6].includes(clock))operate(g,1,clock===2?'colour0':'colour1');operate(g,0,'confirm');operate(g,1,'confirm');}break;
    case 16:operate(g,0,'A');operate(g,1,'D');operate(g,0,'submit');break;
    case 17:for(const id of['A','C','D','T'])operate(g,id==='C'||id==='T'?0:1,id);break;
    case 18:operate(g,0,'select');operate(g,0,'select');operate(g,1,'select');break;
    case 19:operate(g,1,'route');operate(g,0,'submit');break;
    case 20:{walk(g,0,8,6);operate(g,1,'phaseS');walk(g,0,8,3);walk(g,0,8,6);operate(g,1,'phaseS');walk(g,0,13,6);operate(g,1,'phaseS');walk(g,0,13,3);operate(g,0,'phaseE');walk(g,1,8,6);operate(g,0,'phaseE');walk(g,1,8,3);walk(g,1,8,6);operate(g,0,'phaseE');walk(g,1,13,6);operate(g,0,'phaseE');walk(g,1,13,3);break;}
    case 21:carry(g,0,'crate',5,7);carry(g,1,'crate',10,6);operate(g,0,'key');operate(g,0,'latch');carryTo(g,1,'crate','R');carry(g,0,'crate',7,7);break;
    case 22:for(const[p,id]of[[0,'A'],[0,'H'],[0,'P'],[1,'B'],[1,'H'],[1,'A'],[1,'exit1'],[0,'H'],[0,'B'],[0,'exit0']]as[P,string][])operate(g,p,id);break;
    case 23:for(const[i,c]of[...'RRRDLLLDDRRR'].entries())operate(g,i%2 as P,'cmd'+i,c);for(let i=0;i<12;i++)operate(g,i%2 as P,'step');break;
    case 24:for(const[i,id]of['1','2','3','5','6'].entries()){if(i)operate(g,(i-1)%2 as P,'phase');operate(g,i%2 as P,id);}break;
    case 25:for(const id of['2','4','5'])operate(g,0,id);operate(g,1,'route');operate(g,0,'submit');carry(g,0,'crate',8,8);operate(g,1,'phase');carry(g,1,'crate',8,8);break;
  }
}
for(let level=1;level<=25;level++)test(`Room ${String(level).padStart(2,'0')}: source solution, actual traversal and joint exit`,()=>{const g=createGame(level);solve(g);jointExit(g);});

test('actual switch, order, route, dial and stencil handlers agree with enumerated constraints',()=>{
  const masks=[];
  for(let parity=0;parity<16;parity++){const g=createGame(9);for(let i=0;i<4;i++)if(parity&(1<<i))act(g,i%2 as P,String(i+1));if(g.solved)masks.push(parity);}
  assert.deepEqual(masks,[14]);
  const configurations=[];
  for(let mask=0;mask<16;mask++){const g=createGame(16);for(let i=0;i<4;i++)if(mask&(1<<i))act(g,i%2 as P,'ABCD'[i]);assert.equal(g.solved,false,'Exclusions require explicit submission');act(g,0,'submit');if(g.solved)configurations.push(mask);}
  assert.deepEqual(configurations,[9]);
  const orders:string[]=[];
  for(const order of permutations(['A','B','C','D','E'])){const g=createGame(6);for(let i=0;i<5;i++){const j=g.state.order.indexOf(order[i]);if(i!==j){act(g,0,'slot'+i);act(g,0,'slot'+j)}}act(g,1,'submit');if(g.solved)orders.push(order.join(''));}
  assert.deepEqual(orders,['ACEDB']);
  for(const level of[12,19]){const valid:number[][]=[];for(let a=0;a<2;a++)for(let b=0;b<2;b++){const g=createGame(level);if(a)act(g,level===12?1:0,'route');if(b)act(g,level===12?0:1,'route');act(g,0,'submit');if(g.solved)valid.push([a,b]);}assert.deepEqual(valid,level===12?[[1,1]]:[[0,1]]);}
  const dials:number[][]=[];for(let a=0;a<4;a++)for(let b=0;b<4;b++){const g=createGame(14);for(let i=0;i<a;i++)act(g,0,'lever');for(let i=0;i<b;i++)act(g,1,'lever');if(g.solved)dials.push([a,b]);}assert.deepEqual(dials,[[3,2]]);
  const states=new Map<string,G>();const q=[createGame(18)];for(let i=0;i<q.length;i++){const g=q[i],key=g.state.stencils.join();if(states.has(key))continue;states.set(key,g);for(const p of[0,1]as const){const n=structuredClone(g);act(n,p,'select');if(!states.has(n.state.stencils.join()))q.push(n);}}assert.equal(states.size,9);assert.deepEqual([...states.values()].filter(g=>g.solved).map(g=>g.state.stencils),[[1,1]]);
});

test('wrong inputs, sequence feedback, repeated reversals and partial submissions recover',()=>{
  const a=createGame(1);operate(a,0,'A');assert.equal(a.state.correct[0],false);operate(a,0,'B');operate(a,0,'A');assert.equal(a.state.correct[0],true);
  const b=createGame(3);operate(b,0,'A');operate(b,0,'C');assert.equal(b.state.index,0);assert.match(b.feedback[0],/step 2/);solve(b);jointExit(b);
  const c=createGame(4);operate(c,0,'A');assert.equal(c.state.index,0);solve(c);jointExit(c);
  const d=createGame(9);operate(d,0,'2');operate(d,0,'2');assert.equal(d.state.mask,0);assert.equal(d.history.length,2);solve(d);jointExit(d);
  const e=createGame(12);operate(e,0,'submit');assert.equal(e.solved,false);solve(e);jointExit(e);
  const f=createGame(16);operate(f,0,'submit');assert.equal(f.solved,false);solve(f);jointExit(f);
  const h=createGame(19);operate(h,0,'submit');assert.equal(h.solved,false);solve(h);jointExit(h);
});

test('pressure hold resets when either player leaves, then latches after one joint second',()=>{
  const g=createGame(2);walk(g,0,6,5);walk(g,1,12,5);for(let i=0;i<6;i++)tick(g,.1);assert.equal(g.solved,false);move(g,1,0,1);tick(g,.1);assert.equal(g.state.hold,0);walk(g,1,12,5);for(let i=0;i<10;i++)tick(g,.1);assert.equal(g.solved,true);move(g,1,0,1);tick(g,.1);assert.equal(g.solved,true);jointExit(g);
});

test('cart occupancy, unavailable siding and entry closures reject shortcuts',()=>{
  const g=createGame(10);operate(g,0,'2');operate(g,1,'3');operate(g,1,'2');assert.deepEqual(g.state.carts,['2','3']);operate(g,1,'S3');assert.deepEqual(g.state.carts,['2','3']);operate(g,0,'S2');operate(g,1,'2');operate(g,1,'1');operate(g,0,'2');operate(g,0,'3');operate(g,0,'4');jointExit(g);
  const h=createGame(22);operate(h,0,'A');operate(h,0,'H');operate(h,0,'B');operate(h,0,'exit0');assert.equal(h.state.carts[0],'B');assert.equal(h.solved,false);operate(h,0,'H');operate(h,0,'P');operate(h,1,'B');operate(h,1,'H');operate(h,1,'A');operate(h,1,'exit1');operate(h,0,'H');operate(h,0,'B');operate(h,0,'exit0');jointExit(h);
});

test('packet confirmations are joint, travel delays differ, mismatch reset restores a retry',()=>{
  const g=createGame(15);operate(g,0,'colour0');operate(g,0,'confirm');operate(g,0,'confirm');assert.equal(g.state.clock,0);operate(g,1,'confirm');assert.equal(g.state.clock,1);assert.equal(g.state.packets[0].arrival,4);operate(g,1,'colour0');operate(g,0,'confirm');operate(g,1,'confirm');assert.equal(g.state.packets[1].arrival,4);for(let i=0;i<2;i++){operate(g,0,'confirm');operate(g,1,'confirm')}assert.equal(g.state.received,1);
  operate(g,0,'reset');assert.equal(g.state.clock,0);assert.equal(g.state.received,0);assert.deepEqual(g.state.packets,[]);solve(g);jointExit(g);
  const bad=createGame(15);operate(bad,1,'colour0');for(let i=0;i<3;i++){operate(bad,0,'confirm');operate(bad,1,'confirm')}assert.equal(bad.state.failed,true);assert.equal(bad.solved,false);operate(bad,0,'reset');solve(bad);jointExit(bad);
});

test('charge dead end returns safely and converters change state at the specified nodes',()=>{
  const g=createGame(17);operate(g,1,'B');assert.equal(g.state.node,'B');assert.equal(g.state.charge,'red');operate(g,0,'C');assert.equal(g.state.node,'B');operate(g,1,'S');assert.equal(g.state.node,'S');operate(g,1,'A');assert.equal(g.state.charge,'green');operate(g,0,'C');assert.equal(g.state.charge,'red');operate(g,1,'D');assert.equal(g.state.charge,'green');operate(g,0,'T');jointExit(g);
});

test('phase change rejects unsafe corridors, key delivery persists and second traveller crosses',()=>{
  const g=createGame(20);move(g,0,0,-1);operate(g,1,'phaseS');assert.equal(g.state.phase,0);walk(g,0,8,6);operate(g,1,'phaseS');assert.equal(g.state.phase,1);walk(g,0,8,3);assert.equal(g.state.keyCarrier,0);walk(g,0,8,6);operate(g,1,'phaseS');walk(g,0,13,6);operate(g,1,'phaseS');walk(g,0,13,3);assert.equal(g.state.delivered,true);assert.equal(g.solved,false);operate(g,0,'phaseE');walk(g,1,8,6);operate(g,0,'phaseE');walk(g,1,8,3);walk(g,1,8,6);operate(g,0,'phaseE');walk(g,1,13,6);operate(g,0,'phaseE');walk(g,1,13,3);jointExit(g);
});

test('shared program local rewind keeps edits; blocked commands wait and goals do not freeze',()=>{
  const g=createGame(23);for(const[i,c]of[...'RRRDLLLDDRRR'].entries())operate(g,0,'cmd'+i,c);for(let i=0;i<4;i++)operate(g,0,'step');assert.deepEqual(g.state.couriers,[{x:3,y:0},{x:3,y:1}]);operate(g,1,'rewind');assert.equal(g.state.pc,0);assert.deepEqual(g.state.couriers,[{x:0,y:0},{x:0,y:0}]);assert.equal(g.state.program.join(''),'RRRDLLLDDRRR');for(let i=0;i<12;i++)operate(g,i%2 as P,'step');jointExit(g);
});

test('actual program interpreter BFS also reaches both goals first at twelve commands',()=>{
  const evaluate=(program:string)=>{const g=createGame(23);for(const[i,c]of[...program].entries())act(g,i%2 as P,'cmd'+i,c);for(let i=0;i<program.length;i++)act(g,i%2 as P,'step');return g;};
  const q=[''],seen=new Set<string>();let answer='';
  for(let i=0;i<q.length;i++){const program=q[i],g=evaluate(program),key=g.state.couriers.map((a:{x:number,y:number})=>`${a.x},${a.y}`).join('|');if(seen.has(key))continue;seen.add(key);if(g.state.couriers.every((a:{x:number,y:number})=>a.x===3&&a.y===2)){answer=program;break;}if(program.length<12)for(const c of'RDLU')q.push(program+c);}
  assert.equal(answer.length,12);assert.equal(evaluate(answer).solved,true);
});

test('crate bridges retract safely; Q latch stays powered and phase-specific docks require support',()=>{
  const a=createGame(5);carry(a,0,'crate',5,7);carry(a,1,'crate',11,6);carry(a,0,'crate',8,7);assert.equal(canWalk(a,1,7,7),false);assert.equal(a.players[1].x>7,true);jointExit(a);
  const b=createGame(21);carryTo(b,0,'crate','P');carryTo(b,1,'crate','Q');operate(b,0,'key');operate(b,0,'latch');assert.equal(b.state.latch,true);carryTo(b,1,'crate','R');assert.equal(b.state.latch,true);assert.equal(canWalk(b,0,9,7),true);carryTo(b,0,'crate','S');jointExit(b);
  const g=createGame(25);for(const id of['2','4','5'])operate(g,0,id);operate(g,1,'route');operate(g,0,'submit');carryTo(g,0,'crate','P');assert.deepEqual(g.state.docked,[true,false]);operate(g,1,'phase');assert.deepEqual(g.state.docked,[true,false]);carryTo(g,1,'crate','Q');assert.deepEqual(g.exits,[true,true]);
  const pad=g.entities[0].find(e=>e.id==='P')!;walk(g,0,pad.x,pad.y);grab(g,0);assert.equal(g.exits[0],false);grab(g,0);assert.equal(g.exits[0],false,'Cool cannot re-latch during Warm phase');operate(g,1,'phase');assert.deepEqual(g.exits,[true,true]);jointExit(g);
});

test('selectors reject bridge changes during crossings and access gates have neutral returns',()=>{
  const g=createGame(11);walk(g,1,5,6);operate(g,0,'selectL');assert.equal(g.state.bridge,0);walk(g,1,7,6);operate(g,0,'selectL');assert.equal(g.state.bridge,1);
  const h=createGame(18);operate(h,0,'select');operate(h,0,'select');operate(h,1,'select');walk(h,0,6,5);const before=[...h.state.stencils];operate(h,1,'select');assert.deepEqual(h.state.stencils,before);walk(h,0,11,5);jointExit(h);
  const c=createGame(24);assert.equal(canWalk(c,0,5,7),false);operate(c,0,'1');operate(c,1,'phase');operate(c,1,'2');assert.equal(c.state.mask,5);walk(c,1,2,9);assert.equal(c.players[1].y,9);
});

test('shared crate cannot be stolen or pushed while held by the other role',()=>{
  const g=createGame(13);walk(g,0,3,9);grab(g,0);assert.equal(g.players[0].grab,'A');walk(g,1,3,10);grab(g,1);assert.equal(g.players[1].grab,undefined);const before={...g.players[1]};move(g,1,0,-1);assert.deepEqual(g.players[1],before);grab(g,0);assert.equal(g.players[0].grab,undefined);
});

test('lift sensors ignore carried crates and restored crates recover the balanced partition',()=>{
  const g=createGame(13);solve(g);assert.equal(g.solved,true);walk(g,0,3,4);grab(g,0);assert.equal(g.players[0].grab,'A');assert.equal(g.solved,false);walk(g,0,4,4);assert.equal(g.solved,false,'Carrying a crate through its cradle must not count');grab(g,0);assert.equal(g.solved,true);jointExit(g);
});

test('final room power losses close exits until both maintained systems recover',()=>{
  const g=createGame(25);solve(g);assert.deepEqual(g.exits,[true,true]);operate(g,0,'1');assert.deepEqual(g.exits,[false,false]);operate(g,0,'1');assert.deepEqual(g.exits,[true,true]);operate(g,0,'route');assert.deepEqual(g.exits,[false,false]);operate(g,0,'route');assert.deepEqual(g.exits,[false,false],'Reconfigure supply explicitly after rerouting');operate(g,1,'submit');assert.deepEqual(g.exits,[true,true]);jointExit(g);
});

test('powered circuit finite state search finds the gated phase solution and only its parity set',()=>{
  const initial=createGame(24),q:{g:G,parity:number}[]=[{g:initial,parity:0}],seen=new Set<string>(),winners=new Set<number>();
  for(let head=0;head<q.length;head++){const{g,parity}=q[head],key=`${g.state.mask},${g.state.phase}`;if(seen.has(key))continue;seen.add(key);if(g.solved)winners.add(parity);for(const id of['phase','1','2','3','4','5','6']){const next=structuredClone(g),before=next.state.mask;act(next,0,id);q.push({g:next,parity:id!=='phase'&&before!==next.state.mask?parity^(1<<(Number(id)-1)):parity});}}
  assert.ok(seen.size>10);assert.deepEqual([...winners],[55]);
});
