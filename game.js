(() => {
const $ = id => document.getElementById(id);
const store = {
  get(k, d){ try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set(k, v){ try { localStorage.setItem(k, v); } catch {} }
};
const HANDS = ['', '☝️', '✌️', '🤟', '🖖', '🖐️', '👍']; // 1-5 fingers, 6 = thumbs up
const FACES = { neutral:'😐', happy:'😄', smug:'😏', sad:'😢', shocked:'😱', worried:'😟' };
const rand = n => 1 + Math.floor(Math.random() * n);
const wait = ms => new Promise(r => setTimeout(r, ms));

let G = {};
let trophies = +store.get('hc_trophies', 0);

function show(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
}
function names(){ return { p: $('playerName').value.trim() || 'You', c: $('cpuName').value.trim() || 'Rival' }; }

// Home
$('playerName').value = store.get('hc_player', 'You');
$('cpuName').value = store.get('hc_cpu', 'Rohan');
$('trophyCount').textContent = trophies;
$('startBtn').onclick = () => {
  store.set('hc_player', $('playerName').value.trim() || 'You');
  store.set('hc_cpu', $('cpuName').value.trim() || 'Rival');
  startToss();
};
$('againBtn').onclick = () => { $('trophyCount').textContent = trophies; show('home'); };

// Toss
function startToss(){
  const n = names();
  $('tossTitle').textContent = `${n.p}, call the toss`;
  $('tossMsg').textContent = '';
  $('coin').textContent = '🪙';
  $('tossChoices').classList.remove('hidden');
  $('batBowl').classList.add('hidden');
  show('toss');
}
document.querySelectorAll('[data-call]').forEach(b => b.onclick = async () => {
  const n = names();
  $('tossChoices').classList.add('hidden');
  const coin = $('coin');
  coin.classList.remove('spin'); void coin.offsetWidth; coin.classList.add('spin');
  await wait(1700);
  const flip = Math.random() < 0.5 ? 'Heads' : 'Tails';
  const won = flip === b.dataset.call;
  $('tossMsg').textContent = `It's ${flip}! ${won ? n.p : n.c} won the toss.`;
  if (won) {
    $('batBowl').classList.remove('hidden');
  } else {
    await wait(1200);
    const pick = Math.random() < 0.5 ? 'bat' : 'bowl';
    $('tossMsg').textContent += ` ${n.c} chose to ${pick} first.`;
    await wait(1400);
    beginMatch(pick === 'bat' ? 'c' : 'p');
  }
});
document.querySelectorAll('[data-pick]').forEach(b => b.onclick = () =>
  beginMatch(b.dataset.pick === 'bat' ? 'p' : 'c'));

// Match
function beginMatch(firstBatter){
  const n = names();
  G = { n, batter: firstBatter, innings: 1, score: 0, target: null, busy: false };
  $('playerLabel').textContent = n.p;
  $('cpuLabel').textContent = n.c;
  buildPad();
  setFace('neutral');
  updateBoard();
  show('game');
}
function buildPad(){
  const pad = $('pad'); pad.innerHTML = '';
  for (let i = 1; i <= 6; i++){
    const b = document.createElement('button');
    b.textContent = `${HANDS[i]} ${i}`;
    b.onclick = () => ball(i);
    pad.appendChild(b);
  }
}
function setFace(k){
  const f = $('face'); f.textContent = FACES[k];
  f.classList.add('pop'); setTimeout(() => f.classList.remove('pop'), 200);
}
function updateBoard(){
  const batName = G.batter === 'p' ? G.n.p : G.n.c;
  $('inningsInfo').textContent = `Innings ${G.innings}: ${batName} batting`;
  $('score').textContent = G.score;
  $('target').textContent = G.target ? `Target: ${G.target}` : 'Set a target';
  $('msg').textContent = G.batter === 'p' ? 'Pick a number to bat' : 'Pick a number to bowl';
}
async function ball(mine){
  if (G.busy) return;
  G.busy = true;
  document.querySelectorAll('#pad button').forEach(b => b.disabled = true);
  $('myHand').textContent = '✊'; $('cpuHand').textContent = '✊';
  for (const t of ['1…', '2…', '3…']){ $('msg').textContent = t; await wait(350); }
  const cpu = rand(6);
  $('myHand').textContent = HANDS[mine];
  $('cpuHand').textContent = HANDS[cpu];
  const playerBats = G.batter === 'p';
  const out = mine === cpu;
  let ended = false, chased = false;

  if (out){
    $('msg').textContent = `OUT! Both showed ${mine}.`;
    setFace(playerBats ? 'smug' : 'sad');
    ended = true;
  } else {
    const runs = playerBats ? mine : cpu;
    G.score += runs;
    $('msg').textContent = `${runs} run${runs > 1 ? 's' : ''}!`;
    if (playerBats) setFace(runs >= 5 ? 'shocked' : runs >= 3 ? 'worried' : 'neutral');
    else setFace(runs >= 5 ? 'happy' : runs >= 3 ? 'smug' : 'neutral');
    if (G.innings === 2 && G.score >= G.target){ ended = true; chased = true; }
  }
  $('score').textContent = G.score;
  await wait(1100);

  if (!ended){
    document.querySelectorAll('#pad button').forEach(b => b.disabled = false);
    G.busy = false;
    $('msg').textContent = G.batter === 'p' ? 'Pick a number to bat' : 'Pick a number to bowl';
    return;
  }
  if (G.innings === 1){
    G.target = G.score + 1;
    G.innings = 2; G.score = 0;
    G.batter = G.batter === 'p' ? 'c' : 'p';
    setFace('neutral'); updateBoard();
    $('msg').textContent = `Target is ${G.target}. Get ready!`;
    await wait(1500);
    document.querySelectorAll('#pad button').forEach(b => b.disabled = false);
    G.busy = false; updateBoard();
  } else {
    const chaser = G.batter;
    let winner;
    if (chased) winner = chaser;
    else if (G.score === G.target - 1) winner = 'tie';
    else winner = chaser === 'p' ? 'c' : 'p';
    finish(winner);
  }
}
function finish(w){
  const n = G.n;
  if (w === 'p'){
    trophies++; store.set('hc_trophies', trophies);
    $('resultFace').textContent = FACES.sad;
    $('resultTitle').textContent = `${n.p} wins!`;
    $('token').classList.remove('hidden');
  } else if (w === 'c'){
    $('resultFace').textContent = FACES.happy;
    $('resultTitle').textContent = `${n.c} wins!`;
    $('token').classList.add('hidden');
  } else {
    $('resultFace').textContent = FACES.neutral;
    $('resultTitle').textContent = "It's a tie!";
    $('token').classList.add('hidden');
  }
  $('resultMsg').textContent = `Target was ${G.target}.`;
  show('result');
}
})();
