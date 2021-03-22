const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Voting = artifacts.require('Voting');

contract('Whitelist tests', function (accounts) {
  const owner = accounts[0];
  const voter1 = accounts[1];
  const voter2 = accounts[2];
  const voter3 = accounts[3];
  const voter4 = accounts[4];  
  const address0 = "0x0000000000000000000000000000000000000000";

  // Avant chaque test unitaire
  beforeEach(async function () {
    this.Voting = await Voting.new({from: owner});
  });


/*

    constructor () public{
        sessionId=0;
        sessions.push(Session(0,0,'NC',address(0),0,0));
        currentStatus = WorkflowStatus.RegisteringVoters;
        proposals.push(Proposal('Vote blanc', 0, address(0), true));
        emit ProposalRegistered(0, 'Vote blanc', address(0),sessionId);            
    } 
*/

  it('Constructor', async function () {
    let DeployedVoting = await Voting.new({from: owner});
    //event ProposalRegistered(uint proposalId, string proposal, address owner, uint sessionId);
    expectEvent(DeployedVoting, "ProposalRegistered", { proposalId:0, proposal: 'Vote blanc', owner : address0, sessionId: 0});
  });

});