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
import { privyApiRequest, privyApiRequestAllItems, isValidEthereumAddress } from '../../transport';
import { EVM_CHAIN_OPTIONS } from '../../constants/chains';

// List Properties
export const listProperties: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all delegated wallets',
		displayOptions: {
			show: {
				resource: ['delegatedWallet'],
				operation: ['list'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: { minValue: 1, maxValue: 1000 },
		displayOptions: {
			show: {
				resource: ['delegatedWallet'],
				operation: ['list'],
				returnAll: [false],
			},
		},
	},
];

// Get Properties
export const getProperties: INodeProperties[] = [
	{
		displayName: 'Wallet Address',
		name: 'walletAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		displayOptions: {
			show: {
				resource: ['delegatedWallet'],
				operation: ['get'],
			},
		},
	},
];

// Sign Message Properties
export const signMessageProperties: INodeProperties[] = [
	{
		displayName: 'Wallet Address',
		name: 'walletAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		displayOptions: {
			show: {
				resource: ['delegatedWallet'],
				operation: ['signMessage'],
			},
		},
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		required: true,
		default: '',
		typeOptions: { rows: 4 },
		displayOptions: {
			show: {
				resource: ['delegatedWallet'],
				operation: ['signMessage'],
			},
		},
	},
];

// Sign Transaction Properties
export const signTransactionProperties: INodeProperties[] = [
	{
		displayName: 'Wallet Address',
		name: 'walletAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		displayOptions: {
			show: {
				resource: ['delegatedWallet'],
				operation: ['signTransaction'],
			},
		},
	},
	{
		displayName: 'To Address',
		name: 'to',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['delegatedWallet'],
				operation: ['signTransaction'],
			},
		},
	},
	{
		displayName: 'Value (Wei)',
		name: 'value',
		type: 'string',
		default: '0',
		displayOptions: {
			show: {
				resource: ['delegatedWallet'],
				operation: ['signTransaction'],
			},
		},
	},
	{
		displayName: 'Data',
		name: 'data',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['delegatedWallet'],
				operation: ['signTransaction'],
			},
		},
	},
	{
		displayName: 'Chain',
		name: 'chain',
		type: 'options',
		options: EVM_CHAIN_OPTIONS,
		default: 'ethereum',
		displayOptions: {
			show: {
				resource: ['delegatedWallet'],
				operation: ['signTransaction'],
			},
		},
	},
];

// Send Transaction Properties
export const sendTransactionProperties: INodeProperties[] = [
	{
		displayName: 'Wallet Address',
		name: 'walletAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		displayOptions: {
			show: {
				resource: ['delegatedWallet'],
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
		displayOptions: {
			show: {
				resource: ['delegatedWallet'],
				operation: ['sendTransaction'],
			},
		},
	},
	{
		displayName: 'Value (Wei)',
		name: 'value',
		type: 'string',
		default: '0',
		displayOptions: {
			show: {
				resource: ['delegatedWallet'],
				operation: ['sendTransaction'],
			},
		},
	},
	{
		displayName: 'Data',
		name: 'data',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['delegatedWallet'],
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
		displayOptions: {
			show: {
				resource: ['delegatedWallet'],
				operation: ['sendTransaction'],
			},
		},
	},
];

// Sign Typed Data Properties (EIP-712)
export const signTypedDataProperties: INodeProperties[] = [
	{
		displayName: 'Wallet Address',
		name: 'walletAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		displayOptions: {
			show: {
				resource: ['delegatedWallet'],
				operation: ['signTypedData'],
			},
		},
	},
	{
		displayName: 'Typed Data (JSON)',
		name: 'typedData',
		type: 'json',
		required: true,
		default: '{}',
		description: 'EIP-712 typed data structure',
		displayOptions: {
			show: {
				resource: ['delegatedWallet'],
				operation: ['signTypedData'],
			},
		},
	},
];

// Execute Functions
export async function executeList(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;

	const wallets = await privyApiRequestAllItems.call(
		this,
		{ method: 'GET', endpoint: '/delegated-wallets' },
		returnAll,
		limit,
	);

	return wallets.map((wallet) => ({
		json: wallet as IDataObject,
		pairedItem: { item: index },
	}));
}

export async function executeGet(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const walletAddress = this.getNodeParameter('walletAddress', index) as string;

	const response = await privyApiRequest.call(this, {
		method: 'GET',
		endpoint: `/delegated-wallets/${encodeURIComponent(walletAddress)}`,
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}

export async function executeSignMessage(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const walletAddress = this.getNodeParameter('walletAddress', index) as string;
	const message = this.getNodeParameter('message', index) as string;

	const response = await privyApiRequest.call(this, {
		method: 'POST',
		endpoint: `/delegated-wallets/${encodeURIComponent(walletAddress)}/rpc`,
		body: {
			method: 'personal_sign',
			params: { message },
		},
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}

export async function executeSignTransaction(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const walletAddress = this.getNodeParameter('walletAddress', index) as string;
	const to = this.getNodeParameter('to', index) as string;
	const value = this.getNodeParameter('value', index, '0') as string;
	const data = this.getNodeParameter('data', index, '') as string;
	const chain = this.getNodeParameter('chain', index) as string;

	if (!isValidEthereumAddress(to)) {
		throw new NodeOperationError(this.getNode(), 'Invalid recipient address', { itemIndex: index });
	}

	const transaction: IDataObject = { to, value };
	if (data) transaction.data = data;

	const response = await privyApiRequest.call(this, {
		method: 'POST',
		endpoint: `/delegated-wallets/${encodeURIComponent(walletAddress)}/rpc`,
		body: {
			method: 'eth_signTransaction',
			params: { transaction, chain_id: chain },
		},
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}

export async function executeSendTransaction(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const walletAddress = this.getNodeParameter('walletAddress', index) as string;
	const to = this.getNodeParameter('to', index) as string;
	const value = this.getNodeParameter('value', index, '0') as string;
	const data = this.getNodeParameter('data', index, '') as string;
	const chain = this.getNodeParameter('chain', index) as string;

	if (!isValidEthereumAddress(to)) {
		throw new NodeOperationError(this.getNode(), 'Invalid recipient address', { itemIndex: index });
	}

	const transaction: IDataObject = { to, value };
	if (data) transaction.data = data;

	const response = await privyApiRequest.call(this, {
		method: 'POST',
		endpoint: `/delegated-wallets/${encodeURIComponent(walletAddress)}/rpc`,
		body: {
			method: 'eth_sendTransaction',
			params: { transaction, chain_id: chain },
		},
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}

export async function executeSignTypedData(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const walletAddress = this.getNodeParameter('walletAddress', index) as string;
	const typedDataStr = this.getNodeParameter('typedData', index) as string;

	let typedData: IDataObject;
	try {
		typedData = JSON.parse(typedDataStr);
	} catch {
		throw new NodeOperationError(this.getNode(), 'Invalid JSON in typed data', { itemIndex: index });
	}

	const response = await privyApiRequest.call(this, {
		method: 'POST',
		endpoint: `/delegated-wallets/${encodeURIComponent(walletAddress)}/rpc`,
		body: {
			method: 'eth_signTypedData_v4',
			params: { typed_data: typedData },
		},
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}
