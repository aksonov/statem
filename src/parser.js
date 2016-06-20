// Copyright (c) 2016, Pavlo Aksonov
// All rights reserved.

var Mustache = require('mustache');

function toArray(m){
  var res = [];
  Object.keys(m).forEach(id=>{
    res.push({id, value:m[id]});
  });
  return res;
}

function asArray(a){
  if (Array.isArray(a)){
    return a;
  } else {
    return [a];
  }
}
function processData(result){
  if (typeof result === "object"){
    if (Array.isArray(result)){
      return result.map(el=>processData(el));
    } else {
      if (result["#text"]){
        return result["#text"];
      }
      var res = {};
      var changed = false;
      for (var key in result){
        if (result.hasOwnProperty(key)){
          changed = true;
          res[key] = processData(result[key]);
        }
      }
      if (!changed){
        return undefined;
      }
      return res;
    }
  } else {
    return result;
  }

}


function parseXml(xml, arrayTags){
  function isArray(o) {
    return Object.prototype.toString.apply(o) === '[object Array]';
  }

  function parseNode(xmlNode, result) {
    if (xmlNode.nodeName == "#text") {
      /* if you want the object to have a properyty "#text" even if it is "",
       remove that if-else and use code that is currently in else block
       */
      if (xmlNode.nodeValue.trim() == "") {
        return;
      }
      else {
        result[xmlNode.nodeName] = xmlNode.nodeValue;
        return;
      }
    }

    var jsonNode = {};
    var existing = result[xmlNode.nodeName];
    if (existing) {
      if (!isArray(existing)) {
        result[xmlNode.nodeName] = [existing, jsonNode];
      }
      else {
        result[xmlNode.nodeName].push(jsonNode);
      }
    }
    else {
      if (arrayTags && arrayTags.indexOf(xmlNode.nodeName) != -1) {
        result[xmlNode.nodeName] = [jsonNode];
      }
      else {
        result[xmlNode.nodeName] = jsonNode;
      }
    }

    if (xmlNode.attributes) {
      var length = xmlNode.attributes.length;
      for (var i = 0; i < length; i++) {
        var attribute = xmlNode.attributes[i];
        jsonNode[attribute.nodeName] = attribute.nodeValue;
      }
    }

    if (xmlNode.childNodes){
      var length = xmlNode.childNodes.length;
      for (var i = 0; i < length; i++) {
        parseNode(xmlNode.childNodes[i], jsonNode);
      }
    }

  }

  var result = {};
  parseNode(xml, result);
  return processData(result).scxml;
}
var DOMParser = require("xmldom").DOMParser;
// Make sure we got a filename on the command line.
if (process.argv.length < 4) {
  console.log('Usage: node ' + process.argv[1] + ' input ouput template');
  process.exit(1);
}
// Read the file and print its contents.
var fs = require('fs')
  , filename = process.argv[2]
  , output = process.argv[3]
  , templatePath = __dirname+'/templates/state.mustache';

//console.log("TEMPLATE:", templatePath);
var data = fs.readFileSync(filename, 'utf8');
const res =   new DOMParser().parseFromString(data,"text/xml").documentElement;
//console.log(JSON.stringify(parseXml(res)))
const root = parseXml(res);
//console.log(JSON.stringify(root));
root.id = 'Root';

var states = [];
var template = fs.readFileSync(templatePath,'utf-8');
if (process.argv.length > 4 && process.argv[4] === 'test'){
  template = template.replace(/'statem'/g, "'../index'");
}
  function wrapWithFunction(params){
  var args = params;
  if (!Array.isArray(args)){
    args = [args];
  }
  var res = '';
  for (var i=0;i<args.length-1;i++){
    res+=args[i]+';'
  }
  res+=`return ${args[args.length-1]};`;
  return `_event => {${wrapTry(res)} }`;
}
function wrapTry(res){
  return `try {${res}} catch (e){ console.error(e.stack)}`;
}
function generate(root, states, parent, parentProps){
  var id = root.id;
  var lid = id.charAt(0).toLowerCase() + id.slice(1);
  var onentry = [];
  if (root.onentry){
    if (root.onentry.script){
      onentry = onentry.concat(asArray(root.onentry.script));
    }
    if (root.onentry.promise){
      //console.log(root.onentry.promise);
      onentry = onentry.concat(asArray(root.onentry.promise).map(el=>`this.promise(${el})`));
    }
  } 
  if (onentry.length){
    onentry = wrapWithFunction(onentry);
  } else {
    onentry = null;
  }
  var onexit = null;
  if (root.onexit && root.onexit.script){
    if (Array.isArray(root.onexit.script)){
      onexit = root.onexit.script.join(';');
    } else {
      onexit = root.onexit.script;
    }
    onexit = wrapWithFunction(onexit);
  }
  var transition = root.transition;
  var methods = [];
  var exists = {};
  var data;
  var props = {};
  var vars = {};
  var datamodel = root.datamodel;
  if (datamodel){
    data = datamodel.data;
    if (data){
      if (!Array.isArray(data)){
        data = [data];
      }
    }
    data.forEach(p=> {
      if (parentProps[p.id]){
        delete parentProps[p.id];
      }
      if (p.expr.indexOf('this.sm.') !== -1) {
        vars[p.id] = p.expr;
      } else {
        props[p.id] = p.expr;
      }
    });
  }
  var allProps = Object.assign({}, parentProps);
  Object.assign(allProps, vars);
  Object.assign(allProps, props);

  if (transition){
    if (!Array.isArray(transition)){
      transition = [transition];
    }
    transition.forEach(t=> {
      if (t.onentry){
        t.ontransition = wrapWithFunction(t.onentry);
      }
      if (t.cond){
        t.cond = wrapWithFunction(t.cond);
      }
      t.name = t.event || 'default';
      if (!exists[t.name] && t.name !== "success" && t.name !== "failure"){
        methods.push(t);
        exists[t.name] = true;
      }
    });
  }
  states.push( {parent, vars:toArray(vars), props:toArray(props), parentProps:toArray(parentProps), id, lid, initial:root.initial, state:root.state, transition:root.transition, onentry, onexit, methods});
  if (root.state){
    root.state.forEach(s => {
      generate(s, states, id, allProps);
    })
  }
}

generate(root, states, '', {});
const result = Mustache.render(template, {states});
//console.log(result);

fs.writeFileSync(output, result);



