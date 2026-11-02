const SCRATCH_EDITOR = 'https://scratch.mit.edu/projects/editor/';
const PROBLEMS = [
 {id:'P1',level:'Easy',color:'#b8f0d8',pts:100,title:'Dancing Party 💃',
  desc:'Make a sprite throw a dance party! When the green flag is clicked, your sprite should dance to music and react to the keyboard.',
  req:['Use at least 1 sprite and a colourful backdrop','Play a sound or music in a loop','Sprite changes costumes to dance','Pressing the space key changes the backdrop colour','Show a title using a text or say block']},
 {id:'P2',level:'Medium',color:'#fff2a8',pts:200,title:'Maze Runner 🧭',
  desc:'Build a maze game where a player guides a character from the start to the finish without touching the walls.',
  req:['Control the player using the 4 arrow keys','Touching a wall sends the player back to the start','Reaching the goal shows a "You Win!" message','Add a timer variable that shows time taken','Include at least 2 levels (maze changes)']},
 {id:'P3',level:'Medium',color:'#b9e0ff',pts:200,title:'Quiz Master 🧠',
  desc:'Create a fun quiz that asks questions and keeps score, like your own mini game show.',
  req:['Ask at least 5 questions using the Ask and Wait block','Use a Score variable (+1 for correct answers)','Give different replies for correct and wrong answers','Use a list or variables to store questions and answers','Show the final score and a message at the end']},
 {id:'P4',level:'Hard',color:'#ffb3d1',pts:300,title:'Space Defender 🚀',
  desc:'Design a complete space shooter. Protect your planet from falling asteroids and beat your own high score!',
  req:['Spaceship moves left and right with the keyboard','Shoot lasers with the space key using clones','Asteroids fall from random positions using clones','Score increases on a hit, and 3 lives reduce on a crash','Game Over screen with restart option','Difficulty increases as the score grows','Save a High Score variable']}
];
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const LS = k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const SV = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1800);}

// API with automatic fallback to localStorage (static/demo mode)
async function api(path, body, token){
  try{
    const r = await fetch('/api/'+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json','x-token':token||''},body:body?JSON.stringify(body):undefined});
    if(r.status===404||r.status>=500) return null;
    const j = await r.json(); j._status = r.status; return j;
  }catch(e){ return null; }
}

// ----- Router -----
function route(){
  const h = (location.hash||'#home').slice(1);
  const id = $('#'+h) ? h : 'home';
  $$('.view').forEach(v=>v.classList.toggle('on',v.id===id));
  $$('nav a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+id));
  if(id==='submit') showWho();
  if(id==='judge') judgeInit();
  window.scrollTo(0,0);
}
addEventListener('hashchange',route);

// ----- Problems -----
$('#plist').innerHTML = PROBLEMS.map(p=>`
 <div class="card prob" style="--c:${p.color}">
  <div class="ptop"><span class="badge">${p.level}</span><span class="pts">⭐ ${p.pts} points</span></div>
  <h3>${p.title}</h3><p>${p.desc}</p>
  <h4>Core requirements</h4><ul>${p.req.map(r=>`<li>${r}</li>`).join('')}</ul>
  <div class="pfoot"><span class="hint">Opens the official Scratch editor in a new tab</span>
  <a class="btn" href="${SCRATCH_EDITOR}" target="_blank" rel="noopener">Code 💻</a></div>
 </div>`).join('');
$('#sProb').innerHTML = PROBLEMS.map(p=>`<option value="${p.id}">${p.id} · ${p.level} · ${p.title}</option>`).join('');

// ----- Register -----
let mode='team';
function setMode(m){mode=m;$('#tTeam').classList.toggle('on',m==='team');$('#tSolo').classList.toggle('on',m==='solo');
 $('#nameLbl').textContent=m==='team'?'Team name':'Full name';$('#rName').placeholder=m==='team'?'e.g. Code Kittens':'e.g. Aanya Sharma';}
$('#tTeam').onclick=()=>setMode('team');$('#tSolo').onclick=()=>setMode('solo');
$('#rBtn').onclick=async()=>{
  const m=$('#rMsg'),name=$('#rName').value.trim(),cls=$('#rCls').value,school=$('#rSchool').value.trim();
  m.className='msg';
  if(!name||!cls||!school){m.textContent='Please fill in all fields 🙂';return;}
  const data={type:mode,name,cls,school};
  let reg=await api('register',data);
 if(SHEET_URL&&(!reg||reg.error)){m.textContent='Could not save. Check internet and try again.';return;}
  if(!reg||reg.error){reg={...data,id:'L'+Date.now(),at:Date.now()};const r=LS('regs')||[];r.push(reg);SV('regs',r);}
  SV('me',reg);m.className='msg ok';m.textContent='Registered! Taking you to submission... 🎉';
  setTimeout(()=>location.hash='#problems',900);
};

// ----- Submit -----
function showWho(){const me=LS('me');$('#whoami').innerHTML=me?`Submitting as <b>${esc(me.name)}</b> (Class ${esc(me.cls)})`:'Please <a href="#register">register</a> first.';}
$('#sBtn').onclick=async()=>{
  const m=$('#sMsg'),me=LS('me'),link=$('#sLink').value.trim().split('?')[0];m.className='msg';
  if(!me){m.textContent='Please register first.';return;}
  if(!/^https:\/\/scratch\.mit\.edu\/projects\/\d+/.test(link)){m.textContent='Enter a valid Scratch project link 🔗';return;}
const data={regId:me.id,name:me.name,cls:me.cls,school:me.school,problem:$('#sProb').value,link};  const r=await api('submit',data);
  if(!r||r.error){ if(r&&r.error){m.textContent=r.error;return;}
    let s=(LS('subs')||[]).filter(x=>!(x.regId===me.id&&x.problem===data.problem));
    s.push({...data,name:me.name,cls:me.cls,school:me.school,at:Date.now()});SV('subs',s);}
  m.className='msg ok';m.textContent='Submitted! You can resubmit to update it. ✅';$('#sLink').value='';
};

// ----- Judge portal -----
let jToken=null,jSubs=[];
function judgeInit(){const ok=!!(jToken||sessionStorage.getItem('jok'));$('#jLogin').hidden=ok;$('#jPanel').hidden=!ok;if(ok)loadSubs();}
$('#jBtn').onclick=async()=>{
  const pw=$('#jPass').value,m=$('#jMsg');m.className='msg';
  const r=await api('judge/login',{password:pw});
 if(SHEET_URL&&(!r||r.error)){m.textContent=(r&&r.error)||'Could not save. Check internet and try again.';return;}
  if(r&&r.token){jToken=r.token;sessionStorage.setItem('jt',r.token);sessionStorage.setItem('jok','1');}
  else if(r&&r._status===401){m.textContent='Wrong password 🙈';return
   else if(SHEET_URL&&!r){m.textContent='Cannot reach database. Try again.';return;}
  else if(!r&&pw==='judge123'){sessionStorage.setItem('jok','1');sessionStorage.setItem('jlocal','1');}
  else{m.textContent='Wrong password 🙈';return;}
  $('#jPass').value='';judgeInit();
};
$('#jPass').addEventListener('keydown',e=>{if(e.key==='Enter')$('#jBtn').click();});
$('#jOut').onclick=()=>{jToken=null;sessionStorage.clear();judgeInit();};
async function loadSubs(){
  jToken=jToken||sessionStorage.getItem('jt');
  if(sessionStorage.getItem('jlocal')) jSubs=(LS('subs')||[]).sort((a,b)=>b.at-a.at);
  else{const r=await api('submissions',null,jToken);
    if(!r||r._status===401){sessionStorage.clear();jToken=null;return judgeInit();} jSubs=r.subs;}
  renderSubs();
}
function renderSubs(){
  const q=$('#jFilter').value.toLowerCase();
  const rows=jSubs.filter(s=>(s.name+s.cls+s.problem+s.school).toLowerCase().includes(q));
  $('#jCount').textContent='('+rows.length+')';
  $('#jBody').innerHTML=rows.length?rows.map(s=>`<tr>
   <td><b>${esc(s.name)}</b><br><small>${esc(s.school||'')}</small></td><td>${esc(s.cls)}</td>
   <td>${esc(s.problem)}</td><td class="lk"><a href="${esc(s.link)}" target="_blank" rel="noopener">${esc(s.link)}</a></td>
   <td class="act"><button class="copy" data-l="${esc(s.link)}">📋 Copy</button></td></tr>`).join('')
   :'<tr><td colspan="5" class="empty">No submissions yet 🌱</td></tr>';
}
$('#jFilter').oninput=renderSubs;
$('#jBody').onclick=async e=>{const b=e.target.closest('.copy');if(!b)return;
  try{await navigator.clipboard.writeText(b.dataset.l);}catch{const t=document.createElement('textarea');t.value=b.dataset.l;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();}
  b.textContent='✅ Copied';toast('Link copied!');setTimeout(()=>b.textContent='📋 Copy',1500);};
route();
