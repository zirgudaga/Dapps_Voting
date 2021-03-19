import React, { Component } from "react";
import VotingContract from "./contracts/Voting.json";
import getWeb3 from "./getWeb3.js";
import AdminInterface from "./assets/components/AdminInterface.js"
import VoterInterface from "./assets/components/VoterInterface.js"
import ResultVoteInterface from "./assets/components/ResultVoteInterface.js"

import "./App.css";


class App extends Component {
  state = { 
    web3: null, 
    accounts: null, 
    contract: null, 
    myEvents: null,
    isOwner: false,
    contractSessionId: null, 
    curState: null,
    resultSession: null,
    listVoters: [],
    listProposals: [],
  };

  componentDidMount = async () => {

    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();

      const deployedNetwork = VotingContract.networks[networkId];
      const contract = new web3.eth.Contract(
        VotingContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // TODO à Supprimer en prod
      console.log("Methodes : ", contract.methods);

      let isOwner = false;
      let myOwner = await contract.methods.owner().call();
      if(myOwner === accounts[0]){
        isOwner = true; 
      }

      let contractSessionId = await contract.methods.sessionId().call();
      let selectedSessionId = contractSessionId;


      let currentStatus = await contract.methods.currentStatus().call();
      currentStatus = parseInt(currentStatus, 10);   

      this.setState({ web3, accounts, contract, isOwner, contractSessionId, selectedSessionId, currentStatus });  

      this.startFakeWebSocket();

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };
  


  /* GESTION DES SELECTIONS */
  reduceSelectedSession = async () => {
    let { selectedSessionId } = this.state;    
    if (selectedSessionId > 0){
      selectedSessionId --;
      this._updateResultSession();
    }

    this.setState({ selectedSessionId });  
  };

  increaseSelectedSession = async () => {
    let { selectedSessionId, contractSessionId } = this.state;    
    if (selectedSessionId < contractSessionId){
      selectedSessionId ++;
      this._updateResultSession();
    }

    this.setState({ selectedSessionId });  
  };

  _updateResultSession = async () => {
    let { selectedSessionId, contract, contractSessionId, resultSession } = this.state; 

    if (selectedSessionId < contractSessionId) {
      resultSession = await contract.methods.sessions(selectedSessionId).call();
    }else{
      resultSession = null;
    }

    this.setState({ resultSession });  

    return 1;
  }
  /////////////////////////////////////////////////////////////////////






  /* GESTION DE L'ACTUALISATION */
  refresh = async () => {
    let { contract, contractSessionId, currentStatus, selectedSessionId, listVoters } = this.state; 
    let context = this;

    listVoters = [];

    contract.getPastEvents('allEvents', {
      fromBlock: 0,
      toBlock: 'latest'
    }, function(error, events){ })
    .then(function(myEvents){
      console.log(myEvents);
      for(let myEvent of myEvents){
        if (myEvent.returnValues.sessionId === selectedSessionId) {
          if (myEvent.event === 'VoterRegistered'){
            listVoters.push(myEvent.returnValues.voterAddress);
          }
        }
        



      }
      context.setState({ listVoters });  
    });

    contractSessionId = await contract.methods.sessionId().call();

    currentStatus = await contract.methods.currentStatus().call();
    currentStatus = parseInt(currentStatus, 10);   
    
    this.setState({ contractSessionId, currentStatus });
  };


  startFakeWebSocket = async () => {
    //this.refresh();
    setInterval(this.refresh, 1000);
  };




  render() {
    let affSelectedSessionId = parseInt(this.state.selectedSessionId, 10)+1; // Pour l'affichage c'est plus jolie


    if (!this.state.web3) {
      return (
        <div>Loading Web3, accounts, and contract...</div>
      );
    }
    return (
      <div className="App">
        <div>Compte connecté : {this.state.accounts[0]}</div>
        <div>Session selectionnée : <input type="button" value="-" onClick= {this.reduceSelectedSession} />{affSelectedSessionId} <input type="button" value="+" onClick= {this.increaseSelectedSession}/> </div>
        <h1>Good to Vote!</h1>
        <input type="button" value="UPDATE" onClick= {this.startFakeWebSocket} />        
        <AdminInterface state={this.state}/>
        <VoterInterface state={this.state}/>
        <ResultVoteInterface state={this.state}/>
      </div>
    );
  }
};

export default App;