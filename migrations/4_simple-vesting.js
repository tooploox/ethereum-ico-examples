const now = Date.now() / 1000;
const day = 24 * 60 * 60;

const beneficiaries = [
  {
    name:    'developer1',
    address: '0x7319879Eb04477e39c2dbaA846470FEb7b2966e1',
    options: 15,
  },
  {
    name:    'developer2',
    address: '0x9e9Bf5E5D100f45a3527c7eacC84E0a185fc7E0D',
    options: 20,
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
  duration: 3 * 365 * day,
  revocable: false,
};

const crowdsaleSettings = {
  openingTime: now + day,
  closingTime: now + 2 * day,
  rate: 100,
};

const SimpleTokenVesting = artifacts.require("./03-token-vesting/SimpleTokenVesting.sol");
const SimpleToken = artifacts.require("./SimpleToken.sol");
const GenericCrowdsale = artifacts.require("./01-generic/GenericCrowdsale.sol");

module.exports = async (deployer, network, [owner]) => {
  const beneficiariesContracts = await deployTokenVestingContracts(deployer, beneficiaries);
  const tokenInstance = await deployToken(deployer);
  await deployCrowdsale(deployer, owner);
  await transferTokensToVestingContracts(tokenInstance, beneficiariesContracts, owner);
  await transferRemainingTokensToCrowdsale(tokenInstance, beneficiariesContracts, owner);
  displaySummary(tokenInstance, beneficiariesContracts);
};

function deployTokenVestingContracts(deployer, beneficiaries) {
  return Promise.all(
    beneficiaries.map(async (beneficiary) => {
      await deployer.deploy(
        SimpleTokenVesting,
        beneficiary.address,
        vestingSettings.start,
        vestingSettings.cliff,
        vestingSettings.duration,
        vestingSettings.revocable
      ).then((contractInstance) => {
        beneficiary.vestingContract = contractInstance.address;
      });
      return beneficiary;
    })
  );
}

function deployToken(deployer) {
  return deployer.deploy(
    SimpleToken,
    tokenSettings.name,
    tokenSettings.symbol,
    tokenSettings.decimals,
    tokenSettings.amount
  ).then((instance) => { return instance.contract } );
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

async function transferTokensToVestingContracts(tokenInstance, beneficiaries, owner) {
  beneficiaries.forEach((beneficiary) =>
  {
    tokenInstance.transfer(
      beneficiary.vestingContract,
      calculateNumberOfTokensPerBeneficiary(beneficiary),
      { from: owner }
    );
  });
}

function calculateNumberOfTokensPerBeneficiary(beneficiary) {
  return tokenSettings.amount * beneficiary.options / 100;
}

async function transferRemainingTokensToCrowdsale(tokenInstance, beneficiaries, owner) {
  tokenInstance.transfer(
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
    return remaning - beneficiary.options;
  }, 100);
}

function displaySummary(tokenInstance, beneficiariesContracts) {
  console.log(`
    ==========================================================================================

       Deployed Contracts:
      
       SimpleToken: ${SimpleToken.address}
       GenericCrowdsal: ${GenericCrowdsale.address}
  
       Deployed Vesting Contracts:
       ${beneficiariesContracts.map((b) => { return `${b.name} - ${b.vestingContract}` }).join("\n       ")}
       
       Balances:
       
       ${
          beneficiariesContracts.map((b) => { 
            return `${b.name} (${b.vestingContract}) => ${tokenInstance.balanceOf(b.vestingContract)} tokens` 
          }).join("\n       ")
       }
       Crowdsale (${GenericCrowdsale.address}) => ${tokenInstance.balanceOf(GenericCrowdsale.address)} tokens

    ==========================================================================================
  `)
}
