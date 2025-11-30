const { ethers } = require('ethers');

const FAUCET_ADDRESS = '0x6917EfeA2705B18a017035D656746904aa15FDB1';
const RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/FqE_4ZTNSPzI0qDVKo6Gw';

const FAUCET_ABI = [
  'function getFaucetBalance() external view returns (uint256)',
  'function getFaucetStats() external view returns (uint256 balance, uint256 distributed, uint256 claims, uint256 faucetAmount)'
];

async function checkContract() {
  console.log('Checking contract deployment...\n');
  
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // Check if contract has code
    const code = await provider.getCode(FAUCET_ADDRESS);
    console.log('Contract has code:', code !== '0x' ? 'YES ✅' : 'NO ❌');
    console.log('Code length:', code.length, 'bytes\n');
    
    // Get balance
    const balance = await provider.getBalance(FAUCET_ADDRESS);
    console.log('Contract Balance (via provider):', ethers.formatEther(balance), 'ETH\n');
    
    // Try to call contract function
    const contract = new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, provider);
    
    console.log('Calling getFaucetStats()...');
    const stats = await contract.getFaucetStats();
    console.log('Stats from contract:');
    console.log('  Balance:', ethers.formatEther(stats.balance), 'ETH');
    console.log('  Distributed:', ethers.formatEther(stats.distributed), 'ETH');
    console.log('  Claims:', stats.claims.toString());
    console.log('  Amount per claim:', ethers.formatEther(stats.faucetAmount), 'ETH');
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

checkContract();
