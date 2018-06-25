const SimpleToken = artifacts.require("./SimpleToken.sol");
const GenericCrowdsale = artifacts.require("./01-generic/GenericCrowdsale.sol");

module.exports = async (deployer, network, [owner]) => {
  await deployer.deploy(SimpleToken, "Tooploox", "TPX", 18, 21000000);

  const now = Date.now() / 1000;
  const day = 24 * 60 * 60;

  const openingTime = now + day;
  const closingTime = now + 2 * day;
  const rate = 100;

  deployer.deploy(GenericCrowdsale, openingTime, closingTime, rate, owner, SimpleToken.address);
};
