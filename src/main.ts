import './style.css';
import { createGame, move, interact, grab, tick, nearest, getView, type Game, type PlayerId } from './game';
import { draw, drawTitle } from './render';
import { load, persist, keyName, defaults } from './storage';
import { levels } from './levels';
const app = document.querySelector<HTMLDivElement>('#app')!;
const save = load();
let game: Game | null = null, modal = false, screen = 'menu', last = 0, repeat = [0, 0], dialogReturn: () => void = () => { }, capture: ((code: string) => void) | null = null;
const held = new Set<string>();
const dev = new URLSearchParams(location.search).get('dev') === '1';
const actions = ['Move up', 'Move down', 'Move left', 'Move right', 'Interact', 'Grab / release'];
const names = ['Cool', 'Warm'];
const titles = levels.map(level => level.title);
const $ = (id: string) => document.getElementById(id)!;
const escape = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
function clearInput() { held.clear(); repeat = [0, 0]; }
function store() { const ok = persist(save); const n = document.getElementById('save-note'); if (n && !ok)
    n.textContent = 'Storage unavailable. Progress lasts for this session.'; }
function brand() { return '<a class="brand" href="#" id="brand"><i class="spectrum-mark" aria-hidden="true"></i>COLOUR SPECTRUM</a>'; }
function menu() {
    clearInput();
    modal = false;
    game = null;
    screen = 'menu';
    app.innerHTML = `<div class="shell menu-shell"><header>${brand()}<nav><span class="local-label">2 PLAYERS · 1 KEYBOARD</span><button id="help" class="quiet">Field guide <kbd>H</kbd></button><button id="settings" class="quiet">Settings</button></nav></header><main class="landing"><section class="intro"><p class="eyebrow"><span></span> A COOPERATIVE PUZZLE ADVENTURE</p><h1>COLOUR<br><span>SPECTRUM</span></h1><p class="tagline">Two perspectives.<br>One way forward.</p><p class="description">Some things only you can see.<br>Some doors only open together.</p><div class="menu-actions"><button id="start" class="primary">${save.unlocked > 1 ? 'New adventure' : 'Enter the archive'} <span>→</span></button>${save.unlocked > 1 ? '<button id="continue" class="secondary">Continue · Room ' + String(save.current).padStart(2, '0') + '</button>' : ''}</div><p class="save-note" id="save-note">25 rooms to discover. Progress saved on this device.</p></section><section class="hero-art" aria-label="Pixel-art dungeon with two adventurers and an arched wooden door"><div class="art-corner tl"></div><canvas id="title-art" width="512" height="240"></canvas><div class="art-caption"><span class="tiny-square cool"></span> A LITTLE TRUST GOES A LONG WAY <span class="tiny-square warm"></span></div></section></main><section class="features"><div><b>01</b><p><strong>See differently</strong><span>Blue & green. Red & amber.<br>Each view holds half the story.</span></p></div><div><b>02</b><p><strong>Think together</strong><span>Read the room. Share the clues.<br>Build a plan with your partner.</span></p></div><div><b>03</b><p><strong>Leave together</strong><span>Move the machines. Open the way.<br>Nobody gets left behind.</span></p></div></section><footer><span>MADE FOR TWO MINDS, SIDE BY SIDE</span><button id="replay" class="text-button">${dev ? 'Developer room selector' : 'Room archive'} <span>↗</span></button></footer></div>`;
    $('brand').onclick = e => e.preventDefault();
    $('start').onclick = () => start(1);
    document.getElementById('continue')?.addEventListener('click', () => start(save.current));
    $('help').onclick = manual;
    $('settings').onclick = settings;
    $('replay').onclick = selector;
    resize();
}
function start(level: number) {
    game = createGame(level);
    screen = 'game';
    modal = false;
    clearInput();
    app.innerHTML = `<div class="shell play-shell"><header>${brand()}<nav><button id="help" class="quiet">Field guide <kbd>H</kbd></button><button id="restart" class="quiet">Restart room</button><button id="pause" class="quiet">Pause <kbd>Esc</kbd></button></nav></header><section class="room-heading"><div><p class="eyebrow">THE SPECTRUM ARCHIVE <span class="room-number">${String(level).padStart(2, '0')} / 25</span></p><h1>${escape(titles[level - 1])}</h1></div><span class="together-badge">TWO VIEWS. ONE SHARED WORLD.</span></section><main id="playfield" tabindex="0" aria-label="Game area. Cool uses WASD and E. Warm uses arrows and Enter."><div class="views">${([0, 1] as PlayerId[]).map(p => `<section class="player-panel ${p === 0 ? 'cool' : 'warm'}"><div class="player-heading"><div class="role-icon">${p === 0 ? '◇' : '□'}</div><div><h2>PLAYER ${p + 1} <strong>${names[p].toUpperCase()}</strong></h2><span>${p === 0 ? 'BLUE + GREEN PERCEPTION' : 'RED + AMBER PERCEPTION'}</span></div><span class="exit-indicator" id="exit-${p}">EXIT SEALED</span></div><div class="canvas-well"><canvas id="world-${p}" width="256" height="192" aria-label="${names[p]} room view"></canvas></div><div class="interaction-line" id="interaction-${p}"></div><div class="clue-panel"><p class="eyebrow">YOUR INSCRIPTIONS <span>READ TO YOUR PARTNER</span></p><div id="clues-${p}"></div></div><div class="player-readout" id="status-${p}"></div><p class="feedback" role="status" id="feedback-${p}"></p><div class="bindings">${bindings(p)}</div></section>`).join('')}</div></main><div class="room-footer"><div><span id="objective"></span><p id="room-tip"></p></div><span class="joint-status" id="joint-status">BOTH ADVENTURERS MUST REACH THEIR EXITS</span></div><footer><span id="save-note">PROGRESS SAVED AT ROOM BOUNDARIES</span><button class="text-button" id="menu">Return to menu ↗</button></footer></div>`;
    $('brand').onclick = e => { e.preventDefault(); pause(); };
    $('help').onclick = manual;
    $('restart').onclick = restart;
    $('pause').onclick = pause;
    $('menu').onclick = () => confirmDialog('Return to the archive?', 'This room will restart when you continue. Completed rooms stay saved.', () => menu());
    $('playfield').focus({ preventScroll: true });
    save.current = level;
    store();
    startHudBindings();
    updateHud();
    resize();
}
function bindings(p: number) { const k = save.bindings[p]; return `<span>${k.slice(0, 4).map(x => '<kbd>' + escape(keyName(x)) + '</kbd>').join('')} Move</span><span><kbd>${escape(keyName(k[4]))}</kbd> Interact</span><span><kbd>${escape(keyName(k[5]))}</kbd> Grab</span>`; }
function updateHud() { if (!game || screen !== 'game')
    return; for (const p of [0, 1] as PlayerId[]) {
    const v = getView(game, p);
    $('clues-' + p).innerHTML = v.clues.map(c => '<p>' + escape(c) + '</p>').join('');
    $('status-' + p).innerHTML = [...v.status, ...([9, 24, 25].includes(game.level) && game.history.length ? ['Operations: ' + game.history.join(' → ')] : [])].map(c => '<span>' + escape(c) + '</span>').join('');
    $('feedback-' + p).textContent = game.feedback[p] || '';
    const e = nearest(game, p), box = game.entities[p].find(e => e.kind === 'crate' && Math.abs(e.x - game!.players[p].x) + Math.abs(e.y - game!.players[p].y) <= 1);
    $('interaction-' + p).innerHTML = e ? `<kbd>${escape(keyName(save.bindings[p][4]))}</kbd> ${escape(e.label)} <span>· ${e.kind === 'crate' ? 'grab with ' + escape(keyName(save.bindings[p][5])) : 'operate nearby device'}</span>` : game.players[p].grab ? `<kbd>${escape(keyName(save.bindings[p][5]))}</kbd> Release crate ${escape(game.players[p].grab!)}` : box ? `<kbd>${escape(keyName(save.bindings[p][5]))}</kbd> Grab crate ${escape(box.label)}` : '<span class="dim">Explore the room. Read, talk, experiment.</span>';
    $('exit-' + p).textContent = game.exits[p] ? 'EXIT OPEN' : 'EXIT SEALED';
    $('exit-' + p).classList.toggle('open', game.exits[p]);
} const v = getView(game, 0); $('objective').textContent = v.objective; $('room-tip').textContent = v.tip; $('joint-status').textContent = game.solved ? 'THE WAY IS OPEN · FIND BOTH EXITS' : 'BOTH ADVENTURERS MUST REACH THEIR EXITS'; }
function closeDialog() { document.getElementById('overlay')?.remove(); modal = false; capture = null; clearInput(); if (game)
    $('playfield').focus({ preventScroll: true });
else
    $('help')?.focus(); }
function dialog(title: string, body: string, buttons: {
    label: string;
    fn: () => void;
    primary?: boolean;
}[]) { modal = true; clearInput(); capture = null; document.getElementById('overlay')?.remove(); const el = document.createElement('div'); el.id = 'overlay'; el.className = 'overlay'; el.innerHTML = `<section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><p class="eyebrow">COLOUR SPECTRUM · FIELD NOTES</p><h2 id="dialog-title">${escape(title)}</h2><div class="dialog-body">${body}</div><div class="dialog-actions">${buttons.map((b, i) => `<button id="dialog-button-${i}" class="${b.primary ? 'primary' : 'secondary'}">${escape(b.label)}</button>`).join('')}</div></section>`; document.body.append(el); buttons.forEach((b, i) => $('dialog-button-' + i).onclick = b.fn); const panel=el.querySelector<HTMLElement>('.dialog')!; panel.tabIndex=-1; panel.focus({preventScroll:true}); panel.scrollTop=0; dialogReturn = closeDialog; }
function confirmDialog(title: string, body: string, yes: () => void) { dialog(title, '<p>' + body + '</p>', [{ label: 'Keep playing', fn: closeDialog }, { label: 'Confirm', fn: () => { closeDialog(); yes(); }, primary: true }]); }
function restart() { confirmDialog('Restart this room?', 'Both positions, crates, devices, clocks and puzzle progress will reset. Completed rooms stay unlocked.', () => start(game!.level)); }
function pause() { if (!game)
    return; dialog('A moment to think.', '<p>The room is paused for both players. Take your time.</p>', [{ label: 'Resume adventure', fn: closeDialog, primary: true }, { label: 'Field guide', fn: manual }, { label: 'Settings', fn: settings }, { label: 'Room archive', fn: selector }, { label: 'Return to menu', fn: () => { closeDialog(); menu(); } }]); }
function manual() { dialog('The field guide', `<div class="manual-grid"><section><h3>Two halves of a story</h3><p>Cool reads blue and green. Warm reads red and amber. Grey plates can hide a marking meant for your partner. Physical walls and device bodies are visible to both.</p><p>Read neutral letters, numbers and junction names aloud. A clue on your side may describe a device on theirs. A shared monitor cannot prevent looking across; trust is part of the adventure.</p></section><section><h3>Your keyboard</h3>${[0, 1].map(p => `<h4>Player ${p + 1} · ${names[p]}</h4><p class="manual-controls">${bindings(p)}</p>`).join('')}<p><kbd>Esc</kbd> Pause / resume · <kbd>H</kbd> Guide and pause</p><p>Move close to a device, then interact. Focus corners identify the nearest usable object. Carry a crate with Grab; press again to set it down. Crates can also be pushed.</p></section><section><h3>Machines & journeys</h3><p>Read the room's inscriptions and live device feedback. Buttons operate once per press. Pads need a body or crate as marked. Bridges may retract when their support changes; safe islands let you wait.</p><p>Cart, courier and program consoles move their machinery one step at a time. Select neutral destination controls. Packet clocks advance only after both players confirm. A local reset resets that machine; Restart Room resets everything.</p></section><section><h3>Leave together</h3><p>Both exit conditions must hold and both adventurers must reach their exit zones. One player can wait and still move or help. Your next room and unlocked rooms save on this device; in-room moves do not.</p><p>Restart Room always asks. Open Settings to rebind keys. To test keyboard rollover, both hold a direction and press their Interact keys; check that both responses register. Try other bindings if the keyboard drops a combination.</p><p>If controls stop responding, click the room. Switching tabs or losing focus pauses and clears held keys. Menus keep normal Tab navigation.</p></section></div>`, [{ label: game ? 'Back to the room' : 'Back to the archive', fn: closeDialog, primary: true }]); }
function settings() { dialog('Make yourself at home', `<p>Choose a binding, then press a key. Escape, H, Tab and browser shortcuts are reserved. Every action needs a unique key.</p><div class="settings-grid">${[0, 1].map(p => `<section><h3>Player ${p + 1} · ${names[p]}</h3>${actions.map((a, i) => `<div class="key-row"><span>${a}</span><button class="key-bind" data-player="${p}" data-action="${i}">${escape(keyName(save.bindings[p][i]))}</button></div>`).join('')}</section>`).join('')}</div><p id="binding-feedback" role="status">Use the physical right Shift key for Warm's default grab.</p>`, [{ label: 'Done', fn: () => { store(); closeDialog(); if (game)
            startHudBindings(); }, primary: true }, { label: 'Restore defaults', fn: () => { save.bindings = defaults.map(x => [...x]); store(); settings(); } }]); document.querySelectorAll<HTMLButtonElement>('.key-bind').forEach(b => b.onclick = () => { b.textContent = 'Press a key…'; capture = code => { if (['Escape', 'KeyH', 'Tab', 'MetaLeft', 'MetaRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight'].includes(code) || save.bindings.flat().includes(code)) {
    $('binding-feedback').textContent = 'That key is reserved or already assigned. Choose another.';
    return;
} save.bindings[Number(b.dataset.player)][Number(b.dataset.action)] = code; b.textContent = keyName(code); capture = null; $('binding-feedback').textContent = 'Binding updated.'; store(); }; }); }
function startHudBindings() { document.querySelectorAll('.bindings').forEach((e, p) => e.innerHTML = bindings(p)); $('playfield').setAttribute('aria-label', 'Game area. ' + names.map((name,p)=>name+': move '+save.bindings[p].slice(0,4).map(keyName).join(', ')+', interact '+keyName(save.bindings[p][4])+', grab '+keyName(save.bindings[p][5])).join('. ')); }
function selector() { const max = dev ? 25 : save.unlocked; dialog(dev ? 'Developer room selector' : 'The room archive', `<p>${dev ? 'Development mode: all rooms available for verification.' : 'Replay any room you have unlocked. The current room will restart.'}</p><div class="room-list">${titles.map((t, i) => `<button data-level="${i + 1}" ${i >= max ? 'disabled' : ''}><b>${String(i + 1).padStart(2, '0')}</b>${escape(t)}<span>${i >= max ? 'LOCKED' : '→'}</span></button>`).join('')}</div>`, [{ label: 'Back', fn: closeDialog }]); document.querySelectorAll<HTMLButtonElement>('[data-level]').forEach(b => b.onclick = () => { closeDialog(); start(Number(b.dataset.level)); }); }
function complete() { if (!game || modal)
    return; const level = game.level; save.unlocked = Math.min(25, Math.max(save.unlocked, level + 1)); save.current = Math.min(25, level + 1); if (level === 25)
    save.finished = true; store(); dialog(level === 25 ? 'A full spectrum. Together.' : 'Another door, opened together.', `<div class="completion-emblems"><i class="cool">◇</i><span>+</span><i class="warm">□</i></div><p>${level === 25 ? 'All 25 rooms complete. Two different perspectives made one way forward. Thank you for exploring the archive together.' : `Room ${String(level).padStart(2, '0')} complete. Your progress has been saved.<br>Next: ${escape(titles[level])}`}</p>`, [{ label: level === 25 ? 'Return to archive' : 'Enter the next room', fn: () => { closeDialog(); level === 25 ? menu() : start(level + 1); }, primary: true }, { label: 'Replay this room', fn: () => { closeDialog(); start(level); } }]); dialogReturn = () => { }; }
function resize() { if (screen === 'game') {
    const panel = document.querySelector('.canvas-well') as HTMLElement;
    if (panel) {
        const scale = Math.max(1, Math.min(Math.floor(panel.clientWidth / 256), Math.max(1, Math.floor((innerHeight - 530) / 192))));
        document.querySelectorAll<HTMLCanvasElement>('[id^="world-"]').forEach(c => { c.style.width = 256 * scale + 'px'; c.style.height = 192 * scale + 'px'; });
    }
} }
function frame(now: number) { const dt = Math.min((now - last) / 1000 || 0, 0.06); last = now; if (screen === 'menu') {
    const c = document.querySelector<HTMLCanvasElement>('#title-art');
    if (c)
        drawTitle(c, now / 1000);
} if (game && screen === 'game') {
    if (!modal) {
        for (const p of [0, 1] as PlayerId[]) {
            repeat[p] -= dt;
            const k = save.bindings[p];
            const dx = Number(held.has(k[3])) - Number(held.has(k[2])), dy = Number(held.has(k[1])) - Number(held.has(k[0]));
            if ((dx || dy) && repeat[p] <= 0) {
                move(game, p, dx ? Math.sign(dx) : 0, dx ? 0 : Math.sign(dy));
                repeat[p] = 0.13;
            }
        }
        tick(game, dt);
        updateHud();
        if (game.complete)
            complete();
    }
    for (const p of [0, 1] as PlayerId[])
        draw($('world-' + p) as HTMLCanvasElement, game, p, now / 1000);
} requestAnimationFrame(frame); }
window.addEventListener('keydown', e => { if (capture) {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey || e.altKey) {
        $('binding-feedback').textContent = 'Choose a key without a browser shortcut modifier.';
        return;
    }
    capture(e.code);
    return;
} if (e.code === 'Tab' && modal) {
    const buttons = [...document.querySelectorAll<HTMLElement>('#overlay button:not(:disabled),#overlay a')];
    if (buttons.length) {
        const index = buttons.indexOf(document.activeElement as HTMLElement);
        if ((e.shiftKey && index <= 0) || (!e.shiftKey && index === buttons.length - 1)) {
            e.preventDefault();
            buttons[e.shiftKey ? buttons.length - 1 : 0].focus();
        }
    }
    return;
} if (e.repeat && ['Escape', 'KeyH'].includes(e.code))
    return; if (e.code === 'Escape') {
    e.preventDefault();
    modal ? dialogReturn() : pause();
    return;
} if (e.code === 'KeyH' && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    if (!modal)
        manual();
    return;
} if (!game || modal || e.ctrlKey || e.metaKey || e.altKey)
    return; if ((e.target as HTMLElement).closest('button,a,input,select'))
    return; if (save.bindings.flat().includes(e.code)) {
    e.preventDefault();
    if (!e.repeat && !held.has(e.code)) {
        for (const p of [0, 1] as PlayerId[]) {
            if (e.code === save.bindings[p][4])
                interact(game, p);
            if (e.code === save.bindings[p][5])
                grab(game, p);
        }
    }
    held.add(e.code);
} });
window.addEventListener('keyup', e => held.delete(e.code));
window.addEventListener('blur', () => { clearInput(); if (game && !modal)
    pause(); });
document.addEventListener('visibilitychange', () => { clearInput(); if (document.hidden && game && !modal)
    pause(); });
window.addEventListener('resize', resize);
// Development inspection is opt-in and never appears in the ordinary campaign.
if (dev)
    (window as any).spectrum = { start, get game() { return game; }, get paused() { return modal; }, save };
menu();
requestAnimationFrame(frame);
