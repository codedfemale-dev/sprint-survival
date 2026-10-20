const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function setup(storage=new Map(),blocked=false) {
  const listeners=[];
  const elements=new Map();
  const element=selector=>{if(!elements.has(selector))elements.set(selector,{innerHTML:'',textContent:'',focus(){},scrollIntoView(){},querySelector:element,addEventListener(type,fn){if(type==='click')listeners.push(fn);}});return elements.get(selector);};
  let downloadText='';
  const document={querySelector:element,createElement:()=>({click(){},remove(){}}),body:{append(){},classList:{toggle(){}}}};
  const context=vm.createContext({document,window:{localStorage:{getItem(key){if(blocked)throw Error('Unavailable');return storage.get(key)??null;},setItem(key,value){if(blocked)throw Error('Unavailable');storage.set(key,value);},removeItem(key){if(blocked)throw Error('Unavailable');storage.delete(key);}}},console,Blob:class {constructor(parts){this.text=parts.join('');}},URL:{createObjectURL(blob){downloadText=blob.text;return 'blob:test';},revokeObjectURL(){}},setTimeout:fn=>fn()});
  for(const file of ['engine.js','scenarios.js','save.js','script.js','studio.js'])vm.runInContext(fs.readFileSync(`${__dirname}/${file}`,'utf8'),context);
  function click(dataset){const b={dataset,disabled:false};for(const fn of listeners)fn({target:{closest:()=>b}});}
  return {storage,click,html:()=>element('#game').innerHTML,read:code=>vm.runInContext(code,context),download:()=>downloadText,message:()=>element('#announcement').textContent};
}
test('first sprint carries delivery, wellbeing and history into sprint two',()=>{
  const ui=setup();ui.click({studio:'start'});
  for(const task of ['profile','slots','booking'])ui.click({task});
  ui.click({action:'lock'});ui.click({choice:'0'});ui.click({action:'deliver'});
  assert.match(ui.html(),/A first session is bookable/);
  assert.match(ui.html(),/Booking journey built for the demo/);
  assert.equal(ui.read('state.wellbeing'),84);
  ui.click({reflect:'1'});assert.match(ui.html(),/A request changes demand/);
  ui.click({reflect:'0'});assert.match(ui.html(),/Exactly/);
  ui.click({action:'next'});assert.equal(ui.read('state.round'),1);
  assert.equal(ui.read('state.done.length'),3);assert.equal(ui.read('state.history.length'),1);
  assert.match(ui.html(),/Make booking easier to trust and use/);
});
test('reordering protects prerequisites and demonstrates the cost of an overfull plan',()=>{
  const ui=setup();ui.click({studio:'start'});
  for(const task of ['profile','slots','booking'])ui.click({task});
  ui.click({move:'slots',direction:'-1'});
  assert.match(ui.message(),/before its prerequisite/);
  assert.equal(ui.read('state.selected.join(",")'),'profile,slots,booking');
  ui.click({action:'lock'});ui.click({choice:'1'});
  ui.click({move:'banner',direction:'-1'});
  assert.equal(ui.read('state.selected.join(",")'),'profile,slots,banner,booking');
  assert.match(ui.html(),/Time to trim the plan/);
  ui.click({action:'deliver'});
  assert.equal(ui.read('state.done.join(",")'),'profile,slots,banner');
  assert.equal(ui.read('state.wellbeing'),76);
  assert.match(ui.html(),/Booking journey not delivered yet/);
  ui.click({reflect:'0'});ui.click({studio:'replay'});
  assert.equal(ui.read('state.done.length'),0);assert.equal(ui.read('state.wellbeing'),80);
  assert.equal(ui.read('studioReflections[0]'),undefined);assert.match(ui.html(),/Choose your work/);
});
test('all pace and response combinations render through review, including empty plans',()=>{
  for(const stance of ['support','steady','stretch'])for(const choice of ['0','1','2']){
    const ui=setup();ui.click({studio:'start'});ui.click({stance});
    ui.click({action:'lock'});ui.click({choice});ui.click({action:'deliver'});
    assert.match(ui.html(),/YOUR TURN/);assert.doesNotMatch(ui.html(),/undefined|NaN/);
    ui.click({studio:'replay'});assert.equal(ui.read('state.phase'),'plan');
  }
});
function addGoal(ui,round){
  const add=id=>{
    if(ui.read(`state.done.includes('${id}') || state.selected.includes('${id}')`))return;
    for(const dep of ui.read(`G.find('${id}').deps`))add(dep);
    ui.click({task:id});
  };
  for(const id of ui.read(`G.SPRINTS[${round}].goals`))add(id);
}
function finishSprint(ui,choice='0'){
  ui.click({action:'lock'});ui.click({choice});ui.click({action:'deliver'});
}
test('all three chapters, final story and reflection explain a sustainable complete journey',()=>{
  const ui=setup();ui.click({studio:'start'});
  for(let round=0;round<3;round++){
    addGoal(ui,round);
    if(round===1){assert.match(ui.html(),/Support is part of delivery/);assert.match(ui.html(),/2\), keyboard booking \(3\)/);}
    if(round===2){assert.match(ui.html(),/Feedback \(3\)/);assert.match(ui.html(),/improve/);}
    finishSprint(ui);
    assert.equal(ui.read(`state.history[${round}].goal`),true);
    ui.click({reflect:'1'});assert.match(ui.html(),/role="status"/);
    ui.click({reflect:'0'});assert.match(ui.html(),/Exactly/);
    ui.click({action:'next'});
  }
  assert.equal(ui.read('state.phase'),'final');assert.equal(ui.read('state.wellbeing'),96);
  assert.match(ui.html(),/JOURNEY COMPLETE/);assert.match(ui.html(),/Your team. Your delivery story/);
  assert.match(ui.html(),/Example question for a learner/);assert.match(ui.html(),/not a real response/);
  for(let round=0;round<3;round++){
    const reflection=ui.read(`window.studioReflectionLines(${round})`).join('\n');
    assert.match(reflection,/Team conversation:/);assert.match(reflection,/Explanation: Exactly/);
  }
  ui.click({action:'download'});
  assert.match(ui.download(),/Sprint 2:/);assert.match(ui.download(),/Sprint 3:/);
  assert.match(ui.download(),/Debrief: Pairing uses time/);assert.match(ui.download(),/Explanation: Exactly/);
  assert.doesNotMatch(ui.download(),/undefined|NaN/);
  ui.click({studio:'replay'});
  assert.equal(ui.read('state.round'),2);assert.equal(ui.read('state.phase'),'plan');
  assert.equal(ui.read('state.history.length'),2);assert.equal(ui.read('state.wellbeing'),91);
  assert.equal(ui.read('studioReflections[2]'),undefined);assert.equal(ui.read('studioReflections[1]'),0);
  ui.click({studio:'new'});ui.click({studio:'confirm-new'});assert.match(ui.html(),/WELCOME TO YOUR FIRST SPRINT/);
  assert.equal(ui.read('state.history.length'),0);assert.equal(ui.read('Object.keys(studioCheckpoints).length'),1);
});
test('unfinished foundations remain visible in later chapters and recovery updates pace labels',()=>{
  const ui=setup();ui.click({studio:'start'});
  ui.click({stance:'stretch'});finishSprint(ui,'2');ui.click({action:'next'});
  assert.equal(ui.read('state.wellbeing'),56);
  assert.match(ui.html(),/Earlier foundations still matter: Mentor profiles, Available time slots, Book a session/);
  assert.match(ui.html(),/11 capacity · \+2 wellbeing/);
  assert.match(ui.html(),/Starting wellbeing of 56\/100 reduces this sprint/);
  assert.match(ui.html(),/Try Mentor profiles/);
  addGoal(ui,1);finishSprint(ui,'1');
  const history=ui.read('JSON.stringify(state.history[0])');
  ui.click({studio:'replay'});
  assert.equal(ui.read('state.round'),1);assert.equal(ui.read('state.history.length'),1);
  assert.equal(ui.read('JSON.stringify(state.history[0])'),history);
  assert.equal(ui.read('state.wellbeing'),56);assert.equal(ui.read('state.selected.length'),0);
});
test('all 729 pace and response journeys reach the final studio without invalid output',()=>{
  for(let route=0;route<729;route++){
    const ui=setup();ui.click({studio:'start'});let encoded=route;
    for(let round=0;round<3;round++){
      const option=encoded%9;encoded=Math.floor(encoded/9);
      ui.click({stance:['support','steady','stretch'][Math.floor(option/3)]});
      // Mix empty plans and dependency-aware mission plans to cover missed goals.
      if(route%2===0)addGoal(ui,round);
      finishSprint(ui,String(option%3));
      assert.doesNotMatch(ui.html(),/undefined|NaN|First sprint progress/);
      assert.match(ui.html(),/YOUR TURN/);
      ui.click({action:'next'});
    }
    assert.equal(ui.read('state.phase'),'final');
    assert.equal(ui.read('state.history.length'),3);
    assert.match(ui.html(),/JOURNEY COMPLETE/);
    assert.doesNotMatch(ui.html(),/undefined|NaN|existing simulator/);
  }
});

test('revisiting an earlier chapter preserves its starting state and clears later outcomes',()=>{
  const ui=setup();ui.click({studio:'start'});
  for(let round=0;round<3;round++){addGoal(ui,round);finishSprint(ui);ui.click({reflect:'0'});ui.click({action:'next'});}
  ui.click({studio:'replay',round:'1'});
  assert.equal(ui.read('state.round'),1);assert.equal(ui.read('state.history.length'),1);
  assert.equal(ui.read('state.wellbeing'),84);assert.equal(ui.read('state.done.length'),3);
  assert.equal(ui.read('studioReflections[0]'),0);assert.equal(ui.read('studioReflections[1]'),undefined);
  assert.equal(ui.read('studioCheckpoints[2]'),undefined);
  assert.match(ui.html(),/CHAPTER 02/);
});
test('refresh offers resume without overwriting the saved plan or task order',()=>{
  const first=setup();first.click({studio:'start'});
  for(const task of ['profile','slots','booking','privacy'])first.click({task});
  first.click({move:'privacy',direction:'-1'});
  const before=first.read('JSON.stringify(state)');
  const saved=[...first.storage.values()][0];
  const resumed=setup(first.storage);
  assert.match(resumed.html(),/Resume journey/);
  assert.equal([...first.storage.values()][0],saved);
  resumed.click({studio:'resume'});
  assert.equal(resumed.read('JSON.stringify(state)'),before);
  assert.match(resumed.html(),/Saved on this browser/);
});
test('all phases in all chapters resume exactly and completed journeys retain debriefs and replay',()=>{
  let ui=setup();ui.click({studio:'start'});
  function reload(){
    const before=ui.read('JSON.stringify(state)');
    const reflections=ui.read('JSON.stringify(studioReflections)');
    const next=setup(ui.storage);
    assert.match(next.html(),/Your team is right where you left them/);
    next.click({studio:'resume'});
    assert.equal(next.read('JSON.stringify(state)'),before);
    assert.equal(next.read('JSON.stringify(studioReflections)'),reflections);
    ui=next;
  }
  for(let round=0;round<3;round++){
    reload();addGoal(ui,round);reload();
    ui.click({action:'lock'});reload();
    ui.click({choice:String(round)});reload();
    ui.click({action:'deliver'});reload();
    ui.click({reflect:'1'});reload();
    ui.click({reflect:'0'});reload();
    ui.click({action:'next'});
  }
  reload();assert.match(ui.html(),/JOURNEY COMPLETE/);
  ui.click({action:'download'});assert.match(ui.download(),/Your answer:/);
  ui.click({studio:'replay',round:'1'});reload();
  assert.equal(ui.read('state.round'),1);assert.equal(ui.read('state.history.length'),1);
  assert.equal(ui.read('studioReflections[2]'),undefined);
});
test('new-journey confirmation preserves progress on cancel and replaces it only on confirmation',()=>{
  const ui=setup();ui.click({studio:'start'});ui.click({task:'profile'});
  ui.click({studio:'ask-new'});assert.match(ui.html(),/Replace your saved journey/);
  ui.click({studio:'cancel-new'});assert.equal(ui.read('state.selected[0]'),'profile');
  let next=setup(ui.storage);next.click({studio:'ask-new'});next.click({studio:'cancel-new'});
  assert.match(next.html(),/Resume journey/);
  next.click({studio:'ask-new'});next.click({studio:'confirm-new'});
  assert.equal(next.storage.size,0);assert.match(next.html(),/WELCOME TO YOUR FIRST SPRINT/);
  const fresh=setup(ui.storage);assert.doesNotMatch(fresh.html(),/Resume journey/);
});
test('unavailable storage and malformed or incompatible saves never stop play',()=>{
  const blocked=setup(new Map(),true);
  assert.match(blocked.html(),/Saving is unavailable/);
  blocked.click({studio:'start'});addGoal(blocked,0);finishSprint(blocked);
  assert.match(blocked.html(),/YOUR TURN/);
  const seed=setup();seed.click({studio:'start'});addGoal(seed,0);finishSprint(seed);
  const key=[...seed.storage.keys()][0],valid=JSON.parse(seed.storage.get(key));
  const cases=['{broken',JSON.stringify({...valid,version:999}),JSON.stringify({...valid,state:{...valid.state,wellbeing:999}}),JSON.stringify({...valid,state:{...valid.state,selected:['<img src=x onerror=alert(1)>']}}),JSON.stringify({...valid,reflections:{'__bad':0}})];
  for(const value of cases){
    const ui=setup(new Map([[key,value]]));
    assert.match(ui.html(),/saved game could not be read/);assert.doesNotMatch(ui.html(),/Resume journey/);
    ui.click({studio:'start'});ui.click({task:'profile'});assert.equal(ui.read('state.selected[0]'),'profile');
    const next=setup(ui.storage);assert.match(next.html(),/Resume journey/);
  }
});
test('every pace and response combination can resume at the final story',()=>{
  for(let route=0;route<27;route++){
    let encoded=route;const first=setup();first.click({studio:'start'});
    for(let round=0;round<3;round++){
      first.click({stance:['support','steady','stretch'][(route+round)%3]});addGoal(first,round);
      finishSprint(first,String(encoded%3));encoded=Math.floor(encoded/3);
      first.click({action:'next'});
    }
    const next=setup(first.storage);next.click({studio:'resume'});
    assert.equal(next.read('state.phase'),'final');assert.equal(next.read('state.history.length'),3);
  }
});

test('legacy version-one and version-two saves preserve original progress',()=>{
  const first=setup();first.click({studio:'start'});addGoal(first,0);finishSprint(first);first.click({action:'next'});
  const key=[...first.storage.keys()][0],old=JSON.parse(first.storage.get(key));
  delete old.state.campaign;
  for(const version of [1,2]){
  old.version=version;const resumed=setup(new Map([[key,JSON.stringify(old)]]));
  assert.match(resumed.html(),/Resume journey/);resumed.click({studio:'resume'});
  assert.equal(resumed.read('state.campaign'),'classic');assert.equal(resumed.read('state.wellbeing'),84);
  assert.equal(resumed.read('state.done.length'),3);
  }
});
test('earlier choices change both later situations and their real numerical consequences',()=>{
  const play=choice=>{const ui=setup();ui.click({campaign:'pressure'});ui.click({studio:'start'});addGoal(ui,0);finishSprint(ui,String(choice));ui.click({action:'next'});return ui;};
  const focused=play(0),unfinished=play(1),overtime=play(2);
  assert.equal(focused.read('G.eventFor(state).id'),'handoff');
  assert.equal(unfinished.read('G.eventFor(state).id'),'foundations');
  assert.equal(overtime.read('G.eventFor(state).id'),'recovery');
  assert.equal(focused.read('state.wellbeing'),85);assert.equal(overtime.read('state.wellbeing'),70);
  assert.match(overtime.html(),/WHY THIS SITUATION/);assert.match(overtime.html(),/asked Jo to review after hours/);
  assert.doesNotMatch(overtime.html(),/Partner logo banner/);
});
test('all adaptive pace-response paths keep stable scenarios through delivery and resume',()=>{
  const seen=new Set();
  for(let route=0;route<729;route++){
    let ui=setup(),encoded=route;ui.click({campaign:'pressure'});ui.click({studio:'start'});
    for(let round=0;round<3;round++){
      const pick=encoded%9;encoded=Math.floor(encoded/9);
      ui.click({stance:['support','steady','stretch'][Math.floor(pick/3)]});
      if(route%2===0)addGoal(ui,round);
      ui.click({action:'lock'});const event=ui.read('G.eventFor(state).id');seen.add(event);
      ui.click({choice:String(pick%3)});ui.click({action:'deliver'});
      assert.equal(ui.read('G.eventFor(state).id'),event);
      ui.click({reflect:'0'});assert.match(ui.html(),/Exactly/);
      const next=setup(ui.storage);assert.match(next.html(),/Resume journey/);next.click({studio:'resume'});ui=next;
      assert.equal(ui.read('G.eventFor(state).id'),event);
      assert.doesNotMatch(ui.html(),/undefined|NaN/);
      ui.click({action:'next'});
    }
    assert.match(ui.html(),/JOURNEY COMPLETE/);
    ui.click({action:'download'});assert.match(ui.download(),/Changing pressures/);
    ui.click({studio:'replay',round:'1'});assert.equal(ui.read('state.campaign'),'pressure');
    assert.equal(ui.read('state.history.length'),1);
  }
  assert.deepEqual([...seen].sort(),['attendance','draft','foundations','handoff','keyboard','recovery','verification'].sort());
});

test('adaptive stories resume in planning, conversation, adaptation and final reflection',()=>{
  let ui=setup();ui.click({campaign:'pressure'});ui.click({studio:'start'});
  const reload=()=>{const before=ui.read('JSON.stringify(state)');const next=setup(ui.storage);next.click({studio:'resume'});assert.equal(next.read('JSON.stringify(state)'),before);assert.equal(next.read('state.campaign'),'pressure');ui=next;};
  for(let round=0;round<3;round++){addGoal(ui,round);reload();ui.click({action:'lock'});reload();ui.click({choice:'0'});reload();ui.click({action:'deliver'});reload();ui.click({reflect:'1'});reload();ui.click({action:'next'});}
  reload();ui.click({studio:'replay',round:'0'});reload();
  assert.equal(ui.read('G.eventFor(state).id'),'draft');assert.equal(ui.read('state.history.length'),0);
});
