'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

// Copyright (c) 2016, Pavlo Aksonov
// All rights reserved.

var Mustache = require('mustache');
var assert = require('assert');
var transform = require('scxml/lib/compiler/scxml-to-scjson');
var inc = 0;
function toArray(m) {
  var res = [];
  Object.keys(m).forEach(function (id) {
    res.push({ id: id, value: m[id] });
  });
  return res;
}

// Make sure we got a filename on the command line.
if (process.argv.length < 4) {
  console.log('Usage: node ' + process.argv[1] + ' input ouput template');
  process.exit(1);
}
// Read the file and print its contents.
var fs = require('fs'),
    filename = process.argv[2],
    output = process.argv[3],
    templatePath = __dirname + '/templates/state.mustache';

var data = fs.readFileSync(filename, 'utf8');
var root = transform(data);
//console.log("ROOT:",JSON.stringify(root));
root.id = '__Root';

var states = [];
var template = fs.readFileSync(templatePath, 'utf-8');
if (process.argv.length > 4 && process.argv[4] === 'test') {
  template = template.replace(/'statem'/g, "'../index'");
}
function wrapWithFunction(params, ret) {
  var args = params;
  if (!Array.isArray(args)) {
    args = [args];
  }
  var res = '';
  for (var i = 0; i < args.length - 1; i++) {
    res += args[i] + ';';
  }
  res += (ret ? 'return' : '') + ' ' + args[args.length - 1] + ';';
  return '_event => {' + wrapTry(res) + ' }';
}
function wrapTry(res) {
  return res;
  //return `try {${res}} catch (e){ console.error(e.stack)}`;
}
function convert(el) {
  if (el.$type === 'assign') {
    return 'this.' + el.location.expr + ' = ' + el.expr.expr;
  }
  var res = 'this.sm.' + el.$type + '({';
  Object.keys(el).forEach(function (key) {
    if (key === 'content' || key === 'expr' || key === 'location' || key === 'cond') {
      var value = el[key];
      if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
        value = value.expr;
      }
      res += key + ': () => {return ' + value + '}, \n';
    } else {
      res += key + ": '" + el[key] + "',\n";
    }
  });
  res += '})\n';
  return res;
}
function generate(root, states, parent, parentProps) {
  var id = root.id;
  assert(id, "id is not defined for element:" + JSON.stringify(root));
  var lid = id.charAt(0).toLowerCase() + id.slice(1);
  if (root.onEntry) {
    root.onentry = wrapWithFunction(root.onEntry.map(convert), false);
    delete root.onEntry;
  }
  if (root.onExit) {
    root.onexit = wrapWithFunction(root.onExit.map(convert), false);
    delete root.onExit;
  }
  var transition = null;
  var methods = [];
  var exists = {};
  var data;
  var props = {};
  var vars = {};
  if (root.datamodel) {
    root.datamodel.forEach(function (p) {
      if (parentProps[p.id]) {
        delete parentProps[p.id];
      }
      if (p.expr && p.expr.expr.indexOf('this.sm.') !== -1) {
        vars[p.id] = p.expr.expr;
      } else {
        if (p.expr) {
          props[p.id] = p.expr.expr;
        } else {
          props[p.id] = 'undefined';
        }
      }
    });
  }
  var allProps = Object.assign({}, parentProps);
  Object.assign(allProps, vars);
  Object.assign(allProps, props);

  if (root.transitions) {
    root.transitions.forEach(function (t) {
      if (t.onentry) {
        t.ontransition = wrapWithFunction(t.onentry.expr, false);
      }
      if (t.cond) {
        t.cond = wrapWithFunction(t.cond.expr, true);
      }
      t.name = t.event || 'default';
      if (!exists[t.name] && t.name !== "success" && t.name !== "failure") {
        methods.push(t);
        exists[t.name] = true;
      }
    });
  }
  var res = { parent: parent, vars: toArray(vars), props: toArray(props),
    parentProps: toArray(parentProps), id: id, lid: lid, methods: methods, states: root.states, transitions: root.transitions };
  var params = [];
  Object.keys(root).forEach(function (key) {
    if (!res[key]) {
      var value = root[key];
      if (typeof value === 'string' && key !== 'onentry' && key !== 'onexit') {
        value = '\'' + value + '\'';
      }
      if (key.indexOf('/') === -1 && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object') {
        params.push({ key: key, value: value });
      }
    }
  });
  res.params = params;
  states.push(res);
  if (root.states) {
    root.states.forEach(function (s) {
      generate(s, states, id, allProps);
    });
  }
}

generate(root, states, '', {});
var result = Mustache.render(template, { states: states });
//console.log(result);

fs.writeFileSync(output, result);