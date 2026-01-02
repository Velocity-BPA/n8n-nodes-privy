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
 * Get Policy operation properties
 */
export const getPolicyProperties: INodeProperties[] = [
	{
		displayName: 'Wallet ID',
		name: 'walletId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'wallet_xxxxx',
		description: 'The server wallet ID to get policy for',
		displayOptions: {
			show: {
				resource: ['serverWallet'],
				operation: ['getPolicy'],
			},
		},
	},
];

/**
 * Execute get policy operation
 */
export async function executeGetPolicy(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const walletId = this.getNodeParameter('walletId', index) as string;

	const response = await privyApiRequest.call(this, {
		method: 'GET',
		endpoint: `/server-wallets/${encodeURIComponent(walletId)}/policy`,
	});

	return [
		{
			json: response as IDataObject,
			pairedItem: { item: index },
		},
	];
}

/**
 * Update Policy operation properties
 */
export const updatePolicyProperties: INodeProperties[] = [
	{
		displayName: 'Wallet ID',
		name: 'walletId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'wallet_xxxxx',
		description: 'The server wallet ID to update policy for',
		displayOptions: {
			show: {
				resource: ['serverWallet'],
				operation: ['updatePolicy'],
			},
		},
	},
	{
		displayName: 'Policy Rules',
		name: 'policyRules',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		description: 'Policy rules to apply to the wallet',
		displayOptions: {
			show: {
				resource: ['serverWallet'],
				operation: ['updatePolicy'],
			},
		},
		options: [
			{
				name: 'spendingLimit',
				displayName: 'Spending Limit',
				values: [
					{
						displayName: 'Max Amount (Wei)',
						name: 'maxAmount',
						type: 'string',
						default: '',
						description: 'Maximum amount per transaction in wei',
					},
					{
						displayName: 'Period',
						name: 'period',
						type: 'options',
						options: [
							{ name: 'Per Transaction', value: 'transaction' },
							{ name: 'Daily', value: 'daily' },
							{ name: 'Weekly', value: 'weekly' },
							{ name: 'Monthly', value: 'monthly' },
						],
						default: 'transaction',
					},
				],
			},
			{
				name: 'allowlist',
				displayName: 'Allowlist',
				values: [
					{
						displayName: 'Addresses',
						name: 'addresses',
						type: 'string',
						default: '',
						description: 'Comma-separated list of allowed recipient addresses',
					},
				],
			},
			{
				name: 'blocklist',
				displayName: 'Blocklist',
				values: [
					{
						displayName: 'Addresses',
						name: 'addresses',
						type: 'string',
						default: '',
						description: 'Comma-separated list of blocked recipient addresses',
					},
				],
			},
		],
	},
];

/**
 * Execute update policy operation
 */
export async function executeUpdatePolicy(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const walletId = this.getNodeParameter('walletId', index) as string;
	const policyRulesInput = this.getNodeParameter('policyRules', index, {}) as IDataObject;

	const rules: IDataObject[] = [];

	// Process spending limits
	if (policyRulesInput.spendingLimit) {
		const limits = policyRulesInput.spendingLimit as IDataObject[];
		limits.forEach((limit) => {
			rules.push({
				type: 'spending_limit',
				config: {
					max_amount: limit.maxAmount,
					period: limit.period,
				},
			});
		});
	}

	// Process allowlist
	if (policyRulesInput.allowlist) {
		const allowlists = policyRulesInput.allowlist as IDataObject[];
		allowlists.forEach((list) => {
			const addresses = (list.addresses as string).split(',').map((a) => a.trim());
			rules.push({
				type: 'allowlist',
				config: {
					addresses,
				},
			});
		});
	}

	// Process blocklist
	if (policyRulesInput.blocklist) {
		const blocklists = policyRulesInput.blocklist as IDataObject[];
		blocklists.forEach((list) => {
			const addresses = (list.addresses as string).split(',').map((a) => a.trim());
			rules.push({
				type: 'blocklist',
				config: {
					addresses,
				},
			});
		});
	}

	const response = await privyApiRequest.call(this, {
		method: 'PUT',
		endpoint: `/server-wallets/${encodeURIComponent(walletId)}/policy`,
		body: {
			rules,
		},
	});

	return [
		{
			json: response as IDataObject,
			pairedItem: { item: index },
		},
	];
}
