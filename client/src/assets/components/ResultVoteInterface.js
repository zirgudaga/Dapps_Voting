import React from 'react';

export default class ResultVoteInterface extends React.Component {

  render(){
    if(this.props.state.voteResults === null){
      return (<div></div>);
    }

    if ((this.props.state.contractSessionId > this.props.state.selectedSessionId) || (this.props.state.currentStatus === 5)){
      return (
          <div>
            Proposition retenue : {this.props.state.voteResults.winningProposalName} <br/>
            Nombre de votes : {this.props.state.voteResults.nbVotes} <br/>
            Total des votes : {this.props.state.voteResults.totalVotes} <br/>

          </div>
      );
    }
    else{
      return (<div></div>);
    }
  
  }
}


