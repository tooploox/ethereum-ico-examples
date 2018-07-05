const SimpleToken = artifacts.require("./SimpleToken.sol");
const PresaleCrowdsale = artifacts.require("./02-presale-multiple-rounds/PresaleCrowdsale.sol");

module.exports = (deployer, network, [owner]) => deployer
// SimpleToken already deployed by the 2nd migration
// .then(() => deployer.deploy(SimpleToken, "Tooploox", "TPX", 18, 21000000))
  .then(() => deployer.deploy(PresaleCrowdsale, 10000, owner, SimpleToken.address, owner))
  .then(() => SimpleToken.deployed())
  .then(token => token.increaseApproval(PresaleCrowdsale.address, 100000 * (10 ** 18)));
