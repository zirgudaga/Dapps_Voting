import React, { Component } from "react";
import VotingContract from "./contracts/Voting.json";
import getWeb3 from "./getWeb3.js";
import {addToList, removeToList} from "./utils.js"
import AdminInterface from "./assets/components/AdminInterface.js"
import VoterInterface from "./assets/components/VoterInterface.js"
import ResultVoteInterface from "./assets/components/ResultVoteInterface.js"
import Navbar from "./assets/components/Navbar.js"
import MyFooter from "./assets/components/Footer.js"

import "./App.css";


class App extends Component {
  state = { 
    web3: null, 
    accounts: null, 
    contract: null, 
    myEvents: null,
    isOwner: false,
    contractSessionId: null, 
    selectedSessionId: null,
    curState: null,
    resultSession: null,
    listVoters: [],
    listProposals: [],
    listProposalsRefused: [],
    listVotersHasVoted: [],
    voteResults: null,
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

      let isOwner = false;
      let myOwner = await contract.methods.owner().call();
      if(myOwner === accounts[0]){
        isOwner = true; 
      }

      let contractSessionId = parseInt(await contract.methods.sessionId().call(), 10);
      let selectedSessionId = contractSessionId;
      let currentStatus = parseInt(await contract.methods.currentStatus().call(), 10);

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
    this.refresh();

    return 1;
  }
  /////////////////////////////////////////////////////////////////////






  /* GESTION DE L'ACTUALISATION */
  refresh = async () => {
    let { contract, contractSessionId, 
      currentStatus, selectedSessionId, 
      listVoters, listProposals, 
      listProposalsRefused, listVotersHasVoted, 
      voteResults } = this.state; 


    let context = this;

    listVoters = [];
    listProposals = [];

    contract.getPastEvents('allEvents', {
      fromBlock: 0,
      toBlock: 'latest'
    }, function(error, events){ })
    .then(function(myEvents){
      //console.log(myEvents);
      for(let myEvent of myEvents){
        if ( parseInt(myEvent.returnValues.sessionId, 10) === selectedSessionId ) {
          if (myEvent.event === 'VoterRegistered'){
            addToList(listVoters, 
              { 
                key: myEvent.returnValues.voterAddress, 
                isAbleToPropose: myEvent.returnValues.isAbleToPropose
              }
            );
          }
          if (myEvent.event === 'VoterUnRegistered'){
            removeToList(listVoters, myEvent.returnValues.voterAddress);
          }     
          if (myEvent.event === 'ProposalRegistered'){
            addToList(listProposals, 
              { 
                key: myEvent.returnValues.owner, 
                idToSend: myEvent.returnValues.proposalId, 
                content: myEvent.returnValues.proposal
              }
            );
          }          
          if (myEvent.event === 'ProposalUnRegistered'){
            removeToList(listProposals, myEvent.returnValues.owner);
            addToList(listProposalsRefused, 
              { 
                key: myEvent.returnValues.owner, 
                idToSend: myEvent.returnValues.proposalId, 
                content: myEvent.returnValues.proposal
              }
            );            
          }            

          if (myEvent.event === 'Voted'){
            addToList(listVotersHasVoted, 
              { 
                key: myEvent.returnValues.voter, 
                idVoted: myEvent.returnValues.proposalId, 
              }
            );            
          }   

        }
      }
      context.setState({ listVoters, listProposals, listVotersHasVoted});  
    });

    contractSessionId = parseInt(await contract.methods.sessionId().call(), 10);
    currentStatus = parseInt(await contract.methods.currentStatus().call(), 10);

    if ((currentStatus === 5) || (contractSessionId !== selectedSessionId)) {
      voteResults = await contract.methods.getSessionResult(selectedSessionId).call();
    }

    this.setState({ contractSessionId, currentStatus, voteResults });
  };

  goToNewSession = async () => {
    let { selectedSessionId } = this.state; 
    selectedSessionId ++;
    this.setState({ selectedSessionId });
    this.refresh();
  };

  startFakeWebSocket = async () => {
    setInterval(this.refresh, 1000);
  };


  render() {
 
    if (!this.state.web3) {
      return (
        <div>Loading Web3, accounts, and contract...</div>
      );
    }
    return (
      <div className="App">
        <Navbar 
          state={this.state}
          reduceSelectedSession={() => this.reduceSelectedSession()}
          increaseSelectedSession={() => this.increaseSelectedSession()}
        />
        <div className="d-inline-flex mt-5 p-5">
          <h1>Bienvenue sur votre Dapps Voting !</h1>
        </div>
        <AdminInterface 
          state={this.state}
          goToNewSession={() => this.goToNewSession()}  
        />
        <VoterInterface state={this.state}/>
        <ResultVoteInterface state={this.state}/>
        <MyFooter />
      </div>
    );
  }
};


export default App;