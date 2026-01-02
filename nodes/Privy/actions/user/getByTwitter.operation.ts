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
import { privyApiRequest } from '../../transport';

/**
 * Get User by Twitter operation properties
 */
export const getByTwitterProperties: INodeProperties[] = [
	{
		displayName: 'Twitter Handle',
		name: 'twitterHandle',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'username (without @)',
		description: 'The Twitter username to search for',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getByTwitter'],
			},
		},
	},
];

/**
 * Execute get user by Twitter operation
 */
export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	let twitterHandle = this.getNodeParameter('twitterHandle', index) as string;
	
	// Remove @ if present
	twitterHandle = twitterHandle.replace(/^@/, '');
	
	if (!twitterHandle || twitterHandle.length === 0) {
		throw new NodeOperationError(
			this.getNode(),
			'Invalid Twitter handle',
			{ itemIndex: index },
		);
	}

	const response = await privyApiRequest.call(this, {
		method: 'GET',
		endpoint: '/users',
		query: {
			twitter_username: twitterHandle,
		},
	});

	const users = (response.data as IDataObject[]) || [];
	
	if (users.length === 0) {
		throw new NodeOperationError(
			this.getNode(),
			`No user found with Twitter handle: @${twitterHandle}`,
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
