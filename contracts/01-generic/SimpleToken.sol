pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/CappedToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";


contract SimpleToken is DetailedERC20, StandardToken {
  constructor(
    string _name,
    string _symbol,
    uint8 _decimals,
    uint256 _amount
  )
    DetailedERC20(_name, _symbol, _decimals)
    public
  {
    totalSupply_ = _amount.mul(10 ** uint256(_decimals));
    balances[msg.sender] = totalSupply_;
    emit Transfer(address(0), msg.sender, totalSupply_);
  }
}
