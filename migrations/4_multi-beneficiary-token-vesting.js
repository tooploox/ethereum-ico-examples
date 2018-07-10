const now = Math.floor(Date.now() / 1000);
const day = 24 * 60 * 60;

const beneficiaries = [
  {
    address: "0x7319879Eb04477e39c2dbaA846470FEb7b2966e1",
    shares: 15,
  },
  {
    address: "0x9e9Bf5E5D100f45a3527c7eacC84E0a185fc7E0D",
    shares: 20,
  },
];

const tokenSettings = {
  name: "Tooploox",
  symbol: "TPX",
  decimals: 18,
  amount: 3000000,
};

const vestingSettings = {
  start: now + day,
  cliff: 365 * day,
  duration: 3 * 365 * day,
};

const crowdsaleSettings = {
  openingTime: now + day,
  closingTime: now + 2 * day,
  rate: 100,
};

const GenericCrowdsale = artifacts.require("./01-generic/GenericCrowdsale.sol");
const SimpleToken = artifacts.require("./SimpleToken.sol");
const MultiBeneficiaryTokenVesting = artifacts.require("./03-token-vesting/MultiBeneficiaryTokenVesting.sol");

module.exports = (deployer, network, [owner]) => deployer
  .then(() => deployToken(deployer))
  .then(() => deployMultiBeneficiaryTokenVestingContract(deployer))
  .then(() => transferTokensToVestingContract(owner))
  .then(() => addBeneficiariesToVestingContract(owner))
  .then(() => deployCrowdsale(deployer, owner))
  .then(() => transferRemainingTokensToCrowdsale(owner))
  .then(() => displaySummary());

function deployToken(deployer) {
  return deployer.deploy(
    SimpleToken,
    tokenSettings.name,
    tokenSettings.symbol,
    tokenSettings.decimals,
    tokenSettings.amount,
  );
}

function deployMultiBeneficiaryTokenVestingContract(deployer) {
  return deployer.deploy(
    MultiBeneficiaryTokenVesting,
    SimpleToken.address,
    vestingSettings.start,
    vestingSettings.cliff,
    vestingSettings.duration,
  );
}

function deployCrowdsale(deployer, owner) {
  return deployer.deploy(
    GenericCrowdsale,
    crowdsaleSettings.openingTime,
    crowdsaleSettings.closingTime,
    crowdsaleSettings.rate,
    owner,
    SimpleToken.address,
  );
}

async function transferTokensToVestingContract(owner) {
  const sharesSum = beneficiaries.reduce((sharesSum, beneficiary) => sharesSum + beneficiary.shares, 0);
  return (await SimpleToken.deployed()).transfer(
    MultiBeneficiaryTokenVesting.address,
    calculateNumberOfTokensForSharesPercentage(sharesSum),
  );
}

function calculateNumberOfTokensForSharesPercentage(shares) {
  return tokenSettings.amount * shares / 100;
}

async function addBeneficiariesToVestingContract(owner) {
  return Promise.all(
    beneficiaries.map(async (beneficiary) => {
      (await MultiBeneficiaryTokenVesting.deployed()).addBeneficiary(
        beneficiary.address,
        beneficiary.shares,
      );
    }),
  );
}

async function transferRemainingTokensToCrowdsale(owner) {
  (await SimpleToken.deployed()).transfer(
    GenericCrowdsale.address,
    calculateRemainingTokens(),
  );
}

function calculateRemainingTokens() {
  return tokenSettings.amount * calculateRemainingTokensPercentage() / 100;
}

function calculateRemainingTokensPercentage() {
  return beneficiaries.reduce((remaning, beneficiary) => remaning - beneficiary.shares, 100);
}

async function displaySummary() {
  const vestingInstance = (await MultiBeneficiaryTokenVesting.deployed());
  const tokenInstance = (await SimpleToken.deployed());
  console.log(`
    ==========================================================================================

       Deployed Contracts:

       SimpleToken: ${SimpleToken.address}
       GenericCrowdsal: ${GenericCrowdsale.address}
       MultiBeneficiaryTokenVesting: ${MultiBeneficiaryTokenVesting.address}

       Balances:

       MultiBeneficiaryTokenVesting (${MultiBeneficiaryTokenVesting.address}) => ${await tokenInstance.balanceOf(MultiBeneficiaryTokenVesting.address)} tokens
       Crowdsale (${GenericCrowdsale.address}) => ${await tokenInstance.balanceOf(GenericCrowdsale.address)} tokens

       Beneficiaries:

       ${
  beneficiaries.map(b => `${b.address} => ${vestingInstance.contract.shares(b.address)} shares`).join("\n       ")
}

    ==========================================================================================
  `);
}
