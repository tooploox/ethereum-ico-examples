pragma solidity 0.4.24;

import "truffle/Assert.sol";
import "../../contracts/03-token-vesting/MultiBeneficiaryTokenVesting.sol";
import "../../contracts/SimpleToken.sol";


contract MultiBeneficiaryTokenVestingTest {
  SimpleToken token;
  MultiBeneficiaryTokenVesting vesting;

  address beneficiary1 = 0x7319879Eb04477e39c2dbaA846470FEb7b2966e1;
  address beneficiary2 = 0xa2164D11832e1De722c24ed87C82c53318f23b87;
  address beneficiary3 = 0x9e9Bf5E5D100f45a3527c7eacC84E0a185fc7E0D;
  address beneficiary4 = 0xDEb2C03f17614d1543997AfD86fe7072bFAA36ac;

  // solium-disable-next-line security/no-block-members
  uint256 start = now + 1 days;
  uint256 cliff = 365 days;
  uint256 duration = 3 * 365 days;

  function beforeEach() public {
    token = new SimpleToken("Tooploox", "TPX", 5, 21000000);
    vesting = new MultiBeneficiaryTokenVesting(token, start, cliff, duration);
    token.transfer(vesting, token.balanceOf(address(this)));
  }

  function testSettingDetails() public {
    Assert.equal(vesting.start(), start, "start is invalid");
    Assert.equal(vesting.cliff(), start + cliff, "cliff is invalid");
    Assert.equal(vesting.duration(), duration, "duration is invalid");
    Assert.equal(vesting.token(), address(token), "token is invalid");
  }

  function testAddingBeneficiaries() public {
    vesting.addBeneficiary(beneficiary1, 20);
    vesting.addBeneficiary(beneficiary2, 25);
    vesting.addBeneficiary(beneficiary3, 15);

    Assert.equal(vesting.shares(beneficiary1), 20, "beneficiary1 has wrong number of shares");
    Assert.equal(vesting.shares(beneficiary2), 25, "beneficiary2 has wrong number of shares");
    Assert.equal(vesting.shares(beneficiary3), 15, "beneficiary3 has wrong number of shares");

    Assert.equal(vesting.totalShares(), 20 + 25 + 15, "Total shares number is invalid");

    vesting.addBeneficiary(beneficiary3, 30);

    Assert.equal(vesting.shares(beneficiary3), 45, "beneficiary3 has wrong number of shares");
  }

  function testCalculatingShares() public {
    vesting.addBeneficiary(beneficiary1, 30);
    vesting.addBeneficiary(beneficiary2, 30);

    Assert.equal(vesting.calculateShares(1000, beneficiary1), 500, "Number of shares is wrong");
    Assert.equal(vesting.calculateShares(1000, beneficiary2), 500, "Number of shares is wrong");

    vesting.addBeneficiary(beneficiary3, 30);

    Assert.equal(vesting.calculateShares(1000, beneficiary1), 333, "Number of shares is wrong");
    Assert.equal(vesting.calculateShares(1000, beneficiary2), 333, "Number of shares is wrong");
    Assert.equal(vesting.calculateShares(1000, beneficiary3), 333, "Number of shares is wrong");

    vesting.addBeneficiary(beneficiary4, 1);

    Assert.equal(vesting.calculateShares(1000, beneficiary1), 329, "Number of shares is wrong");
    Assert.equal(vesting.calculateShares(1000, beneficiary2), 329, "Number of shares is wrong");
    Assert.equal(vesting.calculateShares(1000, beneficiary3), 329, "Number of shares is wrong");
    Assert.equal(vesting.calculateShares(1000, beneficiary4), 10, "Number of shares is wrong");
  }
}
