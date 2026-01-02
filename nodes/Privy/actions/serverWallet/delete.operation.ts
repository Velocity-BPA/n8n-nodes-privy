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
 * Delete Server Wallet operation properties
 */
export const deleteProperties: INodeProperties[] = [
	{
		displayName: 'Wallet ID',
		name: 'walletId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'wallet_xxxxx',
		description: 'The server wallet ID to delete',
		displayOptions: {
			show: {
				resource: ['serverWallet'],
				operation: ['delete'],
			},
		},
	},
];

/**
 * Execute delete server wallet operation
 */
export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const walletId = this.getNodeParameter('walletId', index) as string;

	await privyApiRequest.call(this, {
		method: 'DELETE',
		endpoint: `/server-wallets/${encodeURIComponent(walletId)}`,
	});

	return [
		{
			json: {
				success: true,
				deleted: walletId,
				message: 'Server wallet successfully deleted',
			} as IDataObject,
			pairedItem: { item: index },
		},
	];
}
