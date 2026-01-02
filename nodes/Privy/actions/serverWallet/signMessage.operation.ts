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
 * Sign Message operation properties
 */
export const signMessageProperties: INodeProperties[] = [
	{
		displayName: 'Wallet ID',
		name: 'walletId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'wallet_xxxxx',
		description: 'The server wallet ID to sign with',
		displayOptions: {
			show: {
				resource: ['serverWallet'],
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
		placeholder: 'Hello, World!',
		description: 'The message to sign',
		typeOptions: {
			rows: 4,
		},
		displayOptions: {
			show: {
				resource: ['serverWallet'],
				operation: ['signMessage'],
			},
		},
	},
	{
		displayName: 'Encoding',
		name: 'encoding',
		type: 'options',
		options: [
			{ name: 'UTF-8', value: 'utf-8' },
			{ name: 'Hex', value: 'hex' },
		],
		default: 'utf-8',
		description: 'The encoding of the message',
		displayOptions: {
			show: {
				resource: ['serverWallet'],
				operation: ['signMessage'],
			},
		},
	},
];

/**
 * Execute sign message operation
 */
export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const walletId = this.getNodeParameter('walletId', index) as string;
	const message = this.getNodeParameter('message', index) as string;
	const encoding = this.getNodeParameter('encoding', index) as string;

	const response = await privyApiRequest.call(this, {
		method: 'POST',
		endpoint: `/server-wallets/${encodeURIComponent(walletId)}/rpc`,
		body: {
			method: 'personal_sign',
			params: {
				message,
				encoding,
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
