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
import { privyApiRequest, isValidEthereumAddress } from '../../transport';
import { EVM_CHAIN_OPTIONS } from '../../constants/chains';

/**
 * Send Transaction operation properties
 */
export const sendTransactionProperties: INodeProperties[] = [
	{
		displayName: 'Wallet ID',
		name: 'walletId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'wallet_xxxxx',
		description: 'The server wallet ID to send from',
		displayOptions: {
			show: {
				resource: ['serverWallet'],
				operation: ['sendTransaction'],
			},
		},
	},
	{
		displayName: 'To Address',
		name: 'to',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'The recipient address',
		displayOptions: {
			show: {
				resource: ['serverWallet'],
				operation: ['sendTransaction'],
			},
		},
	},
	{
		displayName: 'Value (Wei)',
		name: 'value',
		type: 'string',
		default: '0',
		placeholder: '1000000000000000000',
		description: 'Amount in wei (1 ETH = 10^18 wei)',
		displayOptions: {
			show: {
				resource: ['serverWallet'],
				operation: ['sendTransaction'],
			},
		},
	},
	{
		displayName: 'Data',
		name: 'data',
		type: 'string',
		default: '',
		placeholder: '0x...',
		description: 'Contract call data (hex encoded)',
		displayOptions: {
			show: {
				resource: ['serverWallet'],
				operation: ['sendTransaction'],
			},
		},
	},
	{
		displayName: 'Chain',
		name: 'chain',
		type: 'options',
		options: EVM_CHAIN_OPTIONS,
		default: 'ethereum',
		description: 'The chain to send the transaction on',
		displayOptions: {
			show: {
				resource: ['serverWallet'],
				operation: ['sendTransaction'],
			},
		},
	},
	{
		displayName: 'Gas Options',
		name: 'gasOptions',
		type: 'collection',
		placeholder: 'Add Gas Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['serverWallet'],
				operation: ['sendTransaction'],
			},
		},
		options: [
			{
				displayName: 'Gas Limit',
				name: 'gas',
				type: 'string',
				default: '',
				placeholder: '21000',
				description: 'Gas limit for the transaction',
			},
			{
				displayName: 'Max Fee Per Gas (Wei)',
				name: 'maxFeePerGas',
				type: 'string',
				default: '',
				placeholder: '50000000000',
				description: 'Maximum fee per gas (EIP-1559)',
			},
			{
				displayName: 'Max Priority Fee Per Gas (Wei)',
				name: 'maxPriorityFeePerGas',
				type: 'string',
				default: '',
				placeholder: '2000000000',
				description: 'Maximum priority fee (EIP-1559)',
			},
		],
	},
];

/**
 * Execute send transaction operation
 */
export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const walletId = this.getNodeParameter('walletId', index) as string;
	const to = this.getNodeParameter('to', index) as string;
	const value = this.getNodeParameter('value', index, '0') as string;
	const data = this.getNodeParameter('data', index, '') as string;
	const chain = this.getNodeParameter('chain', index) as string;
	const gasOptions = this.getNodeParameter('gasOptions', index, {}) as IDataObject;

	if (!isValidEthereumAddress(to)) {
		throw new NodeOperationError(
			this.getNode(),
			'Invalid recipient address format',
			{ itemIndex: index },
		);
	}

	const transaction: IDataObject = {
		to,
		value,
	};

	if (data) {
		transaction.data = data;
	}

	if (gasOptions.gas) {
		transaction.gas = gasOptions.gas;
	}
	if (gasOptions.maxFeePerGas) {
		transaction.maxFeePerGas = gasOptions.maxFeePerGas;
	}
	if (gasOptions.maxPriorityFeePerGas) {
		transaction.maxPriorityFeePerGas = gasOptions.maxPriorityFeePerGas;
	}

	const response = await privyApiRequest.call(this, {
		method: 'POST',
		endpoint: `/server-wallets/${encodeURIComponent(walletId)}/rpc`,
		body: {
			method: 'eth_sendTransaction',
			params: {
				transaction,
				chain_id: chain,
			},
		},
	});

	return [
		{
			json: response as IDataObject,
			pairedItem: { item: index },
		},
	];
}
