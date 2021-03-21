import React from 'react';

export default class StatusDisplay extends React.Component {

  constructor(props) {
    super(props);
    this.adminTable = [
      'Enregistrement des voteurs',
      'Début de l\'enregistrement des propositions',
      'Fin de l\'enregistrement des propositions',
      'Début des votes',
      'Fin des votes',
      'Dépouillement'
    ];

    this.voterTable = [
      'Enregistrement des autres voteurs',
      'Enregistrement des propositions',
      'Validation des propositions...',
      'Phase des votes',
      'En attente du dépouillement',
      'Voici les résultats des votes de la session'
    ];

  } 

  nextStep = async () => {
    const { accounts, contract } = this.props.state;    
    switch(this.props.state.currentStatus){
      case 0 :
        await contract.methods.proposalSessionBegin().send({ from: accounts[0] });
        break;
      case 1 :
        await contract.methods.proposalSessionEnded().send({ from: accounts[0] });
        break;
      case 2 :   
        await contract.methods.votingSessionStarted().send({ from: accounts[0] });
        break;     
      case 3 :
        await contract.methods.votingSessionEnded().send({ from: accounts[0] });
        break;  
      case 4 :
        await contract.methods.votesTallied().send({ from: accounts[0] });
        break;  
      default :
        break;  
    }
  };

  newSession = async (isWithoutVoter) => {
    const { accounts, contract, web3 } = this.props.state;    
    let context = this;

    await contract.methods.restartSession(isWithoutVoter).send({ from: accounts[0] },
    async (erreur, tx) => {
      if(tx){
        await web3.eth.getTransactionReceipt(tx, 
          async (erreur, receipt) => {
            if(receipt.status){
              await context.goToNewSession();
            }
          }
        )
      }
    })
  };

  goToNewSession = async () => {
    this.props.goToNewSession();
  };

  render(){
    return (
      <div className="d-flex align-items-center justify-content-center">
        
        <button type="button" className="btn btn-light disabled">{       
          (this.props.userType === "Admin") 
          ? this.adminTable[this.props.state.currentStatus]     
          : this.voterTable[this.props.state.currentStatus]
        }</button>

        { ((this.props.state.currentStatus < this.adminTable.length-1) && (this.props.userType === "Admin")) &&
          <input type="button" className="btn btn-primary m-3" value="Etape suivante" onClick= { this.nextStep } /> 
        }

        { ((this.props.state.currentStatus === 5) && (this.props.userType === "Admin")) &&
          <div>
            <input type="button" className="btn btn-success mr-3" value="Nouvelle session (avec les voteurs)" onClick= { () => this.newSession(false) } /> 
            <input type="button" className="btn btn-success" value="Nouvelle session (sans voteurs)" onClick= { () => this.newSession(true) } /> 
          </div>
        }

      </div>
    );
  }
}

