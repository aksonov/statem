import {when, action, autorun, observable, spy} from 'mobx';
import {expect} from 'chai';
import State from '../src/State';
import StateMachine from '../src/StateMachine';

describe("test", function() {
  it("throw error if no initial state", function(){
    expect(()=>new StateMachine({id:'one', state:{id:'child'}})).to.throw('Initial state should be set for compoud state: one');
  });

  it("throw error if no initial state", function(){
    expect(()=>new StateMachine({id:'one', initial:'child2',
      state:{id:'child'}})).to.throw('No state child2 exist for compud state one');
  });

  it("should create compoud state", function(){
    const sm = new StateMachine({id:'one', initial:'child', state:{id:'child'}});
    sm.start();
    expect(sm.getState('child').active).to.be.true;
  });

  it("should create compoud state and call onentry", function(done){
    const sm = new StateMachine({id:'one', initial:'child', state:{id:'child', onentry:done}});
    sm.start();
  });

  it("should create compoud state and call onentry", function(done){
    const sm = new StateMachine({id:'one', initial:'child', state:{id:'child', initial:'childchild', state:{id:'childchild', onentry:done}}});
    sm.start();
  });

  it("should create compoud state and two sub-states and default transition", function(done){
    const sm = new StateMachine({id:'one', initial:'child1',
      state:[{id:'child1',transition:{target:'child2'}}, {id:'child2',onentry:done}]});
    sm.start();
  });

  it("should create compoud state and two sub-states and handle transition", function(done){
    const sm = new StateMachine({id:'one', initial:'child1',
      state:[{id:'child1', transition:{event:'go', target:'child2'}}, {id:'child2'}]});
    sm.start();
    expect(sm.getState('child1').active).to.be.true;
    sm.handle('go');
    when( ()=>sm.getState('child2').active, done)
  });
  //
  it("should create compoud state and two sub-states and handle transition", function(done){
    const sm = new StateMachine({id:'one', initial:'child1',
      state:[{id:'child1',transition:{event:'go', target:'child2'}}, {id:'child2'}],});
    sm.start();
    expect(sm.getState('child1').active).to.be.true;
    sm.handle('go', {a:1, b:2});
    when( ()=>sm.getState('child2').active && sm.getState('child2').props.a === 1 && sm.getState('child2').props.b === 2, done)

  });


  it("should create compoud state and two sub-states and handle transition", function(){
    const sm = new StateMachine({id:'one', initial:'child1',
      state:[{id:'child1',transition:{event:'go', target:'child2'}},
        {id:'child2', transition:{target:'child1'}}]});
    sm.start();
    expect(sm.getState('child1').active).to.be.true;
    sm.handle('go', {a:1, b:2});
  
    expect(sm.getState('child1').active).to.be.true;

  });
});
