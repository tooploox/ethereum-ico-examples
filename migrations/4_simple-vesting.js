const SimpleTokenVesting = artifacts.require("./03-token-vesting/SimpleTokenVesting.sol");

module.exports = (deployer, network, [owner]) => {
  const beneficiaries = [
    0x7319879Eb04477e39c2dbaA846470FEb7b2966e1,
    0xa2164D11832e1De722c24ed87C82c53318f23b87,
    0x9e9Bf5E5D100f45a3527c7eacC84E0a185fc7E0D
  ];

  const now = Date.now() / 1000;
  const day = 24 * 60 * 60;
  const start = now + day;
  const cliff = 365 * day;
  const duration = 3 * 365 * day;
  const revocable = false;

  beneficiaries.forEach((beneficiary) =>
  {
    deployer.deploy(SimpleTokenVesting, beneficiary, start, cliff, duration, revocable);
  });
};
