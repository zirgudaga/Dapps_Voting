import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { 
    web3: null, 
    accounts: null, 
    contract: null, 
    storageValue: 0, 
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

      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const contract = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      this.setState({ web3, accounts, contract });  

      this.getValue();
      this.startFakeWebSocket();
    

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  getValue = async () => {
    const { contract } = this.state;    

    const storageValue = await contract.methods.get().call();
    // Set web3, accounts, and contract to the state, and then proceed with an
    // example of interacting with the contract's methods.
    this.setState({ storageValue });
  };

  setValue = async () => {

    const { accounts, contract, web3 } = this.state;

    let storageValue = this.storedInput.value; 
    let context = this;

    await contract.methods.set(storageValue).send({ from: accounts[0] },
      async (erreur, tx) => {
        if(tx){
          await web3.eth.getTransactionReceipt(tx, 
            async (erreur, receipt) => {
              if(receipt.status){

                // Get the value from the contract to prove it worked.
                const storageInEVM = await contract.methods.get().call();
                
                // Update state with the result.
                context.setState({ storageValue: storageInEVM });
                context.storedInput.value = "";
              }
            }
          )
        }
      }
    );   
  };

  getEvents = async () => {
    const { contract } = this.state;
    
    let context = this;

    contract.getPastEvents('allEvents', {
      fromBlock: 0,
      toBlock: 'latest'
    }, function(error, events){ })
    .then(function(myEvents){
      context.setState({ myEvents });
      context.getValue();
    });

  };

  startFakeWebSocket = async () => {
    let toKillOneDay = setInterval(this.getEvents, 10000);
  };

  render() {
    if (!this.state.web3) {
      return (
        <div>Loading Web3, accounts, and contract...</div>
      );
    }
    return (
      <div className="App">
        <h1>Good to Go!</h1>
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Smart Contract Example</h2>
        <div>
          <form>
            <label>
              Value to store :
              <input type="text" id="storedInput" 
                ref={(input) => { 
                  this.storedInput = input
                }}
              />
            </label>
            <input type="button" value="Set" onClick= { this.setValue } />
          </form>

          <input type="button" value="Show previous values" onClick= { this.getEvents } />        
        </div>

        <div>
          <ul>
            { this.state.myEvents &&
              this.state.myEvents.map((event) => (
                <li key={event.transactionHash}>Block : {event.blockNumber} : {event.returnValues[0]} </li>
              ))
            }
          </ul>
        </div>


        <br></br>
        <div>The stored value is: {this.state.storageValue}</div>
      </div>
    );
  }
};

export default App;