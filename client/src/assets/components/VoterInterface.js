import React from 'react';
import StatusDisplay from "./StatusDisplay.js"

export default class VoterInterface extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      notice: ''
    };
  }

  setNewVoter = async () => {
    const { accounts, contract, web3 } = this.props.state;
    await contract.methods.addProposal(this.newPropal.value, true).send({ from: accounts[0] },
      async (erreur, tx) => {
        if(tx){
          await web3.eth.getTransactionReceipt(tx, 
            async (erreur, receipt) => {
              if(receipt.status){
                this.setState({notice: 'Proposition ajoutée'});
                setTimeout(() => this.setState({notice: ''}), 5000);
                this.newPropal.value = "";
              }
            }
          )
        }
      }
    );   
  };

  render(){
    if(this.props.state.contractSessionId === this.props.state.selectedSessionId){
      return (
        <div>
          <h2>Bonjour voteur</h2>
          <StatusDisplay state={this.props.state} userType="Voter"/>
          <div className="formulaires">
            {this.props.state.currentStatus === 1 &&
              <form>
                <label>
                  Faites votre proposition :
                  <textarea id="newPropal" 
                    ref={(input) => { 
                      this.newPropal = input
                    }}
                    placeholder="Merci de renseigner votre proposition..."                    
                  >
                  </textarea>
                </label>
                <input type="button" value="Valider" onClick= { this.newPropal } />            
              </form>
            }
            {this.props.state.currentStatus === 2 &&
                "TEST 1"
            }
            {this.props.state.currentStatus === 3 &&
                "TEST 2"
            }
            {this.props.state.currentStatus === 4 &&
                "TEST 3"
            }  
          </div>       

          {this.state.notice !== '' &&
            <div className="notices">{this.state.notice}</div>
          }

        </div>
      );
    }
    else{
      return (<div></div>);
    }
  
  }

}


