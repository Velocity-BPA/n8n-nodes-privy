/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Privy API Type Definitions
 * 
 * Comprehensive TypeScript interfaces for the Privy wallet-as-a-service platform.
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Privy Decentralized Identifier format: did:privy:XXXXX
 */
export type PrivyDID = `did:privy:${string}`;

/**
 * Ethereum address format (0x-prefixed, 40 hex chars)
 */
export type EthereumAddress = `0x${string}`;

/**
 * Solana address format (base58 encoded)
 */
export type SolanaAddress = string;

/**
 * Chain types supported by Privy
 */
export type ChainType = 'evm' | 'solana';

/**
 * Supported chain identifiers
 */
export interface ChainConfig {
	name: string;
	chainId: number | string;
	type: ChainType;
	symbol: string;
	rpcUrl?: string;
}

// ============================================================================
// User Types
// ============================================================================

/**
 * Privy user object
 */
export interface PrivyUser {
	id: PrivyDID;
	created_at: string;
	linked_accounts: LinkedAccount[];
	has_accepted_terms?: boolean;
	is_guest?: boolean;
	custom_metadata?: Record<string, unknown>;
	mfa_methods?: MfaMethod[];
}

/**
 * Linked account types
 */
export type LinkedAccountType = 
	| 'email'
	| 'phone'
	| 'wallet'
	| 'google_oauth'
	| 'twitter_oauth'
	| 'discord_oauth'
	| 'github_oauth'
	| 'apple_oauth'
	| 'farcaster'
	| 'passkey'
	| 'custom_auth';

/**
 * Base linked account interface
 */
export interface BaseLinkedAccount {
	type: LinkedAccountType;
	verified_at?: string;
	first_verified_at?: string;
	latest_verified_at?: string;
}

/**
 * Email linked account
 */
export interface EmailLinkedAccount extends BaseLinkedAccount {
	type: 'email';
	address: string;
}

/**
 * Phone linked account
 */
export interface PhoneLinkedAccount extends BaseLinkedAccount {
	type: 'phone';
	number: string;
}

/**
 * Wallet linked account
 */
export interface WalletLinkedAccount extends BaseLinkedAccount {
	type: 'wallet';
	address: string;
	chain_type: ChainType;
	chain_id?: string;
	wallet_client?: WalletClientType;
	wallet_client_type?: WalletClientType;
	connector_type?: string;
	imported?: boolean;
	delegated?: boolean;
}

/**
 * OAuth linked account
 */
export interface OAuthLinkedAccount extends BaseLinkedAccount {
	type: 'google_oauth' | 'twitter_oauth' | 'discord_oauth' | 'github_oauth' | 'apple_oauth';
	subject: string;
	email?: string;
	name?: string;
	username?: string;
	profile_picture_url?: string;
}

/**
 * Farcaster linked account
 */
export interface FarcasterLinkedAccount extends BaseLinkedAccount {
	type: 'farcaster';
	fid: number;
	username?: string;
	display_name?: string;
	bio?: string;
	profile_picture?: string;
	owner_address?: string;
}

/**
 * Custom auth linked account
 */
export interface CustomAuthLinkedAccount extends BaseLinkedAccount {
	type: 'custom_auth';
	custom_user_id: string;
}

/**
 * Union type for all linked accounts
 */
export type LinkedAccount = 
	| EmailLinkedAccount
	| PhoneLinkedAccount
	| WalletLinkedAccount
	| OAuthLinkedAccount
	| FarcasterLinkedAccount
	| CustomAuthLinkedAccount;

/**
 * MFA method types
 */
export interface MfaMethod {
	type: 'totp' | 'passkey';
	verified_at: string;
}

/**
 * Wallet client types
 */
export type WalletClientType = 
	| 'privy'
	| 'metamask'
	| 'coinbase_wallet'
	| 'rainbow'
	| 'phantom'
	| 'wallet_connect';

// ============================================================================
// Wallet Types
// ============================================================================

/**
 * Embedded wallet
 */
export interface EmbeddedWallet {
	id: string;
	address: string;
	chain_type: ChainType;
	chain_id?: string;
	wallet_index: number;
	recovery_method?: string;
	created_at: string;
	delegated?: boolean;
}

/**
 * Server wallet
 */
export interface ServerWallet {
	id: string;
	address: string;
	chain_type: ChainType;
	chain_id?: string;
	name?: string;
	created_at: string;
	policy_ids?: string[];
}

/**
 * Delegated wallet
 */
export interface DelegatedWallet {
	id: string;
	address: string;
	chain_type: ChainType;
	user_id: PrivyDID;
	delegation_expires_at?: string;
	created_at: string;
}

/**
 * Wallet balance
 */
export interface WalletBalance {
	native: {
		balance: string;
		symbol: string;
		decimals: number;
	};
	tokens?: TokenBalance[];
}

/**
 * Token balance
 */
export interface TokenBalance {
	contract_address: string;
	symbol: string;
	decimals: number;
	balance: string;
	name?: string;
}

/**
 * Transaction object
 */
export interface Transaction {
	hash: string;
	from: string;
	to?: string;
	value: string;
	gas?: string;
	gas_price?: string;
	gas_used?: string;
	nonce?: number;
	block_number?: number;
	block_timestamp?: string;
	status: 'pending' | 'confirmed' | 'failed';
	chain_id?: string;
}

/**
 * Wallet policy
 */
export interface WalletPolicy {
	id: string;
	name: string;
	rules: PolicyRule[];
	created_at: string;
	updated_at: string;
}

/**
 * Policy rule
 */
export interface PolicyRule {
	type: 'spending_limit' | 'allowlist' | 'blocklist' | 'rate_limit';
	config: Record<string, unknown>;
}

// ============================================================================
// Session Types
// ============================================================================

/**
 * Session object
 */
export interface Session {
	id: string;
	user_id: PrivyDID;
	client_id: string;
	created_at: string;
	expires_at: string;
	refresh_token_id?: string;
	ip_address?: string;
	user_agent?: string;
}

/**
 * Session token
 */
export interface SessionToken {
	token: string;
	expires_at: string;
	refresh_token?: string;
}

// ============================================================================
// Webhook Types
// ============================================================================

/**
 * Webhook event types
 */
export type WebhookEventType = 
	| 'user.created'
	| 'user.updated'
	| 'user.deleted'
	| 'wallet.created'
	| 'wallet.updated'
	| 'linked_account.created'
	| 'linked_account.deleted'
	| 'session.created'
	| 'session.revoked';

/**
 * Webhook configuration
 */
export interface Webhook {
	id: string;
	url: string;
	enabled: boolean;
	events: WebhookEventType[];
	secret?: string;
	created_at: string;
	updated_at: string;
}

/**
 * Webhook delivery
 */
export interface WebhookDelivery {
	id: string;
	webhook_id: string;
	event_type: WebhookEventType;
	status: 'pending' | 'delivered' | 'failed';
	response_code?: number;
	response_body?: string;
	attempts: number;
	created_at: string;
	delivered_at?: string;
}

/**
 * Webhook payload
 */
export interface WebhookPayload {
	type: WebhookEventType;
	timestamp: string;
	data: Record<string, unknown>;
}

// ============================================================================
// App Configuration Types
// ============================================================================

/**
 * App settings
 */
export interface AppSettings {
	id: string;
	name: string;
	logo_url?: string;
	login_methods: LoginMethod[];
	wallet_config: WalletConfig;
	mfa_config?: MfaConfig;
	created_at: string;
	updated_at: string;
}

/**
 * Login method configuration
 */
export interface LoginMethod {
	type: LinkedAccountType;
	enabled: boolean;
	config?: Record<string, unknown>;
}

/**
 * Wallet configuration
 */
export interface WalletConfig {
	create_on_login: boolean;
	default_chain_type: ChainType;
	allowed_chains?: string[];
	embedded_wallet_enabled: boolean;
	server_wallet_enabled: boolean;
}

/**
 * MFA configuration
 */
export interface MfaConfig {
	enabled: boolean;
	required: boolean;
	methods: ('totp' | 'passkey')[];
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
	data: T[];
	next_cursor?: string;
	has_more: boolean;
	total?: number;
}

/**
 * API error response
 */
export interface PrivyError {
	error: string;
	message: string;
	status_code: number;
	details?: Record<string, unknown>;
}

// ============================================================================
// Request Types
// ============================================================================

/**
 * Create user request
 */
export interface CreateUserRequest {
	create_ethereum_wallet?: boolean;
	create_solana_wallet?: boolean;
	linked_accounts?: Array<{
		type: LinkedAccountType;
		address?: string;
		number?: string;
		subject?: string;
		custom_user_id?: string;
	}>;
	custom_metadata?: Record<string, unknown>;
}

/**
 * Update user metadata request
 */
export interface UpdateUserMetadataRequest {
	custom_metadata: Record<string, unknown>;
}

/**
 * Create wallet request
 */
export interface CreateWalletRequest {
	chain_type: ChainType;
	chain_id?: string;
}

/**
 * Sign message request
 */
export interface SignMessageRequest {
	message: string;
	encoding?: 'utf-8' | 'hex';
}

/**
 * Sign transaction request
 */
export interface SignTransactionRequest {
	transaction: TransactionParams;
}

/**
 * Send transaction request
 */
export interface SendTransactionRequest {
	transaction: TransactionParams;
	chain_id?: string;
}

/**
 * Transaction parameters
 */
export interface TransactionParams {
	to: string;
	value?: string;
	data?: string;
	gas?: string;
	gas_price?: string;
	max_fee_per_gas?: string;
	max_priority_fee_per_gas?: string;
	nonce?: number;
}

/**
 * Sign typed data request (EIP-712)
 */
export interface SignTypedDataRequest {
	domain: {
		name?: string;
		version?: string;
		chainId?: number;
		verifyingContract?: string;
		salt?: string;
	};
	types: Record<string, Array<{ name: string; type: string }>>;
	primaryType: string;
	message: Record<string, unknown>;
}

/**
 * Create webhook request
 */
export interface CreateWebhookRequest {
	url: string;
	events: WebhookEventType[];
	enabled?: boolean;
}

/**
 * Update webhook request
 */
export interface UpdateWebhookRequest {
	url?: string;
	events?: WebhookEventType[];
	enabled?: boolean;
}

// ============================================================================
// n8n Node Types
// ============================================================================

/**
 * Resource types for n8n node
 */
export type PrivyResource = 
	| 'user'
	| 'embeddedWallet'
	| 'serverWallet'
	| 'delegatedWallet'
	| 'session'
	| 'authentication'
	| 'linkedAccount'
	| 'customAuth'
	| 'webhook'
	| 'appConfig';

/**
 * User operations
 */
export type UserOperation = 
	| 'list'
	| 'get'
	| 'getByEmail'
	| 'getByPhone'
	| 'getByWallet'
	| 'getByTwitter'
	| 'getByDiscord'
	| 'create'
	| 'delete'
	| 'updateMetadata';

/**
 * Embedded wallet operations
 */
export type EmbeddedWalletOperation = 
	| 'list'
	| 'get'
	| 'createEthereum'
	| 'createSolana'
	| 'pregenerate'
	| 'getBalance'
	| 'getTransactions';

/**
 * Server wallet operations
 */
export type ServerWalletOperation = 
	| 'list'
	| 'create'
	| 'get'
	| 'delete'
	| 'signMessage'
	| 'signTransaction'
	| 'sendTransaction'
	| 'getPolicy'
	| 'updatePolicy';

/**
 * Delegated wallet operations
 */
export type DelegatedWalletOperation = 
	| 'list'
	| 'get'
	| 'signMessage'
	| 'signTransaction'
	| 'sendTransaction'
	| 'signTypedData';

/**
 * Session operations
 */
export type SessionOperation = 
	| 'create'
	| 'verify'
	| 'revoke'
	| 'getActive'
	| 'revokeAll';

/**
 * Authentication operations
 */
export type AuthenticationOperation = 
	| 'verifyEmailOtp'
	| 'verifySmsOtp'
	| 'verifyCustomJwt'
	| 'getUserByAccessToken';

/**
 * Linked account operations
 */
export type LinkedAccountOperation = 
	| 'list'
	| 'linkEmail'
	| 'linkPhone'
	| 'linkWallet'
	| 'unlink'
	| 'setPrimary';

/**
 * Custom auth operations
 */
export type CustomAuthOperation = 
	| 'createSession'
	| 'getConfig'
	| 'updateConfig';

/**
 * Webhook operations
 */
export type WebhookOperation = 
	| 'list'
	| 'create'
	| 'get'
	| 'update'
	| 'delete'
	| 'getDeliveries'
	| 'retryDelivery';

/**
 * App config operations
 */
export type AppConfigOperation = 
	| 'getSettings'
	| 'updateSettings'
	| 'getLoginMethods'
	| 'updateLoginMethods'
	| 'getWalletConfig'
	| 'updateWalletConfig';
