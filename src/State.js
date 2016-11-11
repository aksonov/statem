// Copyright (c) 2016, Pavlo Aksonov
// All rights reserved.

import {when, action, autorun, toJS, observable, spy} from 'mobx';
import Transition, {DEFAULT} from './Transition';
import assert from 'assert';

function toLower(id){
  return id.charAt(0).toLowerCase() + id.slice(1);
}

function filterParam(data) {
  if (data === undefined || data === null){
    return {};
  }
  const proto = data.constructor.name;
  // avoid passing React Native parameters
  if (proto !== 'Object') {
    if (typeof(data) === 'number' || typeof(data)==='boolean'){
      return data;
    }
    if (proto === 'Number' || proto === 'Boolean'  || proto === 'String'){
      return data;
    }
    //console.log("PROTO:", proto);
    return data.toString();
  }
  const res = {};
  for (const key of Object.keys(data)){
    //console.log("PROCESSING:", key);
    res[key] = filterParam(data[key]);
  }
  return res;
}

export default class State {
  id;
  @observable props = {};
  @observable stack = [];
  @observable index = 0;
  @observable active: boolean = false;
  states;
  transitions;
  sm;
  parent;
  $type;
  
  // listener for state entry/exit
  listener;
  // allow to run code after all interactions
  static runner = (func) => func();
  
  constructor(data, parent, sm){
    assert(data, "No state data is defined!");
    let {id, $type, transition, transitions, state, states, onentry, onexit, initial} = data;
    assert(id, "State should contain id");
    assert(sm, "StateMachine instance is not defined");
    this.id = id;
    this.$type = $type;
    this.parent = parent;
    this.sm = sm;
    this.sm.addState(this);
    this.initial = initial;
    if (transition){
      if (!(transition instanceof Array)){
        transition = [transition];
      }
      this.transitions = transition.map(el => new Transition(this, el));
    }
    
    if (states && states.length ){
      assert(initial, `Initial state should be set for compoud state: ${id}`);
      if (!states.filter(el => el.id === initial).length){
        throw new Error(`No state ${initial} exist for compud state ${id}`);
      }
      this.states = states;
    } else if (state){
      assert(initial, `Initial state should be set for compoud state: ${id}`);
      if (!(state instanceof Array)){
        state = [state];
      }
      if (!state.filter(el => el.id === initial).length){
        throw new Error(`No state ${initial} exist for compud state ${id}`);
      }
      this.states = state.map(el => new State(el, this, sm));
    }
    
    this.onentry = onentry;
    this.onexit = onexit;
  }

  onEntry = this.onEntryAction;
  
  onChildEntry = (child) => {
    console.log(`ID:${child.id}`);
    if (this.isSwitch){
      console.log("JUMP");
      this.jump({id: child.id, data:child.props});
    } else {
        this.push({id: child.id, data:child.props});
    }
  };
  
  @action onEntryAction = (_event = {}) => {
    try {
      // store data if it is not POP
      this.active = true;
      if (_event && _event.data) {
        if (_event.data.isPop){
          console.log("IT IS AFTER POP", this.id);
          return;
        }
        this.props = filterParam(_event.data);
      }
      this.listener && this.listener.onEnter(this.props);
      if (this.parent && this.parent.isContainer && this.parent[toLower(this.id)]) {
        this.parent.onChildEntry(this);
      }
      if (this.onentry) {
        State.runner(()=>this.onentry(_event));
      }
    } catch (e){
      console.error(e)
    }
  }
  
  onExit = this.onExitAction;
  
  @action onExitAction = (_event) => {
    try {
      console.log(`EXIT STATE:`, this.id);
      this.active = false;
      this.clear();
      this.listener && this.listener.onExit(this.props);
      if (this.onexit) {
        console.log(`ONEXITF`, this.onexit);
        State.runner(()=>this.onexit(_event));
      }
    } catch (e){
      console.error(e)
    }
  };

  
  handle = (name, data) => {
    console.log("HANDLE ", name, "FROM", this.id, this.active);
    if (!this.active && this.parent[toLower(this.id)]){
      console.log("CALL PARENT",toLower(this.id));
      this.parent[toLower(this.id)]();
    }
    this.sm.handle(name, data);
  }
  
  @action push = (data) => {
    assert(data, "Empty data");
    assert(data.id, "Empty state name");
    if (this.stack.find(el=>el.id === data.id)){
      console.log("ALREADY EXISTS, NO PUSH");
    } else {
      console.log("PUSHED", data.id);
      this.stack.push(data);
      this.index = this.stack.length - 1;
    }
  };
  
  @action jump = (data) => {
    assert(data, "Empty data");
    assert(data.id, "Empty state name");
    const i = this.stack.findIndex(el => el.id === data.id);
    assert(i >= 0, "Cannot jump to non-existing state:"+ data.id+" STACK:"+JSON.stringify(this.stack));
    this.index = i;
  };
  
  
  clear = () => {
    //this.stack.replace([]);
  };

  @action replace = (data) => {
    assert(this.stack.length, "Empty stack");
    assert(data, "Empty data");
    assert(data.name, "Empty state name");
    this.stack[this.stack.length - 1] = data;
  };
  
  @action pop = (props) => {
    if (this.isSwitch){
      console.log("CANNOT POP SWITCH CONTAINER", this.id);
      return;
    }
    console.log("POP", this.id);
    if (this.stack.length <= 1 && this.parent && this.parent.isContainer){
      this.parent.pop();
    } else {
      if (this.stack.length > 1){
        console.log("STACK:", this.stack.length, this.stack[this.stack.length-1].id);
        this.stack.pop();
        this.index = this.stack.length - 1;
        const data = this.stack[this.index];
        this.handle(toLower(data.id), {isPop: true});
      }
    }
  }
}
