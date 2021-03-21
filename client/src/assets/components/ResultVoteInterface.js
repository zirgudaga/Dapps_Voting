import React from 'react';

export default class ResultVoteInterface extends React.Component {

  render(){
    if(this.props.state.voteResults === null){
      return (<div></div>);
    }
    let affSelectedSessionId = parseInt(this.props.state.selectedSessionId, 10)+1;
    if ((this.props.state.contractSessionId > this.props.state.selectedSessionId) || (this.props.state.currentStatus === 5)){
      return (
          <div className="container">
            <div className="col col-lg-2"></div>
            <div className="card col-md-auto mb-5">
              <h3>Résultat des votes de la session {affSelectedSessionId}</h3>
                <p className="text-success fw-bold">{this.props.state.voteResults.winningProposalName}</p>
                <p>Nombre de votes : {this.props.state.voteResults.nbVotes} / {this.props.state.voteResults.totalVotes}</p>
            </div>
            <div className="col col-lg-2"></div>
          </div>
      );
    }
    else{
      return (<div></div>);
    }
  
  }
}


