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
import { privyApiRequest } from '../../transport';

/**
 * Create User operation properties
 */
export const createProperties: INodeProperties[] = [
	{
		displayName: 'Create Ethereum Wallet',
		name: 'createEthereumWallet',
		type: 'boolean',
		default: true,
		description: 'Whether to create an Ethereum wallet for the user',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Create Solana Wallet',
		name: 'createSolanaWallet',
		type: 'boolean',
		default: false,
		description: 'Whether to create a Solana wallet for the user',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Linked Accounts',
		name: 'linkedAccounts',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		description: 'Initial linked accounts to attach to the user',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'email',
				displayName: 'Email',
				values: [
					{
						displayName: 'Email Address',
						name: 'address',
						type: 'string',
						default: '',
						placeholder: 'user@example.com',
					},
				],
			},
			{
				name: 'phone',
				displayName: 'Phone',
				values: [
					{
						displayName: 'Phone Number',
						name: 'number',
						type: 'string',
						default: '',
						placeholder: '+1234567890',
					},
				],
			},
			{
				name: 'customAuth',
				displayName: 'Custom Auth',
				values: [
					{
						displayName: 'Custom User ID',
						name: 'customUserId',
						type: 'string',
						default: '',
						placeholder: 'external-user-123',
					},
				],
			},
		],
	},
	{
		displayName: 'Custom Metadata',
		name: 'customMetadata',
		type: 'json',
		default: '{}',
		description: 'Custom metadata to attach to the user (JSON object)',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
			},
		},
	},
];

/**
 * Execute create user operation
 */
export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const createEthereumWallet = this.getNodeParameter('createEthereumWallet', index) as boolean;
	const createSolanaWallet = this.getNodeParameter('createSolanaWallet', index) as boolean;
	const linkedAccountsInput = this.getNodeParameter('linkedAccounts', index, {}) as IDataObject;
	const customMetadataStr = this.getNodeParameter('customMetadata', index, '{}') as string;

	// Build request body
	const body: IDataObject = {
		create_ethereum_wallet: createEthereumWallet,
		create_solana_wallet: createSolanaWallet,
	};

	// Process linked accounts
	const linkedAccounts: IDataObject[] = [];
	
	if (linkedAccountsInput.email) {
		const emails = linkedAccountsInput.email as IDataObject[];
		emails.forEach((email) => {
			if (email.address) {
				linkedAccounts.push({
					type: 'email',
					address: email.address,
				});
			}
		});
	}
	
	if (linkedAccountsInput.phone) {
		const phones = linkedAccountsInput.phone as IDataObject[];
		phones.forEach((phone) => {
			if (phone.number) {
				linkedAccounts.push({
					type: 'phone',
					number: phone.number,
				});
			}
		});
	}
	
	if (linkedAccountsInput.customAuth) {
		const customAuths = linkedAccountsInput.customAuth as IDataObject[];
		customAuths.forEach((auth) => {
			if (auth.customUserId) {
				linkedAccounts.push({
					type: 'custom_auth',
					custom_user_id: auth.customUserId,
				});
			}
		});
	}

	if (linkedAccounts.length > 0) {
		body.linked_accounts = linkedAccounts;
	}

	// Parse custom metadata
	if (customMetadataStr && customMetadataStr !== '{}') {
		try {
			body.custom_metadata = JSON.parse(customMetadataStr);
		} catch {
			// Ignore invalid JSON
		}
	}

	const response = await privyApiRequest.call(this, {
		method: 'POST',
		endpoint: '/users',
		body,
	});

	return [
		{
			json: response as IDataObject,
			pairedItem: { item: index },
		},
	];
}
