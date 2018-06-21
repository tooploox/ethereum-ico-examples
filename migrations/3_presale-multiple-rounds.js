const SimpleToken = artifacts.require("./02-presale-multiple-rounds/SimpleToken.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleToken, "Tooploox", "TPX", 18, 21000000);
};
