// Copyright (c) 2016, Pavlo Aksonov
// All rights reserved.

import {when, action, autorun, toJS, observable, spy} from 'mobx';
import Transition, {DEFAULT} from './Transition';
import assert from 'assert';

function toLower(id){
  return id.charAt(0).toLowerCase() + id.slice(1);
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
  @observable shouldPop = false;
  
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
      this.jump({name: child.id, data:child.props});
    } else {
      if (child.props.pop){
        console.log("POP");
      } else if (this.stack.find(el=>el.id === child.id)){
        console.log("ALREADY EXISTS, NO PUSH");
      } else {
        this.push({name: child.id, data:child.props});
        console.log("PUSHED");
      }
    }
  };
  
  @action onEntryAction = (_event = {}) => {
    console.log(`ENTER STATE:`, this.id);
    this.shouldPop = false;
    if (_event && _event.data){
      this.props = _event.data;
    }
    if (this.onentry){
      this.onentry(_event);
    }
    if (this.parent && this.parent.isContainer && this.parent[toLower(this.id)]){
      this.parent.onChildEntry(this);
    }
    this.active = true;
  }
  
  onExit = this.onExitAction;
  
  @action onExitAction = (_event) => {
    console.log(`EXIT STATE:`, this.id);
    this.active = false;
    this.clear();
    if (this.onexit){
      console.log(`ONEXITF`, this.onexit);
      this.onexit(_event);
    }
  };

  
  success = (data) => {
    this.handle("success", data);
  };
  
  failure = (data) => {
    this.handle("failure", data);
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
    assert(data.name, "Empty state name");
    this.stack.push(data);
    this.index = this.stack.length - 1;
  };
  
  @action jump = (data) => {
    assert(data, "Empty data");
    assert(data.name, "Empty state name");
    const i = this.stack.findIndex(el => el.name === data.name);
    assert(i >= 0, "Cannot jump to non-existing state:"+ data.name+" STACK:"+JSON.stringify(this.stack));
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
  
  @action pop = (next, props) => {
    console.log("POP", this.id);
    if (this.stack.length <= 1 && this.parent && this.parent.isContainer){
      this.parent.pop();
    } else {
      console.log("STACK:", this.stack.length, this.stack[this.stack.length-1].name);
      this.stack.pop();
      this.index = this.stack.length - 1;
      const data = this.stack[this.index];
      setTimeout(()=>this.handle(toLower(data.name), {pop: true}));
    }
    if (next){
      setTimeout(()=>next(props), 500);
    }
  }
}
