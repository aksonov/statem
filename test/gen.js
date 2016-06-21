import {when, action, autorun, observable, spy} from 'mobx';
import {expect} from 'chai';
import createSM from './genstate';

describe("test", function() {
  it("redirect to promo scene", function(done){
    const state = createSM({ storage: {load: ()=>{}}});
    state.start();
    when (()=>state.state === "PromoScene", done);
  });
  it("expect login scene", function(done){
    const state = createSM({ xmpp: {login(a) { if (a === 1){
      done()}
    }},
      storage: {load: function(){return {a:1, b:2}}}});
    state.start();
    setTimeout(()=>state.success({username:'test', password:'password'}));
    expect(state.state).to.be.equal("Load_Data");

  });
  it("expect login scene", function(){
    const state = createSM({ storage: {load: ()=>{}}});
    state.start();
    expect(state.state).to.be.equal("Load_Data");
    state.success();
    expect(state.state).to.be.equal("PromoScene");
    state.handle("error");
    expect(state.state).to.be.equal("Error");
    state.handle("handled");
    expect(state.state).to.be.equal("PromoScene");

  });
});
