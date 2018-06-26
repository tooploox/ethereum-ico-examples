const SimpleTokenVesting = artifacts.require("./03-token-vesting/SimpleTokenVesting.sol");

module.exports = async (deployer, network, [owner]) => {
  const beneficiary = 0x7319879Eb04477e39c2dbaA846470FEb7b2966e1;

  const now = Date.now() / 1000;
  const day = 24 * 60 * 60;
  const start = now + day;
  const cliff = 365 * day;
  const duration = 3 * 365 * day;
  const revocable = false;

  await deployer.deploy(SimpleTokenVesting, beneficiary, start, cliff, duration, revocable);
};
