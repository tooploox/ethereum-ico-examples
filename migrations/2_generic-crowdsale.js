const SimpleToken = artifacts.require("./SimpleToken.sol");
const GenericCrowdsale = artifacts.require("./01-generic/GenericCrowdsale.sol");

module.exports = async (deployer, network, [owner]) => {
  await deployer.deploy(SimpleToken, "Tooploox", "TPX", 18, 21000000);

  const now = Math.floor(Date.now() / 1000);
  const day = 24 * 60 * 60;

  const openingTime = now;
  const closingTime = now + 2 * day;
  const rate = 1000;

  await deployer.deploy(GenericCrowdsale, openingTime, closingTime, rate, owner, SimpleToken.address);

  console.log("Transfering tokens...");
  const Token = await SimpleToken.deployed();
  await Token.transfer(GenericCrowdsale.address, 20000000 * (10 ** 18), { from: owner });
};
