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
 * Get User by Email operation properties
 */
export const getByEmailProperties: INodeProperties[] = [
	{
		displayName: 'Email Address',
		name: 'email',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'user@example.com',
		description: 'The email address to search for',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getByEmail'],
			},
		},
	},
];

/**
 * Execute get user by email operation
 */
export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const email = this.getNodeParameter('email', index) as string;
	
	if (!email || !email.includes('@')) {
		throw new NodeOperationError(
			this.getNode(),
			'Invalid email address format',
			{ itemIndex: index },
		);
	}

	const response = await privyApiRequest.call(this, {
		method: 'GET',
		endpoint: '/users',
		query: {
			email: email.toLowerCase(),
		},
	});

	const users = (response.data as IDataObject[]) || [];
	
	if (users.length === 0) {
		throw new NodeOperationError(
			this.getNode(),
			`No user found with email: ${email}`,
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
