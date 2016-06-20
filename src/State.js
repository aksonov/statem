// Copyright (c) 2016, Pavlo Aksonov
// All rights reserved.

import {when, action, autorun, observable, spy} from 'mobx';
import Transition, {DEFAULT} from './Transition';
import assert from 'assert';

export default class State {
  id;
  onEntry;
  onExit;
  states;
  transitions;
  sm;
  parent;
  
  constructor(data, parent, sm){
    assert(data, "No state data is defined!");
    let {id, transition, state, states, onentry, onexit, initial} = data;
    assert(id, "State should contain id");
    this.id = id;
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
    
    this.onEntry = onentry;
    this.onExit = onexit;
  }
  
  promise = (res)=> {
    console.log("RESULT:", res);
    if (res && res.then){
      res.then(response=>{
        console.log("SUCCESS:", response);
        this.success(response);
      }).catch(e => {
        console.log("FAILURE:", e);
        this.failure(e)
      });
    } else {
        setTimeout(()=>res ? this.success(res) : this.failure(res));
    }
  };
  
  success = (data) => {
    this.sm.handle("success", data);
  };
  
  failure = (data) => {
    this.sm.handle("failure", data);
  };
  
}
