pragma solidity 0.4.24;

import "truffle/Assert.sol";
import "../../contracts/SimpleToken.sol";
import "../../contracts/01-generic/GenericCrowdsale.sol";
import "../../contracts/03-token-vesting/TokenVestingCrowdsale.sol";

contract TokenVestingCrowdsaleTest {

  SimpleTokenVesting vesting;
  GenericCrowdsale crowdsale;
  SimpleToken token;
  TokenVestingCrowdsale tokenVestingCrowdsale;

  address beneficiary1 = 0x7319879Eb04477e39c2dbaA846470FEb7b2966e1;
  address beneficiary2 = 0xa2164D11832e1De722c24ed87C82c53318f23b87;

  uint256 start = now + 1 days;
  uint256 cliff = 365 days;
  uint256 duration = 3 * 365 days;
  bool revocable = false;

  uint256 public constant TOTAL_SUPPLY = 30000000;
  uint256 public constant RATE = 10000;
  uint8 public constant DECIMAL_PLACES = 5;
  uint256 public OPENING_TIME = now + 1 days;
  uint256 public CLOSING_TIME = OPENING_TIME + 1 days;


  function beforeEach() public {
    token = new SimpleToken("Tooploox", "TPX", DECIMAL_PLACES, TOTAL_SUPPLY);
    crowdsale = new GenericCrowdsale(OPENING_TIME, CLOSING_TIME, RATE, address(this), token);
    tokenVestingCrowdsale = new TokenVestingCrowdsale(crowdsale, start, cliff, duration, revocable);
    token.transfer(address(tokenVestingCrowdsale), TOTAL_SUPPLY);
    tokenVestingCrowdsale.refreshTokenTotalSupply();
  }

  function testAddingBeneficiaries() public {
    tokenVestingCrowdsale.addBeneficiary('beneficiary1', beneficiary1, 20);
    tokenVestingCrowdsale.addBeneficiary('beneficiary2', beneficiary2, 15);

    Assert.equal(tokenVestingCrowdsale.getBeneficiariesCount(), 2, "beneficiaries are not added");
  }

  function testDeploingVestingContracts() public {
    tokenVestingCrowdsale.addBeneficiary('beneficiary1', beneficiary1, 20);
    tokenVestingCrowdsale.addBeneficiary('beneficiary2', beneficiary2, 15);

    tokenVestingCrowdsale.deployVestingTokens();

    Assert.equal(tokenVestingCrowdsale.areVestingContractsDeployed(), true, "Token vesting contracts not deployed");

    Assert.equal(token.balanceOf(tokenVestingCrowdsale.beneficiariesTokenVestingContracts(beneficiary1)), 6000000, "Balance is wrong");
    Assert.equal(token.balanceOf(tokenVestingCrowdsale.beneficiariesTokenVestingContracts(beneficiary2)), 4500000, "Balance is wrong");
    Assert.equal(token.balanceOf(address(crowdsale)), 19500000, "Balance is wrong");

    Assert.equal(token.balanceOf(address(this)), 0, "Didn't transfer all tokens");
  }
}
