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
import { LINKED_ACCOUNT_TYPE_OPTIONS } from '../../constants/accountTypes';

/**
 * Pregenerate Wallet operation properties
 */
export const pregenerateProperties: INodeProperties[] = [
	{
		displayName: 'Account Type',
		name: 'accountType',
		type: 'options',
		options: LINKED_ACCOUNT_TYPE_OPTIONS.filter(opt => 
			['email', 'phone', 'custom_auth'].includes(opt.value)
		),
		required: true,
		default: 'email',
		description: 'The type of linked account to pregenerate wallet for',
		displayOptions: {
			show: {
				resource: ['embeddedWallet'],
				operation: ['pregenerate'],
			},
		},
	},
	{
		displayName: 'Email Address',
		name: 'email',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'user@example.com',
		description: 'The email address to pregenerate wallet for',
		displayOptions: {
			show: {
				resource: ['embeddedWallet'],
				operation: ['pregenerate'],
				accountType: ['email'],
			},
		},
	},
	{
		displayName: 'Phone Number',
		name: 'phone',
		type: 'string',
		required: true,
		default: '',
		placeholder: '+1234567890',
		description: 'The phone number to pregenerate wallet for',
		displayOptions: {
			show: {
				resource: ['embeddedWallet'],
				operation: ['pregenerate'],
				accountType: ['phone'],
			},
		},
	},
	{
		displayName: 'Custom User ID',
		name: 'customUserId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'external-user-123',
		description: 'The custom user ID to pregenerate wallet for',
		displayOptions: {
			show: {
				resource: ['embeddedWallet'],
				operation: ['pregenerate'],
				accountType: ['custom_auth'],
			},
		},
	},
	{
		displayName: 'Chain Type',
		name: 'chainType',
		type: 'options',
		options: [
			{ name: 'Ethereum (EVM)', value: 'evm' },
			{ name: 'Solana', value: 'solana' },
		],
		default: 'evm',
		description: 'The blockchain type for the wallet',
		displayOptions: {
			show: {
				resource: ['embeddedWallet'],
				operation: ['pregenerate'],
			},
		},
	},
];

/**
 * Execute pregenerate wallet operation
 */
export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const accountType = this.getNodeParameter('accountType', index) as string;
	const chainType = this.getNodeParameter('chainType', index) as string;

	const body: IDataObject = {
		chain_type: chainType,
	};

	// Set the linked account identifier
	if (accountType === 'email') {
		body.email = this.getNodeParameter('email', index) as string;
	} else if (accountType === 'phone') {
		body.phone = this.getNodeParameter('phone', index) as string;
	} else if (accountType === 'custom_auth') {
		body.custom_user_id = this.getNodeParameter('customUserId', index) as string;
	}

	const response = await privyApiRequest.call(this, {
		method: 'POST',
		endpoint: '/wallets/pregenerate',
		body,
	});

	return [
		{
			json: response as IDataObject,
			pairedItem: { item: index },
		},
	];
}
