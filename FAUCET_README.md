# CryptoHoru Testnet Faucet

A complete testnet token faucet system with Solidity smart contracts and Next.js frontend.

## Features

- ✅ **Daily Limits**: One claim per address every 24 hours
- ✅ **Smart Contract Backend**: Secure Solidity contract
- ✅ **MetaMask Integration**: Easy wallet connection
- ✅ **Real-time Stats**: Track faucet balance and total claims
- ✅ **Contract Protection**: Prevents contract addresses from claiming
- ✅ **Owner Controls**: Fund, withdraw, and manage the faucet

## Smart Contract Details

- **Amount per claim**: 0.1 ETH (configurable)
- **Cooldown period**: 24 hours
- **Max daily claims**: 1 per address
- **Gas optimized**: Efficient storage and operations

## Setup Instructions

### 1. Install Dependencies

```bash
cd contracts
npm install
```

### 2. Configure Environment

Create `.env` file in `contracts/` directory:

```bash
cp .env.example .env
```

Edit `.env` and add:
- Your wallet private key (for deployment)
- RPC URLs (Alchemy/Infura)
- API keys for contract verification

### 3. Compile Contracts

```bash
npm run compile
```

### 4. Deploy Contract

**Local testing:**
```bash
npx hardhat node
npm run deploy:localhost
```

**Sepolia Testnet:**
```bash
npm run deploy:sepolia
```

**Goerli Testnet:**
```bash
npm run deploy:goerli
```

**BSC Testnet:**
```bash
npx hardhat run scripts/deploy.js --network bsc_testnet
```

### 5. Update Frontend

After deployment, update `FAUCET_CONTRACT_ADDRESS` in:
- `app/faucet/page.tsx` (line 10)

Replace with your deployed contract address from `deployment-info.json`

### 6. Verify Contract (Optional)

```bash
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS
```

## Usage

### For Users

1. Visit `/faucet` page
2. Connect MetaMask wallet
3. Click "Claim" button
4. Confirm transaction
5. Receive testnet tokens instantly

### For Admins

**Fund the faucet:**
```bash
# Send ETH to contract address
# Or use ethers.js:
const tx = await signer.sendTransaction({
  to: FAUCET_ADDRESS,
  value: ethers.parseEther("10")
});
```

**Withdraw tokens:**
```javascript
const faucet = new ethers.Contract(address, abi, signer);
await faucet.withdraw(ethers.parseEther("5"));
```

**Check stats:**
```javascript
const stats = await faucet.getFaucetStats();
console.log("Balance:", ethers.formatEther(stats.balance));
console.log("Total claims:", stats.claims.toString());
```

## Contract Functions

### User Functions

- `requestTokens()` - Claim tokens from faucet
- `canClaim(address)` - Check if address can claim
- `getTimeUntilNextClaim(address)` - Get cooldown time
- `getRemainingDailyClaims(address)` - Get remaining claims

### Admin Functions (Owner Only)

- `fundFaucet()` - Add tokens to faucet
- `withdraw(uint256)` - Withdraw tokens
- `transferOwnership(address)` - Transfer contract ownership

### View Functions

- `getFaucetBalance()` - Get current faucet balance
- `getFaucetStats()` - Get comprehensive statistics

## Security Features

1. **Reentrancy Protection**: Uses checks-effects-interactions pattern
2. **Contract Blacklist**: Prevents smart contracts from claiming
3. **Rate Limiting**: 24-hour cooldown per address
4. **Daily Limits**: Maximum claims per day
5. **Owner Controls**: Only owner can withdraw or transfer ownership

## Testing

Run contract tests:

```bash
cd contracts
npx hardhat test
```

## Troubleshooting

**"Faucet is empty"**
- Send more tokens to the contract address

**"Please wait 24 hours"**
- Wait for cooldown period to expire
- Check time with `getTimeUntilNextClaim()`

**"Daily claim limit reached"**
- Wait until next day (UTC timezone)
- Check remaining claims with `getRemainingDailyClaims()`

**MetaMask not connecting**
- Make sure MetaMask is installed
- Switch to correct network in MetaMask
- Refresh the page

## Network Configuration

### Supported Testnets

- **Sepolia** (Ethereum)
- **Goerli** (Ethereum)
- **BSC Testnet** (Binance Smart Chain)

Add custom network to MetaMask if needed.

## Gas Optimization

The contract is optimized for gas efficiency:
- Minimal storage usage
- Batch operations where possible
- Efficient data structures

Average gas costs:
- Deployment: ~800,000 gas
- Claim: ~50,000 gas
- Fund: ~30,000 gas

## License

MIT License

## Support

For issues or questions:
- Create an issue on GitHub
- Contact: support@cryptohoru.com
