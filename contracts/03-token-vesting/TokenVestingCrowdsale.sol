pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/TokenVesting.sol";
import "openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./SimpleTokenVesting.sol";


contract TokenVestingCrowdsale is Ownable {
  mapping(address => uint8) beneficiariesOptions;
  mapping(address => bytes32) beneficiariesNames;
  mapping(address => TokenVesting) public beneficiariesTokenVestingContracts;
  address[] beneficiariesList;

  event VestingTokenContractDeployed(TokenVesting _tokenVestingContract);
  event Calculated(uint256);

  ERC20 token;
  Crowdsale crowdsale;
  uint256 start;
  uint256 cliff;
  uint256 duration;
  uint256 totalSupply;
  bool revocable;

  bool tokenVestingContractsDeployed = false;

  constructor(
    Crowdsale _crowdsale,
    uint256 _start,
    uint256 _cliff,
    uint256 _duration,
    bool _revocable
  )
    public
  {
    crowdsale = _crowdsale;
    start = _start;
    cliff = _cliff;
    duration = _duration;
    revocable = _revocable;
    token = crowdsale.token();
  }

  function refreshTokenTotalSupply() {
    require(tokenVestingContractsDeployed == false, "Tokes already transfered");

    totalSupply = token.balanceOf(address(this));
  }

  function addBeneficiary(bytes32 _name, address _address, uint8 _options) onlyOwner public {
    require(tokenVestingContractsDeployed == false, "Tokes already transfered");

    beneficiariesList.push(_address);
    beneficiariesNames[_address] = _name;
    beneficiariesOptions[_address] = _options;
  }

  function getBeneficiariesCount() public constant returns(uint count) {
    return beneficiariesList.length;
  }

  function areVestingContractsDeployed() public constant returns(bool) {
    return tokenVestingContractsDeployed;
  }

  function deployVestingTokens() onlyOwner public {
    require(tokenVestingContractsDeployed == false, "Tokes already transfered");
    require(beneficiariesList.length > 0, "Beneficiares are not defined");

    uint _arrayLength = beneficiariesList.length;
    for (uint i=0; i < _arrayLength; i++) {
      address _beneficiary = beneficiariesList[i];
      TokenVesting tokenVestingContract = new TokenVesting(_beneficiary, start, cliff, duration, revocable);
      beneficiariesTokenVestingContracts[_beneficiary] = tokenVestingContract;
      emit VestingTokenContractDeployed(tokenVestingContract);
      emit Calculated(totalSupply);
      token.transfer(address(tokenVestingContract), calculateNumberOfTokensPerBeneficiary(_beneficiary));
    }

    transferRemainingTokensToCrowdsale();

    tokenVestingContractsDeployed = true;
  }

  function calculateNumberOfTokensPerBeneficiary(address _beneficiary) returns(uint256) {
    return totalSupply * beneficiariesOptions[_beneficiary] / 100;
  }

  function transferRemainingTokensToCrowdsale() {
    token.transfer(address(crowdsale), token.balanceOf(address(this)));
  }
}
