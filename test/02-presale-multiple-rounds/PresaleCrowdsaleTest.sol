pragma solidity 0.4.24;

import "truffle/Assert.sol";
import "../../contracts/SimpleToken.sol";
import "../../contracts/02-presale-multiple-rounds/PresaleCrowdsale.sol";


contract PresaleCrowdsaleTest {
  SimpleToken token;
  PresaleCrowdsale crowdsale;
  uint256 public initialBalance = 1 ether;

  function () public payable {}

  function beforeEach() public {
    token = new SimpleToken("Tooploox", "TPX", 18, 21000000);
    crowdsale = new PresaleCrowdsale(1000, address(this), token, address(this));
    token.increaseApproval(address(crowdsale), 1000 * 1 ether);
  }

  function testSettingDetails() public {
    Assert.equal(crowdsale.rate(), uint(1000), "rate is invalid");
    Assert.equal(crowdsale.wallet(), address(this), "wallet is invalid");
    Assert.equal(crowdsale.token(), address(token), "token is invalid");
    Assert.equal(crowdsale.tokenWallet(), address(this), "tokenWallet is invalid");
  }

  function testIntrustingCrowdsaleWithTokens() public {
    Assert.equal(crowdsale.remainingTokens(), 1000 * 1 ether, "remainingTokens is invalid");
  }

  function testDisallowBuyingNotWhitelisted() public {
    // solium-disable-next-line security/no-call-value
    bool result = address(crowdsale).call.value(0.1 ether)(
      bytes4(keccak256("buyTokens(address)")),
      address(this)
    );
    Assert.equal(result, false, "allows buying not whitelisted users");
  }

  function testAllowBuyingWhitelisted() public {
    crowdsale.addToWhitelist(address(this));
    // solium-disable-next-line security/no-call-value
    bool result = address(crowdsale).call.value(0.1 ether)(
      bytes4(keccak256("buyTokens(address)")),
      address(this)
    );
    Assert.equal(result, true, "disallows buying whitelisted users");
    crowdsale.removeFromWhitelist(address(this));
  }
}
