import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');}
mkdirSync('artifacts',{recursive:true});
const results=[],errors=[];
const browser=await playwright.chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1280,height:720}});
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const base=process.env.GAME_URL||'http://127.0.0.1:5173';
async function check(name,fn){await fn();results.push(name);console.log('PASS',name);}
await page.goto(base+'/?dev=1');await page.evaluate(()=>document.fonts.ready);
await check('Menu and both local fonts load',async()=>{await page.getByRole('heading',{name:/COLOUR.*SPECTRUM/}).waitFor();assert.equal(await page.evaluate(()=>document.fonts.check('12px Archive')),true);await page.screenshot({path:'artifacts/menu-1280.png',fullPage:true});});
await page.locator('#start').click();await page.locator('#playfield').focus();
await check('Simultaneous continuous input and one-shot interaction',async()=>{await page.keyboard.down('KeyD');await page.keyboard.down('ArrowRight');await page.waitForTimeout(290);await page.keyboard.up('KeyD');await page.keyboard.up('ArrowRight');const p=await page.evaluate(()=>window.spectrum.game.players);assert.ok(p[0].x>2&&p[1].x>2);});
await check('Manual freezes timer, closes and clears held input',async()=>{await page.keyboard.press('KeyH');const before=await page.evaluate(()=>window.spectrum.game.elapsed);await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>window.spectrum.game.elapsed),before);await page.getByRole('button',{name:'Back to the room'}).click();const a=await page.evaluate(()=>window.spectrum.game.players);await page.waitForTimeout(180);assert.deepEqual(await page.evaluate(()=>window.spectrum.game.players),a);});
await check('Restart dialog cancels safely and resets both roles when confirmed',async()=>{await page.locator('#restart').click();await page.getByRole('button',{name:'Keep playing'}).click();await page.locator('#restart').click();await page.getByRole('button',{name:'Confirm',exact:true}).click();assert.deepEqual(await page.evaluate(()=>window.spectrum.game.players),[{x:2,y:9},{x:2,y:9}]);});
await check('Real keyboard solution opens both exits and waits for joint departure',async()=>{
 // Grid movement uses a 130 ms repeat; single held presses are deliberately short.
 const step=async code=>{await page.keyboard.down(code);await page.waitForTimeout(25);await page.keyboard.up(code);await page.waitForTimeout(145);};
 for(let i=0;i<3;i++)await step('KeyD');for(let i=0;i<4;i++)await step('KeyW');await page.keyboard.press('KeyE');
 for(let i=0;i<5;i++)await step('ArrowRight');for(let i=0;i<4;i++)await step('ArrowUp');await page.keyboard.press('Enter');
 assert.deepEqual(await page.evaluate(()=>window.spectrum.game.exits),[true,true]);
 for(let i=0;i<8;i++)await step('KeyD');for(let i=0;i<3;i++)await step('KeyW');assert.equal(await page.evaluate(()=>window.spectrum.game.complete),false);
 for(let i=0;i<6;i++)await step('ArrowRight');for(let i=0;i<3;i++)await step('ArrowUp');
 await page.getByRole('heading',{name:'Another door, opened together.'}).waitFor();await page.getByRole('button',{name:'Enter the next room'}).click();assert.equal(await page.evaluate(()=>window.spectrum.game.level),2);
});
await check('Progress persists and Continue restores a fresh consistent room',async()=>{await page.reload();await page.getByRole('button',{name:'Continue · Room 02'}).click();assert.equal(await page.evaluate(()=>window.spectrum.game.level),2);assert.equal(await page.evaluate(()=>window.spectrum.game.state.hold),0);});
await check('Bindings reject duplicates and save unique physical keys',async()=>{await page.locator('#pause').click();await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('[data-player="0"][data-action="4"]').click();await page.keyboard.press('KeyW');await page.getByText('That key is reserved or already assigned. Choose another.').waitFor();await page.keyboard.press('KeyF');await page.getByRole('button',{name:'Done',exact:true}).click();assert.equal(await page.evaluate(()=>window.spectrum.save.bindings[0][4]),'KeyF');});
await check('All 25 rooms render, private inscriptions stay in their view, no horizontal clipping',async()=>{
 for(const size of[{width:1280,height:720},{width:1920,height:1080},{width:960,height:640}]){await page.setViewportSize(size);for(let level=1;level<=25;level++){await page.evaluate(n=>window.spectrum.start(n),level);await page.waitForTimeout(25);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${level} ${size.width}`);assert.equal(await page.locator('canvas').count(),2);if([1,8,23,25].includes(level))await page.screenshot({path:`artifacts/room-${level}-${size.width}.png`,fullPage:true});}}
});
await check('Backgrounding pauses and does not replay stale keys',async()=>{await page.evaluate(()=>window.dispatchEvent(new Event('blur')));assert.equal(await page.evaluate(()=>window.spectrum.paused),true);});
await context.close();
await check('Corrupted and unavailable storage do not prevent play',async()=>{for(const mode of['corrupt','blocked']){const c=await browser.newContext();await c.addInitScript(mode=>{if(mode==='corrupt')localStorage.setItem('spectrum-save','{bad');else Object.defineProperty(window,'localStorage',{get(){throw Error('disabled')}});},mode);const p=await c.newPage();await p.goto(base);await p.locator('#start').click();await p.locator('#playfield').waitFor();await c.close();}});
assert.deepEqual(errors,[]);writeFileSync('artifacts/browser-results.json',JSON.stringify({browser:await browser.version(),engine:'Chromium',checks:results,errors},null,2));await browser.close();console.log(`${results.length} browser checks passed`);
