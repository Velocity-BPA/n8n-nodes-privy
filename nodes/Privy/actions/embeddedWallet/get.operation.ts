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
import { privyApiRequest, isValidEthereumAddress, isValidSolanaAddress } from '../../transport';

/**
 * Get Wallet operation properties
 */
export const getProperties: INodeProperties[] = [
	{
		displayName: 'Wallet Address',
		name: 'walletAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x... or Solana address',
		description: 'The wallet address to retrieve details for',
		displayOptions: {
			show: {
				resource: ['embeddedWallet'],
				operation: ['get'],
			},
		},
	},
];

/**
 * Execute get wallet operation
 */
export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const walletAddress = this.getNodeParameter('walletAddress', index) as string;
	
	const isEvmAddress = isValidEthereumAddress(walletAddress);
	const isSolAddress = isValidSolanaAddress(walletAddress);
	
	if (!isEvmAddress && !isSolAddress) {
		throw new NodeOperationError(
			this.getNode(),
			'Invalid wallet address format',
			{ itemIndex: index },
		);
	}

	const response = await privyApiRequest.call(this, {
		method: 'GET',
		endpoint: `/wallets/${encodeURIComponent(walletAddress)}`,
	});

	return [
		{
			json: response as IDataObject,
			pairedItem: { item: index },
		},
	];
}
