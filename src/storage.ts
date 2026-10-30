export const defaults = [['KeyW','KeyS','KeyA','KeyD','KeyE','KeyQ'],['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter','ShiftRight']];
export type Save = {unlocked:number; current:number; bindings:string[][]; finished:boolean};
export function load():Save {
  const fallback = {unlocked:1,current:1,bindings:defaults.map(x=>[...x]),finished:false};
  try {
    const s=JSON.parse(localStorage.getItem('spectrum-save')||'null');
    if(!s||!Number.isInteger(s.unlocked)||s.unlocked<1||s.unlocked>25) return fallback;
    const keys=s.bindings?.flat();
    return {unlocked:s.unlocked,current:Math.max(1,Math.min(s.unlocked,Number(s.current)||1)),bindings:Array.isArray(keys)&&keys.length===12&&keys.every((k:unknown)=>typeof k==='string'&&!['Escape','KeyH','Tab'].includes(k as string))&&new Set(keys).size===12?s.bindings:fallback.bindings,finished:s.finished===true};
  } catch {return fallback;}
}
export function persist(s:Save):boolean {try{localStorage.setItem('spectrum-save',JSON.stringify(s));return true;}catch{return false;}}
export function keyName(code:string) {return ({ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',ShiftRight:'R Shift',Space:'Space'} as Record<string,string>)[code]||code.replace('Key','').replace('Digit','');}
