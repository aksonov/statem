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
    Object.assign(this, data);
    assert(parent, "Parent should be defined for transition: " + event);

    this.onTransition = data.onentry;
    
  }
}