'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { FaFaucet, FaWallet, FaCheckCircle, FaClock, FaCoins } from 'react-icons/fa';

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Replace with your deployed contract address
const FAUCET_CONTRACT_ADDRESS = '0x6917EfeA2705B18a017035D656746904aa15FDB1'; // Update after deployment

const FAUCET_ABI = [
  'function requestTokens() external',
  'function canClaim(address) external view returns (bool)',
  'function getTimeUntilNextClaim(address) external view returns (uint256)',
  'function getRemainingDailyClaims(address) external view returns (uint256)',
  'function getFaucetStats() external view returns (uint256 balance, uint256 distributed, uint256 claims, uint256 faucetAmount)',
  'function FAUCET_AMOUNT() external view returns (uint256)',
  'event TokensClaimed(address indexed claimer, uint256 amount, uint256 timestamp)'
];

export default function FaucetPage() {
  const [account, setAccount] = useState<string>('');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState(0);
  const [remainingClaims, setRemainingClaims] = useState(0);
  const [faucetStats, setFaucetStats] = useState({
    balance: '0',
    distributed: '0',
    claims: 0,
    amount: '0'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load basic faucet stats on page load (without wallet connection)
  useEffect(() => {
    loadBasicFaucetStats();
  }, []);

  useEffect(() => {
    if (account && contract) {
      loadFaucetData();
    }
  }, [account, contract]);

  useEffect(() => {
    if (timeUntilNext > 0) {
      const interval = setInterval(() => {
        setTimeUntilNext(prev => {
          if (prev <= 1) {
            loadFaucetData();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timeUntilNext]);

  const loadBasicFaucetStats = async () => {
    try {
      console.log('Loading basic faucet stats (no wallet)...');
      
      // Use public RPC provider to fetch balance
      const publicProvider = new ethers.JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/FqE_4ZTNSPzI0qDVKo6Gw');
      
      // Get contract balance
      const balance = await publicProvider.getBalance(FAUCET_CONTRACT_ADDRESS);
      console.log('Faucet balance:', ethers.formatEther(balance), 'ETH');
      
      // Create read-only contract instance
      const readOnlyContract = new ethers.Contract(
        FAUCET_CONTRACT_ADDRESS,
        FAUCET_ABI,
        publicProvider
      );
      
      // Get stats from contract
      const stats = await readOnlyContract.getFaucetStats();
      
      setFaucetStats({
        balance: ethers.formatEther(balance),
        distributed: ethers.formatEther(stats.distributed),
        claims: Number(stats.claims),
        amount: ethers.formatEther(stats.faucetAmount)
      });
      
      console.log('Basic stats loaded successfully');
    } catch (err: any) {
      console.error('Error loading basic stats:', err);
      // Set default values on error
      setFaucetStats({
        balance: '0',
        distributed: '0',
        claims: 0,
        amount: '0.1'
      });
    }
  };

  const connectWallet = async () => {
    console.log('Connect wallet button clicked');
    setError('');
    setLoading(true);

    try {
      console.log('Checking for MetaMask...');
      console.log('window.ethereum exists:', !!window.ethereum);
      
      if (!window.ethereum) {
        setError('Please install MetaMask to use this faucet');
        setLoading(false);
        return;
      }

      console.log('Creating BrowserProvider...');
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      
      console.log('Requesting accounts...');
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      console.log('Connected account:', accounts[0]);
      
      // Check if user is on Sepolia network (chainId: 11155111)
      console.log('Checking network...');
      const network = await browserProvider.getNetwork();
      console.log('Connected to network:', network.chainId.toString());
      
      if (Number(network.chainId) !== 11155111) {
        setError('Please switch to Sepolia testnet in MetaMask');
        setLoading(false);
        return;
      }
      
      console.log('Setting account and provider...');
      setAccount(accounts[0]);
      setProvider(browserProvider);

      console.log('Creating contract instance...');
      const signer = await browserProvider.getSigner();
      const faucetContract = new ethers.Contract(
        FAUCET_CONTRACT_ADDRESS,
        FAUCET_ABI,
        signer
      );
      
      setContract(faucetContract);
      console.log('Contract set successfully');

      // Listen to account changes
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          console.log('Account changed:', accounts[0]);
          if (accounts.length === 0) {
            setAccount('');
            setContract(null);
          } else {
            setAccount(accounts[0]);
          }
        });
        
        // Listen to network changes
        window.ethereum.on('chainChanged', () => {
          console.log('Network changed, reloading...');
          window.location.reload();
        });
      }

    } catch (err: any) {
      console.error('Connect wallet error:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const loadFaucetData = async () => {
    if (!contract || !account || !provider) return;

    try {
      console.log('Loading faucet data...');
      console.log('Contract address:', FAUCET_CONTRACT_ADDRESS);
      console.log('User account:', account);
      
      // Get balance directly from provider as backup
      const directBalance = await provider.getBalance(FAUCET_CONTRACT_ADDRESS);
      console.log('Direct balance from provider:', ethers.formatEther(directBalance), 'ETH');
      
      const [canClaimResult, timeResult, remainingResult, stats] = await Promise.all([
        contract.canClaim(account),
        contract.getTimeUntilNextClaim(account),
        contract.getRemainingDailyClaims(account),
        contract.getFaucetStats()
      ]);

      console.log('Faucet stats from contract:', {
        balance: ethers.formatEther(stats.balance),
        distributed: ethers.formatEther(stats.distributed),
        claims: Number(stats.claims),
        amount: ethers.formatEther(stats.faucetAmount)
      });

      setCanClaim(canClaimResult);
      setTimeUntilNext(Number(timeResult));
      setRemainingClaims(Number(remainingResult));
      
      // Use direct balance if contract balance is 0 but direct balance isn't
      const finalBalance = stats.balance === BigInt(0) && directBalance > BigInt(0)
        ? directBalance 
        : stats.balance;
      
      setFaucetStats({
        balance: ethers.formatEther(finalBalance),
        distributed: ethers.formatEther(stats.distributed),
        claims: Number(stats.claims),
        amount: ethers.formatEther(stats.faucetAmount)
      });
    } catch (err: any) {
      console.error('Error loading faucet data:', err);
      setError('Failed to load faucet data: ' + err.message);
    }
  };

  const claimTokens = async () => {
    if (!contract) return;

    setError('');
    setSuccess('');
    setClaiming(true);

    try {
      const tx = await contract.requestTokens();
      setSuccess('Transaction submitted! Waiting for confirmation...');
      
      await tx.wait();
      
      setSuccess(`Successfully claimed ${faucetStats.amount} tokens! 🎉`);
      await loadFaucetData();
      
    } catch (err: any) {
      if (err.message.includes('user rejected')) {
        setError('Transaction was rejected');
      } else if (err.message.includes('wait 24 hours')) {
        setError('Please wait 24 hours between claims');
      } else if (err.message.includes('Daily claim limit')) {
        setError('Daily claim limit reached');
      } else if (err.message.includes('Faucet is empty')) {
        setError('Faucet is empty. Please try again later.');
      } else {
        setError(err.message || 'Failed to claim tokens');
      }
    } finally {
      setClaiming(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <FaFaucet className="text-6xl mx-auto mb-4" />
          <h1 className="text-5xl font-bold mb-4">CryptoHoru Testnet Faucet</h1>
          <p className="text-xl opacity-90">
            Get free testnet tokens for development and testing
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Network Info Banner */}
        {account && (
          <div className="bg-blue-900/30 border border-blue-600 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-blue-400 font-semibold">Network: Sepolia Testnet</p>
              <p className="text-gray-300 text-sm">Contract: {FAUCET_CONTRACT_ADDRESS.slice(0, 10)}...{FAUCET_CONTRACT_ADDRESS.slice(-8)}</p>
            </div>
            <button
              onClick={loadFaucetData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              🔄 Refresh
            </button>
          </div>
        )}
        
        {/* Faucet Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <FaCoins className="text-4xl text-yellow-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm mb-1">Faucet Balance</p>
            <p className="text-2xl font-bold text-white">{faucetStats.balance} ETH</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <FaCheckCircle className="text-4xl text-green-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm mb-1">Total Claims</p>
            <p className="text-2xl font-bold text-white">{faucetStats.claims}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <FaFaucet className="text-4xl text-blue-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm mb-1">Amount Per Claim</p>
            <p className="text-2xl font-bold text-white">{faucetStats.amount} ETH</p>
          </div>
        </div>

        {/* Main Faucet Card */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 mb-8">
          {!account ? (
            <div className="text-center">
              <FaWallet className="text-6xl text-purple-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
              <p className="text-gray-400 mb-6">
                Connect your wallet to start claiming testnet tokens
              </p>
              <button
                onClick={connectWallet}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-700">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Connected Wallet</p>
                  <p className="text-white font-mono">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </p>
                </div>
                <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Connected
                </div>
              </div>

              {/* Claim Status */}
              {timeUntilNext > 0 && (
                <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <FaClock className="text-yellow-400 text-2xl" />
                    <div>
                      <p className="text-yellow-400 font-semibold">Please Wait</p>
                      <p className="text-gray-300 text-sm">
                        Next claim available in: {formatTime(timeUntilNext)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {remainingClaims > 0 && canClaim && (
                <div className="bg-green-900/30 border border-green-600 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-green-400 text-2xl" />
                    <div>
                      <p className="text-green-400 font-semibold">Ready to Claim</p>
                      <p className="text-gray-300 text-sm">
                        You have {remainingClaims} claim(s) remaining today
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Claim Button */}
              <button
                onClick={claimTokens}
                disabled={!canClaim || claiming}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {claiming ? 'Claiming...' : `Claim ${faucetStats.amount} ETH`}
              </button>

              {/* Messages */}
              {error && (
                <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 mb-4">
                  <p className="text-red-400">{error}</p>
                </div>
              )}
              
              {success && (
                <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
                  <p className="text-green-400">{success}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">How to Use</h3>
          <ol className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm">1</span>
              <span>Connect your MetaMask wallet to the testnet</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm">2</span>
              <span>Click "Claim" to request testnet tokens</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm">3</span>
              <span>Wait 24 hours before claiming again</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm">4</span>
              <span>Each address can claim once per day</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
