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

contract('proposalSessionBegin', function (accounts) {
  return;
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
  return;
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

// LN
// function addProposal(string memory _content) external {

// LN
// function removeProposal(uint16 _proposalId) external onlyOwner{

// EV
// function votingSessionStarted() external onlyOwner{

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

// EV
// function votingSessionEnded() external onlyOwner{

  contract('votesTallied', function (accounts) {
    return;
    const owner = accounts[0];
    const noOwner = accounts[1];
    const voter1 = accounts[2];
    const voter2 = accounts[3];
    const voter3 = accounts[4];
    const voter4 = accounts[5];
    const propal1 = "Poulet frite";

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
    });
     
    it('Voting Taillied - Test 0:2 1:2', async function () { 
      let mySessionBefore = await this.Voting.sessions(0);
      expect(mySessionBefore.endTimeSession).to.be.bignumber.equal(BN_0); 
      expect(mySessionBefore.winningProposalName).to.equal('NC'); 
      expect(mySessionBefore.proposer).to.be.bignumber.equal(BN_0); 
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


      expectEvent(receipt, "VotesTallied", { sessionId: '0'});
      expectEvent(receipt, "WorkflowStatusChange", { previousStatus: '4', newStatus: '5', sessionId: '0'});
    });
  
  });



  //   /**
  //    * @dev Tallied votes
  //    */
  //    function votesTallied() external onlyOwner {
  //     require(currentStatus == WorkflowStatus.VotingSessionEnded, "Session is still ongoing");
      
  //     uint16 currentWinnerId;
  //     uint16 nbVotesWinner;
  //     uint16 totalVotes;

  //     currentStatus = WorkflowStatus.VotesTallied;

  //     for(uint16 i; i<proposals.length; i++){
  //         if (proposals[i].voteCount > nbVotesWinner){
  //             currentWinnerId = i;
  //             nbVotesWinner = proposals[i].voteCount;
  //         }
  //         totalVotes += proposals[i].voteCount;
  //     }
  //     proposalWinningId = currentWinnerId;
  //     sessions[sessionId].endTimeSession = block.timestamp;
  //     sessions[sessionId].winningProposalName = proposals[currentWinnerId].description;
  //     sessions[sessionId].proposer = proposals[currentWinnerId].author;
  //     sessions[sessionId].nbVotes = nbVotesWinner;
  //     sessions[sessionId].totalVotes = totalVotes;       

  //     emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied, sessionId);
  //     emit VotesTallied(sessionId);
  // }




// DVM
// function getWinningProposal() external view returns(string memory contentProposal, uint16 nbVotes, uint16 nbVotesTotal){

// DVM
// function restartSession (bool deleteVoters) external {


// ProposalsRegistrationEnded
