'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _desc, _value, _class, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11;

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

var State = (_class = function State(data, parent) {
  var _this = this;

  var active = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

  _classCallCheck(this, State);

  _initDefineProp(this, 'parent', _descriptor, this);

  _initDefineProp(this, 'state', _descriptor2, this);

  _initDefineProp(this, 'prevState', _descriptor3, this);

  _initDefineProp(this, 'transition', _descriptor4, this);

  _initDefineProp(this, 'props', _descriptor5, this);

  _initDefineProp(this, 'transitionProps', _descriptor6, this);

  _initDefineProp(this, 'active', _descriptor7, this);

  _initDefineProp(this, 'entered', _descriptor8, this);

  _initDefineProp(this, 'exited', _descriptor9, this);

  _initDefineProp(this, 'start', _descriptor10, this);

  _initDefineProp(this, 'handle', _descriptor11, this);

  (0, _assert2.default)(data, "No state data is defined!");
  var id = data.id;
  var transition = data.transition;
  var state = data.state;
  var initial = data.initial;
  var onentry = data.onentry;
  var onexit = data.onexit;
  var datamodel = data.datamodel;

  (0, _assert2.default)(id, "State should contain id");
  this.id = id;
  this.active = active;
  this.parent = parent;
  console.log("PARENT:", parent);
  if (transition) {
    if (!(transition instanceof Array)) {
      transition = [transition];
    }
    this.transitions = transition.map(function (el) {
      return new _Transition2.default(_this, el);
    });
  }
  if (state) {
    (0, _assert2.default)(initial, 'Initial state should be set for compoud state: ' + id);
    this.initial = initial;
    if (!(state instanceof Array)) {
      state = [state];
    }
    if (!state.filter(function (el) {
      return el.id === initial;
    }).length) {
      throw new Error('No state ' + initial + ' exist for compud state ' + id);
    }
    this.states = state.map(function (el) {
      return new State(el, _this, el.id === initial);
    });
  }

  if (!onentry) {
    onentry = function onentry(props) {
      return console.log('Entering state: ' + id + ', props: ' + props);
    };
  }

  if (!onexit) {
    onexit = function onexit(props) {
      return console.log('Exiting state: ' + id + ', props: ' + props);
    };
  }
  this.onentry = onentry;
  this.onexit = onexit;

  if (this.parent) {
    (0, _mobx.autorun)(function () {
      console.log("ID:", _this.id, "STATE: ", _this.parent.state, "PREV:", _this.parent.prevState);
      if (_this.parent.state === _this.id) {
        console.log("ENTER STATE:", _this.id);
        _this.onentry && _this.onentry(_this.parent.transitionProps);
        _this.start();
      }
      // if (this.parent.prevState === this.id && this.parent.state !== this.id && !this.exited) {
      //   this.onexit && this.onexit(this.parent.transitionProps);
      //   this.active = false;
      //   this.exited = true;
      // }
      // if (this.parent.state === this.id && !this.entered) {
      //   this.onentry && this.onentry(this.parent.transitionProps);
      //   this.active = true;
      //   this.entered = true;
      //   this.start();
      // }
    });
  }
}, (_descriptor = _applyDecoratedDescriptor(_class.prototype, 'parent', [_mobx.observable], {
  enumerable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, 'state', [_mobx.observable], {
  enumerable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, 'prevState', [_mobx.observable], {
  enumerable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, 'transition', [_mobx.observable], {
  enumerable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class.prototype, 'props', [_mobx.observable], {
  enumerable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class.prototype, 'transitionProps', [_mobx.observable], {
  enumerable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class.prototype, 'active', [_mobx.observable], {
  enumerable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class.prototype, 'entered', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return false;
  }
}), _descriptor9 = _applyDecoratedDescriptor(_class.prototype, 'exited', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return false;
  }
}), _descriptor10 = _applyDecoratedDescriptor(_class.prototype, 'start', [_mobx.action], {
  enumerable: true,
  initializer: function initializer() {
    var _this2 = this;

    return function (props) {
      _this2.state = _this2.initial;
      _this2.handle(_Transition.DEFAULT, props);
    };
  }
}), _descriptor11 = _applyDecoratedDescriptor(_class.prototype, 'handle', [_mobx.action], {
  enumerable: true,
  initializer: function initializer() {
    var _this3 = this;

    return function (event, props) {
      console.log('HANDLE TRANSITION: ' + event);
      _this3.transition = event;
      _this3.transitionProps = props;
    };
  }
})), _class);
exports.default = State;