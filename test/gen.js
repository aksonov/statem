import {when, action, autorun, observable, spy} from 'mobx';
import {expect} from 'chai';
import createSM from './genstate';

describe("test", function() {
  it("redirect to promo scene", function(done){
    const state = createSM({ storage: {load: ()=>{}}});
    state.start();
    when (()=>state.state === "PromoScene", done);
  });
  it("expect login scene with history", function(done){
    const state = createSM({ storage: {load: ()=>{}}});
    state.start();
    when(()=>state.isIn("Load_Data"), ()=>state.success());
    when(()=>state.isIn("PromoScene"), ()=>state.handle("error"));
    when(()=>state.isIn("Error"), ()=>state.handle("handled"));
    when(()=>state.isIn("PromoScene"), done);
  });
  
  it("expect logged scene", function(done){
    const state = createSM({ listener: {onEntry:state=>console.log(`ENTER STATE:${state}`)}, xmpp: {login(a) { return a===1}}, storage: {load: function(){return {a:1, b:2}}}});
    state.start();
    when(()=>state.isIn("Load_Profile"), ()=>{
      state.success({handle:'test'});
    });
    when (()=>state.isIn("HomeScene"), ()=> {
      state.drawerTabs.friendsScene({msg: "hello"});
    });
    
    when(()=>state.isIn("SearchFriends"), ()=> {
      state.friendsScene.addFriendByUsername({user:'test'});
    });
    
    when(()=>state.isIn(state.addFriendByUsername.id), ()=>{
      expect(state.drawerTabs.stack.length).to.be.equal(2);
      expect(state.friendsScene.stack.length).to.be.equal(2);
      state.drawerTabs.homeScene();
      // switch back and verify that addFriendsByUsername is selected
      when(()=>state.isIn("HomeScene"), ()=> {
        state.drawerTabs.friendsScene();
        when(()=>state.isIn(state.addFriendByUsername.id), done);
      });
    });
  
    
  });
});
