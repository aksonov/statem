import {when, action, autorun, observable, spy} from 'mobx';
import {expect} from 'chai';
import createSM from './genstate';

describe("test", function() {
  it("redirect to promo scene", function(done){
    const state = createSM({ storage: {load: ()=>{}}});
    state.start();
    expect(state.promoScene.active).to.be.false;
    when (()=>state.promoScene.active, done);
  });
  it("expect login scene with history", function(done){
    const state = createSM({ storage: {load: ()=>{}}});
    state.start();
    when(()=>state.load_Data.active, ()=>state.success());
    when(()=>state.promoScene.active, ()=>state.handle("error"));
    when(()=>state.error.active, ()=>{
      state.error.handled();
      when(()=>state.promoScene.active, done);
    });
  });
  
  it("expect logged scene", function(done){
    const state = createSM({ listener: {onEntry:state=>console.log(`ENTER STATE:${state}`)}, xmpp: {login(a) { return a===1}}, storage: {load: function(){return {a:1, b:2}}}});
    state.start();
    when(()=>state.load_Profile.active, ()=>{
      state.success({handle:'test'});
    });
    when (()=>state.homeScene.active, ()=> {
      state.drawerTabs.friendsScene({msg: "hello"});
    });
    
    when(()=>state.searchFriends.active, ()=> {
      state.friendsScene.addFriendByUsername({user:'test'});
    });
    
    when(()=>state.addFriendByUsername.active, ()=>{
      expect(state.drawerTabs.stack.length).to.be.equal(2);
      expect(state.friendsScene.stack.length).to.be.equal(2);
      state.drawerTabs.homeScene();
      // switch back and verify that addFriendsByUsername is selected
      when(()=>state.homeScene.active, ()=> {
        state.drawerTabs.friendsScene();
        when(()=>state.addFriendByUsername.active, done);
      });
    });
  
    
  });
});
