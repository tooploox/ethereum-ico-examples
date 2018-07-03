const now = Date.now() / 1000;
const day = 24 * 60 * 60;

const beneficiaries = [
  {
    address: '0x7319879Eb04477e39c2dbaA846470FEb7b2966e1',
    shares:  15,
  },
  {
    address: '0x9e9Bf5E5D100f45a3527c7eacC84E0a185fc7E0D',
    shares:  20,
  }
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
  duration: 3 * 365 * day
};

const crowdsaleSettings = {
  openingTime: now + day,
  closingTime: now + 2 * day,
  rate: 100,
};

const GenericCrowdsale = artifacts.require("./01-generic/GenericCrowdsale.sol");
const SimpleToken = artifacts.require("./SimpleToken.sol");
const MultiBeneficiaryTokenVesting = artifacts.require("./03-token-vesting/MultiBeneficiaryTokenVesting.sol");

module.exports = async (deployer, network, [owner]) => {
  await deployToken(deployer);
  await deployer.link(SimpleToken, [MultiBeneficiaryTokenVesting, GenericCrowdsale]);
  await deployMultiBeneficiaryTokenVestingContract(deployer);
  await transferTokensToVestingContract(beneficiaries, owner);
  await addBeneficiariesToVestingContract(beneficiaries, owner);
  await deployCrowdsale(deployer, owner);
  await transferRemainingTokensToCrowdsale(beneficiaries, owner);
  await displaySummary();
};

function deployToken(deployer) {
  return deployer.deploy(
    SimpleToken,
    tokenSettings.name,
    tokenSettings.symbol,
    tokenSettings.decimals,
    tokenSettings.amount
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
    SimpleToken.address
  );
}

async function transferTokensToVestingContract(beneficiaries, owner) {
  const sharesSum = beneficiaries.reduce((sharesSum, beneficiary) => sharesSum + beneficiary.shares, 0);

  return (await getInstance(SimpleToken)).transfer(
    MultiBeneficiaryTokenVesting.address,
    calculateNumberOfTokensForSharesPercentage(sharesSum),
    { from: owner }
  );
}

function calculateNumberOfTokensForSharesPercentage(shares) {
  return tokenSettings.amount * shares / 100;
}

async function addBeneficiariesToVestingContract(beneficiaries, owner) {
  return Promise.all(
    beneficiaries.map(async (beneficiary) => {
      (await getInstance(MultiBeneficiaryTokenVesting)).addBeneficiary(
        beneficiary.address,
        beneficiary.shares,
        { from: owner }
      );
    })
  );
}

async function transferRemainingTokensToCrowdsale(beneficiaries, owner) {
  (await getInstance(SimpleToken)).transfer(
    GenericCrowdsale.address,
    calculateRemainingTokens(beneficiaries),
    { from: owner }
  );
}

function calculateRemainingTokens(beneficiaries) {
  return tokenSettings.amount * calculateRemainingTokensPercentage(beneficiaries) / 100;
}

function calculateRemainingTokensPercentage(beneficiaries) {
  return beneficiaries.reduce((remaning, beneficiary) => {
    return remaning - beneficiary.shares;
  }, 100);
}

async function displaySummary() {
  const vestingInstance = (await getInstance(MultiBeneficiaryTokenVesting));
  console.log(`
    ==========================================================================================

       Deployed Contracts:

       SimpleToken: ${SimpleToken.address}
       GenericCrowdsal: ${GenericCrowdsale.address}
       MultiBeneficiaryTokenVesting: ${MultiBeneficiaryTokenVesting.address}

       Balances:

       MultiBeneficiaryTokenVesting (${MultiBeneficiaryTokenVesting.address}) => ${(await getInstance(SimpleToken)).balanceOf(MultiBeneficiaryTokenVesting.address)} tokens
       Crowdsale (${GenericCrowdsale.address}) => ${(await getInstance(SimpleToken)).balanceOf(GenericCrowdsale.address)} tokens
       
       Beneficiaries:
       
       ${
          beneficiaries.map((b) => {
            return `${b.address} => ${vestingInstance.shares(b.address)} shares` 
          }).join("\n       ")
       }

    ==========================================================================================
  `)
}

async function getInstance(contract) {
  return (await contract.deployed()).contract
}
