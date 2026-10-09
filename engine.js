/* The rules live here so you can remix the game without changing the interface. */
(function (root) {
  'use strict';
  const TASKS = [
    {id:'profile', title:'Mentor profiles', effort:3, value:5, type:'Foundation', description:'Help learners find someone with relevant experience.', deps:[]},
    {id:'slots', title:'Available time slots', effort:3, value:4, type:'Foundation', description:'Show when mentors can meet.', deps:['profile']},
    {id:'booking', title:'Book a session', effort:4, value:8, type:'Core journey', description:'Turn a good match into a confirmed conversation.', deps:['slots']},
    {id:'privacy', title:'Private contact details', effort:2, value:5, type:'Trust', description:'Keep personal contact details out of public profiles.', deps:['profile']},
    {id:'access', title:'Keyboard-friendly booking', effort:3, value:6, type:'Accessibility', description:'Make the booking journey usable without a mouse.', deps:['booking']},
    {id:'reminder', title:'Session reminders', effort:3, value:5, type:'Core journey', description:'Help learners and mentors remember their session.', deps:['booking']},
    {id:'cancel', title:'Cancel or rearrange', effort:3, value:5, type:'Core journey', description:'Give people a way to change plans.', deps:['booking']},
    {id:'feedback', title:'Useful session feedback', effort:3, value:6, type:'Learning', description:'Find out whether a session helped the learner.', deps:['booking']},
    {id:'measure', title:'Measure booking completion', effort:2, value:4, type:'Learning', description:'Count completed bookings, not just page visits.', deps:['booking']},
    {id:'improve', title:'Improve the matching questions', effort:4, value:8, type:'Learning', description:'Use feedback to help learners choose a mentor.', deps:['feedback']},
    {id:'confetti', title:'Celebration confetti', effort:2, value:1, type:'Nice to have', description:'A tiny party for every booking. The duck approves.', deps:['booking']},
    {id:'banner', title:'Partner logo banner', effort:3, value:2, type:'New request', description:'An eye-catching request from a stakeholder.', deps:[], hidden:true}
  ];
  const SPRINTS = [
    {goal:'Make a first session bookable', goals:['profile','slots','booking'], event:{title:'“Could you squeeze in one tiny thing?”', text:'A stakeholder wants a partner logo banner before the first demo. It takes 3 effort units and does not help anyone book a session.', options:[
      {title:'Defer it and explain why', text:'Keep the booking goal. Add the request to the backlog for later.', capacity:0, wellbeing:2, lesson:'A clear explanation can protect focus while acknowledging a request.'},
      {title:'Bring it into this sprint', text:'Add the banner to the end of your plan, then decide what fits.', capacity:0, wellbeing:-2, add:'banner', lesson:'Accepting a request means reconsidering scope. Move something out if the plan is too full.'},
      {title:'Promise overtime', text:'Gain 3 effort units this sprint. Lose 14 wellbeing points.', capacity:3, wellbeing:-14, add:'banner', lesson:'Overtime creates short-term capacity, but its cost carries into the next sprint.'}
    ]}},
    {goal:'Make booking easier to trust and use', goals:['privacy','access','reminder'], event:{title:'A teammate is stuck', text:'A test environment problem is blocking a teammate. They have asked for help. How will you respond?', options:[
      {title:'Pair up and unblock them', text:'Use 1 effort unit to help. Gain 5 wellbeing points.', capacity:-1, wellbeing:5, lesson:'Helping early takes time, but can reduce isolation and get work moving.'},
      {title:'Let them work it out alone', text:'Lose 3 effort units while the blocker continues. Lose 6 wellbeing points.', capacity:-3, wellbeing:-6, lesson:'A blocker can affect the whole plan. Making space for support is delivery work.'},
      {title:'Help, then catch up after hours', text:'Keep capacity unchanged. Lose 10 wellbeing points.', capacity:0, wellbeing:-10, lesson:'Solving a blocker is useful. Making recovery depend on overtime adds another problem.'}
    ]}},
    {goal:'Learn what makes sessions useful', goals:['feedback','measure','improve'], event:{title:'The demo date moves forward', text:'A stakeholder wants to see progress sooner. The team still needs time to test the work and prepare a useful demo.', options:[
      {title:'Agree a smaller, tested demo', text:'Reserve 2 effort units for testing and preparation. Gain 3 wellbeing points.', capacity:-2, wellbeing:3, lesson:'A smaller, tested demonstration can create a better conversation than rushed promises.'},
      {title:'Keep every promise', text:'Reserve 2 effort units for preparation, then add 3 through overtime. Lose 14 wellbeing points.', capacity:1, wellbeing:-14, lesson:'Keeping scope unchanged transfers the pressure to people. A deadline does not remove the work.'},
      {title:'Keep the date, discuss expectations', text:'Reserve 1 effort unit for a progress review. Gain 1 wellbeing point.', capacity:-1, wellbeing:1, lesson:'A progress review can show learning and unfinished work honestly, if everyone agrees what to expect.'}
    ]}}
  ];
  const find = id => TASKS.find(t => t.id === id);
  const clamp = n => Math.max(0, Math.min(100, n));
  function createState() { return {round:0, phase:'plan', wellbeing:80, done:[], selected:[], history:[], choice:null, stance:'steady', banner:false}; }
  function capacity(s) { const recovery = s.wellbeing < 45 ? 3 : s.wellbeing < 65 ? 1 : 0; return Math.max(0, 12 - recovery + (s.stance === 'support' ? -2 : s.stance === 'stretch' ? 2 : 0) + (s.choice === null ? 0 : SPRINTS[s.round].event.options[s.choice].capacity)); }
  function effort(s) { return s.selected.reduce((n,id) => n + find(id).effort, 0); }
  function available(s,t) { return !s.done.includes(t.id) && (!t.hidden || s.banner) && t.deps.every(id => s.done.includes(id) || s.selected.includes(id)); }
  function toggle(s,id) {
    if (!['plan','adapt'].includes(s.phase)) return;
    if (s.selected.includes(id)) {
      s.selected = s.selected.filter(x => x !== id);
      let changed;
      do { const before = s.selected.length; s.selected = s.selected.filter(x => find(x).deps.every(d => s.done.includes(d) || s.selected.includes(d))); changed = before !== s.selected.length; } while (changed);
    } else { const t=find(id); if(t && available(s,t)) s.selected.push(id); }
  }
  function choose(s,index) {
    if(s.phase !== 'event' || !SPRINTS[s.round].event.options[index]) return;
    s.choice=index; s.banner=true;
    const o=SPRINTS[s.round].event.options[index];
    if(o.add && !s.done.includes(o.add) && !s.selected.includes(o.add)) s.selected.push(o.add);
    s.phase='adapt';
  }
  function deliver(s) {
    if(s.phase !== 'adapt') return;
    const cap=capacity(s), planned=[...s.selected], finished=[]; let used=0;
    for(const id of planned) { const t=find(id); if(used+t.effort>cap || !t.deps.every(d=>s.done.includes(d)||finished.includes(d))) break; finished.push(id); used+=t.effort; }
    const unfinished=planned.filter(id=>!finished.includes(id));
    const stanceDelta=s.stance==='support'?8:s.stance==='stretch'?-10:2;
    const option=SPRINTS[s.round].event.options[s.choice];
    const delta=stanceDelta+option.wellbeing-(unfinished.length?4:0);
    s.wellbeing=clamp(s.wellbeing+delta); s.done.push(...finished);
    s.history.push({round:s.round,cap,used,planned,finished,unfinished,delta,wellbeing:s.wellbeing,choice:s.choice,stance:s.stance,goal:SPRINTS[s.round].goals.every(id=>s.done.includes(id)),value:finished.reduce((n,id)=>n+find(id).value,0)});
    s.phase='review';
  }
  function next(s) { if(s.phase !== 'review') return; if(s.round===2) s.phase='final'; else {s.round++; s.phase='plan'; s.selected=[]; s.choice=null; s.stance='steady';} }
  root.SprintGame={TASKS,SPRINTS,find,createState,capacity,effort,available,toggle,choose,deliver,next};
})(typeof window !== 'undefined' ? window : globalThis);
