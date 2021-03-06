const { expectRevert, expectEvent, BN } = require('@openzeppelin/test-helpers');

const { expect } = require('chai');
const Voting = artifacts.require('Voting');

contract('addVoter', function (accounts) {
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

contract('removeVoter', function (accounts) { 
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

contract('proposalSessionEnded', function (accounts) {
  const owner = accounts[0];
  const noOwner = accounts[2];
  
  beforeEach(async function () {
    this.Voting = await Voting.new({from: owner});
  });
  
  it('Revert if not owner', async function () { 
    // On vérifie bien que le changement de status provoque un revert !
    await (expectRevert(this.Voting.proposalSessionEnded({from: noOwner}), "Ownable: caller is not the owner"));
  });
  
  it('ProposalsRegistrationEnded status only', async function () { 
    
    await (expectRevert(this.Voting.proposalSessionEnded({from: owner}), "Not ProposalsRegistrationStarted Status"));

    await this.Voting.proposalSessionBegin({from: owner}); // Validated once
    await this.Voting.proposalSessionEnded({from: owner}); // Validated once
    //////// Not twice
    await (expectRevert(this.Voting.proposalSessionEnded({from: owner}), "Not ProposalsRegistrationStarted Status"));

    await this.Voting.votingSessionStarted({from: owner});
    await (expectRevert(this.Voting.proposalSessionEnded({from: owner}), "Not ProposalsRegistrationStarted Status"));

    await this.Voting.votingSessionEnded({from: owner});
    await (expectRevert(this.Voting.proposalSessionEnded({from: owner}), "Not ProposalsRegistrationStarted Status"));

    await this.Voting.votesTallied({from: owner});
    await (expectRevert(this.Voting.proposalSessionEnded({from: owner}), "Not ProposalsRegistrationStarted Status"));

  });
  
  it('Proposals Registration has been ending well', async function () { 
    await this.Voting.proposalSessionBegin({from: owner}); // Validated once
  
    let receipt = await this.Voting.proposalSessionEnded({from: owner});
    let expectedStatus =  new BN(2); 

    let currentStatus = await this.Voting.currentStatus.call(); 
    expect(currentStatus).to.be.bignumber.equal(expectedStatus);    

    expectEvent(receipt, "ProposalsRegistrationEnded", { sessionId: '0'});
    expectEvent(receipt, "WorkflowStatusChange", { previousStatus: '1', newStatus: '2', sessionId: '0'});
  });
});

contract('addProposal', function (accounts) { 
  const owner = accounts[0];
  const voter1 = accounts[1];
  const proposal1 = 'poulet frite !';

  // Avant chaque test unitaire
  beforeEach(async function () {
    this.Voting = await Voting.new({from: owner});
  });

  it('addProposal OK', async function () { 
    await this.Voting.addVoter(voter1, true, {from: owner});
    await this.Voting.proposalSessionBegin({from: owner});

    // On procède à l'ajout d'une proposition
    let receipt = await this.Voting.addProposal(proposal1, {from: voter1});

    let myProposal = await this.Voting.proposals(1); 
    expect(myProposal.description).to.equal(proposal1);
    expect(myProposal.voteCount).to.be.bignumber.equal('0');
    expect(myProposal.author).to.equal(voter1);
    expect(myProposal.isActive).to.equal(true);

    let myVoters = await this.Voting.voters(voter1); 
    expect(myVoters.hasProposed).to.equal(true);

    // L'event est bien envoyé par l'application  
    expectEvent(receipt, "ProposalRegistered", { proposalId: '1', proposal: proposal1, author: voter1, sessionId: '0'});        
  });

  it('Voter not registered', async function () {
    await this.Voting.addVoter(voter1, true, {from: owner});
    await this.Voting.removeVoter(voter1, {from: owner});    

    await this.Voting.proposalSessionBegin({from: owner}); 
    let receipt = this.Voting.addProposal(proposal1, {from: voter1});

    await (expectRevert(receipt, "Voter not registered"));
  }); 

  it('Voter not proposer', async function () {
    await this.Voting.addVoter(voter1, false, {from: owner});   
    await this.Voting.proposalSessionBegin({from: owner}); 
    let receipt = this.Voting.addProposal(proposal1, {from: voter1});

    await (expectRevert(receipt, "Voter not proposer"));
  }); 

  it('ProposalsRegistrationStarted Status only', async function () { 
    await (expectRevert(this.Voting.addProposal(proposal1, {from: voter1}), "Not ProposalsRegistrationStarted Status"));
  
    await this.Voting.proposalSessionBegin({from: owner});
    await this.Voting.proposalSessionEnded({from: owner});
    await (expectRevert(this.Voting.addProposal(proposal1, {from: voter1}), "Not ProposalsRegistrationStarted Status"));
    
    await this.Voting.votingSessionStarted({from: owner});
    await (expectRevert(this.Voting.addProposal(proposal1, {from: voter1}), "Not ProposalsRegistrationStarted Status"));

    await this.Voting.votingSessionEnded({from: owner});
    await (expectRevert(this.Voting.addProposal(proposal1, {from: voter1}), "Not ProposalsRegistrationStarted Status"));

    await this.Voting.votesTallied({from: owner});
    await (expectRevert(this.Voting.addProposal(proposal1, {from: voter1}), "Not ProposalsRegistrationStarted Status"));
  });  

  it('Voter has already propose', async function () {
    await this.Voting.addVoter(voter1, true, {from: owner});
    await this.Voting.proposalSessionBegin({from: owner}); 
    await this.Voting.addProposal(proposal1, {from: voter1});
    await (expectRevert(this.Voting.addProposal(proposal1, {from: voter1}), "Voter has already propose"));
  }); 
});

contract('removePrososal', function (accounts) {
  const owner = accounts[0];
  const voter1 = accounts[1];
  const noOwner = accounts[2];  
  const proposal1 = 'poulet frite !';

  // Avant chaque test unitaire
  beforeEach(async function () {
    this.Voting = await Voting.new({from: owner});
  });

  it('Revert if not owner', async function () {
    // On vérifie bien que l'ajout provoque un revert !
    await (expectRevert(this.Voting.removeProposal('0', {from: noOwner}), "Ownable: caller is not the owner"));
  });

  it('Proposal has been deactivated', async function () {
    await this.Voting.addVoter(voter1, true, {from: owner});   
    await this.Voting.proposalSessionBegin({from: owner});
    await this.Voting.addProposal(proposal1, {from: voter1})
    await this.Voting.proposalSessionEnded({from: owner});   
    let receipt = await this.Voting.removeProposal('1', {from: owner})
    
    let myProposalAfter = await this.Voting.proposals('1');
    expect(myProposalAfter.isActive).to.equal(false);

    expectEvent(receipt, "ProposalUnRegistered", { proposalId: '1', proposal: proposal1, author: voter1, sessionId: '0'});   
  });


  it('ProposalsRegistrationEnded Status only', async function () { 
    await (expectRevert(this.Voting.removeProposal('0', {from: owner}), "Not ProposalsRegistrationEnded Status"));

    await this.Voting.proposalSessionBegin({from: owner});
    await (expectRevert(this.Voting.removeProposal('0', {from: owner}), "Not ProposalsRegistrationEnded Status"));

    await this.Voting.proposalSessionEnded({from: owner});

    await this.Voting.votingSessionStarted({from: owner});
    await (expectRevert(this.Voting.removeProposal('0', {from: owner}), "Not ProposalsRegistrationEnded Status"));

    await this.Voting.votingSessionEnded({from: owner});
    await (expectRevert(this.Voting.removeProposal('0', {from: owner}), "Not ProposalsRegistrationEnded Status"));

    await this.Voting.votesTallied({from: owner});
    await (expectRevert(this.Voting.removeProposal('0', {from: owner}), "Not ProposalsRegistrationEnded Status"));
  });
});


contract('VotingSessionStarted', function (accounts) {
  const owner = accounts[0];
  const noOwner = accounts[2];

  beforeEach(async function () {
    this.Voting = await Voting.new({from: owner});
  });

  it('Revert if not owner', async function () { 
    // On vérifie bien que le changement de status provoque un revert !
    await (expectRevert(this.Voting.votingSessionStarted({from: noOwner}), "Ownable: caller is not the owner"));
  });

  it('ProposalsRegistrationEnded status only', async function () { 
    await this.Voting.proposalSessionBegin({from: owner});
    await (expectRevert(this.Voting.votingSessionStarted({from: owner}), "Not ProposalsRegistrationEnded Status"));

    await this.Voting.proposalSessionEnded({from: owner});

    await this.Voting.votingSessionStarted({from: owner});
    await (expectRevert(this.Voting.votingSessionStarted({from: owner}), "Not ProposalsRegistrationEnded Status"));

    await this.Voting.votingSessionEnded({from: owner});
    await (expectRevert(this.Voting.votingSessionStarted({from: owner}), "Not ProposalsRegistrationEnded Status"));

    await this.Voting.votesTallied({from: owner});
    await (expectRevert(this.Voting.votingSessionStarted({from: owner}), "Not ProposalsRegistrationEnded Status"));
  });

  it('Voting Session has been starting well', async function () { 
    await this.Voting.proposalSessionBegin({from: owner});
    await this.Voting.proposalSessionEnded({from: owner});

    let receipt = await this.Voting.votingSessionStarted({from: owner});
    let expectedStatus =  new BN(3);

    let currentStatus = await this.Voting.currentStatus.call(); 
    expect(currentStatus).to.be.bignumber.equal(expectedStatus);

    expectEvent(receipt, "VotingSessionStarted", { sessionId: '0'});
    expectEvent(receipt, "WorkflowStatusChange", { previousStatus: '2', newStatus: '3', sessionId: '0'});
  });
});

contract('addVote', function (accounts) {
  const owner = accounts[0];
  const voter1 = accounts[1];
  const proposal1 = "Jack";
  
  // Avant chaque test unitaire
  beforeEach(async function () {
    this.Voting = await Voting.new({from: owner});
  });

  async function addVoterAddProposal(myVoting, _voter1, _proposal1){
    await myVoting.addVoter(_voter1, true, {from: owner});
    await myVoting.proposalSessionBegin({from: owner}); 
    await myVoting.addProposal(_proposal1, {from: voter1});
    await myVoting.proposalSessionEnded({from: owner});
  }

  it('addVote OK', async function () { 
    await addVoterAddProposal(this.Voting, voter1, proposal1);

    // On procède à l'ajout d'un vote sur la proposition 1
    await this.Voting.votingSessionStarted({from: owner});
    let receipt = await this.Voting.addVote('1', {from: voter1});
          
    // On vérifie que le voter1 a bien voté
    let voter1AfterTheVote = await this.Voting.voters(voter1);
    expect(voter1AfterTheVote.votedProposalId).to.be.bignumber.equal('1');      
    expect(voter1AfterTheVote.hasVoted).to.equal(true);

    // On vérifie que la proposition1 a bien 1 vote  
    let proposal1AfterTheVote = await this.Voting.proposals('1');
    expect(proposal1AfterTheVote.voteCount).to.be.bignumber.equal('1');

    // L'event est bien envoyé par l'application
    expectEvent(receipt, "Voted", { voter: voter1, proposalId: '1', sessionId: '0'});        
  });

  it('VotingSessionStarted status only', async function () { 
    await (expectRevert(this.Voting.addVote('1', {from: voter1}), "It is not time to vote!"));
    
    await this.Voting.proposalSessionBegin({from: owner});
    await (expectRevert(this.Voting.addVote('1', {from: voter1}), "It is not time to vote!"));

    await this.Voting.proposalSessionEnded({from: owner});
    await (expectRevert(this.Voting.addVote('1', {from: voter1}), "It is not time to vote!"));
    
    await this.Voting.votingSessionStarted({from: owner});

    await this.Voting.votingSessionEnded({from: owner});
    await (expectRevert(this.Voting.addVote('1', {from: voter1}), "It is not time to vote!"));

    await this.Voting.votesTallied({from: owner});
    await (expectRevert(this.Voting.addVote('1', {from: voter1}), "It is not time to vote!"));
  });  

  it('proposal is active', async function () { 
    await addVoterAddProposal(this.Voting, voter1, proposal1);
    await this.Voting.removeProposal('1', {from: owner});
    await this.Voting.votingSessionStarted({from: owner});

    await (expectRevert(this.Voting.addVote('1', {from: voter1}), "Proposition inactive"));
  }); 

  it('Voter has already vote', async function () {
    await addVoterAddProposal(this.Voting, voter1, proposal1);
    await this.Voting.votingSessionStarted({from: owner});
    await this.Voting.addVote('1', {from: voter1});

    await (expectRevert(this.Voting.addVote('1', {from: voter1}), "Voter has already vote"));
  }); 

});

contract('VotingSessionEnded', function (accounts) {
  const owner = accounts[0];
  const noOwner = accounts[2];

  beforeEach(async function () {
    this.Voting = await Voting.new({from: owner});
  });

  it('Revert if not owner', async function () { 
    // On vérifie bien que le changement de status provoque un revert !
    await (expectRevert(this.Voting.votingSessionEnded({from: noOwner}), "Ownable: caller is not the owner"));
  });

  it('VotingSessionStarted status only', async function () { 
    await this.Voting.proposalSessionBegin({from: owner});
    await (expectRevert(this.Voting.votingSessionEnded({from: owner}), "Not VotingSessionStarted Status"));

    await this.Voting.proposalSessionEnded({from: owner});
    await (expectRevert(this.Voting.votingSessionEnded({from: owner}), "Not VotingSessionStarted Status"));

    await this.Voting.votingSessionStarted({from: owner});

    await this.Voting.votingSessionEnded({from: owner});
    await (expectRevert(this.Voting.votingSessionEnded({from: owner}), "Not VotingSessionStarted Status"));

    await this.Voting.votesTallied({from: owner});
    await (expectRevert(this.Voting.votingSessionEnded({from: owner}), "Not VotingSessionStarted Status"));
  });

  it('Voting Session has been ended well', async function () { 
    await this.Voting.proposalSessionBegin({from: owner});
    await this.Voting.proposalSessionEnded({from: owner});
    await this.Voting.votingSessionStarted({from: owner});
    let receipt = await this.Voting.votingSessionEnded({from: owner});
    let expectedStatus =  new BN(4);

    let currentStatus = await this.Voting.currentStatus.call(); 
    expect(currentStatus).to.be.bignumber.equal(expectedStatus);

    expectEvent(receipt, "VotingSessionEnded", { sessionId: '0'});
    expectEvent(receipt, "WorkflowStatusChange", { previousStatus: '3', newStatus: '4', sessionId: '0'});
  });
});

contract('votesTallied', function (accounts) {
  const owner = accounts[0];
  const noOwner = accounts[1];
  const voter1 = accounts[2];
  const voter2 = accounts[3];
  const voter3 = accounts[4];
  const voter4 = accounts[5];
  const propal1 = "Poulet frite";
  const address0 = "0x0000000000000000000000000000000000000000";

  const BN_0 = new BN(0);
  
  const winningVoter = voter3;

  beforeEach(async function () {
    this.Voting = await Voting.new({from: owner});
  });

  it('Revert if not owner', async function () { 
    await (expectRevert(this.Voting.votesTallied({from: noOwner}), "Ownable: caller is not the owner"));
  });

  it('Session is still ongoing', async function () { 
    await (expectRevert(this.Voting.votesTallied({from: owner}), "Session is still ongoing"));
    await this.Voting.proposalSessionBegin({from: owner});
    await (expectRevert(this.Voting.votesTallied({from: owner}), "Session is still ongoing")); 
    await this.Voting.proposalSessionEnded({from: owner});
    await (expectRevert(this.Voting.votesTallied({from: owner}), "Session is still ongoing"));
    await this.Voting.votingSessionStarted({from: owner});
    await (expectRevert(this.Voting.votesTallied({from: owner}), "Session is still ongoing"));
    await this.Voting.votingSessionEnded({from: owner});
    await this.Voting.votesTallied({from: owner});
    await (expectRevert(this.Voting.votesTallied({from: owner}), "Session is still ongoing"));
  });
    
  it('Voting Taillied - Test 0:1 1:3', async function () { 
    let mySessionBefore = await this.Voting.sessions(0);
    expect(mySessionBefore.endTimeSession).to.be.bignumber.equal(BN_0); 
    expect(mySessionBefore.winningProposalName).to.equal('NC'); 
    expect(mySessionBefore.proposer).to.be.bignumber.equal(address0); 
    expect(mySessionBefore.nbVotes).to.be.bignumber.equal(BN_0); 
    expect(mySessionBefore.totalVotes).to.be.bignumber.equal(BN_0); 

    await this.Voting.addVoter(voter1, false, {from: owner});    
    await this.Voting.addVoter(voter2, false, {from: owner});
    await this.Voting.addVoter(voter3, true, {from: owner});
    await this.Voting.addVoter(voter4, false, {from: owner});
    await this.Voting.proposalSessionBegin({from: owner});
    await this.Voting.addProposal(propal1, {from: voter3});
    await this.Voting.proposalSessionEnded({from: owner});
    await this.Voting.votingSessionStarted({from: owner});
    await this.Voting.addVote('0', {from: voter1});    
    await this.Voting.addVote('1', {from: voter2});
    await this.Voting.addVote('1', {from: voter3});
    await this.Voting.addVote('1', {from: voter4});
    await this.Voting.votingSessionEnded({from: owner});
    let receipt = await this.Voting.votesTallied({from: owner});

    let mySessionAfter = await this.Voting.sessions(0);
    expect(mySessionAfter.endTimeSession).not.equal(0);  
    expect(mySessionAfter.winningProposalName).to.equal(propal1); 
    expect(mySessionAfter.proposer).to.be.bignumber.equal(voter3); 
    expect(mySessionAfter.nbVotes).to.be.bignumber.equal('3'); 
    expect(mySessionAfter.totalVotes).to.be.bignumber.equal('4'); 

    expectEvent(receipt, "VotesTallied", { sessionId: '0'});
    expectEvent(receipt, "WorkflowStatusChange", { previousStatus: '4', newStatus: '5', sessionId: '0'});
  });

  it('Voting Taillied - Test 0:2 1:2', async function () { 
    let mySessionBefore = await this.Voting.sessions(0);
    expect(mySessionBefore.endTimeSession).to.be.bignumber.equal(BN_0); 
    expect(mySessionBefore.winningProposalName).to.equal('NC'); 
    expect(mySessionBefore.proposer).to.be.bignumber.equal(address0); 
    expect(mySessionBefore.nbVotes).to.be.bignumber.equal(BN_0); 
    expect(mySessionBefore.totalVotes).to.be.bignumber.equal(BN_0); 

    await this.Voting.addVoter(voter1, false, {from: owner});    
    await this.Voting.addVoter(voter2, false, {from: owner});
    await this.Voting.addVoter(voter3, true, {from: owner});
    await this.Voting.addVoter(voter4, false, {from: owner});
    await this.Voting.proposalSessionBegin({from: owner});
    await this.Voting.addProposal(propal1, {from: voter3});
    await this.Voting.proposalSessionEnded({from: owner});
    await this.Voting.votingSessionStarted({from: owner});
    await this.Voting.addVote('0', {from: voter1});    
    await this.Voting.addVote('0', {from: voter2});
    await this.Voting.addVote('1', {from: voter3});
    await this.Voting.addVote('1', {from: voter4});
    await this.Voting.votingSessionEnded({from: owner});
    let receipt = await this.Voting.votesTallied({from: owner});

    let mySessionAfter = await this.Voting.sessions(0);
    expect(mySessionAfter.endTimeSession).not.equal(0);  
    expect(mySessionAfter.winningProposalName).to.equal('Vote blanc'); 
    expect(mySessionAfter.proposer).to.be.bignumber.equal(address0); 
    expect(mySessionAfter.nbVotes).to.be.bignumber.equal('2'); 
    expect(mySessionAfter.totalVotes).to.be.bignumber.equal('4'); 

    expectEvent(receipt, "VotesTallied", { sessionId: '0'});
    expectEvent(receipt, "WorkflowStatusChange", { previousStatus: '4', newStatus: '5', sessionId: '0'});
  });

});


contract('getWinningProposal', function (accounts) {
  const owner = accounts[0];

  // Avant chaque test unitaire
  beforeEach(async function () {
    this.Voting = await Voting.new({from: owner});
  });

  it('Tallied not finished', async function () { 
    await (expectRevert(this.Voting.getWinningProposal({from: owner}), "Tallied not finished"));
    await this.Voting.proposalSessionBegin({from: owner});
    await (expectRevert(this.Voting.getWinningProposal({from: owner}), "Tallied not finished")); 
    await this.Voting.proposalSessionEnded({from: owner});
    await (expectRevert(this.Voting.getWinningProposal({from: owner}), "Tallied not finished"));
    await this.Voting.votingSessionStarted({from: owner});
    await (expectRevert(this.Voting.getWinningProposal({from: owner}), "Tallied not finished"));
    await this.Voting.votingSessionEnded({from: owner});
    await (expectRevert(this.Voting.getWinningProposal({from: owner}), "Tallied not finished")); 
  });

});

contract('restartSession', function (accounts) {
  const owner = accounts[0];
  const noOwner = accounts[1];    
  const voter1 = accounts[2];
  const voter2 = accounts[3];    
  const proposal1 = "Jack";
  const address0 = "0x0000000000000000000000000000000000000000";    
  
  // Avant chaque test unitaire
  beforeEach(async function () {
    this.Voting = await Voting.new({from: owner});
  });

  async function add2VoterAddProposal2Votes(myVoting, _voter1, _voter2, _proposal1){
    await myVoting.addVoter(_voter1, true, {from: owner});
    await myVoting.addVoter(_voter2, false, {from: owner});      
    await myVoting.proposalSessionBegin({from: owner}); 
    await myVoting.addProposal(_proposal1, {from: voter1});
    await myVoting.proposalSessionEnded({from: owner});
    await myVoting.votingSessionStarted({from: owner});
    await myVoting.addVote('1', {from: voter1});
    await myVoting.addVote('1', {from: voter2}); 
    await myVoting.votingSessionEnded({from: owner});
    await myVoting.votesTallied({from: owner});      
  }       

  it('Revert if not owner', async function () { 
    await (expectRevert(this.Voting.restartSession(true, {from: noOwner}), "Ownable: caller is not the owner"));
  });


  it('Tallied not finished', async function () { 
    await (expectRevert(this.Voting.restartSession({from: owner}), "Tallied not finished"));
    await this.Voting.proposalSessionBegin({from: owner});
    await (expectRevert(this.Voting.restartSession({from: owner}), "Tallied not finished")); 
    await this.Voting.proposalSessionEnded({from: owner});
    await (expectRevert(this.Voting.restartSession({from: owner}), "Tallied not finished"));
    await this.Voting.votingSessionStarted({from: owner});
    await (expectRevert(this.Voting.restartSession({from: owner}), "Tallied not finished"));
    await this.Voting.votingSessionEnded({from: owner});
    await (expectRevert(this.Voting.restartSession({from: owner}), "Tallied not finished"));
  });

  it('Restart with voters', async function () {     
    await add2VoterAddProposal2Votes(this.Voting, voter1, voter2, proposal1);

    let receipt = await this.Voting.restartSession(false, {from: owner});

    let currentStatus = await this.Voting.currentStatus.call(); 
    expect(currentStatus).to.be.bignumber.equal('0');   

    let voter1AfterRestart = await this.Voting.voters(voter1);
    expect(voter1AfterRestart.hasVoted).to.equal(false);                
    expect(voter1AfterRestart.hasProposed).to.equal(false);      

    let voter2AfterRestart = await this.Voting.voters(voter2);
    expect(voter2AfterRestart.hasVoted).to.equal(false);                
    expect(voter2AfterRestart.hasProposed).to.equal(false);      

    let mySession = await this.Voting.sessions(1); 
    expect(mySession.startTimeSession).to.be.bignumber.equal('0'); 
    expect(mySession.endTimeSession).to.be.bignumber.equal('0'); 
    expect(mySession.winningProposalName).to.equal('NC'); 
    expect(mySession.proposer).to.be.bignumber.equal(address0); 
    expect(mySession.nbVotes).to.be.bignumber.equal('0'); 
    expect(mySession.totalVotes).to.be.bignumber.equal('0'); 

    let myProposal = await this.Voting.proposals(0);
    expect(myProposal.description).to.equal('Vote blanc'); 
    expect(myProposal.voteCount).to.be.bignumber.equal('0'); 
    expect(myProposal.author).to.be.bignumber.equal(address0); 
    expect(myProposal.isActive).to.equal(true); 

    expectEvent(receipt, "VoterRegistered", { voterAddress: voter1, isAbleToPropose: true, sessionId: '1'});
    expectEvent(receipt, "VoterRegistered", { voterAddress: voter2, isAbleToPropose: false, sessionId: '1'});
    expectEvent(receipt, "SessionRestart", { sessionId: '1'});
    expectEvent(receipt, "ProposalRegistered", { proposalId: '0', proposal: 'Vote blanc', author: address0, sessionId: '1'});
  });

  
});
