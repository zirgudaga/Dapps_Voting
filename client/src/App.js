import React, { Component } from "react";
import VotingContract from "./contracts/Voting.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { 
    web3: null, 
    accounts: null, 
    contract: null, 
    myEvents: null,
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

      this.setState({ web3, accounts, contract });  

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };



  render() {
    if (!this.state.web3) {
      return (
        <div>Loading Web3, accounts, and contract...</div>
      );
    }
    return (
      <div className="App">
        <h1>Good to Vote!</h1>


 

      </div>
    );
  }
};

export default App;