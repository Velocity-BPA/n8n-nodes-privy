/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { LinkedAccountType, WalletClientType } from '../types/privy.types';

/**
 * Supported linked account types
 */
export const LINKED_ACCOUNT_TYPES: LinkedAccountType[] = [
	'email',
	'phone',
	'wallet',
	'google_oauth',
	'twitter_oauth',
	'discord_oauth',
	'github_oauth',
	'apple_oauth',
	'farcaster',
	'passkey',
	'custom_auth',
];

/**
 * Linked account type options for n8n dropdowns
 */
export const LINKED_ACCOUNT_TYPE_OPTIONS = [
	{ name: 'Email', value: 'email', description: 'Email address' },
	{ name: 'Phone', value: 'phone', description: 'Phone number' },
	{ name: 'Wallet', value: 'wallet', description: 'External wallet' },
	{ name: 'Google OAuth', value: 'google_oauth', description: 'Google account' },
	{ name: 'Twitter OAuth', value: 'twitter_oauth', description: 'Twitter account' },
	{ name: 'Discord OAuth', value: 'discord_oauth', description: 'Discord account' },
	{ name: 'GitHub OAuth', value: 'github_oauth', description: 'GitHub account' },
	{ name: 'Apple OAuth', value: 'apple_oauth', description: 'Apple ID' },
	{ name: 'Farcaster', value: 'farcaster', description: 'Farcaster account' },
	{ name: 'Passkey', value: 'passkey', description: 'WebAuthn passkey' },
	{ name: 'Custom Auth', value: 'custom_auth', description: 'Custom authentication provider' },
];

/**
 * Supported wallet client types
 */
export const WALLET_CLIENT_TYPES: WalletClientType[] = [
	'privy',
	'metamask',
	'coinbase_wallet',
	'rainbow',
	'phantom',
	'wallet_connect',
];

/**
 * Wallet client type options for n8n dropdowns
 */
export const WALLET_CLIENT_TYPE_OPTIONS = [
	{ name: 'Privy', value: 'privy', description: 'Privy embedded wallet' },
	{ name: 'MetaMask', value: 'metamask', description: 'MetaMask wallet' },
	{ name: 'Coinbase Wallet', value: 'coinbase_wallet', description: 'Coinbase Wallet' },
	{ name: 'Rainbow', value: 'rainbow', description: 'Rainbow wallet' },
	{ name: 'Phantom', value: 'phantom', description: 'Phantom wallet (Solana)' },
	{ name: 'WalletConnect', value: 'wallet_connect', description: 'WalletConnect compatible' },
];

/**
 * OAuth provider configurations
 */
export const OAUTH_PROVIDERS = {
	google_oauth: {
		name: 'Google',
		icon: 'google',
		scopes: ['email', 'profile'],
	},
	twitter_oauth: {
		name: 'Twitter',
		icon: 'twitter',
		scopes: ['tweet.read', 'users.read'],
	},
	discord_oauth: {
		name: 'Discord',
		icon: 'discord',
		scopes: ['identify', 'email'],
	},
	github_oauth: {
		name: 'GitHub',
		icon: 'github',
		scopes: ['user:email'],
	},
	apple_oauth: {
		name: 'Apple',
		icon: 'apple',
		scopes: ['name', 'email'],
	},
};

/**
 * Check if account type is an OAuth type
 */
export function isOAuthAccountType(type: LinkedAccountType): boolean {
	return type.endsWith('_oauth');
}

/**
 * Get display name for account type
 */
export function getAccountTypeDisplayName(type: LinkedAccountType): string {
	const option = LINKED_ACCOUNT_TYPE_OPTIONS.find((opt) => opt.value === type);
	return option?.name ?? type;
}
