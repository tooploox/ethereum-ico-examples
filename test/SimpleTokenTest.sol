pragma solidity 0.4.24;

import "truffle/Assert.sol";
import "../contracts/SimpleToken.sol";


contract SimpleTokenTest {
  SimpleToken token;
  uint256 public constant TOTAL_SUPPLY = 21000000000000000000000000;

  function beforeEach() public {
    token = new SimpleToken("Tooploox", "TPX", 18, 21000000);
  }

  function testSettingDetails() public {
    Assert.equal(token.name(), "Tooploox", "name is invalid");
    Assert.equal(token.symbol(), "TPX", "symbol is invalid");
    Assert.equal(uint(token.decimals()), uint(18), "decimals is invalid");
  }

  function testSettingTotalSupply() public {
    Assert.equal(token.totalSupply(), TOTAL_SUPPLY, "total supply is invalid");
  }

  function testTransferSenderTotalSupply() public {
    Assert.equal(
      token.balanceOf(address(this)),
      TOTAL_SUPPLY,
      "total supply not transfered to the sender"
    );
  }
}
