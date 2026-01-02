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
import { SOLANA_CHAIN_OPTIONS } from '../../constants/chains';

/**
 * Create Solana Wallet operation properties
 */
export const createSolanaProperties: INodeProperties[] = [
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'did:privy:xxxxx or xxxxx',
		description: 'The Privy DID or user ID to create wallet for',
		displayOptions: {
			show: {
				resource: ['embeddedWallet'],
				operation: ['createSolana'],
			},
		},
	},
	{
		displayName: 'Network',
		name: 'network',
		type: 'options',
		options: SOLANA_CHAIN_OPTIONS,
		default: 'solana',
		description: 'The Solana network for the wallet',
		displayOptions: {
			show: {
				resource: ['embeddedWallet'],
				operation: ['createSolana'],
			},
		},
	},
];

/**
 * Execute create Solana wallet operation
 */
export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	let userId = this.getNodeParameter('userId', index) as string;
	const network = this.getNodeParameter('network', index) as string;
	
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
		method: 'POST',
		endpoint: `/users/${encodeURIComponent(userId)}/wallets`,
		body: {
			chain_type: 'solana',
			chain_id: network === 'solana' ? 'mainnet-beta' : 'devnet',
		},
	});

	return [
		{
			json: response as IDataObject,
			pairedItem: { item: index },
		},
	];
}
