import {when, action, autorun, observable, spy} from 'mobx';
import {expect} from 'chai';
import statem from './genstate';

statem.listeners.push({onEntry:state=>console.log(`ENTER STATE:${state}`)});
statem.xmpp = {login(a) { return a===1 ? {result:1} : false }};
statem.storage = {load: function(){return {}}};

describe("test", function() {
  it("redirect to promo scene", function(done){
    statem.start();
    expect(statem.promoScene.active).to.be.false;
    when (()=>statem.promoScene.active, done);
  });
  // it("expect login scene with history", function(done){
  //   statem.start();
  //   when(()=>statem.load_Data.active, ()=>statem.success());
  //   when(()=>statem.promoScene.active, ()=>statem.handle("error"));
  //   when(()=>statem.error.active, ()=>{
  //     statem.error.handled();
  //     when(()=>statem.promoScene.active, done);
  //   });
  // });
  
  it("expect logged scene", function(done){
    statem.storage = {load: function(){return {a:1, b:2}}};
    statem.start();
    when(()=>statem.load_Profile.active, ()=>{
      expect(statem.load_Profile.model.result).to.be.equal(1);
      setTimeout(()=>statem.success({handle:'test'}));
    });
    when (()=>statem.homeScene.active, ()=> {
      setTimeout(()=>statem.drawerTabs.friendsScene({msg: "hello"}));
    });
    
    when(()=>statem.searchFriends.active, ()=> {
      setTimeout(()=>statem.friendsScene.addFriendByUsername({user:'test'}));
    });
    
    when(()=>statem.addFriendByUsername.active, ()=>{
      expect(statem.drawerTabs.stack.length).to.be.equal(2);
      expect(statem.friendsScene.stack.length).to.be.equal(2);
      setTimeout(()=>statem.drawerTabs.homeScene());
      // switch back and verify that addFriendsByUsername is selected
      when(()=>statem.homeScene.active, ()=> {
        setTimeout(()=>statem.drawerTabs.friendsScene());
        when(()=>statem.addFriendByUsername.active, done);
      });
    });
  
    
  });
});
