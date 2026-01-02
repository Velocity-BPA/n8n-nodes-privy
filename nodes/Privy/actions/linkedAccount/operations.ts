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
import { privyApiRequest, formatDidWithPrefix, isValidEthereumAddress } from '../../transport';
import { LINKED_ACCOUNT_TYPE_OPTIONS } from '../../constants/accountTypes';

// List Properties
export const listProperties: INodeProperties[] = [
	{
		displayName: 'User DID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'did:privy:xxxxx or xxxxx',
		description: 'The Privy user DID',
		displayOptions: {
			show: {
				resource: ['linkedAccount'],
				operation: ['list'],
			},
		},
	},
];

// Link Email Properties
export const linkEmailProperties: INodeProperties[] = [
	{
		displayName: 'User DID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'did:privy:xxxxx',
		displayOptions: {
			show: {
				resource: ['linkedAccount'],
				operation: ['linkEmail'],
			},
		},
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['linkedAccount'],
				operation: ['linkEmail'],
			},
		},
	},
];

// Link Phone Properties
export const linkPhoneProperties: INodeProperties[] = [
	{
		displayName: 'User DID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'did:privy:xxxxx',
		displayOptions: {
			show: {
				resource: ['linkedAccount'],
				operation: ['linkPhone'],
			},
		},
	},
	{
		displayName: 'Phone Number',
		name: 'phone',
		type: 'string',
		placeholder: '+1234567890',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['linkedAccount'],
				operation: ['linkPhone'],
			},
		},
	},
];

// Link Wallet Properties
export const linkWalletProperties: INodeProperties[] = [
	{
		displayName: 'User DID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'did:privy:xxxxx',
		displayOptions: {
			show: {
				resource: ['linkedAccount'],
				operation: ['linkWallet'],
			},
		},
	},
	{
		displayName: 'Wallet Address',
		name: 'walletAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		displayOptions: {
			show: {
				resource: ['linkedAccount'],
				operation: ['linkWallet'],
			},
		},
	},
	{
		displayName: 'Chain Type',
		name: 'chainType',
		type: 'options',
		options: [
			{ name: 'Ethereum', value: 'ethereum' },
			{ name: 'Solana', value: 'solana' },
		],
		default: 'ethereum',
		displayOptions: {
			show: {
				resource: ['linkedAccount'],
				operation: ['linkWallet'],
			},
		},
	},
];

// Unlink Properties
export const unlinkProperties: INodeProperties[] = [
	{
		displayName: 'User DID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'did:privy:xxxxx',
		displayOptions: {
			show: {
				resource: ['linkedAccount'],
				operation: ['unlink'],
			},
		},
	},
	{
		displayName: 'Account Type',
		name: 'accountType',
		type: 'options',
		options: LINKED_ACCOUNT_TYPE_OPTIONS.map((type) => ({
			name: type.name,
			value: type.value,
		})),
		default: 'email',
		displayOptions: {
			show: {
				resource: ['linkedAccount'],
				operation: ['unlink'],
			},
		},
	},
	{
		displayName: 'Account Identifier',
		name: 'accountId',
		type: 'string',
		required: true,
		default: '',
		description: 'Email address, phone number, wallet address, or OAuth ID',
		displayOptions: {
			show: {
				resource: ['linkedAccount'],
				operation: ['unlink'],
			},
		},
	},
];

// Set Primary Properties
export const setPrimaryProperties: INodeProperties[] = [
	{
		displayName: 'User DID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'did:privy:xxxxx',
		displayOptions: {
			show: {
				resource: ['linkedAccount'],
				operation: ['setPrimary'],
			},
		},
	},
	{
		displayName: 'Account Type',
		name: 'accountType',
		type: 'options',
		options: LINKED_ACCOUNT_TYPE_OPTIONS.map((type) => ({
			name: type.name,
			value: type.value,
		})),
		default: 'email',
		displayOptions: {
			show: {
				resource: ['linkedAccount'],
				operation: ['setPrimary'],
			},
		},
	},
	{
		displayName: 'Account Identifier',
		name: 'accountId',
		type: 'string',
		required: true,
		default: '',
		description: 'Email address, phone number, wallet address, or OAuth ID',
		displayOptions: {
			show: {
				resource: ['linkedAccount'],
				operation: ['setPrimary'],
			},
		},
	},
];

// Execute Functions
export async function executeList(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const userId = this.getNodeParameter('userId', index) as string;
	const formattedDid = formatDidWithPrefix(userId);

	const response = await privyApiRequest.call(this, {
		method: 'GET',
		endpoint: `/users/${encodeURIComponent(formattedDid)}`,
	});

	const user = response as IDataObject;
	const linkedAccounts = (user.linked_accounts || []) as IDataObject[];

	return linkedAccounts.map((account) => ({
		json: account,
		pairedItem: { item: index },
	}));
}

export async function executeLinkEmail(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const userId = this.getNodeParameter('userId', index) as string;
	const email = this.getNodeParameter('email', index) as string;
	const formattedDid = formatDidWithPrefix(userId);

	if (!email.includes('@')) {
		throw new NodeOperationError(this.getNode(), 'Invalid email address', { itemIndex: index });
	}

	const response = await privyApiRequest.call(this, {
		method: 'POST',
		endpoint: `/users/${encodeURIComponent(formattedDid)}/linked_accounts`,
		body: {
			type: 'email',
			address: email,
		},
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}

export async function executeLinkPhone(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const userId = this.getNodeParameter('userId', index) as string;
	const phone = this.getNodeParameter('phone', index) as string;
	const formattedDid = formatDidWithPrefix(userId);

	const response = await privyApiRequest.call(this, {
		method: 'POST',
		endpoint: `/users/${encodeURIComponent(formattedDid)}/linked_accounts`,
		body: {
			type: 'phone',
			number: phone,
		},
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}

export async function executeLinkWallet(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const userId = this.getNodeParameter('userId', index) as string;
	const walletAddress = this.getNodeParameter('walletAddress', index) as string;
	const chainType = this.getNodeParameter('chainType', index) as string;
	const formattedDid = formatDidWithPrefix(userId);

	if (chainType === 'ethereum' && !isValidEthereumAddress(walletAddress)) {
		throw new NodeOperationError(this.getNode(), 'Invalid Ethereum wallet address', { itemIndex: index });
	}

	const response = await privyApiRequest.call(this, {
		method: 'POST',
		endpoint: `/users/${encodeURIComponent(formattedDid)}/linked_accounts`,
		body: {
			type: 'wallet',
			address: walletAddress,
			chain_type: chainType,
		},
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}

export async function executeUnlink(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const userId = this.getNodeParameter('userId', index) as string;
	const accountType = this.getNodeParameter('accountType', index) as string;
	const accountId = this.getNodeParameter('accountId', index) as string;
	const formattedDid = formatDidWithPrefix(userId);

	const response = await privyApiRequest.call(this, {
		method: 'DELETE',
		endpoint: `/users/${encodeURIComponent(formattedDid)}/linked_accounts`,
		body: {
			type: accountType,
			identifier: accountId,
		},
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}

export async function executeSetPrimary(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const userId = this.getNodeParameter('userId', index) as string;
	const accountType = this.getNodeParameter('accountType', index) as string;
	const accountId = this.getNodeParameter('accountId', index) as string;
	const formattedDid = formatDidWithPrefix(userId);

	const response = await privyApiRequest.call(this, {
		method: 'PUT',
		endpoint: `/users/${encodeURIComponent(formattedDid)}/linked_accounts/primary`,
		body: {
			type: accountType,
			identifier: accountId,
		},
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}
