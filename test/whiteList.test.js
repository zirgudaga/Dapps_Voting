const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const truffleAssert = require('truffle-assertions');
const Whitelist = artifacts.require('Whitelist');

contract('Whitelist tests', function (accounts) {
  const owner = accounts[0];
  const whitelisted = accounts[1];
  const notOwner = accounts[2];
  const whitelisted2 = accounts[3];


  // Avant chaque test unitaire
  beforeEach(async function () {
    this.WhitelistInstance = await Whitelist.new({from: owner});
  });

  it('revert when not owner', async function () {
      // version openzeppelin
      // avec msg d'erreur
      await (expectRevert(this.WhitelistInstance.whitelist(whitelisted, {from: notOwner}), "Ownable: caller is not the owner"));
      // sans msg d'erreur
      await (expectRevert.unspecified(this.WhitelistInstance.whitelist(whitelisted, {from: notOwner})));

      // version truffle (il faut installer le package 'truffle-assertions )
      // sans msg d'erreur
      await truffleAssert.reverts(
          this.WhitelistInstance.whitelist(whitelisted, {from: notOwner})
      ); 
      // avec msg d'erreur
      await truffleAssert.reverts(
        this.WhitelistInstance.whitelist(whitelisted, {from: notOwner})
        , "Ownable: caller is not the owner"
      ); 
  });

  it('whitelist address', async function () {
      // avant la tx 
      // Récup le tableau des @ whitelistées 
      let addressesBefore = await this.WhitelistInstance.getAddresses(); // renvoie [] "tableau vide"
      // Ou récup l'@ du mapping _whitelist
      let isWhitelistedBefore = await this.WhitelistInstance._whitelist(whitelisted); // revoie "false"

      expect(addressesBefore.length).to.equal(0);
      expect(isWhitelistedBefore).to.equal(false);

      // tx 
      let receipt = await this.WhitelistInstance.whitelist(whitelisted, {from: owner});

      // après la tx 
      // Récup le tableau des @ whitelistées 
      let addressesAfter = await this.WhitelistInstance.getAddresses(); // renvoie [ '0xf17f52151EbEF6C7334FAD080c5704D77216b732' ]
      // Ou récup l'@ du mapping _whitelist
      let isWhitelistedAfter = await this.WhitelistInstance._whitelist(whitelisted); // revoie "true"

      expect(addressesAfter[0]).to.equal(whitelisted);
      expect(addressesAfter.length).to.equal(1);
      expect(isWhitelistedAfter).to.equal(true);

      expectEvent(receipt, "Whitelisted", { _address: whitelisted });
  });

  it('revert when already whitelisted', async function () { 
    // 1er appel
    await this.WhitelistInstance.whitelist(whitelisted, {from: owner});

    let isWhitelisted = await this.WhitelistInstance._whitelist(whitelisted);
    expect(isWhitelisted).to.equal(true);

    // 2éme appel
    await (expectRevert(this.WhitelistInstance.whitelist(whitelisted, {from: owner}), "This address is already whitelisted !"));
  });

  it('getAddresses', async function () { 
    // 1er appel
    await this.WhitelistInstance.whitelist(whitelisted, {from: owner});
    await this.WhitelistInstance.whitelist(whitelisted2, {from: owner});

    let addresses = await this.WhitelistInstance.getAddresses(); 
    let tab = ['0xf17f52151EbEF6C7334FAD080c5704D77216b732','0x821aEa9a577a9b44299B9c15c88cf3087F3b5544'];

    expect(addresses.toString()).to.equal(tab.toString());
    expect(addresses).to.eql(tab);
    expect(addresses).to.be.an('array').that.includes('0xf17f52151EbEF6C7334FAD080c5704D77216b732');
  });
});