const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function setup() {
  const listeners=[];
  const elements=new Map();
  const element=selector=>{if(!elements.has(selector))elements.set(selector,{innerHTML:'',textContent:'',focus(){},scrollIntoView(){},querySelector:element,addEventListener(type,fn){if(type==='click')listeners.push(fn);}});return elements.get(selector);};
  let downloadText='';
  const document={querySelector:element,createElement:()=>({click(){},remove(){}}),body:{append(){},classList:{toggle(){}}}};
  const context=vm.createContext({document,window:{},console,Blob:class {constructor(parts){this.text=parts.join('');}},URL:{createObjectURL(blob){downloadText=blob.text;return 'blob:test';},revokeObjectURL(){}},setTimeout:fn=>fn()});
  for(const file of ['engine.js','script.js','studio.js'])vm.runInContext(fs.readFileSync(`${__dirname}/${file}`,'utf8'),context);
  function click(dataset){const b={dataset,disabled:false};for(const fn of listeners)fn({target:{closest:()=>b}});}
  return {click,html:()=>element('#game').innerHTML,read:code=>vm.runInContext(code,context),download:()=>downloadText,message:()=>element('#announcement').textContent};
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
  ui.click({studio:'new'});assert.match(ui.html(),/WELCOME TO YOUR FIRST SPRINT/);
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
