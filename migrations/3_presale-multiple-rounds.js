const SimpleToken = artifacts.require("./SimpleToken.sol");
const PresaleCrowdsale = artifacts.require("./02-presale-multiple-rounds/PresaleCrowdsale.sol");

module.exports = async (deployer, network, [owner]) => {
  await deployer.deploy(SimpleToken, "Tooploox", "TPX", 18, 21000000);
  deployer.deploy(PresaleCrowdsale, 10000, owner, SimpleToken.address, owner);
};
