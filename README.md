# Statem
Next-gen state management based on Harel Statechart and SCXML

The big problem with complex application state is how to understand it and see whole picture from source code.
"A Picture Costs A Thousand Words" - it is true for application state as well. UML solves this problem but requires additional
efforts from a developer to draw all state diagrams. 

David Harel in the 1980s introduced *statechart* (now it became part of UML specification) that solves problems above. [SCXML or the "State Chart extensible Markup Language"](http://www.w3.org/TR/scxml/) - an XML language that provides a generic state-machine based execution environment based on Harel statecharts. It is W3C approved standard that allows you to describe all your states as XML file. SCXML is very flexible and allows you to define compound and parallel states (so our logged state will handle disconnect event and show disconnection error to user and all logged UI screens could inherit it and don't care about this event) as well as conditional transitions. Each state could have onEntry, onExit runnable actions and transitions could have such custom actions as well.

This tool provides automatic code generation from given statechart and allow to manage whole state of your app visually.

Here is the state chart diagram that describes the behavior of a stopwatch:

![statechart0](https://cloud.githubusercontent.com/assets/1321329/16263277/bfb65bb8-3873-11e6-8aa2-7c541e29c2fb.png)

The SCXML file describing the transitions in this diagram is:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<scxml xmlns="http://www.w3.org/2005/07/scxml"
       version="1.0" initial="ready">
    <state id="ready">
        <transition event="watch.start" target="running"/>
    </state>
    <state id="running">
        <transition event="watch.split" target="paused"/>
        <transition event="watch.stop" target="stopped"/>
    </state>
    <state id="paused">
        <transition event="watch.unsplit" target="running"/>
        <transition event="watch.stop" target="stopped"/>
    </state>
    <state id="stopped">
        <transition event="watch.reset" target="ready"/>
    </state>
</scxml>
```
(Apache Licensed, see on this [page](http://commons.apache.org/proper/commons-scxml/usecases/scxml-stopwatch.html))

There are many Javascript state machine frameworks, most popular are [Machina.js](http://machina-js.org) and [Javascript State Machine](http://codeincomplete.com/posts/2014/3/15/javascript_state_machine_v2_3_0/) (outdated). `machina-js` supports hierarchical states, but there are no parallel and history support (no SCXML support). Also all they don't allow use to visualise your state flow (as statecharts).

Luckily there is an implementation of SCXML in JavaScript - [scxml](https://www.npmjs.com/package/scxml) (SCION). SCION 2.0 is a lightweight SCXML-to-JavaScript compiler that targets the SCION-CORE Statecharts interpreter. It currently supports node.js and the browser, and will later support Rhino and other JavaScript environments.

However SCION's auto-generated code is not ES6 based and doesn't have Flow-strict type checker annotation, so I've created [Statem](https://github.com/aksonov/statem) - ES6 + Flow + MobX powered code generator that gives you easy access to all your states (via simple `statem.yourState` statement) and give you fully reactive state.

To visualize and edit our application statechart we are using SCXML GUI editor [scxmlgui](https://github.com/fmorbini/scxmlgui). It works with SCXML files, allows export to SVG/PNG/DOT and many other formats. Also you could edit SCXML manually because it has very simple and clear structure.

Here is simplified state of some typical messaging app (created with scxmlgui):

![statechart](https://cloud.githubusercontent.com/assets/1321329/16266129/8fc53810-3883-11e6-8f65-66d14fc3b19a.png)

You can see here compoud states (`Root`, `Connected`, `Main`) and parallel states (`LoggedScene`, `Friends`, `Messaging`).

But how we could connect our application logic with this statechart?
Let's check SCXML file here.

```xml
<scxml version="1.0" xmlns="http://www.w3.org/2005/07/scxml">
  <datamodel>
    <data expr="this.sm.storage" id="storage"/>
    <data expr="this.sm.xmpp" id="xmppStore"/>
    <data expr="this.sm.friend" id="friendStore"/>
    <data expr="this.sm.profile" id="profileStore"/>
    <data expr="this.sm.message" id="messageStore"/>
    <data expr="this.sm.model" id="model"/>
  </datamodel>
  <state id="Root" initial="LoadData">
    <state id="LoadData">
      <onentry>
        <promise>storage.load()</promise>
      </onentry>
      <transition cond="_event.data
         &amp;&amp;_event.data.user" event="success" target="Connect"/>
      <transition cond="!_event.data ||
        !_event.data.user" event="success" target="PromoScene"/>
      <transition event="failure" target="PromoScene"/>
    </state>
    <state id="PromoScene">
      <transition event="success" target="Register"/>
    </state>
    <state id="Register">
      <onentry>
        <promise>xmppStore.register(_event.data.resource,
            _event.data.provider_data)</promise>
      </onentry>
      <transition event="success" target="Connect"/>
    </state>
    <state id="Connected" initial="LoadProfile">
      <onentry>
        <on event="disconnect">xmppStore.disconnected</on>
      </onentry>
      <transition event="disconnect" target="PromoScene"/>
      <state id="CheckProfile">
        <onentry>
          <assign expr="_event.data" location="model.profile"/>
        </onentry>
        <transition cond="!this.model.profile.handle" target="SignUpScene"/>
        <transition cond="this.model.profile.handle" target="Main"/>
      </state>
      <state id="SignUpScene">
        <transition event="success" target="RegisterProfile"/>
      </state>
      <state id="RegisterProfile">
        <onentry>
          <promise>xmppStore.update(_event.data)</promise>
        </onentry>
        <transition event="failure" target="SignUpScene"/>
        <transition event="success" target="LoadProfile"/>
      </state>
      <parallel id="Main">
        <state id="LoggedScene"/>
        <state id="Messaging" initial="RequestArchive">
          <state id="RequestArchive">
            <onentry>
              <on event="messageReceived">xmppStore.message</on>
              <script>messageStore.requestArchive()</script>
            </onentry>
            <transition target="MessagingIdle"/>
          </state>
          <state id="MessagingIdle">
            <transition event="messageReceived" target="MessageReceived"/>
          </state>
          <state id="MessageReceived">
            <onentry>
              <script>messageStore.receiveMessage(_event.data)</script>
            </onentry>
            <transition target="MessagingIdle"/>
          </state>
        </state>
        <state id="Friends" initial="RequestRoster">
          <state id="RequestRoster">
            <onentry>
              <promise>friendStore.requestRoster()</promise>
            </onentry>
            <transition target="FriendsIdle"/>
          </state>
          <state id="FriendsIdle">
            <transition event="presenceReceived" target="PresenceReceived"/>
          </state>
          <state id="PresenceReceived">
            <transition target="FriendsIdle"/>
          </state>
        </state>
      </parallel>
      <state id="LoadProfile">
        <onentry>
          <assign expr="_event.data.host" location="model.server"/>
          <promise>profileStore.loadProfile(_event.data.user)</promise>
        </onentry>
        <transition event="success" target="CheckProfile"/>
      </state>
    </state>
    <state id="Connect">
      <onentry>
        <promise>xmppStore.connect(_event.data.user,
            _event.data.password,
            _event.data.host)</promise>
        <assign expr="_event.data.host" location="model.server"/>
      </onentry>
      <transition event="failure" target="PromoScene"/>
      <transition event="success" target="Connected"/>
    </state>
  </state>
</scxml>
```
* `this.sm` refers to your `StateMachine` instance. You could pass all your stores/data there as well as custom actions

* `_event.data` is built-in SCXML variable contained transition parameters.

* `promise` and `on` are SCXML extensions are provided by Statem. They allow use to run Javascript Promise and then generate `success` or `failure` event depending from promise result. You may define any other custom actions.

But how to integrate SCXML into React Native app?

* Install `statem` with `npm i statem --save`
* Install `watchman` with `npm i watchman --save`
* Put your `model.scxml` into `state` folder of your project and add following to your `package.json`, `scripts` section:

```
    "watch": "./node_modules/watchman/watchman
    		state/model.scxml 'npm run gen'",
    "gen": "node node_modules/statem/src/parser.js
    		 state/model.scxml gen/state.js",
```
and then run watcher `npm run watch`

* import generated `genstate.js` from your `App.js` and create state and pass all your stores and optionally custom actions:

```javascript
import createState from '../gen/state';
const statem = createState({...rootStore, ...customactions});

```

Note that all your State IDs should be unique and should start with upper case (like Javascript classes), don't contain space and other special characters (i.e. be valid Javascript identifier). `statem` adds all of them to its instance (starting with lower case). So if you have state ID `Register`, you could access its data via `statem.register`. You may also use register generated class with `import {RegisterState} from '../gen/state'` for strict Flow type checking.

* Inside your code you could use all state transitions and other data as simple javascript method call:

```
statem.success({resource: DeviceInfo.getUniqueID(), provider_data})
```



