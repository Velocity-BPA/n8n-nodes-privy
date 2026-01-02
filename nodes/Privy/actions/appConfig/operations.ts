/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { privyApiRequest } from '../../transport';

// Get Settings Properties (no additional fields needed)
export const getSettingsProperties: INodeProperties[] = [];

// Update Settings Properties
export const updateSettingsProperties: INodeProperties[] = [
	{
		displayName: 'App Name',
		name: 'appName',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['appConfig'],
				operation: ['updateSettings'],
			},
		},
	},
	{
		displayName: 'Logo URL',
		name: 'logoUrl',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['appConfig'],
				operation: ['updateSettings'],
			},
		},
	},
	{
		displayName: 'Accent Color',
		name: 'accentColor',
		type: 'string',
		default: '',
		placeholder: '#6366f1',
		displayOptions: {
			show: {
				resource: ['appConfig'],
				operation: ['updateSettings'],
			},
		},
	},
];

// Get Login Methods Properties (no additional fields needed)
export const getLoginMethodsProperties: INodeProperties[] = [];

// Update Login Methods Properties
export const updateLoginMethodsProperties: INodeProperties[] = [
	{
		displayName: 'Email Login',
		name: 'emailLogin',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['appConfig'],
				operation: ['updateLoginMethods'],
			},
		},
	},
	{
		displayName: 'SMS Login',
		name: 'smsLogin',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['appConfig'],
				operation: ['updateLoginMethods'],
			},
		},
	},
	{
		displayName: 'Google OAuth',
		name: 'googleOauth',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['appConfig'],
				operation: ['updateLoginMethods'],
			},
		},
	},
	{
		displayName: 'Twitter OAuth',
		name: 'twitterOauth',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['appConfig'],
				operation: ['updateLoginMethods'],
			},
		},
	},
	{
		displayName: 'Discord OAuth',
		name: 'discordOauth',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['appConfig'],
				operation: ['updateLoginMethods'],
			},
		},
	},
	{
		displayName: 'GitHub OAuth',
		name: 'githubOauth',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['appConfig'],
				operation: ['updateLoginMethods'],
			},
		},
	},
	{
		displayName: 'Apple OAuth',
		name: 'appleOauth',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['appConfig'],
				operation: ['updateLoginMethods'],
			},
		},
	},
	{
		displayName: 'Wallet Login',
		name: 'walletLogin',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['appConfig'],
				operation: ['updateLoginMethods'],
			},
		},
	},
	{
		displayName: 'Passkey Login',
		name: 'passkeyLogin',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['appConfig'],
				operation: ['updateLoginMethods'],
			},
		},
	},
];

// Get Wallet Config Properties (no additional fields needed)
export const getWalletConfigProperties: INodeProperties[] = [];

// Update Wallet Config Properties
export const updateWalletConfigProperties: INodeProperties[] = [
	{
		displayName: 'Auto-Create Wallets',
		name: 'autoCreateWallets',
		type: 'boolean',
		default: true,
		description: 'Whether to automatically create embedded wallets for new users',
		displayOptions: {
			show: {
				resource: ['appConfig'],
				operation: ['updateWalletConfig'],
			},
		},
	},
	{
		displayName: 'Default Chain',
		name: 'defaultChain',
		type: 'options',
		options: [
			{ name: 'Ethereum', value: 'ethereum' },
			{ name: 'Polygon', value: 'polygon' },
			{ name: 'Arbitrum', value: 'arbitrum' },
			{ name: 'Optimism', value: 'optimism' },
			{ name: 'Base', value: 'base' },
			{ name: 'Solana', value: 'solana' },
		],
		default: 'ethereum',
		displayOptions: {
			show: {
				resource: ['appConfig'],
				operation: ['updateWalletConfig'],
			},
		},
	},
	{
		displayName: 'Create Solana Wallets',
		name: 'createSolanaWallets',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['appConfig'],
				operation: ['updateWalletConfig'],
			},
		},
	},
	{
		displayName: 'Recovery Method',
		name: 'recoveryMethod',
		type: 'options',
		options: [
			{ name: 'Google Drive', value: 'google_drive' },
			{ name: 'iCloud', value: 'icloud' },
			{ name: 'Privy Cloud', value: 'privy' },
			{ name: 'User Passphrase', value: 'user_passphrase' },
		],
		default: 'privy',
		displayOptions: {
			show: {
				resource: ['appConfig'],
				operation: ['updateWalletConfig'],
			},
		},
	},
];

// Execute Functions
export async function executeGetSettings(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const response = await privyApiRequest.call(this, {
		method: 'GET',
		endpoint: '/apps/settings',
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}

export async function executeUpdateSettings(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const appName = this.getNodeParameter('appName', index, '') as string;
	const logoUrl = this.getNodeParameter('logoUrl', index, '') as string;
	const accentColor = this.getNodeParameter('accentColor', index, '') as string;

	const body: IDataObject = {};
	if (appName) body.name = appName;
	if (logoUrl) body.logo_url = logoUrl;
	if (accentColor) body.accent_color = accentColor;

	if (Object.keys(body).length === 0) {
		throw new NodeOperationError(this.getNode(), 'At least one setting must be provided', { itemIndex: index });
	}

	const response = await privyApiRequest.call(this, {
		method: 'PUT',
		endpoint: '/apps/settings',
		body,
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}

export async function executeGetLoginMethods(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const response = await privyApiRequest.call(this, {
		method: 'GET',
		endpoint: '/apps/login-methods',
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}

export async function executeUpdateLoginMethods(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const emailLogin = this.getNodeParameter('emailLogin', index) as boolean;
	const smsLogin = this.getNodeParameter('smsLogin', index) as boolean;
	const googleOauth = this.getNodeParameter('googleOauth', index) as boolean;
	const twitterOauth = this.getNodeParameter('twitterOauth', index) as boolean;
	const discordOauth = this.getNodeParameter('discordOauth', index) as boolean;
	const githubOauth = this.getNodeParameter('githubOauth', index) as boolean;
	const appleOauth = this.getNodeParameter('appleOauth', index) as boolean;
	const walletLogin = this.getNodeParameter('walletLogin', index) as boolean;
	const passkeyLogin = this.getNodeParameter('passkeyLogin', index) as boolean;

	const loginMethods: IDataObject = {
		email: emailLogin,
		sms: smsLogin,
		google_oauth: googleOauth,
		twitter_oauth: twitterOauth,
		discord_oauth: discordOauth,
		github_oauth: githubOauth,
		apple_oauth: appleOauth,
		wallet: walletLogin,
		passkey: passkeyLogin,
	};

	const response = await privyApiRequest.call(this, {
		method: 'PUT',
		endpoint: '/apps/login-methods',
		body: { login_methods: loginMethods },
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}

export async function executeGetWalletConfig(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const response = await privyApiRequest.call(this, {
		method: 'GET',
		endpoint: '/apps/wallet-config',
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}

export async function executeUpdateWalletConfig(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const autoCreateWallets = this.getNodeParameter('autoCreateWallets', index) as boolean;
	const defaultChain = this.getNodeParameter('defaultChain', index) as string;
	const createSolanaWallets = this.getNodeParameter('createSolanaWallets', index) as boolean;
	const recoveryMethod = this.getNodeParameter('recoveryMethod', index) as string;

	const body: IDataObject = {
		auto_create_wallets: autoCreateWallets,
		default_chain: defaultChain,
		create_solana_wallets: createSolanaWallets,
		recovery_method: recoveryMethod,
	};

	const response = await privyApiRequest.call(this, {
		method: 'PUT',
		endpoint: '/apps/wallet-config',
		body,
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}
