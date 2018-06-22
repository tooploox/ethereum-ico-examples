pragma solidity 0.4.24;

import "truffle/Assert.sol";
import "../../contracts/SimpleToken.sol";
import "../../contracts/02-presale-multiple-rounds/PresaleCrowdsale.sol";


contract PresaleCrowdsaleTest {
  SimpleToken token;
  PresaleCrowdsale crowdsale;

  function beforeEach() public {
    token = new SimpleToken("Tooploox", "TPX", 18, 21000000);
    crowdsale = new PresaleCrowdsale(1000, address(this), token, address(this));
  }

  function testSettingDetails() public {
    Assert.equal(crowdsale.rate(), uint(1000), "rate is invalid");
    Assert.equal(crowdsale.wallet(), address(this), "wallet is invalid");
    Assert.equal(crowdsale.token(), address(token), "token is invalid");
    Assert.equal(crowdsale.tokenWallet(), address(this), "tokenWallet is invalid");
  }

  function testIntrustingCrowdsaleWithTokens() public {
    token.increaseApproval(address(crowdsale), 1000000);
    Assert.equal(crowdsale.remainingTokens(), 1000000, "remainingTokens is invalid");
  }
}
