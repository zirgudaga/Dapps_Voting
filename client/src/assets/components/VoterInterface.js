import React from 'react';
import StatusDisplay from "./StatusDisplay.js"
import {isInList} from "../../utils.js"

export default class VoterInterface extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      notice: ''
    };
  }

  addProposal = async () => {
    if(this.newPropal.value.trim() !== '')
    {    
      const { accounts, contract, web3 } = this.props.state;
      await contract.methods.addProposal(this.newPropal.value).send({ from: accounts[0] },
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
    }
  };

  addVote = async (idToVote) => {
    const { accounts, contract, web3 } = this.props.state;
    await contract.methods.addVote(idToVote).send({ from: accounts[0] },
      async (erreur, tx) => {
        if(tx){
          await web3.eth.getTransactionReceipt(tx, 
            async (erreur, receipt) => {
              if(receipt.status){
                this.setState({notice: 'Vote enregistré'});
                setTimeout(() => this.setState({notice: ''}), 5000);
              }
            }
          )
        }
      }
    );  
  };

  render(){
    let hasProposed = isInList(this.props.state.listProposals, this.props.state.accounts[0]);
    let isRefused = isInList(this.props.state.listProposalsRefused, this.props.state.accounts[0]);
    let hasVoted = isInList(this.props.state.listVotersHasVoted, this.props.state.accounts[0]);
    
    if(this.props.state.contractSessionId === this.props.state.selectedSessionId){

      if(isInList(this.props.state.listVoters, this.props.state.accounts[0]))
      {
          return (
          <div>
            <h2>Bonjour voteur</h2>
            <StatusDisplay state={this.props.state} userType="Voter"/>
            <div className="formulaires">
              {(this.props.state.currentStatus === 1 && !hasProposed) &&
                <form>
                  <label>
                    Faites votre proposition :
                    <textarea id="newPropal" 
                      ref={(input) => { 
                        this.newPropal = input
                      }}
                      placeholder="Merci de renseigner votre proposition..."                    
                    />
                    
                  </label>
                  <input type="button" value="Valider" onClick= { this.addProposal } />            
                </form>
              }

              {(this.props.state.currentStatus === 1 && hasProposed) &&
                <h4> Votre proposition est bien envoyée </h4>
              }

              {(this.props.state.currentStatus === 2 && hasProposed && !isRefused) &&
                <h4> Propositon en cours d'étude </h4>
              }
             
              {(this.props.state.currentStatus === 2 && isRefused) &&
                <h4> Votre proposition a été refusée </h4>
              }

              {(this.props.state.currentStatus === 3 && this.props.state.listProposals.length > 0 && !hasVoted) &&
                <div>
                  <h3> Liste des propositions </h3>
                  {this.props.state.listProposals.map((propal) => (
                    <div key={propal.key}> {parseInt(propal.idToSend,10)+1} - {propal.content}
                      <input type="button" value="Voter" onClick= { () => this.addVote(propal.idToSend)}/>
                    </div>
                    ))   
                  }
                </div>
              }

              {(this.props.state.currentStatus === 3 && hasVoted) &&
                <h4> Votre vote a bien été pris en compte </h4>
              }

            </div>       

            {this.state.notice !== '' &&
              <div className="notices">{this.state.notice}</div>
            }

          </div>
        );
      }
      return (<div>
        <h2>Bonjour voteur</h2><div>En attente d'autorisation être électeur...</div>
        </div>);
    }
    else{
      return (<div></div>);
    }
  
  }

}


