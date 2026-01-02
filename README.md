# n8n-nodes-privy

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Privy, the leading wallet-as-a-service platform powering embedded wallets for 75M+ accounts. Privy provides self-custodial wallet infrastructure with MPC key management, enabling applications to create and manage wallets for their users.

![n8n Community Node](https://img.shields.io/badge/n8n-community%20node-green)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green)

## Features

- **User Management**: Create, retrieve, update, and delete Privy users with full metadata support
- **Embedded Wallets**: Create and manage self-custodial wallets for both EVM chains and Solana
- **Server Wallets**: Backend-controlled wallets for automated operations with policy controls
- **Delegated Wallets**: Execute transactions on behalf of users with proper delegation
- **Multi-Chain Support**: Ethereum, Polygon, Arbitrum, Optimism, Base, Avalanche, BSC, and Solana
- **Session Management**: Create, verify, and manage user authentication sessions
- **Webhook Support**: Real-time event notifications with signature verification
- **OAuth Integration**: Support for Google, Twitter, Discord, GitHub, and Apple OAuth

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** > **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-privy`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n custom extensions folder
cd ~/.n8n/custom

# Clone or download this package
npm install n8n-nodes-privy

# Restart n8n
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-privy.git
cd n8n-nodes-privy

# Install dependencies
npm install

# Build the project
npm run build

# Link to n8n
npm link
cd ~/.n8n/custom
npm link n8n-nodes-privy

# Restart n8n
```

## Credentials Setup

### Privy API Credentials

| Field | Type | Description |
|-------|------|-------------|
| App ID | String | Your Privy application ID from the dashboard |
| App Secret | String | Your Privy application secret key |
| Environment | Options | Production or Development |

To obtain your credentials:

1. Sign up at [Privy Dashboard](https://dashboard.privy.io)
2. Create a new application
3. Navigate to **Settings** > **App Secrets**
4. Copy your App ID and generate an App Secret

## Resources & Operations

### User Resource

| Operation | Description |
|-----------|-------------|
| List | Get a paginated list of all users |
| Get | Retrieve a user by their DID |
| Get by Email | Find a user by email address |
| Get by Phone | Find a user by phone number |
| Get by Wallet | Find a user by wallet address |
| Get by Twitter | Find a user by Twitter handle |
| Get by Discord | Find a user by Discord ID |
| Create | Create a new user with optional wallet |
| Delete | Remove a user and associated data |
| Update Metadata | Update custom user metadata |

### Embedded Wallet Resource

| Operation | Description |
|-----------|-------------|
| List | Get all wallets for a user |
| Get | Get specific wallet details |
| Create Ethereum | Create an EVM wallet |
| Create Solana | Create a Solana wallet |
| Pregenerate | Create wallet before user signup |
| Get Balance | Get wallet balance |
| Get Transactions | Get transaction history |

### Server Wallet Resource

| Operation | Description |
|-----------|-------------|
| List | List all server wallets |
| Create | Create a new server wallet |
| Get | Get wallet details |
| Delete | Delete a server wallet |
| Sign Message | Sign an arbitrary message |
| Sign Transaction | Sign a transaction |
| Send Transaction | Sign and broadcast transaction |
| Get Policy | Get wallet policy rules |
| Update Policy | Update policy rules |

### Delegated Wallet Resource

| Operation | Description |
|-----------|-------------|
| List | List delegated wallets |
| Get | Get delegated wallet details |
| Sign Message | Sign on behalf of user |
| Sign Transaction | Sign tx on behalf of user |
| Send Transaction | Execute on behalf of user |
| Sign Typed Data | EIP-712 typed data signing |

### Session Resource

| Operation | Description |
|-----------|-------------|
| Create | Generate a user session token |
| Verify | Validate a session token |
| Revoke | Invalidate a session |
| Get Active | List active sessions |
| Revoke All | Logout everywhere |

### Authentication Resource

| Operation | Description |
|-----------|-------------|
| Verify Email OTP | Validate email verification code |
| Verify SMS OTP | Validate phone verification code |
| Verify Custom JWT | Validate external JWT token |
| Get User by Token | Decode access token |

### Linked Account Resource

| Operation | Description |
|-----------|-------------|
| List | Get all linked auth methods |
| Link Email | Add email to user |
| Link Phone | Add phone to user |
| Link Wallet | Link external wallet |
| Unlink | Remove auth method |
| Set Primary | Set default auth |

### Custom Auth Resource

| Operation | Description |
|-----------|-------------|
| Create Session | External provider login |
| Get Config | Get provider settings |
| Update Config | Modify provider config |

### Webhook Resource

| Operation | Description |
|-----------|-------------|
| List | List registered webhooks |
| Create | Register new webhook |
| Get | Get webhook details |
| Update | Modify webhook config |
| Delete | Remove webhook |
| Get Deliveries | View delivery history |
| Retry Delivery | Resend failed webhook |

### App Configuration Resource

| Operation | Description |
|-----------|-------------|
| Get Settings | Get app configuration |
| Update Settings | Modify configuration |
| Get Login Methods | Get enabled auth methods |
| Update Login Methods | Enable/disable methods |
| Get Wallet Config | Get wallet settings |
| Update Wallet Config | Modify wallet settings |

## Trigger Node

The **Privy Trigger** node allows you to receive webhook events:

| Event | Description |
|-------|-------------|
| user.created | New user signup |
| user.updated | User profile changed |
| user.deleted | User account removed |
| wallet.created | New wallet created |
| wallet.updated | Wallet settings changed |
| linked_account.created | New auth method added |
| linked_account.deleted | Auth method removed |
| session.created | User logged in |
| session.revoked | Session ended |

## Usage Examples

### User Onboarding with Wallet Creation

```javascript
// Create a new user with an Ethereum wallet
{
  "resource": "user",
  "operation": "create",
  "email": "user@example.com",
  "createWallet": true,
  "walletChainType": "ethereum"
}
```

### Server-Side Transaction for Trading Bot

```javascript
// Sign and send a transaction from server wallet
{
  "resource": "serverWallet",
  "operation": "sendTransaction",
  "walletId": "wallet-id",
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f3bD12",
  "value": "1000000000000000000",
  "data": "0x",
  "chain": "ethereum"
}
```

### Airdrop Distribution

```javascript
// Get user's wallet and send tokens
{
  "resource": "embeddedWallet",
  "operation": "list",
  "userId": "did:privy:xxxxx"
}
```

### Gaming Reward Distribution

```javascript
// Delegated transaction for in-game rewards
{
  "resource": "delegatedWallet",
  "operation": "sendTransaction",
  "walletAddress": "0x...",
  "to": "0x...",
  "value": "0",
  "data": "0xa9059cbb..." // ERC20 transfer
}
```

## Privy Concepts

| Concept | Description |
|---------|-------------|
| DID | Decentralized Identifier (did:privy:xxxxx) - unique user ID |
| Embedded Wallet | Self-custodial wallet managed via Privy MPC |
| Server Wallet | Backend-controlled wallet for automated operations |
| Delegated Wallet | User wallet with server execution rights |
| MPC | Multi-Party Computation for key management |
| TEE | Trusted Execution Environment for secure key operations |
| Linked Account | Connected authentication method (email, OAuth, etc.) |

## Supported Networks

### EVM Chains

| Chain | Chain ID | Type |
|-------|----------|------|
| Ethereum | 1 | Mainnet |
| Polygon | 137 | Mainnet |
| Arbitrum | 42161 | Mainnet |
| Optimism | 10 | Mainnet |
| Base | 8453 | Mainnet |
| Avalanche | 43114 | Mainnet |
| BSC | 56 | Mainnet |

### Solana

| Network | Description |
|---------|-------------|
| mainnet-beta | Production network |
| devnet | Development network |

## Error Handling

The node provides detailed error messages for common issues:

- **Invalid Credentials**: Check your App ID and App Secret
- **User Not Found**: Verify the DID or lookup identifier
- **Wallet Not Found**: Ensure the wallet address is correct
- **Insufficient Funds**: Check wallet balance before transactions
- **Invalid Chain**: Verify the chain is supported
- **Policy Violation**: Review server wallet policy rules

## Security Best Practices

1. **Never expose credentials** in workflows or logs
2. **Use webhook signatures** to verify incoming events
3. **Implement rate limiting** for high-volume operations
4. **Monitor transactions** using the webhook trigger
5. **Use server wallets** for automated backend operations
6. **Implement proper delegation** for user wallet actions

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode for development
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure your code:

1. Follows the existing code style
2. Includes appropriate tests
3. Updates documentation as needed
4. Maintains BSL 1.1 license compliance

## Support

- **Documentation**: [Privy Docs](https://docs.privy.io)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-privy/issues)
- **Licensing**: licensing@velobpa.com

## Acknowledgments

- [Privy](https://privy.io) for their excellent wallet-as-a-service platform
- [n8n](https://n8n.io) for the powerful workflow automation platform
- The n8n community for their continuous support and feedback
