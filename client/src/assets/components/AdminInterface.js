import React from 'react';
import StatusDisplay from "./StatusDisplay.js"

export default class AdminInterface extends React.Component {


  render(){
    return (
      <div>
        <h2>Bonjour administrateur des votes </h2>        
        <StatusDisplay state={this.props.state} userType="Admin"/>
      </div>
    );
  }
}


