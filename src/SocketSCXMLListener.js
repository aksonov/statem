var net =  require('net');
import autobind from 'autobind-decorator';

@autobind
export default class SocketSCXMLListener {
  socket;
  activeTransitions = [];
  
  constructor(port = 8124) {
    try {
      this.socket = net.createConnection(port);
      this.socket.on("error", error=> {
        console.log(`SocketSCXMLListener: Port ${port} is not active, enable server and restart the app, ${error}`);
        this.socket = null;
      });
    } catch (error) {
      console.log(`SocketSCXMLListener: Port ${port} is not active, enable server and restart the app, ${error}`);
    }
  }
  
  write(str){
    if (this.socket){
      try {
        this.socket.write(str);
      } catch (error){
        console.log(`SocketSCXMLListener error: ${error} enable server and restart the app`);
        this.socket = null;
      }
    }
  }
  
  sendActiveState(stateId){
    this.write(`1 ${stateId}\n`);
  }
  
  sendInactiveState(stateId){
    this.write(`0 ${stateId}\n`);
  }
  
  onEntry(stateId){
    if (this.activeState)
    this.sendInactiveState(this.activeState);
    this.activeState = stateId;
    this.sendActiveState(stateId);
    console.log(`ONENTER ${stateId}`)
    }
  
  onExit(stateId){
    this.sendInactiveState(stateId);
    this.activeState = null;
    console.log(`ONEXIT ${stateId}`)
  }
  
  onTransition(sourceStateId, targetStateIds){
    console.log(`TRANSTION: ${sourceStateId} ${JSON.stringify(targetStateIds)}`)
    for (let transition of this.activeTransitions){
      this.write(`2 ${transition.from} -> ${transition.to}\n`);
    }
    this.activeTransitions = [];
    for (let target of targetStateIds){
      this.activeTransitions.push({from : sourceStateId, to: target});
    }
    for (let transition of this.activeTransitions){
      this.write(`3 ${transition.from} -> ${transition.to}\n`);
    }
  }
}

