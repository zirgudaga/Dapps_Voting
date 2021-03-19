import React from 'react';
import StatusDisplay from "./StatusDisplay.js"

export default class AdminInterface extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      notice: ''
    };
  }

  setNewVoter = async () => {
    const { accounts, contract, web3 } = this.props.state;
    await contract.methods.addVoter(this.newVoter.value, true).send({ from: accounts[0] },
      async (erreur, tx) => {
        if(tx){
          await web3.eth.getTransactionReceipt(tx, 
            async (erreur, receipt) => {
              if(receipt.status){
                this.setState({notice: 'Electeur ajouté'});
                setTimeout(() => this.setState({notice: ''}), 5000);
                this.newVoter.value = "";
              }
            }
          )
        }
      }
    );   
  };

  render(){
    if(this.props.state.isOwner && (this.props.state.contractSessionId === this.props.state.selectedSessionId))
    {
      return (
        <div>
          <h2>Bonjour administrateur des votes </h2>        
          <StatusDisplay state={this.props.state} userType="Admin"/>

          <div className="formulaires">
            {this.props.state.currentStatus === 0 &&
              <form>
                <label>
                  Ajouter l'adresse d'un électeur :
                  <input type="text" id="newVoter" 
                    ref={(input) => { 
                      this.newVoter = input
                    }}
                  />
                </label>
                <input type="button" value="Ajouter" onClick= { this.setNewVoter } />            
              </form>
            }
            {this.props.state.currentStatus === 1 &&
                "TEST 1"
            }
            {this.props.state.currentStatus === 2 &&
                "TEST 2"
            }
            {this.props.state.currentStatus === 3 &&
                "TEST 3"
            }  
          </div>       

          {this.state.notice !== '' &&
            <div className="notices">{this.state.notice}</div>
          }


          {this.props.state.listVoters.length > 0 
          ? 
            this.props.state.listVoters.map((voter) => (
              <div key={voter}> {voter} </div>
            ))
          : 
          <div>Loading...</div>
          }          

        </div>
      );
    }
    else{
      return (<div></div>);
    }
  }
}


