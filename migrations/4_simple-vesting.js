const SimpleTokenVesting = artifacts.require("./03-token-vesting/SimpleTokenVesting.sol");
const SimpleToken = artifacts.require("./SimpleToken.sol");
const GenericCrowdsale = artifacts.require("./01-generic/GenericCrowdsale.sol");

const now = Date.now() / 1000;
const day = 24 * 60 * 60;

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

const vestingSettings = {
  start: now + day,
  cliff: 365 * day,
  duration: 3 * 365 * day,
  revocable: false,
};

const crowdsaleSettings = {
  openingTime: now + day,
  closingTime: now + 2 * day,
  rate: 100,
};

module.exports = (deployer, network, [owner]) => {
  deployTokenVestingContracts(deployer, beneficiaries);
  deployToken(deployer);
  deployCrowdsale(deployer, owner);
  transferTokensToVestingContracts(deployer, beneficiaries);
};

function deployTokenVestingContracts(deployer, beneficiaries) {

  beneficiaries.forEach((beneficiary) =>
  {
    deployer.deploy(
      SimpleTokenVesting,
      beneficiary.address,
      vestingSettings.start,
      vestingSettings.cliff,
      vestingSettings.duration,
      vestingSettings.revocable
    );
  });
}

function deployToken(deployer) {
  deployer.deploy(SimpleToken, "Tooploox", "TPX", 18, 21000000);
}

function deployCrowdsale(deployer, owner) {
  deployer.deploy(
    GenericCrowdsale,
    crowdsaleSettings.openingTime,
    crowdsaleSettings.closingTime,
    crowdsaleSettings.rate,
    owner,
    SimpleToken.address
  );
}

function transferTokensToVestingContracts(deployer, beneficiaries) {
  //
}
