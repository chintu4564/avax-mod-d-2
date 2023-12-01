// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    uint public pin;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event PinSet(uint256 newPin);
    event OddCubeResult(uint256 input, uint256 result);
    event SelfDestruct(address indexed beneficiary, uint256 remainingBalance);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
        pin = 1001;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;
        require(msg.sender == owner, "You are not the owner of this account");
        balance += _amount;
        assert(balance == _previousBalance + _amount);
        emit Deposit(_amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }
        balance -= _withdrawAmount;
        assert(balance == (_previousBalance - _withdrawAmount));
        emit Withdraw(_withdrawAmount);
    }

    function setPin(uint _newPin) public {
        require(msg.sender == owner, "You are not the owner of this account");
        pin = _newPin;
        emit PinSet(_newPin);
    }

    function oddCube(uint256 _input) public {
        require(msg.sender == owner, "You are not the owner of this account");
        require(_input % 2 != 0, "Input must be an odd number");
        uint256 result = _input * _input * _input;
        emit OddCubeResult(_input, result);
    }

    function selfDestruct(address payable _beneficiary) public {
        require(msg.sender == owner, "You are not the owner of this account");
        _beneficiary.transfer(balance);
        emit SelfDestruct(_beneficiary, balance);
        selfDestruct(_beneficiary);
    }
}
