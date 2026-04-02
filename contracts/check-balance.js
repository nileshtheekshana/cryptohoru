const { ethers } = require('ethers');

const FAUCET_ADDRESS = '0x6917EfeA2705B18a017035D656746904aa15FDB1';
const RPC_URL = 'https://rpc.sepolia.org';

async function checkBalance() {
  console.log('Checking faucet contract balance...\n');
  console.log('Contract Address:', FAUCET_ADDRESS);
  console.log('Network: Sepolia Testnet\n');
  
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // Get contract balance
    const balance = await provider.getBalance(FAUCET_ADDRESS);
    console.log('Contract Balance:', ethers.formatEther(balance), 'ETH');
    
    if (balance === 0n) {
      console.log('\n❌ Contract has NO funds!');
      console.log('\nTo fund the contract:');
      console.log('1. Open MetaMask');
      console.log('2. Make sure you are on Sepolia network');
      console.log('3. Send ETH to:', FAUCET_ADDRESS);
      console.log('4. Wait for transaction confirmation');
    } else {
      console.log('\n✅ Contract is funded!');
      console.log('Users can claim:', ethers.formatEther(ethers.parseEther('0.1')), 'ETH per claim');
      console.log('Total claims available:', Number(balance / ethers.parseEther('0.1')));
    }
    
    console.log('\nView on Etherscan:');
    console.log('https://sepolia.etherscan.io/address/' + FAUCET_ADDRESS);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkBalance();
