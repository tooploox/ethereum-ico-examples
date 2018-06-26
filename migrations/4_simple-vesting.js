const SimpleTokenVesting = artifacts.require("./03-token-vesting/SimpleTokenVesting.sol");
const SimpleToken = artifacts.require("./SimpleToken.sol");

module.exports = (deployer, network, [owner]) => {
  const beneficiaries = [
    {
      name:    'developer1',
      address: 0x7319879Eb04477e39c2dbaA846470FEb7b2966e1,
      options: 15,
    },
    {
      name:    'developer2',
      address: 0x9e9Bf5E5D100f45a3527c7eacC84E0a185fc7E0D,
      options: 15,
    },
    {
      name:    'crowdsale',
      address: 0x7319879Eb04477e39c2dbaA846470FEb7b2966e1,
      options: 70
    }
  ];

  deployTokenVestingContracts(deployer, beneficiaries);
  deployToken(deployer);
};

function deployTokenVestingContracts(deployer, beneficiaries) {
  const now = Date.now() / 1000;
  const day = 24 * 60 * 60;
  const start = now + day;
  const cliff = 365 * day;
  const duration = 3 * 365 * day;
  const revocable = false;

  beneficiaries.forEach((beneficiary) =>
  {
    deployer.deploy(SimpleTokenVesting, beneficiary.address, start, cliff, duration, revocable);
  });
}

function deployToken(deployer) {
  deployer.deploy(SimpleToken, "Tooploox", "TPX", 18, 21000000);
}
