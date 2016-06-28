// Copyright (c) 2016, Pavlo Aksonov
// All rights reserved.

import {observable, autorun} from 'mobx';
import assert from 'assert';
export const DEFAULT = "default";
export default class Transition {
  event;
  parent;
  cond;
  mode;
  target;
  onTransition;

  constructor(parent, data) {
    assert(data, "Data should be defined");
    Object.assign(this, data);
    assert(parent, "Parent should be defined for transition:" + this.event);

    this.onTransition = (params)=>{
      data.onentry && data.onentry(params);
      if (this.mode === 'push'){
        assert(data.target, "Target should be defined for push transition");
        parent.push({name: data.target, data:params && params.data || {}});
      }
      if (this.mode === 'jump'){
        assert(data.target, "Target should be defined for push transition");
        parent.jump({name: data.target, data:params && params.data || {}});
      }
    }
    
  }
}