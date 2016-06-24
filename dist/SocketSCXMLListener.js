'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class;

var _autobindDecorator = require('autobind-decorator');

var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var net = require('net');

var SocketSCXMLListener = (0, _autobindDecorator2.default)(_class = function () {
  function SocketSCXMLListener() {
    var _this = this;

    var port = arguments.length <= 0 || arguments[0] === undefined ? 8124 : arguments[0];

    _classCallCheck(this, SocketSCXMLListener);

    this.activeTransitions = [];

    try {
      this.socket = net.createConnection(port);
      this.socket.on("error", function (error) {
        console.log('SocketSCXMLListener: Port ' + port + ' is not active, enable server and restart the app, ' + error);
        _this.socket = null;
      });
    } catch (error) {
      console.log('SocketSCXMLListener: Port ' + port + ' is not active, enable server and restart the app, ' + error);
    }
  }

  _createClass(SocketSCXMLListener, [{
    key: 'write',
    value: function write(str) {
      if (this.socket) {
        try {
          this.socket.write(str);
        } catch (error) {
          console.log('SocketSCXMLListener error: ' + error + ' enable server and restart the app');
          this.socket = null;
        }
      }
    }
  }, {
    key: 'sendActiveState',
    value: function sendActiveState(stateId) {
      this.write('1 ' + stateId + '\n');
    }
  }, {
    key: 'sendInactiveState',
    value: function sendInactiveState(stateId) {
      this.write('0 ' + stateId + '\n');
    }
  }, {
    key: 'onEntry',
    value: function onEntry(stateId) {
      if (this.activeState) this.sendInactiveState(this.activeState);
      this.activeState = stateId;
      this.sendActiveState(stateId);
      console.log('ONENTER ' + stateId);
    }
  }, {
    key: 'onExit',
    value: function onExit(stateId) {
      this.sendInactiveState(stateId);
      this.activeState = null;
      console.log('ONEXIT ' + stateId);
    }
  }, {
    key: 'onTransition',
    value: function onTransition(sourceStateId, targetStateIds) {
      console.log('TRANSTION: ' + sourceStateId + ' ' + JSON.stringify(targetStateIds));
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.activeTransitions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var transition = _step.value;

          this.write('2 ' + transition.from + ' -> ' + transition.to + '\n');
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this.activeTransitions = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = targetStateIds[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var target = _step2.value;

          this.activeTransitions.push({ from: sourceStateId, to: target });
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.activeTransitions[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var _transition = _step3.value;

          this.write('3 ' + _transition.from + ' -> ' + _transition.to + '\n');
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  }]);

  return SocketSCXMLListener;
}()) || _class;

exports.default = SocketSCXMLListener;