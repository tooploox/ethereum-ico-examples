pragma solidity 0.4.24;

import "truffle/Assert.sol";
import "../../contracts/01-generic/SimpleToken.sol";


contract TokenTest {
  SimpleToken token;
  uint256 public constant TOTAL_SUPPLY = 21000000000000000000000000;

  function beforeEach() public {
    token = new SimpleToken("Tooploox", "TPX", 18, 21000000);
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
