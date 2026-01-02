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
 * Get User by Wallet operation properties
 */
export const getByWalletProperties: INodeProperties[] = [
	{
		displayName: 'Wallet Address',
		name: 'walletAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x... or Solana address',
		description: 'The wallet address to search for',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getByWallet'],
			},
		},
	},
];

/**
 * Execute get user by wallet operation
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
			'Invalid wallet address format. Must be a valid Ethereum or Solana address',
			{ itemIndex: index },
		);
	}

	const response = await privyApiRequest.call(this, {
		method: 'GET',
		endpoint: '/users',
		query: {
			wallet_address: walletAddress,
		},
	});

	const users = (response.data as IDataObject[]) || [];
	
	if (users.length === 0) {
		throw new NodeOperationError(
			this.getNode(),
			`No user found with wallet: ${walletAddress}`,
			{ itemIndex: index },
		);
	}

	return [
		{
			json: users[0] as IDataObject,
			pairedItem: { item: index },
		},
	];
}
