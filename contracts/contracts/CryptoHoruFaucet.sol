// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CryptoHoruFaucet
 * @dev Testnet token faucet with daily limits per address
 */
contract CryptoHoruFaucet {
    // Owner of the contract
    address public owner;
    
    // Token amount to distribute (in wei)
    uint256 public constant FAUCET_AMOUNT = 0.1 ether; // 0.1 tokens per request
    
    // Cooldown period (24 hours in seconds)
    uint256 public constant COOLDOWN_TIME = 24 hours;
    
    // Minimum contract balance to operate
    uint256 public constant MIN_BALANCE = 1 ether;
    
    // Maximum daily claims per address
    uint256 public constant MAX_DAILY_CLAIMS = 1;
    
    // Track last claim time for each address
    mapping(address => uint256) public lastClaimTime;
    
    // Track daily claim count
    mapping(address => mapping(uint256 => uint256)) public dailyClaims;
    
    // Total tokens distributed
    uint256 public totalDistributed;
    
    // Total number of claims
    uint256 public totalClaims;
    
    // Events
    event TokensClaimed(address indexed claimer, uint256 amount, uint256 timestamp);
    event FaucetFunded(address indexed funder, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    /**
     * @dev Constructor sets the owner
     */
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Request tokens from faucet
     */
    function requestTokens() external {
        address claimer = msg.sender;
        
        // Check if contract has enough balance
        require(address(this).balance >= FAUCET_AMOUNT, "Faucet is empty. Please try again later.");
        
        // Check cooldown period
        require(
            block.timestamp >= lastClaimTime[claimer] + COOLDOWN_TIME,
            "Please wait 24 hours between claims"
        );
        
        // Check daily limit
        uint256 currentDay = block.timestamp / 1 days;
        require(
            dailyClaims[claimer][currentDay] < MAX_DAILY_CLAIMS,
            "Daily claim limit reached"
        );
        
        // Check if claimer is a contract
        require(!isContract(claimer), "Contracts cannot claim from faucet");
        
        // Update claim records
        lastClaimTime[claimer] = block.timestamp;
        dailyClaims[claimer][currentDay]++;
        totalDistributed += FAUCET_AMOUNT;
        totalClaims++;
        
        // Transfer tokens
        (bool success, ) = payable(claimer).call{value: FAUCET_AMOUNT}("");
        require(success, "Token transfer failed");
        
        emit TokensClaimed(claimer, FAUCET_AMOUNT, block.timestamp);
    }
    
    /**
     * @dev Check if address can claim
     */
    function canClaim(address _address) external view returns (bool) {
        if (address(this).balance < FAUCET_AMOUNT) return false;
        if (isContract(_address)) return false;
        if (block.timestamp < lastClaimTime[_address] + COOLDOWN_TIME) return false;
        
        uint256 currentDay = block.timestamp / 1 days;
        if (dailyClaims[_address][currentDay] >= MAX_DAILY_CLAIMS) return false;
        
        return true;
    }
    
    /**
     * @dev Get time remaining until next claim
     */
    function getTimeUntilNextClaim(address _address) external view returns (uint256) {
        uint256 nextClaimTime = lastClaimTime[_address] + COOLDOWN_TIME;
        if (block.timestamp >= nextClaimTime) {
            return 0;
        }
        return nextClaimTime - block.timestamp;
    }
    
    /**
     * @dev Get remaining daily claims
     */
    function getRemainingDailyClaims(address _address) external view returns (uint256) {
        uint256 currentDay = block.timestamp / 1 days;
        uint256 claimed = dailyClaims[_address][currentDay];
        if (claimed >= MAX_DAILY_CLAIMS) return 0;
        return MAX_DAILY_CLAIMS - claimed;
    }
    
    /**
     * @dev Check if address is a contract
     */
    function isContract(address _address) internal view returns (bool) {
        uint32 size;
        assembly {
            size := extcodesize(_address)
        }
        return (size > 0);
    }
    
    /**
     * @dev Fund the faucet
     */
    function fundFaucet() external payable {
        require(msg.value > 0, "Must send tokens to fund faucet");
        emit FaucetFunded(msg.sender, msg.value);
    }
    
    /**
     * @dev Withdraw tokens (owner only)
     */
    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
    
    /**
     * @dev Get faucet balance
     */
    function getFaucetBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get faucet stats
     */
    function getFaucetStats() external view returns (
        uint256 balance,
        uint256 distributed,
        uint256 claims,
        uint256 faucetAmount
    ) {
        return (
            address(this).balance,
            totalDistributed,
            totalClaims,
            FAUCET_AMOUNT
        );
    }
    
    /**
     * @dev Receive function to accept direct transfers
     */
    receive() external payable {
        emit FaucetFunded(msg.sender, msg.value);
    }
    
    /**
     * @dev Fallback function
     */
    fallback() external payable {
        emit FaucetFunded(msg.sender, msg.value);
    }
}
