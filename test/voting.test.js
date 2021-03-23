const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Voting = artifacts.require('Voting');

// Contrat de test pour addVoter
contract('addVoter', function (accounts) {
  const owner = accounts[0];
  const voter1 = accounts[1];
  const noOwner = accounts[2];

  // Avant chaque test unitaire
  beforeEach(async function () {
    this.Voting = await Voting.new({from: owner});
  });

  it('Revert if not owner', async function () { 
    // On vérifie bien que l'ajout provoque un revert !
    await (expectRevert(this.Voting.addVoter(voter1, false, {from: noOwner}), "Ownable: caller is not the owner"));
  });

  it('Registred ok', async function () { 
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

  it('Voter already registred', async function () { 
    await this.Voting.addVoter(voter1, false, {from: owner});
    await (expectRevert(this.Voting.addVoter(voter1, false, {from: owner}), "Voter already registred"));
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
  




contract('XXXXXXX', function (accounts) {
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

  it('Revert if not owner', async function () { 
   
  });



});