// Copyright (c) 2016, Pavlo Aksonov
// All rights reserved.

import {observable, autorun} from 'mobx';
import assert from 'assert';
export const DEFAULT = "default";
export default class Transition {
  event;
  parent;
  cond;
  target;
  onTransition;

  constructor(parent, data) {
    assert(data, "Data should be defined");
    let {event, cond, target, onentry} = data;
    if (!cond){
      cond = ()=>true;
    }
    assert(parent, "Parent should be defined for transition: " + event);

    this.parent = parent;
    this.event = event;
    this.cond = cond;
    this.target = target;
    this.onTransition = onentry;
    
  }
}