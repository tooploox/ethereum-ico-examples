const SimpleToken = artifacts.require("./SimpleToken.sol");
const GenericCrowdsale = artifacts.require("./01-generic/GenericCrowdsale.sol");

module.exports = async (deployer, network, [owner]) => {
  await deployer.deploy(SimpleToken, "Tooploox", "TPX", 18, 21000000);

  const openingTime = Date.now() + 100000;
  const closingTime = Date.now() + 200000;
  const rate = 100;

  deployer.deploy(GenericCrowdsale, openingTime, closingTime, rate, owner, SimpleToken.address);
};
