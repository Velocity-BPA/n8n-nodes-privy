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
import { privyApiRequest, formatPrivyDid, isValidPrivyDid } from '../../transport';

/**
 * List User Wallets operation properties
 */
export const listProperties: INodeProperties[] = [
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'did:privy:xxxxx or xxxxx',
		description: 'The Privy DID or user ID to list wallets for',
		displayOptions: {
			show: {
				resource: ['embeddedWallet'],
				operation: ['list'],
			},
		},
	},
];

/**
 * Execute list user wallets operation
 */
export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	let userId = this.getNodeParameter('userId', index) as string;
	
	// Format as DID if not already
	userId = formatPrivyDid(userId);
	
	if (!isValidPrivyDid(userId)) {
		throw new NodeOperationError(
			this.getNode(),
			'Invalid Privy user ID format',
			{ itemIndex: index },
		);
	}

	const response = await privyApiRequest.call(this, {
		method: 'GET',
		endpoint: `/users/${encodeURIComponent(userId)}/wallets`,
	});

	const wallets = (response.data as IDataObject[]) || (response.wallets as IDataObject[]) || [];

	return wallets.map((wallet) => ({
		json: wallet as IDataObject,
		pairedItem: { item: index },
	}));
}
