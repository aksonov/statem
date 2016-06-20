// Copyright (c) 2016, Pavlo Aksonov
// All rights reserved.

import scion from 'scion-core';
import State from './State';
import autobind from 'autobind-decorator';
import assert from 'assert';
import {observable} from 'mobx';

@autobind
export default class StateMachine {
  interpreter;
  _states = {};
  @observable state;

  constructor(state, stateClass, props = {}){
    Object.assign(this, props);
    const StateClass = stateClass || State;
    const data = new StateClass(state, null, this);
    this.interpreter = new scion.Statechart(data);
    this.interpreter._evaluateAction = function(currentEvent, actionRef) {
        return actionRef.call(this._scriptingContext, currentEvent);     //SCXML system variables
    };

    this.interpreter.registerListener({
      onEntry: (state)=>{this.state = state;console.log(`Entering state ${state}`)},
      onTransition: (from, to)=>console.log(`Transition from ${from} to ${to}`),
      onExit: (state)=>console.log(`Exit state ${state}`)});
  }

  start = () => {
    this.interpreter.start();
  };

  handle = (event, data) => {
    this.interpreter.gen(event, data);
  };



  currentState = () => { return this.interpreter.getConfiguration()[0] }
  currentStates = () => { return this.interpreter.getConfiguration() }

  addState(state) {
    assert(!this._states[state.id], `State ${state.id} already exists`);
    this._states[state.id] = state;
  }
  
  getState(stateName){
    return this._states[stateName];
  }

  success = (data) => {
    this.handle("success", data);
  };
  failure = (data) => {
    this.interpreter.handle("failure", data);
  };
}