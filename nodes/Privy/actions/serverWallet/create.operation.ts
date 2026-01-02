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
import { CHAIN_OPTIONS } from '../../constants/chains';

/**
 * Create Server Wallet operation properties
 */
export const createProperties: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'Treasury Wallet',
		description: 'A descriptive name for the server wallet',
		displayOptions: {
			show: {
				resource: ['serverWallet'],
				operation: ['create'],
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
				resource: ['serverWallet'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Chain',
		name: 'chain',
		type: 'options',
		options: CHAIN_OPTIONS,
		default: 'ethereum',
		description: 'The specific chain for the wallet',
		displayOptions: {
			show: {
				resource: ['serverWallet'],
				operation: ['create'],
			},
		},
	},
];

/**
 * Execute create server wallet operation
 */
export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter('name', index) as string;
	const chainType = this.getNodeParameter('chainType', index) as string;
	const chain = this.getNodeParameter('chain', index) as string;

	const response = await privyApiRequest.call(this, {
		method: 'POST',
		endpoint: '/server-wallets',
		body: {
			name,
			chain_type: chainType,
			chain_id: chain,
		},
	});

	return [
		{
			json: response as IDataObject,
			pairedItem: { item: index },
		},
	];
}
