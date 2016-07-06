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
  
  @action onEntryAction = (_event) => {
    this.active = true;
    if (_event && _event.data){
      this.props = _event.data;
    }
    if (this.onentry){
      this.onentry(_event);
    }
  }
  
  onExit = this.onExitAction;
  
  @action onExitAction = (_event) => {
    this.props = {};
    this.active = false;
    this.clear();
    if (this.onexit){
      this.onexit(_event);
    }
  };

  
  success = (data) => {
    this.sm.handle("success", data);
  };
  
  failure = (data) => {
    this.sm.handle("failure", data);
  };
  
  handle = (name, data) => {
    if (!this.active && this.parent[toLower(this.id)]){
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
    //this.stack.replace(this.stack.slice(1));
  };

  @action replace = (data) => {
    assert(this.stack.length, "Empty stack");
    assert(data, "Empty data");
    assert(data.name, "Empty state name");
    this.stack[this.stack.length - 1] = data;
  };
  
  @action pop = () => {
    assert(this.stack.length > 1, "Empty stack, cannot pop");
    this.stack.pop();
    this.index = this.stack.length - 1;
    const data = this.stack[this.stack.length - 1];
    this.sm.handle(toLower(data.name), data.data);
  }
}
