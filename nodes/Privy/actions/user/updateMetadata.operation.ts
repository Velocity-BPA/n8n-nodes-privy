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
 * Update User Metadata operation properties
 */
export const updateMetadataProperties: INodeProperties[] = [
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'did:privy:xxxxx or xxxxx',
		description: 'The Privy DID or user ID to update',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['updateMetadata'],
			},
		},
	},
	{
		displayName: 'Custom Metadata',
		name: 'customMetadata',
		type: 'json',
		required: true,
		default: '{}',
		description: 'Custom metadata to set for the user (JSON object). This will replace existing metadata.',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['updateMetadata'],
			},
		},
	},
];

/**
 * Execute update user metadata operation
 */
export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	let userId = this.getNodeParameter('userId', index) as string;
	const customMetadataStr = this.getNodeParameter('customMetadata', index) as string;
	
	// Format as DID if not already
	userId = formatPrivyDid(userId);
	
	if (!isValidPrivyDid(userId)) {
		throw new NodeOperationError(
			this.getNode(),
			'Invalid Privy user ID format',
			{ itemIndex: index },
		);
	}

	// Parse custom metadata
	let customMetadata: IDataObject;
	try {
		customMetadata = JSON.parse(customMetadataStr);
	} catch {
		throw new NodeOperationError(
			this.getNode(),
			'Invalid JSON in custom metadata',
			{ itemIndex: index },
		);
	}

	const response = await privyApiRequest.call(this, {
		method: 'PATCH',
		endpoint: `/users/${encodeURIComponent(userId)}`,
		body: {
			custom_metadata: customMetadata,
		},
	});

	return [
		{
			json: response as IDataObject,
			pairedItem: { item: index },
		},
	];
}
