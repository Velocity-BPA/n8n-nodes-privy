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
 * Delete User operation properties
 */
export const deleteProperties: INodeProperties[] = [
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'did:privy:xxxxx or xxxxx',
		description: 'The Privy DID or user ID to delete',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['delete'],
			},
		},
	},
];

/**
 * Execute delete user operation
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

	await privyApiRequest.call(this, {
		method: 'DELETE',
		endpoint: `/users/${encodeURIComponent(userId)}`,
	});

	return [
		{
			json: {
				success: true,
				deleted: userId,
				message: 'User successfully deleted',
			} as IDataObject,
			pairedItem: { item: index },
		},
	];
}
