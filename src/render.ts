import { nearest, worldTile, type Game, type PlayerId } from './game';

// Material ramps are adapted from R03; every mark lands on a logical pixel.
const C = {
  void: '#111a22', floor: '#29353d', floorLight: '#303d45', floorDark: '#253139',
  mortar: '#374654', stone: '#8294a5', stoneLight: '#abb7c5', stoneDark: '#596b7e',
  wood: '#b56f55', woodLight: '#ca8762', woodDark: '#6e3d38', gold: '#feae33',
  goldLight: '#f4e25a', cream: '#e8dfbf', ink: '#1b2630', cool: '#72d2c3',
  coolDark: '#397e8d', warm: '#efa55b', warmDark: '#a65c47', grey: '#65737a',
};
type Context = CanvasRenderingContext2D;
const rect = (c: Context, x: number, y: number, w: number, h: number, colour: string) => {
  c.fillStyle = colour; c.fillRect(Math.floor(x), Math.floor(y), w, h);
};
const glyphs: Record<string, string> = {
  A:'01110100011000111111100011000110001',B:'11110100011000111110100011000111110',
  C:'01111100001000010000100001000001111',D:'11110100011000110001100011000111110',
  E:'11111100001000011110100001000011111',F:'11111100001000011110100001000010000',
  G:'01111100001000010111100011000101111',H:'10001100011000111111100011000110001',
  I:'11111001000010000100001000010011111',J:'00111000100001000010100101001001100',
  K:'10001100101010011000101001001010001',L:'10000100001000010000100001000011111',
  M:'10001110111010110101100011000110001',N:'10001110011010110011100011000110001',
  O:'01110100011000110001100011000101110',P:'11110100011000111110100001000010000',
  Q:'01110100011000110001101011001001101',R:'11110100011000111110101001001010001',
  S:'01111100001000001110000010000111110',T:'11111001000010000100001000010000100',
  U:'10001100011000110001100011000101110',V:'10001100011000110001100010101000100',
  W:'10001100011000110101101011101110001',X:'10001100010101000100010101000110001',
  Y:'10001100010101000100001000010000100',Z:'11111000010001000100010001000011111',
  '0':'01110100011001110101110011000101110','1':'00100011000010000100001000010001110',
  '2':'01110100010000100010001000100011111','3':'11110000010000101110000010000111110',
  '4':'00010001100101010010111110001000010','5':'11111100001000011110000010000111110',
  '6':'01110100001000011110100011000101110','7':'11111000010001000100010000100001000',
  '8':'01110100011000101110100011000101110','9':'01110100011000101111000010000101110',
  '?':'01110100010000100010001000000000100','!':'00100001000010000100001000000000100',
  '-':'00000000000000011111000000000000000','+':'00000001000010011111001000010000000',
  '>':'10000010000010000010001000100010000','<':'00001000100010001000001000001000001',
  '/':'00001000100001000100010000100010000',':':'00000001000010000000001000010000000',
  '.':'00000000000000000000000000010000100','=':'00000000001111100000111110000000000',
};
function text(c: Context, value: string, x: number, y: number, colour = C.cream, scale = 1) {
  let cursor = x;
  for (const letter of value.toUpperCase()) {
    const bits = glyphs[letter];
    if (bits) for (let row = 0; row < 7; row++) for (let col = 0; col < 5; col++) {
      if (bits[row * 5 + col] === '1') rect(c, cursor + col * scale, y + row * scale, scale, scale, colour);
    }
    cursor += 6 * scale;
  }
}
function stone(c: Context, x: number, y: number, seed: number, dark = false) {
  rect(c,x,y,16,16,C.mortar);
  const a = dark ? C.stoneDark : C.stone;
  rect(c,x,y,15,7,a); rect(c,x+1,y,13,1,dark ? C.stone : C.stoneLight);
  rect(c,x+(seed%2 ? 0 : 5),y+8,seed%2 ? 8 : 10,7,a);
  rect(c,x+(seed%2 ? 9 : 0),y+8,seed%2 ? 7 : 4,7,a);
  rect(c,x+2,y+9,4,1,dark ? C.stone : C.stoneLight);
  rect(c,x+11,y+3,3,2,C.stoneDark); rect(c,x+2,y+5,2,1,C.stoneDark);
}
function floor(c: Context,x: number,y: number,seed: number) {
  rect(c,x,y,16,16,seed%5 === 0 ? C.floorLight : C.floor);
  rect(c,x,y+15,16,1,C.floorDark); rect(c,x+15,y,1,16,C.floorDark);
  if (seed%7===0) { rect(c,x+3,y+4,4,1,C.floorLight); rect(c,x+2,y+5,1,3,C.floorLight); }
  if (seed%11===0) { rect(c,x+10,y+10,3,1,C.floorDark); rect(c,x+11,y+11,1,2,C.floorDark); }
}
function door(c: Context,x: number,y: number,open: boolean, size = 1) {
  c.save(); c.translate(x,y); c.scale(size,size);
  // Stepped arch and irregular stone blocks, vertical wood, two gold straps.
  rect(c,4,0,24,3,C.stoneDark); rect(c,1,3,30,4,C.stoneLight);
  rect(c,0,7,32,31,C.stoneDark); rect(c,2,6,28,31,C.mortar);
  rect(c,5,5,22,32,open ? C.ink : C.woodDark);
  if (!open) {
    rect(c,7,7,18,30,C.wood); rect(c,8,8,3,29,C.woodLight);
    rect(c,12,7,1,30,C.woodDark); rect(c,19,7,2,30,C.woodDark);
    rect(c,15,10,1,8,C.woodLight); rect(c,22,22,1,9,C.woodDark);
    for(const yy of [16,29]) { rect(c,5,yy,22,3,C.gold); for(const xx of [7,13,19,24]) rect(c,xx,yy+1,1,1,C.goldLight); }
    rect(c,22,22,3,4,C.woodDark); rect(c,21,22,1,3,C.gold); rect(c,25,22,1,3,C.gold); rect(c,22,25,3,1,C.gold);
  } else {
    rect(c,7,8,4,27,C.wood); rect(c,7,17,4,2,C.gold); rect(c,7,30,4,2,C.gold);
    rect(c,12,35,13,2,C.floorLight); rect(c,14,30,9,1,C.stoneDark);
  }
  for(let yy=8;yy<37;yy+=7) {
    rect(c,0,yy,5,6,C.stone); rect(c,0,yy,4,1,C.stoneLight);
    rect(c,27,yy,5,6,C.stone); rect(c,28,yy,4,1,C.stoneLight);
    rect(c,1,yy+3,2,1,C.stoneDark); rect(c,29,yy+4,2,1,C.stoneDark);
  }
  rect(c,4,4,5,5,C.stone); rect(c,23,4,5,5,C.stone); rect(c,9,2,14,4,C.stone);
  rect(c,10,2,12,1,C.stoneLight); rect(c,3,38,26,2,C.stoneDark);
  c.restore();
}
function torch(c: Context,x: number,y: number,time: number,colour?:string) {
  const flicker = Math.floor(time / 0.23)%2;
  rect(c,x-2,y+4,5,3,C.stoneDark); rect(c,x,y+3,2,8,C.woodDark);
  rect(c,x-2,y-1+flicker,6,7-flicker,colour ?? '#bf6a37');
  rect(c,x-1,y-3+flicker,3,7-flicker,colour ?? C.gold); rect(c,x,y,2,4,C.goldLight);
}
function character(c: Context,x: number,y: number,p: PlayerId,time: number,moving = false) {
  const a = p === 0 ? C.cool : C.warm, d = p === 0 ? C.coolDark : C.warmDark;
  const bob = moving ? Math.floor(time/0.18)%2 : 0;
  rect(c,x+3,y+14,10,2,C.ink); rect(c,x+4,y+11,3,4,C.ink); rect(c,x+9,y+11,3,4,C.ink);
  rect(c,x+3,y+6-bob,10,7,d); rect(c,x+1,y+8-bob,3,4,d); rect(c,x+12,y+8-bob,3,4,d);
  rect(c,x+4,y+7-bob,8,5,a); rect(c,x+4,y+12-bob,8,2,d);
  if(p===0) { rect(c,x+5,y-bob,6,2,d); rect(c,x+3,y+2-bob,10,6,d); rect(c,x+4,y+2-bob,8,2,a); }
  else { rect(c,x+4,y+1-bob,8,6,d); rect(c,x+3,y-bob,9,3,a); rect(c,x+11,y+2-bob,3,2,a); }
  rect(c,x+5,y+4-bob,6,3,'#dfc7a3'); rect(c,x+5,y+4-bob,2,1,C.ink); rect(c,x+9,y+4-bob,2,1,C.ink);
  if(p===0) { rect(c,x+7,y+8-bob,2,1,C.cream); rect(c,x+6,y+9-bob,4,1,C.cream); rect(c,x+7,y+10-bob,2,1,C.cream); }
  else rect(c,x+7,y+8-bob,3,3,C.cream);
  rect(c,x+1,y+11-bob,2,2,'#dfc7a3'); rect(c,x+13,y+11-bob,2,2,'#dfc7a3');
}
function crate(c: Context,x:number,y:number,label:string,colour = C.cream) {
  rect(c,x+1,y+1,14,14,C.woodDark); rect(c,x+2,y+2,12,11,C.wood);
  rect(c,x+3,y+3,10,1,C.woodLight); rect(c,x+4,y+4,1,8,C.woodDark); rect(c,x+10,y+4,1,8,C.woodDark);
  rect(c,x+2,y+4,12,2,C.woodLight); rect(c,x+2,y+10,12,2,C.woodDark);
  rect(c,x+2,y+2,2,2,C.gold); rect(c,x+12,y+2,2,2,C.gold); rect(c,x+2,y+12,2,2,C.gold); rect(c,x+12,y+12,2,2,C.gold);
  if(label) { rect(c,x+5,y+5,7,9,C.woodDark); text(c,label.slice(0,1),x+6,y+6,colour); }
}
function device(c: Context,e: any,p:PlayerId,g:Game,time:number) {
  const x=e.x*16, y=e.y*16;
  const visible = e.channel === undefined || e.channel === p;
  const a = !visible ? C.grey : p===0 ? C.cool : C.warm;
  const kind=String(e.kind).toLowerCase();
  const label=String(e.label ?? '');
  const value=visible && e.value !== undefined ? String(e.value) : '';
  const active=visible && (e.active || e.on || e.powered || e.latched);
  if(kind==='exit'||kind==='door') return;
  if(kind.includes('crate')) { crate(c,x,y,label,C.cream); if(value) { rect(c,x+12,y-4,value.length*6+2,9,C.ink); text(c,value,x+13,y-3,a); } return; }
  if(kind.includes('pad')||kind.includes('cradle')||kind.includes('dock')) {
    rect(c,x+1,y+7,14,8,C.ink); rect(c,x+2,y+7,12,6,C.stoneDark); rect(c,x+3,y+8,10,3,active?a:C.grey);
    rect(c,x+1,y+6,2,3,C.stone); rect(c,x+13,y+6,2,3,C.stone); if(label) text(c,label.slice(0,3),x+8-Math.min(label.length,3)*3,y-1,C.cream); return;
  }
  if(kind.includes('lamp')) {
    rect(c,x+5,y+8,6,6,C.stoneDark); rect(c,x+4,y+3,8,7,C.ink); rect(c,x+5,y+2,6,7,active?a:C.grey);
    rect(c,x+6,y+3,2,2,active?C.cream:C.stoneDark); if(label) text(c,label.slice(0,1),x+6,y+9,C.cream); return;
  }
  if(kind.includes('key')) {
    rect(c,x+2,y+5,5,5,C.woodDark); rect(c,x+3,y+4,4,5,C.gold); rect(c,x+4,y+5,2,2,C.ink);
    rect(c,x+6,y+7,8,2,C.gold); rect(c,x+10,y+9,2,2,C.gold); rect(c,x+13,y+8,2,3,C.gold); return;
  }
  if(kind.includes('cart')||kind.includes('courier')) {
    rect(c,x+2,y+9,3,5,C.ink); rect(c,x+11,y+9,3,5,C.ink); rect(c,x+1,y+5,14,6,C.stoneDark);
    rect(c,x+2,y+3,12,6,a); rect(c,x+3,y+4,10,2,visible?C.cream:C.stone); if(label) text(c,label.slice(0,1),x+6,y+5,C.ink); return;
  }
  if(kind.includes('sign')||kind.includes('clue')||kind.includes('plate')) {
    rect(c,x+1,y+3,14,9,C.woodDark); rect(c,x+2,y+4,12,7,C.wood); rect(c,x+7,y+12,2,3,C.woodDark);
    if(visible) { rect(c,x+4,y+6,8,1,a); rect(c,x+4,y+8,5,1,a); } return;
  }
  if(kind==='rail'||kind==='slot') {
    rect(c,x,y+11,16,3,C.stoneDark); rect(c,x+1,y+12,14,1,C.stoneLight);
    rect(c,x+3,y+1,11,10,C.woodDark); rect(c,x+4,y+2,9,8,C.wood);
    text(c,(value||label).slice(0,1),x+6,y+3,visible?C.cream:C.grey);
    if(value&&label!==value)text(c,label.slice(0,2),x+8-Math.min(label.length,2)*3,y+17,C.stoneLight); return;
  }
  if(kind==='marker') {
    rect(c,x+2,y+4,12,9,C.floorDark); text(c,label.slice(0,2),x+8-Math.min(label.length,2)*3,y+5,C.stoneLight); return;
  }
  if(kind==='node') {
    rect(c,x+2,y+4,12,10,C.ink); rect(c,x+3,y+4,10,8,C.stoneDark);
    rect(c,x+4,y+3,8,1,C.stoneLight); if(label)text(c,label.slice(0,3),x+8-Math.min(label.length,3)*3,y+5,C.cream);
    if(active) { rect(c,x+1,y+7,1,3,a); rect(c,x+14,y+7,1,3,a); } return;
  }
  if(kind==='console'||kind==='selector'||kind==='stencil'||kind==='receiver') {
    rect(c,x+1,y+5,14,10,C.ink); rect(c,x+2,y+4,12,9,C.stoneDark);
    rect(c,x+3,y+4,10,1,C.stoneLight); rect(c,x+4,y+6,8,5,C.ink);
    if(visible) {
      if(kind==='stencil')rect(c,x+5,y+7,6,2,active?a:C.grey);
      else if(value && value.length<=2) text(c,value,x+5,y+5,a);
      else { rect(c,x+5,y+7,2,2,a); rect(c,x+8,y+7,3,1,a); }
    }
    rect(c,x+3,y+13,2,1,C.gold); rect(c,x+11,y+13,2,1,C.gold);
    if(label.length<=3)text(c,label,x+5,y-4,C.cream); return;
  }
  if(kind==='phase') {
    rect(c,x+3,y+6,10,8,C.ink); rect(c,x+4,y+5,8,7,C.stoneDark);
    rect(c,x+6,y+2,4,6,C.gold); rect(c,x+5,y+3,6,3,C.goldLight);
    if(value)text(c,value.slice(0,1),x+6,y+5,C.ink); return;
  }
  if(kind==='reset') {
    rect(c,x+2,y+8,12,6,C.stoneDark); rect(c,x+3,y+7,10,4,C.stone);
    rect(c,x+5,y+4,6,5,C.woodDark); rect(c,x+6,y+4,4,3,C.woodLight);
    text(c,'R',x+6,y-4,C.cream); return;
  }
  if(kind==='gate') {
    rect(c,x,y+1,2,15,C.stone); rect(c,x+14,y+1,2,15,C.stone);
    for(let i=3;i<14;i+=4)rect(c,x+i,y+3,2,active?4:13,C.stoneDark);
    rect(c,x+2,y+3,12,2,C.stoneLight); return;
  }
  // A metal-mounted lever gives controls a physical silhouette distinct from pads/crates.
  rect(c,x+2,y+10,12,5,C.ink); rect(c,x+3,y+10,10,3,C.stoneDark); rect(c,x+4,y+10,8,1,C.stoneLight);
  rect(c,x+7,y+5,2,6,C.stoneLight); rect(c,x+6,y+3,4,4,active?a:C.wood);
  rect(c,x+7,y+3,2,1,active?C.cream:C.woodLight); rect(c,x+4,y+12,1,1,C.cream); rect(c,x+11,y+12,1,1,C.cream);
  if(label && label.length<=3) { rect(c,x+4,y-5,Math.min(label.length*6,18),9,C.ink); text(c,label,x+5,y-4,C.cream); }
}
type PixelPoint = [number, number];
function wire(c:Context,points:PixelPoint[],colour:string,arrow=false) {
  for(let i=1;i<points.length;i++) {
    const [x1,y1]=points[i-1],[x2,y2]=points[i];
    rect(c,Math.min(x1,x2)-1,Math.min(y1,y2)-1,Math.abs(x2-x1)+2,Math.abs(y2-y1)+2,colour);
  }
  if(arrow&&points.length>1) {
    const [x,y]=points[points.length-1],[px,py]=points[points.length-2];
    const dx=Math.sign(x-px),dy=Math.sign(y-py),ax=x-dx*10,ay=y-dy*10;
    if(dx) {rect(c,ax-dx*2,ay-3,1,7,colour);rect(c,ax-dx,ay-2,1,5,colour);rect(c,ax,ay-1,1,3,colour);}
    else {rect(c,ax-3,ay-dy*2,7,1,colour);rect(c,ax-2,ay-dy,5,1,colour);rect(c,ax-1,ay,3,1,colour);}
  }
}
function junction(c:Context,label:string,x:number,y:number) {
  rect(c,x-5,y-6,12,13,C.ink);rect(c,x-4,y-5,10,11,C.stoneDark);
  text(c,label,x-1,y-3,C.cream);
}
function routePreview(c:Context,g:Game,p:PlayerId) {
  const selected=g.state.routes[p],accent=p===0?C.cool:C.warm,dim=p===0?C.coolDark:C.warmDark;
  const committed=g.level===25?g.state.supply:g.solved;
  if(g.level===12) {
    const routes:PixelPoint[][] = p===0
      ? [[[40,56],[72,56],[120,56],[136,56],[136,66],[216,66],[216,56]],[[40,56],[40,80],[72,80],[168,80],[216,80],[216,56]]]
      : [[[40,56],[72,56],[88,56],[88,80],[168,80],[216,80],[216,56]],[[40,56],[40,40],[120,40],[120,56],[184,56],[216,56]]];
    wire(c,routes[1-selected],dim);wire(c,routes[selected],committed?accent:dim);
    for(const [label,x,y] of [['A',72,56],['B',72,80],['C',120,56],['D',168,80],['E',184,56]] as [string,number,number][])junction(c,label,x,y);
    rect(c,34,50,8,13,C.stone);rect(c,35,51,2,3,accent);
    rect(c,213,50,9,13,C.stoneDark);rect(c,216,53,3,7,committed?accent:C.grey);
    // A selected preview is marked physically without exposing the partner’s route.
    const route=routes[selected];for(const [x,y] of route.slice(1,-1))rect(c,x-1,y-1,3,3,accent);
    text(c,committed?'BEAM POWERED':'PREVIEW',committed?81:96,28,committed?accent:C.stoneLight);
  } else {
    const compact=g.level===25;
    const x1=compact?48:48,x2=compact?104:192,y=compact?116:48,lower=y+(compact?22:30),hx=compact?76:128;
    const routes:PixelPoint[][]=[[[x1,y],[hx,y],[x2,y]],[[x1,y],[x1,lower],[x2,lower],[x2,y]]];
    wire(c,routes[1-selected],dim);wire(c,routes[selected],accent);
    junction(c,'H',hx,y);rect(c,x1-4,y-5,7,11,C.stoneDark);rect(c,x1-3,y-4,2,2,accent);
    rect(c,x2-3,y-5,7,11,C.stoneDark);rect(c,x2-1,y-3,3,6,committed?accent:C.grey);
    text(c,'2',hx+12,y-12,accent);text(c,p===0?'4':'3',hx+10,lower+4,accent);
    if(!compact)text(c,committed?'ROUTE POWERED':'ROUTE PREVIEW',80,24,committed?accent:C.stoneLight);
  }
}
function corners(c:Context,x:number,y:number,colour:string) {
  for(const [dx,dy,sx,sy] of [[0,0,1,1],[16,0,-1,1],[0,16,1,-1],[16,16,-1,-1]]) {
    rect(c,x+dx+(sx<0?-4:0),y+dy,4,1,colour); rect(c,x+dx,y+dy+(sy<0?-4:0),1,4,colour);
  }
}
function context(canvas: HTMLCanvasElement,width:number,height:number) {
  if(canvas.width!==width)canvas.width=width;
  if(canvas.height!==height)canvas.height=height;
  const c=canvas.getContext('2d')!; c.imageSmoothingEnabled=false; return c;
}
const poses=new WeakMap<HTMLCanvasElement,{x:number;y:number;moved:number}>();
export function draw(canvas: HTMLCanvasElement,g:Game,p:PlayerId,time:number) {
  const c=context(canvas,256,192);
  rect(c,0,0,256,192,C.void);
  for(let y=0;y<12;y++)for(let x=0;x<16;x++) {
    const tile=worldTile(g,p,x,y), xx=x*16, yy=y*16;
    if(tile==='wall') stone(c,xx,yy,x+y*7,true);
    else if(tile==='void') { if((x+y)%3===0)rect(c,xx+4,yy+8,8,1,'#18232c'); }
    else {
      floor(c,xx,yy,x*17+y*29);
      if(tile==='bridge') { rect(c,xx,yy+1,16,14,C.woodDark); for(let i=0;i<4;i++)rect(c,xx+i*4,yy+2,3,12,C.wood); rect(c,xx,yy+3,16,1,C.woodLight); }
      if(tile==='closed') { rect(c,xx+2,yy+2,12,12,C.stoneDark); rect(c,xx+4,yy+4,8,8,C.mortar); rect(c,xx+6,yy+6,4,4,C.grey); }
      if(tile==='exit') { rect(c,xx+4,yy+11,8,2,C.gold); rect(c,xx+6,yy+9,4,2,C.gold); }
    }
  }
  if([12,19,25].includes(g.level))routePreview(c,g,p);
  if(g.level===17) {
    const accent=p===0?C.cool:C.warm;
    const links:PixelPoint[][]=p===0
      ? [[[104,72],[152,72]],[[184,104],[200,104],[200,72]]]
      : [[[56,104],[56,72],[104,72]],[[56,104],[56,136],[104,136]],[[104,136],[56,136],[56,104]],[[152,72],[184,72],[184,104]]];
    for(const link of links)wire(c,link,accent,true);
  }
  if(g.level===14) {
    for(let i=0;i<3;i++) {
      const x=72+i*36,y=42,visible=p===0?i<2:i===2;
      rect(c,x+2,y,20,2,C.stoneLight);rect(c,x,y+2,24,20,C.stoneDark);
      rect(c,x+2,y+2,20,18,C.mortar);rect(c,x+4,y+4,16,14,C.ink);
      rect(c,x+7,y+6,10,11,C.floorLight);
      if(visible)text(c,String(g.state.dials[i]),x+10,y+8,p===0?C.cool:C.warm);
      text(c,String.fromCharCode(65+i),x+10,y+25,C.cream);
    }
  }
  if(g.level===15) {
    rect(c,47,42,157,12,C.mortar); rect(c,48,44,155,7,C.ink);
    for(let x=50;x<200;x+=10)rect(c,x,47,5,1,C.stoneDark);
    for(const packet of g.state.packets.filter((a:any)=>a.p===p)) {
      const remain=packet.arrival-g.state.clock,delay=p===0?3:2;
      if(remain>=0&&remain<=delay) {
        const x=51+Math.round((1-remain/delay)*144);
        const colour=p===0?['#72d2a1','#78bfe4'][packet.colour]:['#d67762',C.gold][packet.colour];
        rect(c,x,44,5,6,colour);rect(c,x+1,45,2,1,C.cream);
      }
    }
    rect(c,202,40,9,15,C.stoneDark);rect(c,204,42,5,8,C.stone);
    text(c,'T'+g.state.clock,48,30,C.cream);
  }
  if(g.level===7||g.level===8) {
    const rotated=g.level===8&&p===1;
    for(const [mark,x,y] of (rotated ? [['3',4,3],['1',8,3],['4',4,8],['2',8,8]] : [['1',4,4],['2',9,4],['3',4,8],['4',9,8]]) as [string,number,number][]) {
      rect(c,x*16+3,y*16+3,10,11,C.mortar); text(c,mark,x*16+6,y*16+5,C.cream);
    }
  }
  if(g.level===23) {
    const bx=46,by=18,cell=10;
    const closures=p===0?[[1,1],[2,1],[3,1]]:[[1,1],[2,1],[2,2]];
    rect(c,bx-3,by-3,46,36,C.stoneDark);
    for(let y=0;y<3;y++)for(let x=0;x<4;x++) {
      const xx=bx+x*cell, yy=by+y*cell;
      rect(c,xx,yy,9,9,C.floorLight);
      if(closures.some(([a,b])=>a===x&&b===y)) {
        rect(c,xx+1,yy+1,7,7,p===0?C.coolDark:C.warmDark);
        rect(c,xx+2,yy+2,5,1,p===0?C.cool:C.warm);
      }
      if(x===3&&y===2) {rect(c,xx+2,yy+6,5,1,C.gold);rect(c,xx+3,yy+4,3,2,C.gold);}
    }
    const courier=g.state.couriers[p];
    rect(c,bx+courier.x*cell+3,by+courier.y*cell+2,4,5,p===0?C.cool:C.warm);
    rect(c,bx+courier.x*cell+4,by+courier.y*cell+3,1,1,C.cream);
    text(c,'BOARD',92,21,C.stoneLight); text(c,String(g.state.pc)+'/12',92,32,C.cream);
  }
  // Fixed architecture: neutral decoration carries no puzzle state.
  torch(c,25,22,time,p===0?C.cool:C.warm); torch(c,232,22,time,p===0?C.cool:C.warm);
  if(g.level===10||g.level===22) {
    const rail=(x1:number,y1:number,x2:number,y2:number)=>{
      const x=Math.min(x1,x2)*16+8,y=Math.min(y1,y2)*16+8;
      if(y1===y2) {
        const w=Math.abs(x2-x1)*16;
        rect(c,x,y-4,w,1,C.stoneDark);rect(c,x,y+4,w,1,C.stoneDark);
        for(let xx=x+4;xx<x+w;xx+=8)rect(c,xx,y-5,2,11,C.woodDark);
      } else {
        const h=Math.abs(y2-y1)*16;
        rect(c,x-4,y,1,h,C.stoneDark);rect(c,x+4,y,1,h,C.stoneDark);
        for(let yy=y+4;yy<y+h;yy+=8)rect(c,x-5,yy,11,2,C.woodDark);
      }
    };
    if(g.level===10) {rail(4,5,10,5);rail(6,3,6,5);rail(8,3,8,5);}
    else {rail(4,5,10,5);rail(7,3,7,5);rail(4,3,4,5);rail(10,3,10,5);}
  }
  for(const e of g.entities[p]) device(c,e,p,g,time);
  const exit = g.entities[p].find(e=>e.kind==='exit'||e.kind==='door');
  door(c,(exit?.x ?? 13)*16-8,(exit?.y ?? 2)*16-20,Boolean(g.exits?.[p]));
  const near=nearest(g,p); if(near)corners(c,near.x*16-1,near.y*16-1,C.cream);
  const player=g.players[p],last=poses.get(canvas);
  const moved=!last||last.x!==player.x||last.y!==player.y?time:last.moved;
  poses.set(canvas,{x:player.x,y:player.y,moved});
  character(c,player.x*16,player.y*16,p,time,time-moved<0.16);
  if(player.grab) { rect(c,player.x*16+13,player.y*16+5,3,2,C.gold); }
}
export function drawTitle(canvas:HTMLCanvasElement,time:number) {
  const c=context(canvas,512,240); rect(c,0,0,512,240,C.void);
  // An original two-route ruin, not an extraction of the supplied door artwork.
  for(let y=32;y<224;y+=16)for(let x=32;x<480;x+=16) {
    const cx=x/16,cy=y/16;
    const central=x>=208&&x<304;
    const sides=y>=128&&y<192&&x>=64&&x<448;
    const wings=(x>=64&&x<176||x>=336&&x<448)&&y>=80&&y<208;
    if(central||sides||wings)floor(c,x,y,cx*17+cy*13);
  }
  for(let y=0;y<4;y++)for(let x=0;x<5;x++) {
    if(y===0||x===0||x===4)stone(c,216+x*16,24+y*16,x+y,true);
  }
  for(const side of [64,336]) {
    for(let x=0;x<7;x++)stone(c,side+x*16,64,x,true);
    for(let y=0;y<8;y++) { stone(c,side-16,80+y*16,y,true); stone(c,side+112,80+y*16,y,true); }
    for(let x=0;x<7;x++)if(x!==3)stone(c,side+x*16,208,x,true);
  }
  // Thick raised gatehouse, with the chipped pale stone and warm grain of R03.
  for(const xx of [208,288])for(let y=0;y<6;y++)stone(c,xx,32+y*16,y,false);
  door(c,224,32,false,2);
  rect(c,225,112,62,4,C.stoneLight); rect(c,221,116,70,4,C.stoneDark);
  rect(c,217,120,78,4,C.stone); rect(c,213,124,86,4,C.stoneDark);
  // Two separated approaches keep the cooperative composition legible.
  for(let i=0;i<9;i++) {
    rect(c,120+i*12,162,8,2,C.coolDark); rect(c,282+i*12,162,8,2,C.warmDark);
  }
  for(let y=136;y<208;y+=12) { rect(c,118,y,2,7,C.coolDark); rect(c,392,y,2,7,C.warmDark); }
  for(const xx of [92,140,364,412]) {
    rect(c,xx,104,10,15,C.woodDark); rect(c,xx+1,105,8,11,C.wood); rect(c,xx+2,106,6,1,C.woodLight);
    rect(c,xx+2,108,6,2,C.gold); rect(c,xx+2,114,6,2,C.gold);
  }
  torch(c,208,92,time,C.cool); torch(c,302,92,time,C.warm);
  torch(c,80,87,time); torch(c,428,87,time);
  character(c,112,176,0,time); character(c,384,176,1,time);
  crate(c,80,174,''); crate(c,416,174,'');
  // Readable, low-contrast masonry debris and stepped plants at the exterior.
  for(const [x,y] of [[24,152],[464,184],[32,96],[464,80],[184,200],[304,200]]) {
    rect(c,x,y,14,7,C.mortar); rect(c,x+2,y-2,10,6,C.stoneDark); rect(c,x+3,y-2,5,1,C.stone);
  }
  for(const [x,y] of [[39,204],[463,143],[187,64],[316,50],[26,63]]) {
    rect(c,x,y+3,9,4,'#304c4a'); rect(c,x+2,y,5,5,'#45625a'); rect(c,x+3,y-2,3,3,'#536d5e');
  }
  text(c,'I',116,202,C.cool); text(c,'II',386,202,C.warm);
  text(c,'ONE WORLD',229,145,C.stoneLight); text(c,'TWO PERSPECTIVES',211,157,C.stoneDark);
}
