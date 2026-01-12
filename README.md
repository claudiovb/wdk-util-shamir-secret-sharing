# wdk-util-shamir-secret-sharing

Split BIP39 mnemonic seed phrases into shares using Shamir Secret Sharing and reconstruct them.

## Overview

This library provides a simple interface to split BIP39 mnemonic phrases into multiple shares using [Shamir's Secret Sharing](https://en.wikipedia.org/wiki/Shamir%27s_secret_sharing) scheme, and reconstruct the original mnemonic from a threshold number of shares.

This enables secure backup strategies where:
- A seed phrase is split into `n` shares
- Any `k` shares (threshold) can reconstruct the original seed
- Fewer than `k` shares reveal no information about the seed

## Features

- Split 12, 15, 18, 21, or 24-word BIP39 mnemonics
- Configurable number of shares and threshold
- Hex-encoded shares for easy storage and transmission
- Uses audited [shamir-secret-sharing](https://github.com/privy-io/shamir-secret-sharing) library (audited by Cure53 and Zellic)
- Works in Node.js and browser environments
- Zero external runtime dependencies beyond the core SSS library

## Installation

```bash
npm install wdk-util-shamir-secret-sharing
```

## Usage

### Split a Mnemonic

```javascript
import { split } from 'wdk-util-shamir-secret-sharing'

const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

// Split into 5 shares, requiring 3 to reconstruct
const shares = await split(mnemonic, {
  shares: 5,
  threshold: 3
})

console.log(shares)
// [
//   'a1b2c3d4e5f6...',
//   'b2c3d4e5f6a1...',
//   'c3d4e5f6a1b2...',
//   'd4e5f6a1b2c3...',
//   'e5f6a1b2c3d4...'
// ]
```

### Reconstruct a Mnemonic

```javascript
import { combine } from 'wdk-util-shamir-secret-sharing'

// Any 3 shares can reconstruct the original mnemonic
const shares = [
  'a1b2c3d4e5f6...',
  'c3d4e5f6a1b2...',
  'e5f6a1b2c3d4...'
]

const mnemonic = await combine(shares)
console.log(mnemonic)
// 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
```

### Default Export

```javascript
import shamir from 'wdk-util-shamir-secret-sharing'

const shares = await shamir.split(mnemonic, { shares: 5, threshold: 3 })
const reconstructed = await shamir.combine(shares)
```

## API Reference

### `split(mnemonic, options)`

Split a BIP39 mnemonic into shares using Shamir Secret Sharing.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `mnemonic` | `string` | BIP39 mnemonic phrase (12, 15, 18, 21, or 24 words) |
| `options.shares` | `number` | Total number of shares to create (n). Must be ≥ 2 and ≤ 255 |
| `options.threshold` | `number` | Minimum shares needed to reconstruct (k). Must be ≥ 2 and ≤ shares |

**Returns:** `Promise<string[]>` - Array of hex-encoded shares

**Throws:** `Error` if parameters are invalid

### `combine(shares)`

Reconstruct a BIP39 mnemonic from shares.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `shares` | `string[]` | Array of hex-encoded shares (at least threshold amount) |

**Returns:** `Promise<string>` - Reconstructed BIP39 mnemonic phrase

**Throws:** `Error` if shares are invalid or insufficient

## Common Configurations

| Use Case | Shares | Threshold | Description |
|----------|--------|-----------|-------------|
| 2-of-3 | 3 | 2 | Common for personal backup (e.g., home, bank, family) |
| 3-of-5 | 5 | 3 | Balanced security and redundancy |
| 2-of-2 | 2 | 2 | Simple split requiring both shares |
| 5-of-7 | 7 | 5 | High security multi-party setup |

## Security Considerations

1. **Share Storage**: Store shares in physically separate, secure locations
2. **Never Store Together**: Storing threshold or more shares together defeats the purpose
3. **Secure Environment**: Generate and reconstruct secrets in a secure, offline environment
4. **Memory Clearing**: Be aware that JavaScript doesn't guarantee memory clearing; consider using secure hardware for high-value secrets
5. **Audit Trail**: The underlying `shamir-secret-sharing` library has been independently audited by Cure53 and Zellic

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

## Testing

The library includes comprehensive tests covering:

- Split and combine round-trips
- All valid mnemonic lengths (12, 15, 18, 21, 24 words)
- Various threshold/share configurations
- Input validation and error handling
- Edge cases

```bash
npm test
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Related Projects

- [wdk-wallet-evm-erc-4337](https://github.com/tetherto/wdk-wallet-evm-erc-4337) - EVM wallet with ERC-4337 support
- [shamir-secret-sharing](https://github.com/privy-io/shamir-secret-sharing) - Core SSS implementation used by this library
