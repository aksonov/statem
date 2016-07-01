'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _desc, _value, _class2, _descriptor, _descriptor2, _class3, _temp, _initialiseProps; // Copyright (c) 2016, Pavlo Aksonov
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

var StateMachine = (0, _autobindDecorator2.default)(_class = (_class2 = (_temp = _class3 = function () {
  function StateMachine(state) {
    var stateClasses = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var props = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, StateMachine);

    _initialiseProps.call(this);

    Object.assign(this, props);
    this.stateClasses = stateClasses;
    var StateClass = stateClasses.State || _State2.default;
    var data = new StateClass(state, null, this);
    this.interpreter = new _scionCore2.default.Statechart(data, { console: console });
    this.interpreter._evaluateAction = function (currentEvent, actionRef) {
      return actionRef.call(this._scriptingContext, currentEvent); //SCXML system variables
    };
    if (props.listener) {
      this.interpreter.registerListener(props.listener);
    }
  }

  _createClass(StateMachine, [{
    key: 'on',


    // content here must return KefirJS stream
    value: function on(_ref) {
      var _this = this;

      var content = _ref.content;
      var event = _ref.event;

      var stream = content();
      if (!this.handlers[event]) {
        this.handlers[event] = stream.onValue(function (e) {
          return _this.handle(event, e);
        });
      }
    }
  }, {
    key: 'action',
    value: function action(_ref2) {
      var event = _ref2.event;
      var expr = _ref2.expr;
      var $column = _ref2.$column;
      var $line = _ref2.$line;
      var cond = _ref2.cond;

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
    value: function script(_ref3) {
      var content = _ref3.content;
      var $column = _ref3.$column;
      var $line = _ref3.$line;

      try {
        content();
      } catch (e) {
        throw 'scxml eval error, column: ' + $column + ' line: ' + $line + ', ' + e;
      }
    }
  }, {
    key: 'log',
    value: function log(_ref4) {
      var expr = _ref4.expr;
      var $column = _ref4.$column;
      var $line = _ref4.$line;

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
}(), _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this._states = {};

  _initDefineProp(this, 'state', _descriptor, this);

  _initDefineProp(this, 'states', _descriptor2, this);

  this.handlers = {};
  this.stateClasses = {};

  this.start = function () {
    _this2.interpreter.start();
  };

  this.handle = function (event, data) {
    //console.log(`EVENT: ${event} DATA: ${data}`);
    setTimeout(function () {
      return _this2.interpreter.gen(event, data);
    });
  };

  this.promise = function (_ref5) {
    var wrap = _ref5.wrap;
    var content = _ref5.content;
    var $column = _ref5.$column;
    var $line = _ref5.$line;

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
        _this2.success(key ? _defineProperty({}, key, response) : response);
      }).catch(function (e) {
        //throw(`scxml eval error, column: ${$column} line: ${$line}, ${e}`);
        _this2.failure({ error: e });
      });
    } else {
      if (res) {
        _this2.success(key ? _defineProperty({}, key, res) : res);
      } else {
        _this2.failure({ error: error });
      }
    }
  };

  this.currentState = function () {
    return _this2.interpreter.getConfiguration()[0];
  };

  this.currentStates = function () {
    return _this2.interpreter.getConfiguration();
  };

  this.success = function (data) {
    _this2.handle("success", data);
  };

  this.failure = function (data) {
    _this2.handle("failure", data);
  };
}, _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'state', [_mobx.observable], {
  enumerable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'states', [_mobx.observable], {
  enumerable: true,
  initializer: function initializer() {
    return [];
  }
})), _class2)) || _class;

exports.default = StateMachine;