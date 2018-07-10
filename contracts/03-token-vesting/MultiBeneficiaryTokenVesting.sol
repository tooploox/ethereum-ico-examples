pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Basic.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


contract MultiBeneficiaryTokenVesting is Ownable {
  using SafeMath for uint256;
  using SafeERC20 for ERC20Basic;

  event Released(address beneficiary, uint256 amount);

  ERC20Basic public token;
  uint256 public cliff;
  uint256 public start;
  uint256 public duration;

  mapping (address => uint256) public shares;

  uint256 released = 0;

  address[] public beneficiaries;

  modifier onlyBeneficiaries {
    require(msg.sender == owner || shares[msg.sender] > 0, "You cannot release tokens!");
    _;
  }

  constructor(
    ERC20Basic _token,
    uint256 _start,
    uint256 _cliff,
    uint256 _duration
  )
  public
  {
    require(_cliff <= _duration, "Cliff has to be lower or equal to duration");
    token = _token;
    duration = _duration;
    cliff = _start.add(_cliff);
    start = _start;
  }

  function addBeneficiary(address _beneficiary, uint256 _sharesAmount) onlyOwner public {
    require(_beneficiary != address(0), "The beneficiary's address cannot be 0");
    require(_sharesAmount > 0, "Shares amount has to be greater than 0");

    releaseAllTokens();

    if (shares[_beneficiary] == 0) {
      beneficiaries.push(_beneficiary);
    }

    shares[_beneficiary] = shares[_beneficiary].add(_sharesAmount);
  }

  function releaseAllTokens() onlyBeneficiaries public {
    uint256 unreleased = releasableAmount();

    if (unreleased > 0) {
      uint beneficiariesCount = beneficiaries.length;

      released = released.add(unreleased);

      for (uint i = 0; i < beneficiariesCount; i++) {
        release(beneficiaries[i], calculateShares(unreleased, beneficiaries[i]));
      }
    }
  }

  function releasableAmount() public view returns (uint256) {
    return vestedAmount().sub(released);
  }

  function calculateShares(uint256 _amount, address _beneficiary) public view returns (uint256) {
    return _amount.mul(shares[_beneficiary]).div(totalShares());
  }

  function totalShares() public view returns (uint256) {
    uint sum = 0;
    uint beneficiariesCount = beneficiaries.length;

    for (uint i = 0; i < beneficiariesCount; i++) {
      sum = sum.add(shares[beneficiaries[i]]);
    }

    return sum;
  }

  function vestedAmount() public view returns (uint256) {
    uint256 currentBalance = token.balanceOf(this);
    uint256 totalBalance = currentBalance.add(released);

    // solium-disable security/no-block-members
    if (block.timestamp < cliff) {
      return 0;
    } else if (block.timestamp >= start.add(duration)) {
      return totalBalance;
    } else {
      return totalBalance.mul(block.timestamp.sub(start)).div(duration);
    }
    // solium-enable security/no-block-members
  }

  function release(address _beneficiary, uint256 _amount) private {
    token.safeTransfer(_beneficiary, _amount);
    emit Released(_beneficiary, _amount);
  }
}
