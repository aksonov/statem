// Copyright (c) 2016, Pavlo Aksonov
// All rights reserved.
import {State, StateMachine, Transition} from '../src/index';
import {action, computed, observable} from 'mobx';

    export class __RootState extends State {
        @computed get storage() { return this.sm.storage };
        @computed get xmpp() { return this.sm.xmpp };
        @observable user;

    constructor(_, parent, sm){
    super({ id: "__Root"}, parent, sm);
        const storage = this.storage;
        const xmpp = this.xmpp;
        let user = {a:1, b:2};
        this.user = user;

    let states = [];
        states.push(new HistoryState(null, this, sm));
        states.push(new RootState(null, this, sm));
        states.push(new ErrorState(null, this, sm));
    let transition = [];
        transition.push({
         event: "error", 
        
        
        
         target:"Error", 
        
        });

    this.states = states;
    this.transitions = transition.map(el => new Transition(this, el));
    this.initial = 'History'; this.name = 'success'; this.$type = 'scxml'; 

    if (this.states && this.states.length){
        for (let i=0;i<1 ;i++){
            this.stack.push({name: this.states[i].id});
        }

        this.states.splice(0, 0, {id: this.id+'History', type:'deep', $type: 'history', transitions:[{target:this.states[0].id}]});
    }

    }
        error = (data) => {
        this.sm.handle("error", data);
        };
    }
    export class HistoryState extends State {
        get storage() { return this.parent.storage };
        set storage(value) { this.parent.storage = value };
        get xmpp() { return this.parent.xmpp };
        set xmpp(value) { this.parent.xmpp = value };
        get user() { return this.parent.user };
        set user(value) { this.parent.user = value };

    constructor(_, parent, sm){
    super({ id: "History"}, parent, sm);
        const storage = this.storage;
        const xmpp = this.xmpp;
        const user = this.user;

    let states = [];
    let transition = [];
        transition.push({
        
        
        
        
         target:"Root", 
        
        });

    this.states = states;
    this.transitions = transition.map(el => new Transition(this, el));
    this.type = 'deep'; this.isDeep = true; this.$type = 'history'; 

    if (this.states && this.states.length){
        for (let i=0;i<1 ;i++){
            this.stack.push({name: this.states[i].id});
        }

        this.states.splice(0, 0, {id: this.id+'History', type:'deep', $type: 'history', transitions:[{target:this.states[0].id}]});
    }

    }
        default = (data) => {
        this.sm.handle("default", data);
        };
    }
    export class RootState extends State {
        get storage() { return this.parent.storage };
        set storage(value) { this.parent.storage = value };
        get xmpp() { return this.parent.xmpp };
        set xmpp(value) { this.parent.xmpp = value };
        get user() { return this.parent.user };
        set user(value) { this.parent.user = value };

    constructor(_, parent, sm){
    super({ id: "Root"}, parent, sm);
        const storage = this.storage;
        const xmpp = this.xmpp;
        const user = this.user;

    let states = [];
        states.push(new Load_DataState(null, this, sm));
        states.push(new ConnectState(null, this, sm));
        states.push(new PromoSceneState(null, this, sm));
        states.push(new RegisterState(null, this, sm));
        states.push(new Load_ProfileState(null, this, sm));
        states.push(new SignUpSceneState(null, this, sm));
        states.push(new Register_ProfileState(null, this, sm));
        states.push(new LoggedSceneState(null, this, sm));
    let transition = [];

    this.states = states;
    this.transitions = transition.map(el => new Transition(this, el));
    this.initial = 'Load_Data'; 

    if (this.states && this.states.length){
        for (let i=0;i<1 ;i++){
            this.stack.push({name: this.states[i].id});
        }

        this.states.splice(0, 0, {id: this.id+'History', type:'deep', $type: 'history', transitions:[{target:this.states[0].id}]});
    }

    }
    }
    export class Load_DataState extends State {
        get storage() { return this.parent.storage };
        set storage(value) { this.parent.storage = value };
        get xmpp() { return this.parent.xmpp };
        set xmpp(value) { this.parent.xmpp = value };
        get user() { return this.parent.user };
        set user(value) { this.parent.user = value };

    constructor(_, parent, sm){
    super({ id: "Load_Data"}, parent, sm);
        const storage = this.storage;
        const xmpp = this.xmpp;
        const user = this.user;

    let states = [];
    let transition = [];
        transition.push({
         event: "success", 
        
        
         cond: _event => {return _event.data &&_event.data.a; }, 
         target:"Connect", 
        
        });
        transition.push({
         event: "success", 
        
        
         cond: _event => {return !_event.data || !_event.data.a; }, 
         target:"PromoScene", 
        
        });
        transition.push({
         event: "failure", 
        
        
        
         target:"PromoScene", 
        
        });

    this.states = states;
    this.transitions = transition.map(el => new Transition(this, el));
    this.onentry = _event => { this.sm.promise({$line: '13',
$column: '13',
$type: 'promise',
content: () => {return storage.load()}, 
})
; }; 

    if (this.states && this.states.length){
        for (let i=0;i<1 ;i++){
            this.stack.push({name: this.states[i].id});
        }

        this.states.splice(0, 0, {id: this.id+'History', type:'deep', $type: 'history', transitions:[{target:this.states[0].id}]});
    }

    }
    }
    export class ConnectState extends State {
        get storage() { return this.parent.storage };
        set storage(value) { this.parent.storage = value };
        get xmpp() { return this.parent.xmpp };
        set xmpp(value) { this.parent.xmpp = value };
        get user() { return this.parent.user };
        set user(value) { this.parent.user = value };

    constructor(_, parent, sm){
    super({ id: "Connect"}, parent, sm);
        const storage = this.storage;
        const xmpp = this.xmpp;
        const user = this.user;

    let states = [];
    let transition = [];
        transition.push({
         event: "failure", 
        
        
        
         target:"PromoScene", 
        
        });
        transition.push({
         event: "success", 
        
        
        
         target:"Load_Profile", 
        
        });

    this.states = states;
    this.transitions = transition.map(el => new Transition(this, el));
    this.onentry = _event => { this.sm.promise({$line: '21',
$column: '13',
$type: 'promise',
content: () => {return xmpp.login(_event.data.a)}, 
})
; }; 

    if (this.states && this.states.length){
        for (let i=0;i<1 ;i++){
            this.stack.push({name: this.states[i].id});
        }

        this.states.splice(0, 0, {id: this.id+'History', type:'deep', $type: 'history', transitions:[{target:this.states[0].id}]});
    }

    }
    }
    export class PromoSceneState extends State {
        get storage() { return this.parent.storage };
        set storage(value) { this.parent.storage = value };
        get xmpp() { return this.parent.xmpp };
        set xmpp(value) { this.parent.xmpp = value };
        get user() { return this.parent.user };
        set user(value) { this.parent.user = value };

    constructor(_, parent, sm){
    super({ id: "PromoScene"}, parent, sm);
        const storage = this.storage;
        const xmpp = this.xmpp;
        const user = this.user;

    let states = [];
    let transition = [];
        transition.push({
         event: "success", 
        
        
        
         target:"Register", 
        
        });

    this.states = states;
    this.transitions = transition.map(el => new Transition(this, el));
    this.onentry = _event => { this.user.c = _event.data; }; 

    if (this.states && this.states.length){
        for (let i=0;i<1 ;i++){
            this.stack.push({name: this.states[i].id});
        }

        this.states.splice(0, 0, {id: this.id+'History', type:'deep', $type: 'history', transitions:[{target:this.states[0].id}]});
    }

    }
    }
    export class RegisterState extends State {
        get storage() { return this.parent.storage };
        set storage(value) { this.parent.storage = value };
        get xmpp() { return this.parent.xmpp };
        set xmpp(value) { this.parent.xmpp = value };
        get user() { return this.parent.user };
        set user(value) { this.parent.user = value };

    constructor(_, parent, sm){
    super({ id: "Register"}, parent, sm);
        const storage = this.storage;
        const xmpp = this.xmpp;
        const user = this.user;

    let states = [];
    let transition = [];
        transition.push({
         event: "success", 
        
        
        
         target:"Connect", 
        
        });

    this.states = states;
    this.transitions = transition.map(el => new Transition(this, el));
    

    if (this.states && this.states.length){
        for (let i=0;i<1 ;i++){
            this.stack.push({name: this.states[i].id});
        }

        this.states.splice(0, 0, {id: this.id+'History', type:'deep', $type: 'history', transitions:[{target:this.states[0].id}]});
    }

    }
    }
    export class Load_ProfileState extends State {
        get storage() { return this.parent.storage };
        set storage(value) { this.parent.storage = value };
        get xmpp() { return this.parent.xmpp };
        set xmpp(value) { this.parent.xmpp = value };
        get user() { return this.parent.user };
        set user(value) { this.parent.user = value };

    constructor(_, parent, sm){
    super({ id: "Load_Profile"}, parent, sm);
        const storage = this.storage;
        const xmpp = this.xmpp;
        const user = this.user;

    let states = [];
    let transition = [];
        transition.push({
         event: "failure", 
        
        
        
         target:"PromoScene", 
        
        });
        transition.push({
         event: "success", 
        
        
         cond: _event => {return !_event.data.handle; }, 
         target:"SignUpScene", 
        
        });
        transition.push({
         event: "success", 
        
        
         cond: _event => {return _event.data.handle; }, 
         target:"LoggedScene", 
        
        });

    this.states = states;
    this.transitions = transition.map(el => new Transition(this, el));
    

    if (this.states && this.states.length){
        for (let i=0;i<1 ;i++){
            this.stack.push({name: this.states[i].id});
        }

        this.states.splice(0, 0, {id: this.id+'History', type:'deep', $type: 'history', transitions:[{target:this.states[0].id}]});
    }

    }
    }
    export class SignUpSceneState extends State {
        get storage() { return this.parent.storage };
        set storage(value) { this.parent.storage = value };
        get xmpp() { return this.parent.xmpp };
        set xmpp(value) { this.parent.xmpp = value };
        get user() { return this.parent.user };
        set user(value) { this.parent.user = value };

    constructor(_, parent, sm){
    super({ id: "SignUpScene"}, parent, sm);
        const storage = this.storage;
        const xmpp = this.xmpp;
        const user = this.user;

    let states = [];
    let transition = [];
        transition.push({
         event: "success", 
        
        
        
         target:"Register_Profile", 
        
        });

    this.states = states;
    this.transitions = transition.map(el => new Transition(this, el));
    

    if (this.states && this.states.length){
        for (let i=0;i<1 ;i++){
            this.stack.push({name: this.states[i].id});
        }

        this.states.splice(0, 0, {id: this.id+'History', type:'deep', $type: 'history', transitions:[{target:this.states[0].id}]});
    }

    }
    }
    export class Register_ProfileState extends State {
        get storage() { return this.parent.storage };
        set storage(value) { this.parent.storage = value };
        get xmpp() { return this.parent.xmpp };
        set xmpp(value) { this.parent.xmpp = value };
        get user() { return this.parent.user };
        set user(value) { this.parent.user = value };

    constructor(_, parent, sm){
    super({ id: "Register_Profile"}, parent, sm);
        const storage = this.storage;
        const xmpp = this.xmpp;
        const user = this.user;

    let states = [];
    let transition = [];
        transition.push({
         event: "failure", 
        
        
        
         target:"SignUpScene", 
        
        });
        transition.push({
         event: "success", 
        
        
        
         target:"Load_Profile", 
        
        });

    this.states = states;
    this.transitions = transition.map(el => new Transition(this, el));
    

    if (this.states && this.states.length){
        for (let i=0;i<1 ;i++){
            this.stack.push({name: this.states[i].id});
        }

        this.states.splice(0, 0, {id: this.id+'History', type:'deep', $type: 'history', transitions:[{target:this.states[0].id}]});
    }

    }
    }
    export class LoggedSceneState extends State {
        get storage() { return this.parent.storage };
        set storage(value) { this.parent.storage = value };
        get xmpp() { return this.parent.xmpp };
        set xmpp(value) { this.parent.xmpp = value };
        get user() { return this.parent.user };
        set user(value) { this.parent.user = value };

    constructor(_, parent, sm){
    super({ id: "LoggedScene"}, parent, sm);
        const storage = this.storage;
        const xmpp = this.xmpp;
        const user = this.user;

    let states = [];
        states.push(new DrawerTabsState(null, this, sm));
    let transition = [];

    this.states = states;
    this.transitions = transition.map(el => new Transition(this, el));
    

    if (this.states && this.states.length){
        for (let i=0;i<1 ;i++){
            this.stack.push({name: this.states[i].id});
        }

        this.states.splice(0, 0, {id: this.id+'History', type:'deep', $type: 'history', transitions:[{target:this.states[0].id}]});
    }

    }
    }
    export class DrawerTabsState extends State {
        get storage() { return this.parent.storage };
        set storage(value) { this.parent.storage = value };
        get xmpp() { return this.parent.xmpp };
        set xmpp(value) { this.parent.xmpp = value };
        get user() { return this.parent.user };
        set user(value) { this.parent.user = value };

    constructor(_, parent, sm){
    super({ id: "DrawerTabs"}, parent, sm);
        const storage = this.storage;
        const xmpp = this.xmpp;
        const user = this.user;

    let states = [];
        states.push(new HomeSceneState(null, this, sm));
        states.push(new FriendsSceneState(null, this, sm));
    let transition = [];
        transition.push({
         event: "homeScene", 
         type: "internal", 
         mode: "jump", 
        
         target:"HomeScene", 
        
        });
        transition.push({
         event: "friendsScene", 
         type: "internal", 
         mode: "jump", 
        
         target:"FriendsScene", 
        
        });

    this.states = states;
    this.transitions = transition.map(el => new Transition(this, el));
    

    if (this.states && this.states.length){
        for (let i=0;i<this.states.length ;i++){
            this.stack.push({name: this.states[i].id});
        }

        this.states.splice(0, 0, {id: this.id+'History', type:'deep', $type: 'history', transitions:[{target:this.states[0].id}]});
    }

    }
        homeScene = (data) => {
        this.sm.handle("homeScene", data);
        };
        friendsScene = (data) => {
        this.sm.handle("friendsScene", data);
        };
    }
    export class HomeSceneState extends State {
        get storage() { return this.parent.storage };
        set storage(value) { this.parent.storage = value };
        get xmpp() { return this.parent.xmpp };
        set xmpp(value) { this.parent.xmpp = value };
        get user() { return this.parent.user };
        set user(value) { this.parent.user = value };

    constructor(_, parent, sm){
    super({ id: "HomeScene"}, parent, sm);
        const storage = this.storage;
        const xmpp = this.xmpp;
        const user = this.user;

    let states = [];
    let transition = [];

    this.states = states;
    this.transitions = transition.map(el => new Transition(this, el));
    

    if (this.states && this.states.length){
        for (let i=0;i<1 ;i++){
            this.stack.push({name: this.states[i].id});
        }

        this.states.splice(0, 0, {id: this.id+'History', type:'deep', $type: 'history', transitions:[{target:this.states[0].id}]});
    }

    }
    }
    export class FriendsSceneState extends State {
        get storage() { return this.parent.storage };
        set storage(value) { this.parent.storage = value };
        get xmpp() { return this.parent.xmpp };
        set xmpp(value) { this.parent.xmpp = value };
        get user() { return this.parent.user };
        set user(value) { this.parent.user = value };

    constructor(_, parent, sm){
    super({ id: "FriendsScene"}, parent, sm);
        const storage = this.storage;
        const xmpp = this.xmpp;
        const user = this.user;

    let states = [];
        states.push(new SearchFriendsState(null, this, sm));
        states.push(new AddFriendByUsernameState(null, this, sm));
    let transition = [];
        transition.push({
         event: "searchFriends", 
         type: "internal", 
         mode: "push", 
        
         target:"SearchFriends", 
        
        });
        transition.push({
         event: "addFriendByUsername", 
         type: "internal", 
         mode: "push", 
        
         target:"AddFriendByUsername", 
        
        });

    this.states = states;
    this.transitions = transition.map(el => new Transition(this, el));
    

    if (this.states && this.states.length){
        for (let i=0;i<1 ;i++){
            this.stack.push({name: this.states[i].id});
        }

        this.states.splice(0, 0, {id: this.id+'History', type:'deep', $type: 'history', transitions:[{target:this.states[0].id}]});
    }

    }
        searchFriends = (data) => {
        this.sm.handle("searchFriends", data);
        };
        addFriendByUsername = (data) => {
        this.sm.handle("addFriendByUsername", data);
        };
    }
    export class SearchFriendsState extends State {
        get storage() { return this.parent.storage };
        set storage(value) { this.parent.storage = value };
        get xmpp() { return this.parent.xmpp };
        set xmpp(value) { this.parent.xmpp = value };
        get user() { return this.parent.user };
        set user(value) { this.parent.user = value };

    constructor(_, parent, sm){
    super({ id: "SearchFriends"}, parent, sm);
        const storage = this.storage;
        const xmpp = this.xmpp;
        const user = this.user;

    let states = [];
    let transition = [];

    this.states = states;
    this.transitions = transition.map(el => new Transition(this, el));
    

    if (this.states && this.states.length){
        for (let i=0;i<1 ;i++){
            this.stack.push({name: this.states[i].id});
        }

        this.states.splice(0, 0, {id: this.id+'History', type:'deep', $type: 'history', transitions:[{target:this.states[0].id}]});
    }

    }
    }
    export class AddFriendByUsernameState extends State {
        get storage() { return this.parent.storage };
        set storage(value) { this.parent.storage = value };
        get xmpp() { return this.parent.xmpp };
        set xmpp(value) { this.parent.xmpp = value };
        get user() { return this.parent.user };
        set user(value) { this.parent.user = value };

    constructor(_, parent, sm){
    super({ id: "AddFriendByUsername"}, parent, sm);
        const storage = this.storage;
        const xmpp = this.xmpp;
        const user = this.user;

    let states = [];
    let transition = [];

    this.states = states;
    this.transitions = transition.map(el => new Transition(this, el));
    

    if (this.states && this.states.length){
        for (let i=0;i<1 ;i++){
            this.stack.push({name: this.states[i].id});
        }

        this.states.splice(0, 0, {id: this.id+'History', type:'deep', $type: 'history', transitions:[{target:this.states[0].id}]});
    }

    }
    }
    export class ErrorState extends State {
        get storage() { return this.parent.storage };
        set storage(value) { this.parent.storage = value };
        get xmpp() { return this.parent.xmpp };
        set xmpp(value) { this.parent.xmpp = value };
        get user() { return this.parent.user };
        set user(value) { this.parent.user = value };

    constructor(_, parent, sm){
    super({ id: "Error"}, parent, sm);
        const storage = this.storage;
        const xmpp = this.xmpp;
        const user = this.user;

    let states = [];
    let transition = [];
        transition.push({
         event: "handled", 
        
        
        
         target:"History", 
        
        });

    this.states = states;
    this.transitions = transition.map(el => new Transition(this, el));
    

    if (this.states && this.states.length){
        for (let i=0;i<1 ;i++){
            this.stack.push({name: this.states[i].id});
        }

        this.states.splice(0, 0, {id: this.id+'History', type:'deep', $type: 'history', transitions:[{target:this.states[0].id}]});
    }

    }
        handled = (data) => {
        this.sm.handle("handled", data);
        };
    }

export class Statem extends StateMachine {
    __Root: __RootState = this.getState("__Root");
    history: HistoryState = this.getState("History");
    root: RootState = this.getState("Root");
    load_Data: Load_DataState = this.getState("Load_Data");
    connect: ConnectState = this.getState("Connect");
    promoScene: PromoSceneState = this.getState("PromoScene");
    register: RegisterState = this.getState("Register");
    load_Profile: Load_ProfileState = this.getState("Load_Profile");
    signUpScene: SignUpSceneState = this.getState("SignUpScene");
    register_Profile: Register_ProfileState = this.getState("Register_Profile");
    loggedScene: LoggedSceneState = this.getState("LoggedScene");
    drawerTabs: DrawerTabsState = this.getState("DrawerTabs");
    homeScene: HomeSceneState = this.getState("HomeScene");
    friendsScene: FriendsSceneState = this.getState("FriendsScene");
    searchFriends: SearchFriendsState = this.getState("SearchFriends");
    addFriendByUsername: AddFriendByUsernameState = this.getState("AddFriendByUsername");
    error: ErrorState = this.getState("Error");
}

export default function createStateMachine(props) {
  return new Statem(null, __RootState, props);
}