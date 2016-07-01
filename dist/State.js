'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _desc, _value, _class, _descriptor, _descriptor2, _descriptor3, _descriptor4, _class2, _temp, _initialiseProps; // Copyright (c) 2016, Pavlo Aksonov
// All rights reserved.

var _mobx = require('mobx');

var _Transition = require('./Transition');

var _Transition2 = _interopRequireDefault(_Transition);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _initDefineProp(target, property, descriptor, context) {
  if (!descriptor) return;
  Object.defineProperty(target, property, {
    enumerable: descriptor.enumerable,
    configurable: descriptor.configurable,
    writable: descriptor.writable,
    value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
  });
}

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

function _initializerWarningHelper(descriptor, context) {
  throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
}

function toLower(id) {
  return id.charAt(0).toLowerCase() + id.slice(1);
}

var State = (_class = (_temp = _class2 = function State(data, parent, sm) {
  var _this = this;

  _classCallCheck(this, State);

  _initialiseProps.call(this);

  (0, _assert2.default)(data, "No state data is defined!");
  var id = data.id;
  var $type = data.$type;
  var transition = data.transition;
  var transitions = data.transitions;
  var state = data.state;
  var states = data.states;
  var onentry = data.onentry;
  var onexit = data.onexit;
  var initial = data.initial;

  (0, _assert2.default)(id, "State should contain id");
  (0, _assert2.default)(sm, "StateMachine instance is not defined");
  this.id = id;
  this.$type = $type;
  this.parent = parent;
  this.sm = sm;
  this.sm.addState(this);
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
      return new State(el, _this, sm);
    });
  }

  this.onentry = onentry;
  this.onexit = onexit;
}
//this.stack.replace(this.stack.slice(1));
, _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  _initDefineProp(this, 'props', _descriptor, this);

  _initDefineProp(this, 'stack', _descriptor2, this);

  _initDefineProp(this, 'index', _descriptor3, this);

  _initDefineProp(this, 'active', _descriptor4, this);

  this.onEntry = function (_event) {
    //console.log(`ENTERING STATE: ${this.id} EVENT:${JSON.stringify(_event)} `);
    // assign all values to the state
    _this2.active = true;
    if (_event && _event.data) {
      _this2.props = _event.data;
    }
    if (_this2.onentry) {
      _this2.onentry(_event);
    }
  };

  this.onExit = function (_event) {
    _this2.props = {};
    _this2.active = false;
    _this2.clear();
    if (_this2.onexit) {
      _this2.onexit(_event);
    }
  };

  this.success = function (data) {
    _this2.sm.handle("success", data);
  };

  this.failure = function (data) {
    _this2.sm.handle("failure", data);
  };

  this.push = function (data) {
    (0, _assert2.default)(data, "Empty data");
    (0, _assert2.default)(data.name, "Empty state name");
    _this2.stack.push(data);
    _this2.index = _this2.stack.length - 1;
  };

  this.jump = function (data) {
    (0, _assert2.default)(data, "Empty data");
    (0, _assert2.default)(data.name, "Empty state name");
    var i = _this2.stack.findIndex(function (el) {
      return el.name === data.name;
    });
    (0, _assert2.default)(i >= 0, "Cannot jump to non-existing state:" + data.name + " STACK:" + JSON.stringify(_this2.stack));
    _this2.index = i;
  };

  this.clear = function () {};

  this.replace = function (data) {
    (0, _assert2.default)(_this2.stack.length, "Empty stack");
    (0, _assert2.default)(data, "Empty data");
    (0, _assert2.default)(data.name, "Empty state name");
    _this2.stack[_this2.stack.length - 1] = data;
  };

  this.pop = function () {
    (0, _assert2.default)(_this2.stack.length > 1, "Empty stack, cannot pop");
    _this2.stack.pop();
    _this2.index = _this2.stack.length - 1;
    var data = _this2.stack[_this2.stack.length - 1];
    _this2.sm.handle(toLower(data.name), data.data);
  };
}, _temp), (_descriptor = _applyDecoratedDescriptor(_class.prototype, 'props', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return {};
  }
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, 'stack', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return [];
  }
}), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, 'index', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return 0;
  }
}), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, 'active', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return false;
  }
})), _class);
exports.default = State;