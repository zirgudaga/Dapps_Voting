import React from 'react';
import StatusDisplay from "./StatusDisplay.js"

export default class AdminInterface extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      notice: '',
      isAbbleToPropose: true,
    };
  }

  addVoter = async () => {
    const { accounts, contract, web3 } = this.props.state;
    const { isAbbleToPropose } = this.state;  

    if(this.newVoter.value.trim() !== '')
    {
      await contract.methods.addVoter(this.newVoter.value, isAbbleToPropose).send({ from: accounts[0] },
        async (erreur, tx) => {
          if(tx){
            await web3.eth.getTransactionReceipt(tx, 
              async (erreur, receipt) => {
                if(receipt.status){
                  this.setState({notice: 'Electeur ajouté'});
                  setTimeout(() => this.setState({notice: ''}), 5000);
                  this.newVoter.value = "";
                  this.setState({isAbbleToPropose: true});
                }
              }
            )
          }
        }
      );   
    }
  };

  removeVoter = async (addressToKill) => {
    const { accounts, contract, web3 } = this.props.state;
    await contract.methods.removeVoter(addressToKill).send({ from: accounts[0] },
      async (erreur, tx) => {
        if(tx){
          await web3.eth.getTransactionReceipt(tx, 
            async (erreur, receipt) => {
              if(receipt.status){
                this.setState({notice: 'Electeur supprimé'});
                setTimeout(() => this.setState({notice: ''}), 5000);
              }
            }
          )
        }
      }
    );  
  };

  removeProposal = async (idToKill) => {
    const { accounts, contract, web3 } = this.props.state;
    await contract.methods.removeProposal(idToKill).send({ from: accounts[0] },
      async (erreur, tx) => {
        if(tx){
          await web3.eth.getTransactionReceipt(tx, 
            async (erreur, receipt) => {
              if(receipt.status){
                this.setState({notice: 'Proposition supprimé'});
                setTimeout(() => this.setState({notice: ''}), 5000);
              }
            }
          )
        }
      }
    );  
  };

  handleInputChange = (event) => {
    const isAbbleToPropose = event.target.checked;
    this.setState({isAbbleToPropose});
  };

  render(){
    if(this.props.state.isOwner && (this.props.state.contractSessionId === this.props.state.selectedSessionId))
    {
      return (
        <div>
          <h2>Bonjour administrateur des votes </h2>        
          <StatusDisplay 
            state={this.props.state} userType="Admin"
            goToNewSession={() => this.props.goToNewSession()}
          />

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
                  -
                  <img src="/img/isAbbleToPropose_32.png"/>
                  <input
                    name="isAbbleToPropose"
                    type="checkbox"
                    checked={this.state.isAbbleToPropose}
                    onChange={this.handleInputChange} />

                </label>
                <input type="button" value="Ajouter" onClick= { () => this.addVoter() } />            
              </form>
            }

          </div>       

          {this.state.notice !== '' &&
            <div className="notices">{this.state.notice}</div>
          }

          <h3> Liste des électeurs </h3>
          {this.props.state.listVoters.length > 0 
          ?
            this.props.state.listVoters.map((voter) => (
              <div key={voter.key}> {voter.key}
              {voter.isAbleToPropose 
              ? <img src="/img/isAbbleToPropose_32.png"/>
              : " "
              }
              {this.props.state.currentStatus === 0 && <input type="button" value="Retirer" onClick= { () => this.removeVoter(voter.key) } />}
              </div>
            ))           
          : 
          <div>Aucun électeur à l'heure actuelle...</div>
          }       

          <h3> Liste des propositions valides</h3>
          {this.props.state.listProposals.length > 0 
          ?
            this.props.state.listProposals.map((propal) => (
              <div key={propal.key}> {parseInt(propal.idToSend,10)+1} - {propal.content}
              {this.props.state.currentStatus === 2 && <input type="button" value="Retirer" onClick= { () => this.removeProposal(propal.idToSend) } />}
              </div>
            ))           
          : 
          <div>Aucune proposition à l'heure actuelle...</div>
          }       

          <h3> Liste des propositions refusées</h3>
          {this.props.state.listProposalsRefused.length > 0 
          ?
            this.props.state.listProposalsRefused.map((propal) => (
              <div key={propal.key}> {parseInt(propal.idToSend,10)+1} - {propal.content}
              </div>
            ))           
          : 
          <div>Aucune proposition refusée à l'heure actuelle...</div>
          }    


        </div>
      );
    }
    else{
      return (<div></div>);
    }
  }
}

