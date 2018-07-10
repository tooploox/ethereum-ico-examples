pragma solidity 0.4.24;

import "truffle/Assert.sol";
import "../../contracts/SimpleToken.sol";
import "../../contracts/02-presale-multiple-rounds/RoundCrowdsale.sol";


contract RoundCrowdsaleTest {
  SimpleToken token;
  RoundCrowdsale crowdsale;

  // solium-disable security/no-block-members
  uint256 openingTime = now;
  uint256 closingTime = now + 2 days;
  // solium-enable security/no-block-members

  uint256 public initialBalance = 1 ether;

  function () public payable {}

  function beforeEach() public {
    token = new SimpleToken("Tooploox", "TPX", 18, 21000000);
    crowdsale = new RoundCrowdsale(
      1000,
      address(this),
      token,
      address(this),
      openingTime,
      closingTime
    );
    token.increaseApproval(address(crowdsale), 1000 * 1 ether);
  }

  function testSettingDetails() public {
    Assert.equal(crowdsale.rate(), uint(1000), "rate is invalid");
    Assert.equal(crowdsale.wallet(), address(this), "wallet is invalid");
    Assert.equal(crowdsale.token(), address(token), "token is invalid");
    Assert.equal(crowdsale.tokenWallet(), address(this), "tokenWallet is invalid");
    Assert.equal(crowdsale.openingTime(), openingTime, "openingTime is invalid");
    Assert.equal(crowdsale.closingTime(), closingTime, "closingTime is invalid");
  }

  function testIntrustingCrowdsaleWithTokens() public {
    Assert.equal(crowdsale.remainingTokens(), 1000 * 1 ether, "remainingTokens is invalid");
  }
}
