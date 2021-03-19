import React from 'react';

export default class StatusDisplay extends React.Component {

  constructor(props) {
    super(props);
    this.adminTable = [
      'Registering Voters',
      'Proposals Registration Started',
      'Proposals Registration Ended',
      'Voting Session Started',
      'Voting Session Ended',
      'Votes Tallied'
    ];

    this.voterTable = [
      'Veuillez patienter pendant l\'enregistrement des voteurs',
      'Merci de renseigner vos propositions',
      'Patientez pendant la validation de vos propositions',
      'Merci de bien vouloir voter',
      'Merci d\'attendre durant le dépouillement',
      'Voici les résultats du vote'
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

  //TODO a supprimer !!
  prevStep = async () => {
    const { accounts, contract } = this.props.state;    
    await contract.methods.adminChangeStatus(this.props.state.currentStatus-1).send({ from: accounts[0] });
  };  


  render(){
    return (
      <div>

        <h3>{       
          (this.props.userType === "Admin") 
          ? this.adminTable[this.props.state.currentStatus]     
          : this.voterTable[this.props.state.currentStatus]
        }</h3>

        { ((this.props.state.currentStatus > 0) && (this.props.userType === "Admin")) &&
          <input type="button" value="Etape précédante" onClick= { this.prevStep } /> 
        }        
        { ((this.props.state.currentStatus < this.adminTable.length-1) && (this.props.userType === "Admin")) &&
          <input type="button" value="Etape suivante" onClick= { this.nextStep } /> 
        }

      </div>
    );
  }
}
