// Copyright (c) 2016, Pavlo Aksonov
// All rights reserved.

import {when, action, autorun, observable, spy} from 'mobx';
import Transition, {DEFAULT} from './Transition';
import assert from 'assert';

export default class State {
  id;
  props = {};
  states;
  transitions;
  sm;
  parent;
  $type;
  handlers = {};
  
  constructor(data, parent, sm){
    assert(data, "No state data is defined!");
    let {id, $type, transition, state, states, onentry, onexit, initial} = data;
    assert(id, "State should contain id");
    this.id = id;
    this.$type = $type;
    this.parent = parent;
    this.sm = sm;
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
      this.states = state.map(el => new State(el, sm));
    }
    
    this.onentry = onentry;
    this.onexit = onexit;
  }

  onEntry = (_event) => {
    console.log(`ENTERING STATE: ${this.id} EVENT:${JSON.stringify(_event)}`);
    // assign all values to the state
    if (_event && _event.data){
      this.props = _event.data;
    }
    if (this.onentry){
      this.onentry(_event);
    }
    this.sm.enterState(this.id);
  };

  onExit = (_event) => {
    this.props = null;
    if (this.onexit){
      this.onexit(_event);
    }
    this.sm.exitState(this.id);
  };

  
  success = (data) => {
    this.sm.handle("success", data);
  };
  
  failure = (data) => {
    this.sm.handle("failure", data);
  };
  
}
