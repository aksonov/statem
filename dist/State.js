'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _class, _temp, _initialiseProps; // Copyright (c) 2016, Pavlo Aksonov
// All rights reserved.

var _mobx = require('mobx');

var _Transition = require('./Transition');

var _Transition2 = _interopRequireDefault(_Transition);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var State = (_temp = _class = function State(data, parent, sm) {
  var _this = this;

  _classCallCheck(this, State);

  _initialiseProps.call(this);

  (0, _assert2.default)(data, "No state data is defined!");
  var id = data.id;
  var $type = data.$type;
  var transition = data.transition;
  var state = data.state;
  var states = data.states;
  var onentry = data.onentry;
  var onexit = data.onexit;
  var initial = data.initial;

  (0, _assert2.default)(id, "State should contain id");
  this.id = id;
  this.$type = $type;
  this.parent = parent;
  this.sm = sm;
  this.initial = initial;
  if (transition) {
    if (!(transition instanceof Array)) {
      transition = [transition];
    }
    this.transitions = transition.map(function (el) {
      return new _Transition2.default(_this, el);
    });
  }
  if (states && states.length) {
    (0, _assert2.default)(initial, 'Initial state should be set for compoud state: ' + id);
    if (!states.filter(function (el) {
      return el.id === initial;
    }).length) {
      throw new Error('No state ' + initial + ' exist for compud state ' + id);
    }
    this.states = states;
  } else if (state) {
    (0, _assert2.default)(initial, 'Initial state should be set for compoud state: ' + id);
    if (!(state instanceof Array)) {
      state = [state];
    }
    if (!state.filter(function (el) {
      return el.id === initial;
    }).length) {
      throw new Error('No state ' + initial + ' exist for compud state ' + id);
    }
    this.states = state.map(function (el) {
      return new State(el, sm);
    });
  }

  this.onentry = onentry;
  this.onexit = onexit;
}, _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.props = {};
  this.handlers = {};

  this.onEntry = function (_event) {
    console.log('ENTERING STATE: ' + _this2.id + ' EVENT:' + JSON.stringify(_event));
    // assign all values to the state
    if (_event && _event.data) {
      _this2.props = _event.data;
    }
    if (_this2.onentry) {
      _this2.onentry(_event);
    }
    _this2.sm.enterState(_this2.id);
  };

  this.onExit = function (_event) {
    _this2.props = null;
    if (_this2.onexit) {
      _this2.onexit(_event);
    }
    _this2.sm.exitState(_this2.id);
  };

  this.success = function (data) {
    _this2.sm.handle("success", data);
  };

  this.failure = function (data) {
    _this2.sm.handle("failure", data);
  };
}, _temp);
exports.default = State;