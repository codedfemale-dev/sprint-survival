const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function setup() {
  const listeners=[];
  const elements=new Map();
  const element=selector=>{if(!elements.has(selector))elements.set(selector,{innerHTML:'',textContent:'',focus(){},scrollIntoView(){},querySelector:element,addEventListener(type,fn){if(type==='click')listeners.push(fn);}});return elements.get(selector);};
  const document={querySelector:element,body:{classList:{toggle(){}}}};
  const context=vm.createContext({document,window:{},console});
  for(const file of ['engine.js','script.js','studio.js'])vm.runInContext(fs.readFileSync(`${__dirname}/${file}`,'utf8'),context);
  function click(dataset){const b={dataset,disabled:false};for(const fn of listeners)fn({target:{closest:()=>b}});}
  return {click,html:()=>element('#game').innerHTML,read:code=>vm.runInContext(code,context),message:()=>element('#announcement').textContent};
}
test('first sprint carries delivery, wellbeing and history into sprint two',()=>{
  const ui=setup();ui.click({studio:'start'});
  for(const task of ['profile','slots','booking'])ui.click({task});
  ui.click({action:'lock'});ui.click({choice:'0'});ui.click({action:'deliver'});
  assert.match(ui.html(),/A first session is bookable/);
  assert.match(ui.html(),/Booking journey built for the demo/);
  assert.equal(ui.read('state.wellbeing'),84);
  ui.click({reflect:'request'});assert.match(ui.html(),/A request changes demand/);
  ui.click({reflect:'capacity'});assert.match(ui.html(),/Exactly/);
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
  ui.click({reflect:'capacity'});ui.click({studio:'replay'});
  assert.equal(ui.read('state.done.length'),0);assert.equal(ui.read('state.wellbeing'),80);
  assert.equal(ui.read('studioReflection'),null);assert.match(ui.html(),/Choose your work/);
});
test('all pace and response combinations render through review, including empty plans',()=>{
  for(const stance of ['support','steady','stretch'])for(const choice of ['0','1','2']){
    const ui=setup();ui.click({studio:'start'});ui.click({stance});
    ui.click({action:'lock'});ui.click({choice});ui.click({action:'deliver'});
    assert.match(ui.html(),/YOUR TURN/);assert.doesNotMatch(ui.html(),/undefined|NaN/);
    ui.click({studio:'replay'});assert.equal(ui.read('state.phase'),'plan');
  }
});
