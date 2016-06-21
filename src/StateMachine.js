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
  handlers = {};

  constructor(state, stateClass, props = {}){
    Object.assign(this, props);
    const StateClass = stateClass || State;
    const data = new StateClass(state, null, this);
    this.interpreter = new scion.Statechart(data, {console});
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

  promise = ({content, $column, $line})=> {
    var res;
    try {
      res = content();
    } catch (e){
      throw(`scxml eval error, column: ${$column} line: ${$line}, ${e}`);
    }
    console.log("RESULT:", res);
    if (res && res.then){
      res.then(response=>{
        //console.log("SUCCESS:", response);
        this.success(response);
      }).catch(e => {
        throw(`scxml eval error, column: ${$column} line: ${$line}, ${e}`);
        this.failure(e)
      });
    } else {
      setTimeout(()=>res ? this.success(res) : this.failure(res));
    }
  };

  // content here must return KefirJS stream
  on({content, target}) {
    const stream = content();
    if (!this.handlers[target]){
      this.handlers[target] = stream.onValue(e => this.handle(target, e));
    }
  }

  pass({content}){
    setTimeout(()=>this.handle("pass", content()));
  }

  script({content, $column, $line}) {
    try {
      content();
    } catch (e){
      throw(`scxml eval error, column: ${$column} line: ${$line}, ${e}`);
    }
  }
  
  log({expr, $column, $line}){
    try {
      console.log(expr());
    } catch (e){
      throw(`scxml eval error, column: ${$column} line: ${$line}, ${e}`);
    }
  }


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
    this.handle("failure", data);
  };
}