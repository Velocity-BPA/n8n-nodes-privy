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
import { CHAIN_OPTIONS } from '../../constants/chains';

/**
 * Get Wallet Transactions operation properties
 */
export const getTransactionsProperties: INodeProperties[] = [
	{
		displayName: 'Wallet Address',
		name: 'walletAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x... or Solana address',
		description: 'The wallet address to get transactions for',
		displayOptions: {
			show: {
				resource: ['embeddedWallet'],
				operation: ['getTransactions'],
			},
		},
	},
	{
		displayName: 'Chain',
		name: 'chain',
		type: 'options',
		options: CHAIN_OPTIONS,
		default: 'ethereum',
		description: 'The blockchain network to query',
		displayOptions: {
			show: {
				resource: ['embeddedWallet'],
				operation: ['getTransactions'],
			},
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all transactions or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['embeddedWallet'],
				operation: ['getTransactions'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of transactions to return',
		typeOptions: {
			minValue: 1,
			maxValue: 500,
		},
		displayOptions: {
			show: {
				resource: ['embeddedWallet'],
				operation: ['getTransactions'],
				returnAll: [false],
			},
		},
	},
];

/**
 * Execute get wallet transactions operation
 */
export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const walletAddress = this.getNodeParameter('walletAddress', index) as string;
	const chain = this.getNodeParameter('chain', index) as string;
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;
	
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
		endpoint: `/wallets/${encodeURIComponent(walletAddress)}/transactions`,
		query: {
			chain,
			limit: returnAll ? 500 : limit,
		},
	});

	const transactions = (response.data as IDataObject[]) || (response.transactions as IDataObject[]) || [];
	const results = returnAll ? transactions : transactions.slice(0, limit);

	return results.map((tx) => ({
		json: tx as IDataObject,
		pairedItem: { item: index },
	}));
}
