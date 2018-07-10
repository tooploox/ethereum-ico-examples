pragma solidity 0.4.24;

import "truffle/Assert.sol";
import "../../contracts/SimpleToken.sol";
import "../../contracts/01-generic/GenericCrowdsale.sol";


contract GenericCrowdsaleTest {
  GenericCrowdsale crowdsale;
  SimpleToken token;
  uint256 public constant TOTAL_SUPPLY = 30000000;
  uint256 public constant RATE = 10000;
  uint8 public constant DECIMAL_PLACES = 5;

  // solium-disable-next-line security/no-block-members
  uint256 public openingTime = now + 1 days;
  uint256 public closingTime = openingTime + 1 days;

  function beforeEach() public {
    token = new SimpleToken("Tooploox", "TPX", DECIMAL_PLACES, TOTAL_SUPPLY);
    crowdsale = new GenericCrowdsale(openingTime, closingTime, RATE, address(this), token);
  }

  function testSettingToken() public {
    Assert.equal(crowdsale.token(), token, "token is invalid");
  }

  function testTransferSenderTotalSupply() public {
    Assert.equal(
      token.balanceOf(address(this)),
      TOTAL_SUPPLY * (10 ** uint256(DECIMAL_PLACES)),
      "total supply not transfered to the sender"
    );
  }

  function testSettingOpeningTime() public {
    Assert.equal(crowdsale.openingTime(), openingTime, "opening time is invalid");
  }

  function testSettingClosingTime() public {
    Assert.equal(crowdsale.closingTime(), closingTime, "closing time is invalid");
  }

  function testSettingRate() public {
    Assert.equal(crowdsale.rate(), RATE, "rate is invalid");
  }

  function testSettingWallet() public {
    Assert.equal(crowdsale.wallet(), address(this), "wallet is invalid");
  }
}
