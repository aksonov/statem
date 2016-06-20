import {when, action, autorun, observable, spy} from 'mobx';
import Transition, {DEFAULT} from './Transition';
import assert from 'assert';

export default class State {
  id;
  @observable parent;
  @observable state;
  @observable prevState;
  @observable transition;
  @observable props;
  @observable transitionProps;
  @observable active;
  @observable entered = false;
  @observable exited = false;

  states;
  transitions;
  onentry;
  onexit;
  initial;

  constructor(data, parent, active = false){
    assert(data, "No state data is defined!");
    let {id, transition, state, initial, onentry, onexit, datamodel} = data;
    assert(id, "State should contain id");
    this.id = id;
    this.active = active;
    this.parent = parent;
    console.log("PARENT:", parent);
    if (transition){
      if (!(transition instanceof Array)){
        transition = [transition];
      }
      this.transitions = transition.map(el => new Transition(this, el));
    }
    if (state){
      assert(initial, `Initial state should be set for compoud state: ${id}`);
      this.initial = initial;
      if (!(state instanceof Array)){
        state = [state];
      }
      if (!state.filter(el => el.id === initial).length){
        throw new Error(`No state ${initial} exist for compud state ${id}`);
      }
      this.states = state.map(el => new State(el, this, el.id === initial));
    }

    if (!onentry){
      onentry = (props) => console.log(`Entering state: ${id}, props: ${props}`);
    }

    if (!onexit){
      onexit = (props) => console.log(`Exiting state: ${id}, props: ${props}`);
    }
    this.onentry = onentry;
    this.onexit = onexit;

    if (this.parent){
      autorun(()=>{
        console.log("ID:",this.id, "STATE: ",this.parent.state, "PREV:", this.parent.prevState);
        if (this.parent.state === this.id){
          console.log("ENTER STATE:", this.id);
          this.onentry && this.onentry(this.parent.transitionProps);
          this.start();
        }
        // if (this.parent.prevState === this.id && this.parent.state !== this.id && !this.exited) {
        //   this.onexit && this.onexit(this.parent.transitionProps);
        //   this.active = false;
        //   this.exited = true;
        // }
        // if (this.parent.state === this.id && !this.entered) {
        //   this.onentry && this.onentry(this.parent.transitionProps);
        //   this.active = true;
        //   this.entered = true;
        //   this.start();
        // }
      })
    }
  }

  @action start = props => {
    this.state = this.initial;
    this.handle(DEFAULT, props);
  };
  
  @action handle = (event, props) => {
    console.log(`HANDLE TRANSITION: ${event}`);
    this.transition = event;
    this.transitionProps = props;
  };

}
