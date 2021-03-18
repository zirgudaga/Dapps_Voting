import React from 'react';
import StatusDisplay from "./StatusDisplay.js"

export default class VoterInterface extends React.Component {


  render(){
    return (
      <div>
        <h2>Bonjour voteur</h2>
        <StatusDisplay state={this.props.state} userType="Voter"/>
      </div>
    );
  }
}


