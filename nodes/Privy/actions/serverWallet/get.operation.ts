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
 * Get Server Wallet operation properties
 */
export const getProperties: INodeProperties[] = [
	{
		displayName: 'Wallet ID',
		name: 'walletId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'wallet_xxxxx',
		description: 'The server wallet ID to retrieve',
		displayOptions: {
			show: {
				resource: ['serverWallet'],
				operation: ['get'],
			},
		},
	},
];

/**
 * Execute get server wallet operation
 */
export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const walletId = this.getNodeParameter('walletId', index) as string;

	const response = await privyApiRequest.call(this, {
		method: 'GET',
		endpoint: `/server-wallets/${encodeURIComponent(walletId)}`,
	});

	return [
		{
			json: response as IDataObject,
			pairedItem: { item: index },
		},
	];
}
