pragma solidity 0.4.24;

import "truffle/Assert.sol";
import "../../contracts/SimpleToken.sol";
import "../../contracts/01-generic/GenericCrowdsale.sol";


contract GenericCrowdsaleTest {
  GenericCrowdsale crowdsale;
  SimpleToken token;
  uint256 public constant totalSupply = 30000000;
  uint256 public constant rate = 10000;
  uint8 public constant decimalPlaces = 5;
  uint256 public openingTime = now + 1 days;
  uint256 public closingTime = openingTime + 1 days;

  function beforeEach() public {
    token = new SimpleToken("Tooploox", "TPX", decimalPlaces, totalSupply);
    crowdsale = new GenericCrowdsale(openingTime, closingTime, rate, address(this), token);
  }

  function testSettingToken() public {
    Assert.equal(crowdsale.token(), token, "token is invalid");
  }

  function testTransferSenderTotalSupply() public {
    Assert.equal(
      token.balanceOf(address(this)),
      totalSupply * (10 ** uint256(decimalPlaces)),
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
    Assert.equal(crowdsale.rate(), rate, "rate is invalid");
  }

  function testSettingWallet() public {
    Assert.equal(crowdsale.wallet(), address(this), "wallet is invalid");
  }
}
