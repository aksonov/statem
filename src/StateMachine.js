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
  @observable states = [];
  handlers = {};
  stateClasses = {};

  constructor(state, stateClasses = {}, props = {}){
    Object.assign(this, props);
    this.stateClasses = stateClasses;
    const StateClass = stateClasses.State || State;
    const data = new StateClass(state, null, this);
    this.interpreter = new scion.Statechart(data, {console});
    this.interpreter._evaluateAction = function(currentEvent, actionRef) {
        return actionRef.call(this._scriptingContext, currentEvent);     //SCXML system variables
    };
    if (props.listener){
      this.interpreter.registerListener(props.listener);
    }

  }
  
  start = () => {
    this.interpreter.start();
  };

  handle = (event, data) => {
    //console.log(`EVENT: ${event} DATA: ${data}`);
    setTimeout(()=>this.interpreter.gen(event, data));
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
        this.success(key ? {[key]: response} : response);
      }).catch(e => {
        //throw(`scxml eval error, column: ${$column} line: ${$line}, ${e}`);
        this.failure({ error: e })
      });
    } else {
      if (res){
        this.success(key ? {[key] : res} : res)
      } else {
        this.failure( {error});
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