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

    console.log(props);

  } 

  render(){
    return (
      <div>

        <h3>{       
          (this.props.userType == "Admin") 
          ? this.adminTable[this.props.state.currentStatus]
          : this.voterTable[this.props.state.currentStatus]
        }</h3>

      </div>
    );
  }
}
