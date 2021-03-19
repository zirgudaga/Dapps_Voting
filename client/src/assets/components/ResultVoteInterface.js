import React from 'react';

export default class ResultVoteInterface extends React.Component {


  render(){
    if(this.props.state.contractSessionId > this.props.state.selectedSessionId){
      return (
        <div>
          <h2>Voici les résultats de la sceances</h2>



        </div>
      );
    }
    else{
      return (<div></div>);
    }
  
  }
}


