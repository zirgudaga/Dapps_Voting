const { expectRevert, expectEvent, BN } = require('@openzeppelin/test-helpers');

const { expect } = require('chai');
const Voting = artifacts.require('Voting');

contract('addVoter', function (accounts) {
  return;
  const owner = accounts[0];
  const voter1 = accounts[1];
  const noOwner = accounts[2];

  beforeEach(async function () {
    this.Voting = await Voting.new({from: owner});
  });

  it('Revert if not owner', async function () { 
    // On vérifie bien que l'ajout provoque un revert !
    await (expectRevert(this.Voting.addVoter(voter1, false, {from: noOwner}), "Ownable: caller is not the owner"));
  });

  it('Registered ok', async function () { 
    // On regarde qu'au départ le voter n'est pas enregistré
    let voter1Before = await this.Voting.voters(voter1); 
    expect(voter1Before.isRegistered).to.equal(false);

    // On procède à l'ajout
    let receipt = await this.Voting.addVoter(voter1, false, {from: owner});

    // On regarde que voter1 est enregistré - Sur le mapping
    let voter1After = await this.Voting.voters(voter1); 
    expect(voter1After.isRegistered).to.equal(true);  

    // On regarde que voter1 est enregistré - Sur le tableau des adresses    
    let adresseToSaveAfter = await this.Voting.addressToSave(0);
    expect(adresseToSaveAfter).to.equal(voter1);  

    // L'event est bien envoyé par l'application
    expectEvent(receipt, "VoterRegistered", { voterAddress: voter1, isAbleToPropose: false, sessionId: '0'});
  });

  it('Voter already registered', async function () { 
    await this.Voting.addVoter(voter1, false, {from: owner});
    await (expectRevert(this.Voting.addVoter(voter1, false, {from: owner}), "Voter already registered"));
  });  

  it('RegisteringVoters status only', async function () { 
    await this.Voting.proposalSessionBegin({from: owner});
    await (expectRevert(this.Voting.addVoter(voter1, false, {from: owner}), "Not RegisteringVoters Status"));

    await this.Voting.proposalSessionEnded({from: owner});
    await (expectRevert(this.Voting.addVoter(voter1, false, {from: owner}), "Not RegisteringVoters Status"));

    await this.Voting.votingSessionStarted({from: owner});
    await (expectRevert(this.Voting.addVoter(voter1, false, {from: owner}), "Not RegisteringVoters Status"));

    await this.Voting.votingSessionEnded({from: owner});
    await (expectRevert(this.Voting.addVoter(voter1, false, {from: owner}), "Not RegisteringVoters Status"));

    await this.Voting.votesTallied({from: owner});
    await (expectRevert(this.Voting.addVoter(voter1, false, {from: owner}), "Not RegisteringVoters Status"));
  });  

});
  
// Remove voter, sans vouloir te chapitrer !
contract('removeVoter', function (accounts) {
  return;
  const owner = accounts[0];
  const voter1 = accounts[1];
  const noOwner = accounts[2];

  // Avant chaque test unitaire
  beforeEach(async function () {
    this.Voting = await Voting.new({from: owner});
  });

  it('Revert if not owner', async function () { 
    // On vérifie bien que l'ajout provoque un revert !
    await (expectRevert(this.Voting.removeVoter(voter1, {from: noOwner}), "Ownable: caller is not the owner"));
  });

  it('Voter is not registered', async function () { 
    await (expectRevert(this.Voting.removeVoter(voter1, {from: owner}), "Voter not registered"));
  });    

  it('Unregistered ok', async function () { 
    // On procède à l'ajout d'un voter
    await this.Voting.addVoter(voter1, false, {from: owner});

    // On procède au retrait du voter
    let receipt = await this.Voting.removeVoter(voter1, {from: owner});

    // On regarde que voter1 est n'est plus enregistré - Sur le mapping
    let voter1After = await this.Voting.voters(voter1); 
    expect(voter1After.isRegistered).to.equal(false);  

    // L'event est bien envoyé par l'application
    expectEvent(receipt, "VoterUnRegistered", { voterAddress: voter1, sessionId: '0'});
  });

  it('RegisteringVoters status only', async function () { 
    await this.Voting.proposalSessionBegin({from: owner});
    await (expectRevert(this.Voting.removeVoter(voter1, {from: owner}), "Not RegisteringVoters Status"));

    await this.Voting.proposalSessionEnded({from: owner});
    await (expectRevert(this.Voting.removeVoter(voter1, {from: owner}), "Not RegisteringVoters Status"));

    await this.Voting.votingSessionStarted({from: owner});
    await (expectRevert(this.Voting.removeVoter(voter1, {from: owner}), "Not RegisteringVoters Status"));

    await this.Voting.votingSessionEnded({from: owner});
    await (expectRevert(this.Voting.removeVoter(voter1, {from: owner}), "Not RegisteringVoters Status"));

    await this.Voting.votesTallied({from: owner});
    await (expectRevert(this.Voting.removeVoter(voter1, {from: owner}), "Not RegisteringVoters Status"));
  });  

});




// ProposalsRegistrationStarted

contract('proposalSessionBegin', function (accounts) {
  const owner = accounts[0];
  const noOwner = accounts[2];

  beforeEach(async function () {
    this.Voting = await Voting.new({from: owner});
  });

  it('Revert if not owner', async function () { 
    // On vérifie bien que le changement de stauts provoque un revert !
    await (expectRevert(this.Voting.proposalSessionBegin({from: noOwner}), "Ownable: caller is not the owner"));
  });

  it('RegisteringVoters status only', async function () { 
    await this.Voting.proposalSessionBegin({from: owner});
    await (expectRevert(this.Voting.proposalSessionBegin({from: owner}), "Not RegisteringVoters Status"));

    await this.Voting.proposalSessionEnded({from: owner});
    await (expectRevert(this.Voting.proposalSessionBegin({from: owner}), "Not RegisteringVoters Status"));

    await this.Voting.votingSessionStarted({from: owner});
    await (expectRevert(this.Voting.proposalSessionBegin({from: owner}), "Not RegisteringVoters Status"));

    await this.Voting.votingSessionEnded({from: owner});
    await (expectRevert(this.Voting.proposalSessionBegin({from: owner}), "Not RegisteringVoters Status"));

    await this.Voting.votesTallied({from: owner});
    await (expectRevert(this.Voting.proposalSessionBegin({from: owner}), "Not RegisteringVoters Status"));
  });

  it('Proposals Registration has been starting well', async function () { 

    let receipt = await this.Voting.proposalSessionBegin({from: owner});
    let expectedStatus =  new BN(1); 

    let mySession = await this.Voting.sessions(0); 
    expect(mySession.startTimeSession).not.equal(0);    

    let currentStatus = await this.Voting.currentStatus.call(); 
    expect(currentStatus).to.be.bignumber.equal(expectedStatus);    

    expectEvent(receipt, "ProposalsRegistrationStarted", { sessionId: '0'});
    expectEvent(receipt, "WorkflowStatusChange", { previousStatus: '0', newStatus: '1', sessionId: '0'});
  });

});

// LN
// function proposalSessionEnded() external onlyOwner{

// LN
// function addProposal(string memory _content) external {

// LN
// function removeProposal(uint16 _proposalId) external onlyOwner{

// EV
// function votingSessionStarted() external onlyOwner{

// EV
// function addVote(uint16 _votedProposalId) external {

// EV
// function votingSessionEnded() external onlyOwner{

// DVM
// function votesTallied() external onlyOwner {

// DVM
// function getWinningProposal() external view returns(string memory contentProposal, uint16 nbVotes, uint16 nbVotesTotal){

// DVM
// function restartSession (bool deleteVoters) external {