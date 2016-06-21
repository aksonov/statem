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
      onExit: (state)=>{console.log(`Exit state ${state}`)}});
  }
  
  isIn = (state) => {
    return this.interpreter.isIn(state);
  }

  start = () => {
    this.interpreter.start();
  };

  handle = (event, data) => {
    this.interpreter.gen(event, data);
  };

  promise = ({wrap, content, $column, $line})=> {
    var res;
    var key, error;
    if (wrap){
      key = 'response';
      error = 'error';
    }
    try {
      res = content();
    } catch (e){
      console.error(`scxml eval error, column: ${$column} line: ${$line}, ${e}`);
    }
    if (res && res.then){
      res.then(response=>{
        this.success(key ? {[key]: response} : response);
      }).catch(e => {
        throw(`scxml eval error, column: ${$column} line: ${$line}, ${e}`);
        this.failure(error ? {[error]: e} : e)
      });
    } else {
      setTimeout(()=>res ? this.success(key ? {[key] : res} : res) : this.failure([error]? {[error] : res} : res));
    }
  };

  // content here must return KefirJS stream
  on({content, event}) {
    const stream = content();
    if (!this.handlers[event]){
      this.handlers[event] = stream.onValue(e => this.handle(event, e));
    }
  }

  action({event, expr, $column, $line, cond}){
    try {
      if (cond && !cond()) {
        console.log(`condition is false to triger event=${event}, ignore`)
        return;
      }
    } catch (e){
      console.error(`scxml eval error, column: ${$column} line: ${$line}, ${e}`);
    }
    setTimeout(()=>{
      const data = expr();
      // it means that data is already processed
      if (data.response || data.error){
        console.log("Action was already executed, run transition");
        if (data.response){
          this.success(data.response);
        } else {
          this.failure(data.error);
        }
      } else {
        try {
          this.handle(event, data)
        } catch (e){
          console.error(`scxml eval error, column: ${$column} line: ${$line}, ${e}`);
        }
      }
    });
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