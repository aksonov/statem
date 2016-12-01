'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _desc, _value, _class, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _class2, _temp, _initialiseProps; // Copyright (c) 2016, Pavlo Aksonov
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

function filterParam(data) {
  if (data === '') {
    return '';
  }
  if (data === undefined || data === null) {
    return data;
  }
  var proto = data.constructor.name;
  // avoid passing React Native parameters
  if (proto !== 'Object') {
    if (typeof data === 'number' || typeof data === 'boolean') {
      return data;
    }
    if (proto === 'Number' || proto === 'Boolean' || proto === 'String') {
      return data;
    }
    //console.log("PROTO:", proto);
    return data.toString();
  }
  var res = {};
  var keys = Object.keys(data);
  for (var i = 0; i < keys.length; i++) {
    res[keys[i]] = filterParam(data[keys[i]]);
    //console.log("PROCESSING:", key, data[key], res[key]);
  }
  return res;
}

var State = (_class = (_temp = _class2 =

// listener for state entry/exit
function State(data, parent, sm) {
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
// allow to run code after all interactions
, _class2.runner = function (func) {
  return func();
}, _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  _initDefineProp(this, 'props', _descriptor, this);

  _initDefineProp(this, 'stack', _descriptor2, this);

  _initDefineProp(this, 'index', _descriptor3, this);

  _initDefineProp(this, 'active', _descriptor4, this);

  this.onEntry = this.onEntryAction;

  this.onChildEntry = function (child) {
    console.log('ID:' + child.id);
    if (_this2.isSwitch) {
      console.log("JUMP");
      _this2.jump({ id: child.id, data: child.props });
    } else {
      _this2.push({ id: child.id, data: child.props });
    }
  };

  _initDefineProp(this, 'onEntryAction', _descriptor5, this);

  this.onExit = this.onExitAction;

  _initDefineProp(this, 'onExitAction', _descriptor6, this);

  this.handle = function (name, data) {
    console.log("HANDLE ", name, "FROM", _this2.id, _this2.active);
    if (!_this2.active && _this2.parent[toLower(_this2.id)]) {
      console.log("CALL PARENT", toLower(_this2.id));
      _this2.parent[toLower(_this2.id)]();
    }
    _this2.sm.handle(name, data);
  };

  _initDefineProp(this, 'push', _descriptor7, this);

  _initDefineProp(this, 'jump', _descriptor8, this);

  this.clear = function () {
    //this.stack.replace([]);
  };

  _initDefineProp(this, 'replace', _descriptor9, this);

  _initDefineProp(this, 'pop', _descriptor10, this);
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
}), _descriptor5 = _applyDecoratedDescriptor(_class.prototype, 'onEntryAction', [_mobx.action], {
  enumerable: true,
  initializer: function initializer() {
    var _this3 = this;

    return function () {
      var _event = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      try {
        // store data if it is not POP
        _this3.active = true;
        if (_event && _event.data) {
          if (_event.data.isPop) {
            console.log("IT IS AFTER POP", _this3.id);
            return;
          }
          _this3.props = filterParam(_event.data);
        }
        _this3.listener && _this3.listener.onEnter(_this3.props);
        if (_this3.parent && _this3.parent.isContainer && _this3.parent[toLower(_this3.id)]) {
          _this3.parent.onChildEntry(_this3);
        }
        if (_this3.onentry) {
          State.runner(function () {
            return _this3.onentry(_event);
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
  }
}), _descriptor6 = _applyDecoratedDescriptor(_class.prototype, 'onExitAction', [_mobx.action], {
  enumerable: true,
  initializer: function initializer() {
    var _this4 = this;

    return function (_event) {
      try {
        console.log('EXIT STATE:', _this4.id);
        _this4.active = false;
        _this4.clear();
        _this4.listener && _this4.listener.onExit(_this4.props);
        if (_this4.onexit) {
          console.log('ONEXITF', _this4.onexit);
          State.runner(function () {
            return _this4.onexit(_event);
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
  }
}), _descriptor7 = _applyDecoratedDescriptor(_class.prototype, 'push', [_mobx.action], {
  enumerable: true,
  initializer: function initializer() {
    var _this5 = this;

    return function (data) {
      (0, _assert2.default)(data, "Empty data");
      (0, _assert2.default)(data.id, "Empty state name");
      if (_this5.stack.find(function (el) {
        return el.id === data.id;
      })) {
        console.log("ALREADY EXISTS, NO PUSH");
      } else {
        console.log("PUSHED", data.id);
        _this5.stack.push(data);
        _this5.index = _this5.stack.length - 1;
      }
    };
  }
}), _descriptor8 = _applyDecoratedDescriptor(_class.prototype, 'jump', [_mobx.action], {
  enumerable: true,
  initializer: function initializer() {
    var _this6 = this;

    return function (data) {
      (0, _assert2.default)(data, "Empty data");
      (0, _assert2.default)(data.id, "Empty state name");
      var i = _this6.stack.findIndex(function (el) {
        return el.id === data.id;
      });
      (0, _assert2.default)(i >= 0, "Cannot jump to non-existing state:" + data.id + " STACK:" + JSON.stringify(_this6.stack));
      _this6.index = i;
    };
  }
}), _descriptor9 = _applyDecoratedDescriptor(_class.prototype, 'replace', [_mobx.action], {
  enumerable: true,
  initializer: function initializer() {
    var _this7 = this;

    return function (data) {
      (0, _assert2.default)(_this7.stack.length, "Empty stack");
      (0, _assert2.default)(data, "Empty data");
      (0, _assert2.default)(data.name, "Empty state name");
      _this7.stack[_this7.stack.length - 1] = data;
    };
  }
}), _descriptor10 = _applyDecoratedDescriptor(_class.prototype, 'pop', [_mobx.action], {
  enumerable: true,
  initializer: function initializer() {
    var _this8 = this;

    return function (props) {
      if (_this8.isSwitch) {
        console.log("CANNOT POP SWITCH CONTAINER", _this8.id);
        return;
      }
      console.log("POP", _this8.id);
      if (_this8.stack.length <= 1 && _this8.parent && _this8.parent.isContainer) {
        _this8.parent.pop();
      } else {
        if (_this8.stack.length > 1) {
          console.log("STACK:", _this8.stack.length, _this8.stack[_this8.stack.length - 1].id);
          _this8.stack.pop();
          _this8.index = _this8.stack.length - 1;
          var data = _this8.stack[_this8.index];
          _this8.handle(toLower(data.id), { isPop: true });
        }
      }
    };
  }
})), _class);
exports.default = State;