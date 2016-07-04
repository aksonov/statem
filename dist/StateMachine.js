'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _desc, _value, _class2, _descriptor, _descriptor2; // Copyright (c) 2016, Pavlo Aksonov
// All rights reserved.

var _scionCore = require('scion-core');

var _scionCore2 = _interopRequireDefault(_scionCore);

var _State = require('./State');

var _State2 = _interopRequireDefault(_State);

var _autobindDecorator = require('autobind-decorator');

var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _mobx = require('mobx');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

var StateMachine = (0, _autobindDecorator2.default)(_class = (_class2 = function () {
  function StateMachine(initialState, RootClass) {
    var _this = this;

    _classCallCheck(this, StateMachine);

    this._states = {};

    _initDefineProp(this, 'state', _descriptor, this);

    _initDefineProp(this, 'states', _descriptor2, this);

    this.handlers = {};
    this.initialState = null;
    this.listener = null;

    this.start = function () {
      var StateClass = _this.RootClass || _State2.default;
      _this._states = {};
      _this.states.replace([]);
      _this.initialState = new StateClass(_this.initialState, null, _this);
      _this.interpreter = new _scionCore2.default.Statechart(_this.initialState, { console: console });
      if (_this.listener) {
        _this.interpreter.registerListener(_this.listener);
      }
      _this.interpreter._evaluateAction = function (currentEvent, actionRef) {
        return actionRef.call(this._scriptingContext, currentEvent); //SCXML system variables
      };
      _this.interpreter.start();
    };

    this.handle = function (event, data) {
      //console.log(`EVENT: ${event} DATA: ${data}`);
      setTimeout(function () {
        return _this.interpreter.gen(event, data);
      });
    };

    this.promise = function (_ref) {
      var wrap = _ref.wrap;
      var content = _ref.content;
      var $column = _ref.$column;
      var $line = _ref.$line;

      var res = void 0;
      var key = void 0;
      var error = void 0;
      if (wrap) {
        key = 'response';
      }
      try {
        res = content();
      } catch (e) {
        error = 'scxml eval error, column: ' + $column + ' line: ' + $line + ', ' + e;
        console.error(error);
      }
      if (res && res.then) {
        res.then(function (response) {
          _this.success(key ? _defineProperty({}, key, response) : response);
        }).catch(function (e) {
          //throw(`scxml eval error, column: ${$column} line: ${$line}, ${e}`);
          _this.failure({ error: e });
        });
      } else {
        if (res) {
          _this.success(key ? _defineProperty({}, key, res) : res);
        } else {
          _this.failure({ error: error });
        }
      }
    };

    this.currentState = function () {
      return _this.interpreter.getConfiguration()[0];
    };

    this.currentStates = function () {
      return _this.interpreter.getConfiguration();
    };

    this.success = function (data) {
      _this.handle("success", data);
    };

    this.failure = function (data) {
      _this.handle("failure", data);
    };

    this.initialState = initialState;
    this.RootClass = RootClass;
  }

  _createClass(StateMachine, [{
    key: 'on',


    // content here must return KefirJS stream
    value: function on(_ref4) {
      var _this2 = this;

      var content = _ref4.content;
      var event = _ref4.event;

      var stream = content();
      if (!this.handlers[event]) {
        this.handlers[event] = stream.onValue(function (e) {
          return _this2.handle(event, e);
        });
      }
    }
  }, {
    key: 'action',
    value: function action(_ref5) {
      var event = _ref5.event;
      var expr = _ref5.expr;
      var $column = _ref5.$column;
      var $line = _ref5.$line;
      var cond = _ref5.cond;

      try {
        if (cond && !cond()) {
          console.log('condition is false to triger event=' + event + ', ignore');
          return;
        }
      } catch (e) {
        console.error('scxml eval error, column: ' + $column + ' line: ' + $line + ', ' + e);
      }
      var data = expr();
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
          this.handle(event, data);
        } catch (e) {
          console.error('scxml eval error, column: ' + $column + ' line: ' + $line + ', ' + e);
        }
      }
    }
  }, {
    key: 'script',
    value: function script(_ref6) {
      var content = _ref6.content;
      var $column = _ref6.$column;
      var $line = _ref6.$line;

      try {
        content();
      } catch (e) {
        throw 'scxml eval error, column: ' + $column + ' line: ' + $line + ', ' + e;
      }
    }
  }, {
    key: 'log',
    value: function log(_ref7) {
      var expr = _ref7.expr;
      var $column = _ref7.$column;
      var $line = _ref7.$line;

      try {
        console.log(expr());
      } catch (e) {
        throw 'scxml eval error, column: ' + $column + ' line: ' + $line + ', ' + e;
      }
    }
  }, {
    key: 'addState',
    value: function addState(state) {
      (0, _assert2.default)(!this._states[state.id], 'State ' + state.id + ' already exists');
      this._states[state.id] = state;
    }
  }, {
    key: 'getState',
    value: function getState(stateName) {
      return this._states[stateName];
    }
  }]);

  return StateMachine;
}(), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'state', [_mobx.observable], {
  enumerable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'states', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return [];
  }
})), _class2)) || _class;

exports.default = StateMachine;