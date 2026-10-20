/* Three-sprint studio. Shares the existing engine and its accessible controls. */
'use strict';
let studioStarted = false;
let studioReflections = {};
let studioCheckpoints = {};
let studioSaveStatus = window.StudioSave.read();
let studioPendingSave = studioSaveStatus.status==='saved'?studioSaveStatus.game:null;
let studioNewConfirmation = false;
if(studioPendingSave)state=JSON.parse(JSON.stringify(studioPendingSave.state));
function studioSaveBar(){
  const saved=studioSaveStatus.status==='saved';
  return `<aside class="save-bar" aria-label="Game progress"><p role="status">${studioSaveStatus.status==='unavailable'?'Saving is unavailable in this browser. Keep this tab open to continue.':studioSaveStatus.status==='invalid'?'The saved game could not be read. You can start a new journey.':saved?'✓ Saved on this browser':'Your journey will save automatically as you play.'}</p>${studioStarted||studioPendingSave?'<button data-studio="ask-new">Start a new journey</button>':''}</aside>`;
}
function studioResumePanel(){
  const s=studioPendingSave.state;
  const phase={plan:'planning',event:'team conversation',adapt:'adjusting the plan',review:'sprint review',final:'final delivery story'}[s.phase];
  return `<section class="resume-panel"><p class="eyebrow">WELCOME BACK TO THE STUDIO</p><h2 id="game-heading" tabindex="-1">Your team is right where you left them.</h2><p>Saved: sprint ${s.round+1} · ${phase} · wellbeing ${s.wellbeing}/100.</p><p>Your task order, decisions, delivered work and debrief answers are ready to continue.</p><button class="primary" data-studio="resume">${s.phase==='final'?'Open my delivery story':'Resume journey →'}</button><p class="scope-note">Saved only on this browser and device. Clearing site data or using private browsing can remove progress.</p></section>`;
}
function studioConfirmNew(){
  return `<section class="resume-panel" aria-labelledby="new-heading"><p class="eyebrow">START FRESH?</p><h2 id="new-heading">Replace your saved journey?</h2><p>This resets all three sprints and replaces the saved progress on this browser.</p><div class="studio-actions"><button class="primary" data-studio="confirm-new">Start fresh and replace save</button><button data-studio="cancel-new">Keep my journey</button></div></section>`;
}
const portraits = {
  maya: ['#d7bee9','#9b6046','#352936','Maya','Product lead'],
  jo: ['#c4e0d7','#bc7954','#342a32','Jo','Developer'],
  sam: ['#f3d49c','#e6af83','#5a4030','Sam','Designer & tester']
};
function portrait(key) {
  const [shirt,skin,hair,name,role]=portraits[key];
  return `<svg class="portrait" viewBox="0 0 100 104" role="img" aria-label="${name}, ${role}"><rect width="100" height="104" rx="24" fill="${shirt}"/><path d="M12 104Q13 65 50 66Q86 65 89 104" fill="${hair}"/><rect x="41" y="56" width="18" height="20" rx="7" fill="${skin}"/><ellipse cx="50" cy="40" rx="25" ry="29" fill="${hair}"/><ellipse cx="50" cy="43" rx="20" ry="23" fill="${skin}"/><path d="M29 35Q26 8 52 14Q79 12 72 39L61 25Q48 38 29 35" fill="${hair}"/><circle cx="42" cy="44" r="2" fill="#282333"/><circle cx="59" cy="44" r="2" fill="#282333"/><path d="M44 55Q50 60 57 54" fill="none" stroke="#573337" stroke-width="2" stroke-linecap="round"/></svg>`;
}
function duck() { return `<svg class="duck-avatar" viewBox="0 0 100 90" role="img" aria-label="Your duck guide"><rect width="100" height="90" rx="24" fill="#f8e8b9"/><path d="M17 52Q39 62 45 40Q42 18 64 19Q85 21 78 44Q88 76 48 77Q20 76 17 52" fill="#eebd43" stroke="#8a6024" stroke-width="2"/><path d="M77 34L92 40L76 46" fill="#da7953"/><circle cx="67" cy="32" r="3" fill="#302837"/><path d="M35 54Q46 71 62 52" fill="none" stroke="#c58b2d" stroke-width="3"/></svg>`; }
const CHAPTERS = [
  {
    label:'A first mentoring session', speaker:'maya',
    welcome:'Build a useful journey.',
    context:'A learner needs to find a mentor, see an available time and book it. Start with a small journey you can demonstrate.',
    eventTitle:'“One tiny thing before the demo?”',
    eventText:'Our partner has asked for a logo banner. It needs 3 effort. It matters to them, but it won’t help a learner book their first mentoring session.',
    prompt:'What should we tell them?',
    tipTitle:'A request starts a conversation.',
    tip:'Try: “We can review the banner next sprint. If it must happen now, which planned work should move out?” You can edit your plan after responding.',
    examples:[
      '“Let’s put the banner in the backlog and show the booking journey first.”',
      '“If the banner comes in, let’s agree what moves out. The available time hasn’t changed.”',
      '“We have more time on paper, but we’re spending the team’s recovery. Let’s inspect the plan before committing.”'
    ],
    adaptation:'The booking journey uses 3 + 3 + 4 = 10 effort. A banner adds 3, making 13. At a steady pace without overtime, only 12 fit. Compare a smaller plan with an unfinished promise.',
    question:'The banner mattered to the partner. What made it a trade-off?',
    answers:['It competed for the same limited working time.','A new request always creates extra capacity.'],
    feedback:['Exactly. Acknowledge the request, explain the goal and agree what changes. A useful response makes the cost visible.','Look again: the banner takes 3 effort. A request changes demand; only an explicit capacity change or a scope change alters what can fit.'],
    success:'A first session is bookable.',
    review:'“Our prototype connects a mentor profile, a time and a booking. Next we need to check who can use it and whether sessions actually help.”',
    transfer:'What moves out when an urgent request moves in?'
  },
  {
    label:'A journey people can trust', speaker:'jo',
    welcome:'Support is part of delivery.',
    context:'Now make booking easier to trust and use: protect contact details, support keyboard booking and add reminders. A teammate’s blocker will test how you protect both the goal and the people.',
    eventTitle:'“I’m stuck. Can someone pair with me?”',
    eventText:'The test environment is broken. Jo cannot check the booking changes and has asked for help. The rest of the team still has planned work. Waiting also has a cost.',
    prompt:'How will you respond to Jo?',
    tipTitle:'Make the blocker visible.',
    tip:'Try: “Let’s look at it together. We’ll reserve support time, agree who can help and tell Maya what changes in the plan.” A blocker belongs in the team conversation, not on one person’s shoulders.',
    examples:[
      '“Let’s pair on the environment issue. We’ll show the support time in our plan and agree what still fits.”',
      '“I’ll keep investigating alone. Please make the blocked work visible and agree when we’ll ask for help.”',
      '“We can help now, but catching up tonight will cost recovery time. Can we reduce scope instead?”'
    ],
    adaptation:'The three trust-and-use tasks need 2 + 3 + 3 = 8 effort, once booking is complete. At a steady pace, pairing leaves 11 capacity; waiting leaves 9. Helping uses time, but leaving a blocker unresolved can use more.',
    question:'Pairing uses time. Why can it still help delivery?',
    answers:['It can unblock shared work while making support time visible.','It guarantees every task will finish without changing the plan.'],
    feedback:['Exactly. Pairing costs 1 capacity here; leaving the blocker unresolved costs 3. Check the remaining plan and agree a next checkpoint. Support is useful work, not spare-time work.','Pairing is not a guarantee. It changes the available capacity and can unblock work. Inspect dependencies, trim scope if needed and check whether the blocker is resolved.'],
    success:'Booking is easier to trust and use.',
    review:'“We delivered privacy controls, keyboard booking and reminders in the prototype. Let’s check the real journey with learners, including people using a keyboard.”',
    transfer:'How would your team notice and discuss a blocker before someone is left struggling alone?'
  },
  {
    label:'Evidence before bigger promises', speaker:'sam',
    welcome:'Learn what happens after booking.',
    context:'A booking count cannot tell you whether mentoring helps. Collect session feedback, measure booking completion and use what you learn to improve the matching questions. Then decide what to show when the demo moves forward.',
    eventTitle:'“The demo has moved forward.”',
    eventText:'A stakeholder wants to see progress sooner. Sam still needs time to test the journey and prepare a useful demonstration. Showing more unfinished features would not answer whether mentoring helps.',
    prompt:'What can we demonstrate honestly?',
    tipTitle:'Agree what the demo is for.',
    tip:'Try: “Which tested part would give you the most useful feedback? We can show what works, name what is unfinished and agree the next check.” A demo is a chance to learn, not automatic release approval.',
    examples:[
      '“Let’s show a smaller, tested journey. We’ll reserve preparation time and be clear about what is not ready.”',
      '“Keeping every promise adds pressure. Extra hours still cost recovery; let’s inspect the scope before running the sprint.”',
      '“We’ll use the date for an honest progress review, including unfinished work and the questions we still need to answer.”'
    ],
    adaptation:'Feedback, measurement and improved matching need 3 + 2 + 4 = 9 effort, once booking is complete. At a steady pace, a smaller tested demo leaves 10 capacity. Keeping every promise leaves 13 through overtime, but costs 14 wellbeing from the response.',
    question:'Bookings increased. What would tell you whether mentoring is helping?',
    answers:['Check attended sessions and useful feedback, then test an improvement.','The booking count alone proves that learners are better supported.'],
    feedback:['Exactly. Booking completion helps find friction; attendance and feedback help investigate usefulness. These are questions for real users, not outcomes proven by shipping a feedback form.','Bookings are an activity measure. People can book and never attend, or attend a session that does not help. Check the wider journey and speak with learners and mentors.'],
    success:'You built the next learning loop.',
    review:'“We can now collect feedback, measure booking completion and try better matching questions. Shipping those tools starts the learning; it does not prove sessions are useful yet.”',
    transfer:'What evidence would change your next product decision, and when would you review it?'
  }
];
const chapter = () => CHAPTERS[state.round];
const signed = n => `${n >= 0 ? '+' : '−'}${Math.abs(n)}`;
const recoveryCost = () => state.wellbeing < 45 ? 3 : state.wellbeing < 65 ? 1 : 0;
function studioScene() {
  const delivered=['review','final'].includes(state.phase);
  return `<section class="studio-scene" aria-label="Mentor Match team studio"><div class="scene-window" aria-hidden="true"><span></span><span></span></div><div class="scene-label">MENTOR MATCH <span>TEAM STUDIO</span></div><div class="scene-board" aria-hidden="true"><span>${state.phase==='final'?'OUR DELIVERY STORY':'OUR NEXT SMALL STEP'}</span><b>${delivered?'Inspect & learn':chapter().label}</b><i></i><i></i><i></i></div><div class="crew">${Object.entries(portraits).map(([key,p])=>`<div class="crew-member">${portrait(key)}<b>${p[3]}</b><span>${p[4]}</span></div>`).join('')}</div><div class="studio-desk" aria-hidden="true"><div class="laptop">${state.phase==='final'?'KEEP LEARNING':delivered?'DEMO DAY':'LET’S BUILD SOMETHING USEFUL'}</div><div class="plant">✦</div></div></section>`;
}
function duckNote(title,text) {
  return `<aside class="duck-note">${duck()}<div><p class="eyebrow">DUCK’S FIELD NOTES</p><h3>${title}</h3><p>${text}</p></div></aside>`;
}
function teamDialogue(key,label,title,text,extra='') {
  return `<div class="dialogue">${portrait(key)}<div><p class="eyebrow">${portraits[key][3].toUpperCase()} · ${label}</p><h3>${title}</h3><p>${text}</p>${extra}</div></div>`;
}
function productPreview() {
  const done=state.done, book=done.includes('booking');
  const features=[['privacy','Contact details protected'],['access','Keyboard booking implemented'],['reminder','Session reminders built'],['feedback','Session feedback built'],['measure','Booking completion measurement built'],['improve','Matching questions improved']];
  return `<section class="product-preview"><div class="preview-top"><span>↗ MENTOR MATCH</span><span>PROTOTYPE</span></div><h3>${book?'A conversation can begin.':'A small product, taking shape.'}</h3>${done.includes('profile')?'<div class="mentor"><span class="mentor-dot">A</span><div><b>Aisha · Frontend mentor</b><small>For learners taking their first steps in tech</small></div></div>':'<p class="placeholder">Mentor profiles not delivered yet.</p>'}${done.includes('slots')?'<p class="time-slot">Thursday · 14:00 · 30 minutes</p>':''}<div class="${book?'booking-ready':'booking-pending'}">${book?'✓ Booking journey built for the demo':'Booking journey not delivered yet'}</div>${features.some(([id])=>done.includes(id))?`<ul class="feature-list">${features.filter(([id])=>done.includes(id)).map(([,label])=>`<li>✓ ${label}</li>`).join('')}</ul>`:''}${done.includes('feedback')?'<div class="feedback-example"><b>Example question for a learner</b><p>“What could you do after the session that you could not do before?”</p><small>Illustrative question, not a real response or measured result.</small></div>':''}<small>Illustrative prototype. Check privacy, keyboard access and failure handling before release. Delivered features do not prove learner outcomes.</small></section>`;
}
function missionTasks() {
  const ids = new Set(G.SPRINTS[state.round].goals);
  function addDeps(id) { for (const dep of G.find(id).deps) { if(!ids.has(dep)){ids.add(dep);addDeps(dep);} } }
  for (const id of [...ids]) addDeps(id);
  return ids;
}
function studioTasks() {
  const tasks=G.TASKS.filter(t=>!state.done.includes(t.id)&&(!t.hidden||state.banner));
  const core=missionTasks(); if(state.round===0)core.add('privacy');
  const featured=t=>core.has(t.id)||state.selected.includes(t.id)||(state.phase==='adapt'&&state.round===0&&t.id==='banner');
  const card=t=>`<article class="studio-task ${state.selected.includes(t.id)?'picked':''}"><div class="task-top"><span>${G.SPRINTS[state.round].goals.includes(t.id)?'MISSION WORK':core.has(t.id)?'FOUNDATION WORK':t.type}</span><b>${t.effort} effort</b></div><h3>${t.title}</h3><p>${t.description}</p>${t.deps.length?`<p class="dependency">↳ ${t.deps.every(id=>state.done.includes(id))?'Prerequisites delivered:':'Needs earlier work:'} ${names(t.deps)}</p>`:''}<button data-task="${t.id}" aria-label="${state.selected.includes(t.id)?'Remove':'Add'} ${t.title}" aria-pressed="${state.selected.includes(t.id)}" ${!G.available(state,t)&&!state.selected.includes(t.id)?'disabled':''}>${state.selected.includes(t.id)?'✓ In your plan':!G.available(state,t)?'Waiting for prerequisite':'+ Add to sprint'}</button></article>`;
  const other=tasks.filter(t=>!featured(t));
  const completed=G.SPRINTS[state.round].goals.filter(id=>state.done.includes(id));
  return `<div><div class="panel-heading"><h3>Choose your work</h3><span>BACKLOG → SPRINT</span></div><p>A backlog is a list of options. Start with the mission and any unfinished foundations it needs.</p>${completed.length?`<p class="completed-work">✓ Already delivered towards this goal: ${names(completed)}.</p>`:''}<div class="studio-cards">${tasks.filter(featured).map(card).join('')}</div>${tasks.length===0?'<p>All available work is complete. An empty sprint gives the team breathing room.</p>':''}${other.length?`<details class="future-work"><summary>Explore ${other.length} other ideas</summary><p>These options remain available. Check prerequisites and capacity before adding them.</p><div class="studio-cards">${other.map(card).join('')}</div></details>`:''}</div>`;
}
function studioQueue() {
  const effort=G.effort(state),cap=G.capacity(state);
  const suggestion=G.TASKS.find(t=>missionTasks().has(t.id)&&G.available(state,t));
  return `<aside class="studio-queue"><p class="eyebrow">YOUR DELIVERY ORDER</p><h3>${effort>cap?'Time to trim the plan.':'A plan with room to breathe.'}</h3><p><strong>${effort} / ${cap} effort planned</strong></p><meter min="0" max="${Math.max(cap,effort,1)}" value="${effort}" aria-label="Planned effort"></meter>${state.selected.length?`<ol>${state.selected.map((id,i)=>`<li><b>${G.find(id).title}</b><small>${G.find(id).effort} effort</small><div class="order-controls"><button data-move="${id}" data-direction="-1" aria-label="Move ${G.find(id).title} earlier" ${i===0?'disabled':''}>↑</button><button data-move="${id}" data-direction="1" aria-label="Move ${G.find(id).title} later" ${i===state.selected.length-1?'disabled':''}>↓</button></div></li>`).join('')}</ol>`:`<p class="empty">${suggestion?'Try '+suggestion.title+'.':'Choose useful work or leave space for recovery.'}</p>`}<p class="${effort>cap?'warning':'queue-tip'}">${effort>cap?'Over capacity. Delivery stops at the first card that cannot fit, so later cards also wait. Unfinished planned work costs 4 wellbeing points in total.':`${cap-effort} effort left. Spare capacity can absorb surprises; you don’t have to fill it.`}</p><button class="primary" data-action="${state.phase==='adapt'?'deliver':'lock'}">${state.phase==='adapt'?'Run the sprint →':state.round===0?'Meet the stakeholder →':state.round===1?'Check in with Jo →':'Talk about the demo →'}</button><p id="order-feedback" role="status"></p><small>${state.phase==='adapt'?'This delivers the plan in the order above.':'You can adjust your plan after the conversation. An empty plan is allowed.'}</small></aside>`;
}
function planningLesson() {
  if(state.round===0) {
    if(!state.selected.length)return 'Start with the person using your product. A learner needs to find a mentor, see a time and book it. Which card makes the next step possible?';
    if(!state.selected.includes('slots'))return 'A dependency is work that must happen first. Available time slots needs Mentor profiles; booking then needs time slots. Build that chain in order.';
    if(!state.selected.includes('booking'))return 'Profiles and times are useful foundations. Add Book a session to complete the journey. The three mission cards use 3 + 3 + 4 = 10 effort.';
    return `The core journey uses 10 effort. Your current plan uses ${G.effort(state)} of ${G.capacity(state)}. Compare adding privacy with keeping room for a surprise.`;
  }
  const needed=missionTasks();
  const missing=G.TASKS.filter(t=>needed.has(t.id)&&!state.done.includes(t.id)&&!G.SPRINTS[state.round].goals.includes(t.id)).map(t=>t.id);
  if(missing.length)return `Earlier foundations still matter: ${names(missing)}. Include them before dependent mission cards; their effort is additional to this sprint’s goal. An unmet goal carries learning forward, not a penalty for the individual.`;
  if(state.round===1)return `Privacy (2), keyboard booking (3) and reminders (3) total 8 effort if none are already delivered. The goal is a journey more people can trust and use. Your plan uses ${G.effort(state)} of ${G.capacity(state)}; support and testing need time too.`;
  return `Feedback (3) + booking measurement (2) + improved matching (4) = 9 effort. Improved matching depends on feedback first. Counting completed bookings shows one step; ask whether sessions were attended and useful before claiming impact.`;
}
function pacePicker() {
  const recovery=recoveryCost();
  return `<details class="pace-picker"><summary>Team pace: ${state.stance} · compare the trade-offs</summary><p>Capacity is available working time, not story points. Wellbeing effects apply after delivery. ${recovery?`Starting wellbeing of ${state.wellbeing}/100 reduces this sprint’s capacity by ${recovery}.`:'Starting wellbeing does not reduce capacity this sprint.'} Below 65 wellbeing, the next sprint loses 1 capacity; below 45 it loses 3.</p><div class="stance">${[['support','Support',-2,8],['steady','Steady',0,2],['stretch','Stretch',2,-10]].map(([id,title,change,wellbeing])=>`<button data-stance="${id}" aria-pressed="${state.stance===id}"><strong>${title}</strong><small>${12-recovery+change} capacity · ${signed(wellbeing)} wellbeing</small></button>`).join('')}</div></details>`;
}
function studioPlanning() {
  const c=chapter(), adapt=state.phase==='adapt',o=adapt?G.SPRINTS[state.round].event.options[state.choice]:null;
  const previous=state.history[state.round-1];
  const carry=previous&&!adapt?`<p class="chapter-memory">From sprint ${state.round}: ${previous.goal?'goal met':'goal still in progress'} · wellbeing ${previous.wellbeing}/100 · ${previous.unfinished.length} unfinished planned task${previous.unfinished.length===1?'':'s'} returned to the backlog.</p>`:'';
  const intro=!adapt&&state.round>0?teamDialogue(c.speaker,`SPRINT ${state.round+1} BRIEFING`,c.welcome,c.context):'';
  return `${carry}${intro}${adapt?teamDialogue(c.speaker,'AFTER THE CONVERSATION',o.title,o.lesson,`<p>Response effect: ${signed(o.capacity)} capacity now · ${signed(o.wellbeing)} wellbeing after delivery.</p><blockquote>${c.examples[state.choice]}</blockquote>`):duckNote(c.welcome,planningLesson())}${!adapt?pacePicker():duckNote('Make the trade-off concrete.',`${c.adaptation} Your actual plan uses ${G.effort(state)} of ${G.capacity(state)}. ${state.choice===2&&state.round===0?'The overtime wellbeing cost remains even if you remove the banner.':''}`)}<div class="planning-layout">${studioTasks()}${studioQueue()}</div>`;
}
function studioEvent() {
  const c=chapter();
  return `${teamDialogue(c.speaker,portraits[c.speaker][4].toUpperCase(),c.eventTitle,c.eventText,`<p>Your plan uses <strong>${G.effort(state)} of ${G.capacity(state)}</strong> effort. ${c.prompt}</p>`)}<div class="studio-choices">${G.SPRINTS[state.round].event.options.map((o,i)=>`<button data-choice="${i}"><span>0${i+1}</span><strong>${o.title}</strong><small>${o.text}</small><small>${signed(o.capacity)} capacity now · ${signed(o.wellbeing)} wellbeing after delivery</small></button>`).join('')}</div>${duckNote(c.tipTitle,c.tip)}`;
}
function studioReview() {
  const c=chapter(),r=state.history[state.round],o=G.SPRINTS[state.round].event.options[state.choice];
  const remaining=G.SPRINTS[state.round].goals.filter(id=>!state.done.includes(id));
  const before=state.round?state.history[state.round-1].wellbeing:80;
  const raw=before+r.delta;
  const effect=`Started at ${before}; ${signed(state.stance==='support'?8:state.stance==='stretch'?-10:2)} for ${state.stance} pace, ${signed(o.wellbeing)} from your response${r.unfinished.length?', −4 for unfinished planned work':''}. ${raw!==r.wellbeing?'The result is capped to the 0–100 range.':''}`;
  const answer=studioReflections[state.round];
  return `${teamDialogue(r.goal?'sam':c.speaker,'DEMO CHECK-IN',r.goal?c.success:'A smaller step, with work still to do.',r.goal?c.review:`“Still needed for our goal: ${names(remaining)}. Let’s show what works, name what is unfinished and decide what to do next.”`,`<p>Delivered this sprint: <strong>${names(r.finished)||'No tasks this sprint'}</strong>.</p><p>Back to the backlog: <strong>${names(r.unfinished)||'No unfinished planned work'}</strong>. Wellbeing: ${signed(r.delta)} → ${r.wellbeing}/100.</p>`)}<div class="review-layout">${productPreview()}${duckNote('Connect the choice to the outcome.',`${o.lesson} ${effect}`)}</div><section class="reflection"><p class="eyebrow">YOUR TURN · A QUICK DEBRIEF</p><h3>${c.question}</h3><div class="reflection-options">${c.answers.map((text,i)=>`<button data-reflect="${i}" aria-pressed="${answer===i}">${text}</button>`).join('')}</div>${answer!==undefined?`<p role="status">${c.feedback[answer]}</p>`:''}<p>Take it to work: ${c.transfer}</p></section><div class="studio-actions"><button class="primary" data-action="next">${state.round===2?'See your delivery story →':`Continue to sprint ${state.round+2} →`}</button><button data-studio="replay">Replay sprint ${state.round+1}</button></div>`;
}
function studioFinal() {
  const goals=state.history.filter(r=>r.goal).length;
  const title=state.wellbeing<45?'Make recovery the next priority.':goals===3&&state.wellbeing>=65?'Useful progress. A sustainable pace.':'Progress to inspect. More to learn.';
  return `${teamDialogue('maya','THREE SPRINTS LATER',title,`“We met ${goals} of 3 goals and delivered ${state.done.length} tasks. Let’s look at what helped, what remains and how the team is doing.”`)}<div class="journey-results">${state.history.map((r,i)=>`<article class="journey-result"><p class="eyebrow">SPRINT ${i+1} · ${r.goal?'GOAL MET':'GOAL IN PROGRESS'}</p><h3>${G.SPRINTS[i].goal}</h3><p>${r.used}/${r.cap} effort used · wellbeing ${r.wellbeing}/100</p><p><strong>Response:</strong> ${G.SPRINTS[i].event.options[r.choice].title}</p><p>${G.SPRINTS[i].event.options[r.choice].lesson}</p><p class="reflection-record">${studioReflections[i]===undefined?'Debrief available when replaying this sprint.':studioReflections[i]===0?'Debrief: key idea recognised.':'Debrief: revisit the explanation when replaying.'}</p><button data-studio="replay" data-round="${i}">Revisit sprint ${i+1}</button></article>`).join('')}</div><div class="review-layout">${productPreview()}<div>${duckNote('A delivered feature is a starting point.',`You built ${state.done.includes('feedback')?'a way to ask for session feedback':'some of the product foundations'}. Now check whether learners attend and find sessions useful. ${state.wellbeing<65?'Start the next team conversation with workload, support and recovery.':'Keep asking the team about workload even when the fictional meter looks healthy.'}`)}<div class="next-experiment"><h3>Your next real-world experiment</h3><p>Talk to a small group of learners and mentors. Compare bookings with attended sessions, ask what helped, then agree one improvement and a review date.</p></div></div></div><details class="future-work"><summary>What is still available in the backlog?</summary><p>${names(G.TASKS.filter(t=>!state.done.includes(t.id)&&(!t.hidden||state.banner)).map(t=>t.id))||'All available tasks are delivered.'}</p><p>A backlog is a set of options. Finishing every idea is not the aim.</p></details><div class="studio-actions"><button class="primary" data-studio="new">Start a new journey →</button><button data-action="download">Download my reflection</button></div><p class="scope-note">Revisiting a sprint keeps earlier results and clears later ones. A new journey resets all three sprints.</p>`;
}
window.studioReflectionLines = round => {
  const c=CHAPTERS[round], answer=studioReflections[round];
  return ['Team conversation: '+c.examples[state.history[round].choice], 'Debrief: '+c.question, ...(answer===undefined?['Debrief not answered.']:['Your answer: '+c.answers[answer], 'Explanation: '+c.feedback[answer]]), 'Take it to work: '+c.transfer];
};
window.renderStudio = function() {
  if(studioStarted&&!studioPendingSave)studioSaveStatus=window.StudioSave.write(state,studioReflections);
  if(state.phase==='plan'&&!studioCheckpoints[state.round])studioCheckpoints[state.round]=JSON.parse(JSON.stringify(state));
  const phase=studioPendingSave?'resume':!studioStarted?'intro':state.phase;
  const progressPhase=studioPendingSave?state.phase:phase;
  const finalPhase=progressPhase==='final',last=state.history[state.round];
  const titles={resume:'Welcome back.',intro:'Small team. Meaningful choices.',plan:'Make room for what matters.',event:chapter().eventTitle,adapt:'Keep the goal. Adjust the plan.',review:'See what your choices made possible.',final:'Your team. Your delivery story.'};
  const steps=['Meet','Plan','Respond','Adapt','Review'],index=finalPhase?5:['intro','plan','event','adapt','review'].indexOf(progressPhase);
  game.innerHTML=`<div class="studio-title"><div><p class="eyebrow">CODED FEMALE · A PLAYABLE DELIVERY STORY</p><h1>Sprint Survival<span> / the team studio</span></h1></div><span class="chapter-tag">${finalPhase?'JOURNEY COMPLETE':`CHAPTER 0${state.round+1} / 03`}</span></div><ol class="campaign-route" aria-label="Journey progress">${CHAPTERS.map((c,i)=>`<li class="${i<=state.round?'reached':''}" ${i===state.round&&!finalPhase?'aria-current="step"':''}><span>${i<state.round||finalPhase?'✓':`0${i+1}`}</span>${c.label}</li>`).join('')}</ol><div class="studio-hud"><div><small>${finalPhase?'THREE SPRINTS COMPLETE':'YOUR MISSION'}</small><strong>${finalPhase?'Inspect, learn and try again':G.SPRINTS[state.round].goal}</strong></div><div><small>${finalPhase?'GOALS MET':progressPhase==='review'?'EFFORT DELIVERED':'EFFORT PLANNED'}</small><strong>${finalPhase?`${state.history.filter(r=>r.goal).length} / 3`:`${progressPhase==='review'?last.used:G.effort(state)} / ${progressPhase==='review'?last.cap:G.capacity(state)}`}</strong></div><div><small>TEAM WELLBEING</small><strong>${state.wellbeing} / 100</strong></div></div>${!finalPhase?`<ol class="studio-progress" aria-label="Sprint ${state.round+1} progress">${steps.map((s,i)=>`<li ${i===index?'aria-current="step"':''} class="${i<=index?'reached':''}"><span>${i<index?'✓':i+1}</span>${s==='Meet'&&state.round>0?'Brief':s}</li>`).join('')}</ol>`:''}${studioScene()}<div class="chapter-content">${studioSaveBar()}${studioNewConfirmation?studioConfirmNew():phase==='resume'?studioResumePanel():`${heading(titles[phase])}${phase==='intro'?`<div class="intro-grid"><div><p class="eyebrow">WELCOME TO YOUR FIRST SPRINT</p><h3>Help someone take their first step into tech.</h3><p>Mentor Match connects learners with mentors. You’re guiding Maya, Jo and Sam through three short periods of focused work: <strong>sprints</strong>.</p><p>Build a bookable journey, make it easier to trust and use, then learn whether sessions help. Choose work, handle surprises and inspect the result together.</p><button class="primary" data-studio="start">Meet the board →</button><p class="scope-note">No timer. Learn by trying. About 15–20 minutes for the journey.</p></div>${duckNote('I’m your unofficial duck consultant.', 'I’ll explain the tricky bits when they appear. First example: three useful tasks can create one complete journey. More tasks do not automatically mean more help for a learner.')}</div>`:({plan:studioPlanning,event:studioEvent,adapt:studioPlanning,review:studioReview,final:studioFinal}[phase])()}` }<details class="model-note"><summary>About the learning model</summary><p>Fictional effort and wellbeing numbers help you explore decisions; they do not measure real people. Estimated value is not verified impact. This is a prototype exercise, not a release checklist. Ask the people involved, validate accessibility and privacy, and check outcomes with learners. Progress saves automatically on this browser and device. Clearing site data or using private browsing can remove it. There is no account or cross-device sync.</p></details></div>`;
};
game.addEventListener('click', e=>{
  const b=e.target.closest('button'); if(!b||b.disabled)return;
  if(b.dataset.studio){
    const action=b.dataset.studio;
    if(action==='ask-new'||action==='new'){studioNewConfirmation=true;render();game.querySelector('[data-studio="confirm-new"]').focus({preventScroll:true});return;}
    if(action==='cancel-new'){studioNewConfirmation=false;render();game.querySelector(studioPendingSave?'[data-studio="resume"]':'[data-studio="ask-new"]').focus({preventScroll:true});return;}
    if(action==='confirm-new'){
      studioSaveStatus=window.StudioSave.clear();state=G.createState();studioStarted=false;studioReflections={};studioCheckpoints={};studioPendingSave=null;studioNewConfirmation=false;
    }else if(action==='resume'){
      if(!studioPendingSave)return;
      state=studioPendingSave.state;studioReflections=studioPendingSave.reflections;studioCheckpoints=studioPendingSave.checkpoints;studioStarted=true;studioPendingSave=null;
    }else if(action==='start')studioStarted=true;
    else if(action==='replay'){
      const round=b.dataset.round===undefined?state.round:Number(b.dataset.round);
      if(!studioCheckpoints[round])return;
      state=JSON.parse(JSON.stringify(studioCheckpoints[round]));
      for(const key of Object.keys(studioReflections))if(Number(key)>=state.round)delete studioReflections[key];
      for(const key of Object.keys(studioCheckpoints))if(Number(key)>state.round)delete studioCheckpoints[key];
    }
    render(true);
  }
  if(b.dataset.reflect!==undefined){const answer=Number(b.dataset.reflect);if(![0,1].includes(answer))return;studioReflections[state.round]=answer;render();game.querySelector(`[data-reflect="${answer}"]`).focus({preventScroll:true});}
  if(b.dataset.move){
    const from=state.selected.indexOf(b.dataset.move),to=from+Number(b.dataset.direction);
    if(from<0||to<0||to>=state.selected.length)return;
    const order=[...state.selected];[order[from],order[to]]=[order[to],order[from]];
    const valid=order.every((id,i)=>G.find(id).deps.every(dep=>state.done.includes(dep)||order.slice(0,i).includes(dep)));
    if(valid){state.selected=order;render();game.querySelector(`[data-move="${b.dataset.move}"][data-direction="${b.dataset.direction}"]`).focus({preventScroll:true});}
    const feedback=valid?'Delivery order updated.':'That move would place a task before its prerequisite. Keep dependencies in order.';
    document.querySelector('#announcement').textContent=feedback;document.querySelector('#order-feedback').textContent=feedback;
  }
});
render();
if(studioPendingSave){
  const resumeHeading=document.querySelector('#game-heading');
  resumeHeading.focus({preventScroll:true});
  resumeHeading.scrollIntoView({behavior:'auto',block:'center'});
}
