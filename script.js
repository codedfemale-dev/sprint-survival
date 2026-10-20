/* The interface renders the game state. No accounts, cookies or saved personal data. */
'use strict';
const G = window.SprintGame;
let state = G.createState();
const game = document.querySelector('#game');
const names = ids => ids.map(id => G.find(id).title).join(', ');
const totalValue = () => state.done.reduce((n,id) => n + G.find(id).value,0);
const heading = text => `<h2 id="game-heading" tabindex="-1">${text}</h2>`;
function status() {
  const last = state.history[state.history.length-1];
  const reviewed = ['review','final'].includes(state.phase);
  return `<div class="stats"><div class="stat"><small>${reviewed?'Last sprint effort used':'Planned effort / capacity'}</small><strong>${reviewed?last.used:G.effort(state)} / ${reviewed?last.cap:G.capacity(state)}</strong></div><div class="stat"><small>Team wellbeing</small><strong>${state.wellbeing}<small style="display:inline"> / 100</small></strong><progress max="100" value="${state.wellbeing}" aria-label="Team wellbeing"></progress></div><div class="stat"><small>Estimated value delivered</small><strong>${totalValue()}</strong></div></div>`;
}
function goal() { const sprint=G.SPRINTS[state.round]; return `<div class="goal"><p class="eyebrow">SPRINT GOAL</p><h3>${sprint.goal}</h3><p>Complete: ${names(sprint.goals)}.</p></div>`; }
function taskCard(t) {
  const selected=state.selected.includes(t.id), enabled=G.available(state,t);
  const missing=t.deps.filter(d=>!state.done.includes(d)&&!state.selected.includes(d));
  return `<article class="task ${selected?'selected':''}"><p class="eyebrow">${t.type}</p><h3>${t.title}</h3><p>${t.description}</p><div class="meta">${t.effort} effort · ${t.value} estimated value</div>${t.deps.length?`<div class="dependency">${missing.length?'Select first:':'Needs:'} ${names(missing.length?missing:t.deps)}</div>`:''}<button data-task="${t.id}" aria-pressed="${selected}" ${!enabled&&!selected?'disabled':''}>${selected?'Remove from plan':!enabled?'Needs earlier work':'Add to plan'}</button></article>`;
}
function board() {
  const effort=G.effort(state), cap=G.capacity(state), adapt=state.phase==='adapt';
  const tasks=G.TASKS.filter(t=>!state.done.includes(t.id)&&(!t.hidden||state.banner));
  return `<div class="board"><div><h3>The backlog</h3><p class="muted">Select tasks in delivery order. Removing a task also removes its dependent tasks from your plan.</p><div class="tasks">${tasks.map(taskCard).join('')}</div>${tasks.length?'':'<p>All work is complete. You can deliver an empty sprint to give the team some breathing room.</p>'}</div><aside class="plan"><p class="eyebrow">YOUR SPRINT PLAN</p><h3>${state.selected.length} task${state.selected.length===1?'':'s'} selected</h3>${state.selected.length?`<ol>${state.selected.map(id=>`<li>${G.find(id).title}<span>${G.find(id).effort} effort units</span></li>`).join('')}</ol>`:'<p class="empty">Make room for the work that matters. Add a task from the backlog.</p>'}<p><strong>${effort} of ${cap} effort units planned</strong></p>${effort>cap?'<p class="warning">This plan exceeds capacity. Delivery stops when the next task does not fit. Trim the plan to protect focus.</p>':`<p class="muted">${cap-effort} units left for breathing room.</p>`}<button class="primary" data-action="${adapt?'deliver':'lock'}">${adapt?'Deliver this sprint':'Lock plan & reveal surprise'}</button><p class="tip">${adapt?'You can still change scope before delivery.':'An empty plan is allowed. You will still encounter the surprise.'} To change the order, remove a task and add it again.</p></aside></div>`;
}
function planning() {
  const recovery=state.wellbeing<45?3:state.wellbeing<65?1:0;
  return `${goal()}<h3>How will the team work?</h3><div class="stance">${[
    ['support','Make space for support','−2 capacity · +8 wellbeing'],['steady','Keep a steady pace','Standard capacity · +2 wellbeing'],['stretch','Stretch the team','+2 capacity · −10 wellbeing']
  ].map(([id,title,text])=>`<button data-stance="${id}" aria-pressed="${state.stance===id}"><strong>${title}</strong><small>${text}</small></button>`).join('')}</div>${recovery?`<p class="warning">The team needs recovery time. Starting wellbeing reduces this sprint’s capacity by ${recovery} unit${recovery===1?'':'s'}.</p>`:''}${board()}`;
}
function event() {const e=G.SPRINTS[state.round].event; return `${goal()}<div class="event"><p class="eyebrow">PLOT TWIST / ${state.round+1}</p><h3>${e.title}</h3><p>${e.text}</p><div class="choices">${e.options.map((o,i)=>`<button data-choice="${i}"><strong>${o.title}</strong><small>${o.text}</small></button>`).join('')}</div></div><p class="muted">Choose a response. You’ll then have a chance to adjust your plan before delivery.</p>`;}
function adapting() {const o=G.SPRINTS[state.round].event.options[state.choice];return `${goal()}<div class="callout"><p class="eyebrow">YOU CHOSE / ${o.title}</p><p>${o.lesson}</p><p class="muted">Event effect: ${o.capacity>0?'+':''}${o.capacity} capacity, ${o.wellbeing>0?'+':''}${o.wellbeing} wellbeing. Wellbeing changes are applied after delivery.</p></div>${board()}`;}
function review() {
  const r=state.history[state.history.length-1], o=G.SPRINTS[state.round].event.options[state.choice];
  return `<div class="callout"><p class="eyebrow">${r.goal?'GOAL MET':'GOAL STILL IN PROGRESS'}</p><h3>${G.SPRINTS[state.round].goal}</h3><p>${r.goal?'The essential tasks for this goal are complete.':'Still needed: '+names(G.SPRINTS[state.round].goals.filter(id=>!state.done.includes(id)))+'.'}</p></div><div class="result-grid"><div class="result"><h3>Delivered</h3>${r.finished.length?`<ul>${r.finished.map(id=>`<li>${G.find(id).title}</li>`).join('')}</ul>`:'<p>No tasks delivered this sprint.</p>'}<p class="muted">${r.value} estimated value · ${r.used} effort units used</p></div><div class="result"><h3>Returned to the backlog</h3>${r.unfinished.length?`<ul>${r.unfinished.map(id=>`<li>${G.find(id).title}</li>`).join('')}</ul><p class="muted">These tasks need selecting again. No partial progress carries over.</p>`:'<p>Everything in the final plan was completed.</p>'}<p class="${r.delta>=0?'positive':'warning'}">Wellbeing change: ${r.delta>0?'+':''}${r.delta} points${r.wellbeing===100?' (capped at 100)':''}.</p></div></div><p><strong>The learning:</strong> ${o.lesson} ${r.unfinished.length?'An overfull plan also cost 4 wellbeing points.':''}</p><p class="muted">Retrospective question: what would you keep, change or discuss with the team next time?</p><button class="primary" data-action="next">${state.round===2?'See your final reflection':'Plan sprint '+(state.round+2)}</button>`;
}
function final() {
  const goals=state.history.filter(r=>r.goal).length, left=G.TASKS.filter(t=>!state.done.includes(t.id)&&(!t.hidden||state.banner));
  let title=state.wellbeing<45?'Time to give the team room to recover.':goals===3&&state.wellbeing>=65?'Useful progress. A sustainable pace.':state.wellbeing>=65?'A healthy team, with more to learn.':'Progress made. Check in with the people.';
  return `<div class="callout"><p class="eyebrow">YOUR DELIVERY STORY</p><h3>${title}</h3><p>You met ${goals} of 3 sprint goals and completed ${state.done.length} tasks. Team wellbeing finished at ${state.wellbeing}/100.</p><p>${state.wellbeing<65?'Start the next conversation with workload, support and recovery.':'Keep checking in with the team, even when the numbers look healthy.'} ${goals<3?'Unmet goals are a reason to inspect the plan and priorities, not blame individuals.':'Now test whether the work actually helps learners book useful sessions.'}</p></div><div class="table-wrap"><table class="log"><caption class="sr-only">Results across the three sprints</caption><thead><tr><th>Sprint</th><th>Goal</th><th>Effort used</th><th>Value</th><th>Wellbeing</th></tr></thead><tbody>${state.history.map(r=>`<tr><td>${r.round+1}</td><td>${r.goal?'Met':'In progress'}</td><td>${r.used}/${r.cap}</td><td>${r.value}</td><td>${r.wellbeing}/100</td></tr>`).join('')}</tbody></table></div><div class="result-grid"><div class="result"><h3>Take it into your next sprint</h3><ul><li>Agree a useful goal before filling the plan.</li><li>When work arrives, discuss what moves out.</li><li>Make support and testing part of the work.</li><li>Use evidence from learners to check your value assumptions.</li></ul></div><div class="result"><h3>Still in the backlog</h3>${left.length?`<ul>${left.map(t=>`<li>${t.title}</li>`).join('')}</ul>`:'<p>All available tasks are complete.</p>'}<p class="muted">A backlog is a set of options. You do not have to finish every idea.</p></div></div><p><strong>Try another approach:</strong> the same surprises appear each time, so you can compare your decisions fairly.</p><div class="actions"><button class="primary" data-action="restart">Play again</button><button data-action="download">Download my reflection</button><a class="button" href="https://codedfemale.com">Explore the blog ↗</a></div>`;
}
function render(focus=false) {
  document.body.classList.toggle('studio-active', state.round === 0);
  if (state.round === 0 && window.renderStudio) {
    window.renderStudio();
    if (focus) { document.querySelector('#game-heading').focus({preventScroll:true}); game.scrollIntoView({behavior:'auto',block:'start'}); }
    return;
  }
  const title={plan:'Choose what matters.',event:'Here comes the surprise.',adapt:'Adjust the plan.',review:'Inspect what happened.',final:'What did you learn?'}[state.phase];
  game.innerHTML=`<div class="section-top"><div><p class="eyebrow">${state.phase==='final'?'THREE SPRINTS / COMPLETE':'SPRINT '+(state.round+1)+' OF 3'}</p>${heading(title)}</div><div class="steps" aria-label="Sprint progress">${[0,1,2].map(i=>`<span class="step ${i<state.round||state.phase==='final'?'complete':i===state.round?'active':''}" ${i===state.round&&state.phase!=='final'?'aria-current="step"':''}>${i+1}</span>`).join('')}</div></div>${status()}${({plan:planning,event,adapt:adapting,review,final}[state.phase])()}`;
  if(focus) {document.querySelector('#game-heading').focus({preventScroll:true});game.scrollIntoView({behavior:'auto',block:'start'});}
}
function download() {
  const lines=['Sprint Survival | Coded Female','Mentor Match: three-sprint reflection','',...state.history.flatMap(r=>[
    'Sprint '+(r.round+1)+': '+G.SPRINTS[r.round].goal,
    'Approach: '+r.stance+'. Event response: '+G.SPRINTS[r.round].event.options[r.choice].title,
    'Delivered: '+(names(r.finished)||'None'), 'Returned to backlog: '+(names(r.unfinished)||'None'),
    `Goal: ${r.goal?'met':'in progress'}. Effort: ${r.used}/${r.cap}. Estimated value: ${r.value}. Wellbeing: ${r.wellbeing}/100.`,
    'Learning: '+G.SPRINTS[r.round].event.options[r.choice].lesson,''
  ]),'Reflection prompts:','What changed when new work arrived?','What would I discuss with the team?','How would I check whether the work helped learners?','','Fictional teaching model, not a measure of real team performance.','https://codedfemale.com'];
  const url=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='my-sprint-reflection.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
game.addEventListener('click', e=>{
  const b=e.target.closest('button');if(!b||b.disabled)return;
  if(b.dataset.task){const id=b.dataset.task;G.toggle(state,id);render();const replacement=game.querySelector(`[data-task="${id}"]`);if(replacement)replacement.focus({preventScroll:true});document.querySelector('#announcement').textContent=`Plan updated. ${G.effort(state)} effort units planned, ${G.capacity(state)} available.`;return;}
  if(b.dataset.stance){state.stance=b.dataset.stance;render();game.querySelector(`[data-stance="${state.stance}"]`).focus({preventScroll:true});document.querySelector('#announcement').textContent=`Approach changed. ${G.capacity(state)} effort units available.`;return;}
  if(b.dataset.choice!==undefined){G.choose(state,Number(b.dataset.choice));render(true);return;}
  switch(b.dataset.action){case 'lock':if(state.phase==='plan')state.phase='event';break;case 'deliver':G.deliver(state);break;case 'next':G.next(state);break;case 'restart':state=G.createState();break;case 'download':download();return;default:return;}render(true);
});
render();
