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
import { privyApiRequestAllItems } from '../../transport';

/**
 * List Server Wallets operation properties
 */
export const listProperties: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all server wallets or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['serverWallet'],
				operation: ['list'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of server wallets to return',
		typeOptions: {
			minValue: 1,
			maxValue: 1000,
		},
		displayOptions: {
			show: {
				resource: ['serverWallet'],
				operation: ['list'],
				returnAll: [false],
			},
		},
	},
];

/**
 * Execute list server wallets operation
 */
export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;

	const wallets = await privyApiRequestAllItems.call(
		this,
		{
			method: 'GET',
			endpoint: '/server-wallets',
		},
		returnAll,
		limit,
	);

	return wallets.map((wallet) => ({
		json: wallet as IDataObject,
		pairedItem: { item: index },
	}));
}
