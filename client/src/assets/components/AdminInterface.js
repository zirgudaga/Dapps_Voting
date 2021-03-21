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
        <div className="container mb-5">
          <div className="col col-lg-2"></div>
          <div className="card col-md-auto">
            <div className="card-body">
              <h2 className="card-header mb-3">Interface administrateur</h2>        
              <StatusDisplay 
                state={this.props.state} userType="Admin"
                goToNewSession={() => this.props.goToNewSession()}
              />
            <div className="formulaires">
              {this.props.state.currentStatus === 0 &&
                <form>
                  <label>
                      <label className="mr-2">Ajouter l'adresse d'un voteur</label>
                      <input type="text" id="newVoter" 
                        ref={(input) => { 
                          this.newVoter = input
                        }}
                      />
                    <img className="m-2" src="logo.png" width="25" height="25" alt="able_to_propose"/>
                    <input
                      name="isAbbleToPropose"
                      type="checkbox"
                      checked={this.state.isAbbleToPropose}
                      onChange={this.handleInputChange} />
                  </label>
                  <input type="button" className="btn btn-success ml-2" value="Ajouter" onClick= { () => this.addVoter() } />            
                </form>
              }
            </div>       
              {this.state.notice !== '' &&
                <div className="notices">{this.state.notice}</div>
              }
              <h3 className="card-title m-3"> Liste des voteurs </h3>
              {this.props.state.listVoters.length > 0 
              ?
                this.props.state.listVoters.map((voter) => (
                  <div className="m-2" key={voter.key}> {voter.key}
                  {voter.isAbleToPropose 
                  && <img className="m-2" src="logo.png" width="25" height="25" alt="able_to_propose"/>
                  }
                  {this.props.state.currentStatus === 0 && <input type="button" className="btn btn-danger ml-2" value="Retirer" onClick= { () => this.removeVoter(voter.key) } />}
                  </div>
                ))           
              : 
              <div className="card-text m-3">Aucun voteur à l'heure actuelle...</div>
              }       
              <h3 className="card-title m-3"> Liste des propositions valides</h3>
              {this.props.state.listProposals.length > 0 
              ?
                this.props.state.listProposals.map((propal) => (
                  <div key={propal.key}> {parseInt(propal.idToSend,10)+1} - {propal.content}
                  {this.props.state.currentStatus === 2 && <input type="button" className="btn btn-danger ml-2" value="Retirer" onClick= { () => this.removeProposal(propal.idToSend) } />}
                  </div>
                ))           
              : 
              <div className="card-text m-3">Aucune proposition à l'heure actuelle...</div>
              }       
              <h3 className="card-title m-3"> Liste des propositions refusées</h3>
              {this.props.state.listProposalsRefused.length > 0 
              ?
                this.props.state.listProposalsRefused.map((propal) => (
                  <div key={propal.key}> {parseInt(propal.idToSend,10)+1} - {propal.content}
                  </div>
                ))           
              : 
              <div className="card-text m-3">Aucune proposition refusée à l'heure actuelle...</div>
              }    
            </div>
          <div className="col col-lg-2"></div>
          </div>
        </div>
      );
    }
    else{
      return (<div></div>);
    }
    
  }
}

