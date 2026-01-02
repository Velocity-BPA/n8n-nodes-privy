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
 * Get User by Discord operation properties
 */
export const getByDiscordProperties: INodeProperties[] = [
	{
		displayName: 'Discord ID',
		name: 'discordId',
		type: 'string',
		required: true,
		default: '',
		placeholder: '123456789012345678',
		description: 'The Discord user ID to search for',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getByDiscord'],
			},
		},
	},
];

/**
 * Execute get user by Discord operation
 */
export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const discordId = this.getNodeParameter('discordId', index) as string;
	
	if (!discordId || !/^\d+$/.test(discordId)) {
		throw new NodeOperationError(
			this.getNode(),
			'Invalid Discord ID format. Must be a numeric string',
			{ itemIndex: index },
		);
	}

	const response = await privyApiRequest.call(this, {
		method: 'GET',
		endpoint: '/users',
		query: {
			discord_id: discordId,
		},
	});

	const users = (response.data as IDataObject[]) || [];
	
	if (users.length === 0) {
		throw new NodeOperationError(
			this.getNode(),
			`No user found with Discord ID: ${discordId}`,
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
