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
  @observable states = [];
  handlers = {};
  initialState = null;
  RootClass;
  listeners = [];
  
  constructor(initialState, RootClass){
    this.initialState = initialState;
    this.RootClass = RootClass;
  }
  
  start = () => {
    const StateClass = this.RootClass || State;
    this._states = {};
    this.states.replace([]);
    this.initialState  = new StateClass(this.initialState, null, this);
    this.interpreter = new scion.Statechart(this.initialState, {console});
    this.listeners.forEach(listener => this.interpreter.registerListener(listener));
    // this.interpreter._evaluateAction = function(currentEvent, actionRef) {
    //   return actionRef.call(this._scriptingContext, currentEvent);     //SCXML system variables
    // };
    this.interpreter.start();
  };

  handle = (event, data) => {
    this.interpreter.gen(event, data);
  };

  promise = ({wrap, content, $column, $line})=> {
    let res;
    let key;
    let error;
    if (wrap){
      key = 'response';
    }
    try {
      res = content();
    } catch (e){
      error  = `scxml eval error, column: ${$column} line: ${$line}, ${e}`;
      console.error(error);
    }
    if (res && res.then){
      res.then(response=>{
        setTimeout(()=>this.success(key ? {[key]: response} : response));
      }).catch(e => {
        //throw(`scxml eval error, column: ${$column} line: ${$line}, ${e}`);
        setTimeout(()=>this.failure({ error: e }));
      });
    } else {
      if (res){
        setTimeout(()=>this.success(key ? {[key] : res} : res));
      } else {
        setTimeout(()=>this.failure( {error}));
      }
    }
  };

  // content here must return KefirJS stream
  on({content, event}) {
    const stream = content();
    if (!this.handlers[event]){
      this.handlers[event] = stream.onValue(e => this.handle(event, e));
    }
  }

  action({event, expr, $column, $line, cond}) {
    try {
      if (cond && !cond()) {
        console.log(`condition is false to triger event=${event}, ignore`)
        return;
      }
    } catch (e) {
      console.error(`scxml eval error, column: ${$column} line: ${$line}, ${e}`);
    }
    const data = expr();
    // it means that data is already processed
    if (data.response || data.error) {
      console.log("Action was already executed, run transition");
      if (data.response) {
        this.success(data.response);
      } else {
        this.failure(data.error);
      }
    } else {
      try {
        this.handle(event, data)
      } catch (e) {
        console.error(`scxml eval error, column: ${$column} line: ${$line}, ${e}`);
      }
    }
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