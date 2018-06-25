pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/emission/AllowanceCrowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/validation/WhitelistedCrowdsale.sol";


contract PresaleCrowdsale is AllowanceCrowdsale, WhitelistedCrowdsale {
  constructor(
    uint256 _rate,
    address _wallet,
    ERC20 _token,
    address _tokenWallet
  )
    Crowdsale(_rate, _wallet, _token)
    AllowanceCrowdsale(_tokenWallet)
    public
  {}
}
