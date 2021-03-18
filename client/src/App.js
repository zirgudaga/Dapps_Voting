import React, { Component } from "react";
import VotingContract from "./contracts/Voting.json";
import getWeb3 from "./getWeb3.js";
import AdminInterface from "./assets/components/AdminInterface.js"
import VoterInterface from "./assets/components/VoterInterface.js"

import "./App.css";


class App extends Component {
  state = { 
    web3: null, 
    accounts: null, 
    contract: null, 
    myEvents: null,
    isOwner: false,
    curSession: 1, 

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

      this.setState({ web3, accounts, contract, isOwner });  

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  incrementValue = async () => {
    let myValue = this.state.myValue;
    myValue++;
    this.setState({ myValue });  
  };



  render() {
    if (!this.state.web3) {
      return (
        <div>Loading Web3, accounts, and contract...</div>
      );
    }
    return (
      <div className="App">
        <div>{this.state.accounts[0]}</div>
        <h1>Good to Vote!</h1>
        {this.state.myValue}
        {this.state.isOwner && <AdminInterface state={this.state}/>}
        <VoterInterface />
        <input type="button" value="++" onClick= { this.incrementValue } />
      </div>
    );
  }
};

export default App;