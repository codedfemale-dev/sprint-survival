/* Browser-local saves. Rebuild stored games through the engine before resuming. */
(function(root){
  'use strict';
  const key='codedfemale:sprint-survival:studio:v1';
  const engine=root.SprintGame;
  const clone=value=>JSON.parse(JSON.stringify(value));
  const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
  const validStance=value=>['support','steady','stretch'].includes(value);
  function select(s,ids){
    if(!Array.isArray(ids)||ids.length>engine.TASKS.length||new Set(ids).size!==ids.length)throw Error('Invalid plan');
    s.selected=[];
    for(const id of ids){
      const task=engine.find(id);
      if(!task||!engine.available(s,task))throw Error('Invalid dependency');
      engine.toggle(s,id);
    }
  }
  function validate(data){
    if(!object(data)||data.version!==1||data.started!==true||!Number.isFinite(data.savedAt)||data.savedAt<=0||!object(data.state)||!object(data.reflections))throw Error('Invalid save');
    const stored=data.state;
    if(!Number.isInteger(stored.round)||stored.round<0||stored.round>2||!['plan','event','adapt','review','final'].includes(stored.phase)||!Array.isArray(stored.history)||stored.history.length>3||!validStance(stored.stance))throw Error('Invalid state');
    const reviewed=['review','final'].includes(stored.phase);
    if(stored.history.length!==stored.round+(reviewed?1:0)||stored.phase==='final'&&stored.round!==2)throw Error('Invalid history');
    const state=engine.createState(),checkpoints={0:clone(state)};
    for(let i=0;i<stored.history.length;i++){
      const entry=stored.history[i];
      if(!object(entry)||entry.round!==i||!validStance(entry.stance)||!Number.isInteger(entry.choice)||entry.choice<0||entry.choice>2)throw Error('Invalid result');
      state.stance=entry.stance;state.phase='event';engine.choose(state,entry.choice);
      select(state,entry.planned);engine.deliver(state);
      const actual=state.history[i];
      if(!Object.keys(actual).every(field=>equal(actual[field],entry[field])))throw Error('Result mismatch');
      if(i<stored.round){engine.next(state);checkpoints[state.round]=clone(state);}
    }
    if(!reviewed){
      state.stance=stored.stance;
      if(stored.phase==='adapt'){
        if(!Number.isInteger(stored.choice)||stored.choice<0||stored.choice>2)throw Error('Invalid response');
        state.phase='event';engine.choose(state,stored.choice);
      }
      select(state,stored.selected);
      state.phase=stored.phase;
    }else if(stored.phase==='final')engine.next(state);
    if(!Object.keys(state).every(field=>equal(state[field],stored[field])))throw Error('State mismatch');
    const reflections={};
    for(const [round,answer] of Object.entries(data.reflections)){
      if(!['0','1','2'].includes(round)||Number(round)>=stored.history.length||![0,1].includes(answer))throw Error('Invalid reflection');
      reflections[round]=answer;
    }
    return {state,checkpoints,reflections,started:true,savedAt:data.savedAt};
  }
  function read(){
    let text;
    try{text=root.localStorage.getItem(key);}catch{return {status:'unavailable'};}
    if(text===null)return {status:'empty'};
    try{
      if(text.length>50000)throw Error('Save too large');
      return {status:'saved',game:validate(JSON.parse(text))};
    }catch{return {status:'invalid'};}
  }
  function write(state,reflections){
    try{
      const savedAt=Date.now();
      root.localStorage.setItem(key,JSON.stringify({version:1,savedAt,started:true,state,reflections}));
      return {status:'saved',savedAt};
    }catch{return {status:'unavailable'};}
  }
  function clear(){try{root.localStorage.removeItem(key);return {status:'empty'};}catch{return {status:'unavailable'};}}
  root.StudioSave={read,write,clear};
})(typeof window!=='undefined'?window:globalThis);
