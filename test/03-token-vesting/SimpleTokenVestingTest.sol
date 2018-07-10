pragma solidity 0.4.24;

import "truffle/Assert.sol";
import "../../contracts/03-token-vesting/SimpleTokenVesting.sol";


contract SimpleTokenVestingTest {
  SimpleTokenVesting vesting;
  address beneficiary = 0x7319879Eb04477e39c2dbaA846470FEb7b2966e1;
  // solium-disable-next-line security/no-block-members
  uint256 start = now + 1 days;
  uint256 cliff = 365 days;
  uint256 duration = 3 * 365 days;
  bool revocable = false;

  function beforeEach() public {
    vesting = new SimpleTokenVesting(beneficiary, start, cliff, duration, revocable);
  }

  function testSettingDetails() public {
    Assert.equal(vesting.beneficiary(), beneficiary, "beneficiary is invalid");
    Assert.equal(vesting.start(), start, "start is invalid");
    Assert.equal(vesting.cliff(), start + cliff, "cliff is invalid");
    Assert.equal(vesting.duration(), duration, "duration is invalid");
    Assert.equal(vesting.revocable(), revocable, "revocable is invalid");
  }
}
