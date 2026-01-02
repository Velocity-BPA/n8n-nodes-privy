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
 * Get User by Phone operation properties
 */
export const getByPhoneProperties: INodeProperties[] = [
	{
		displayName: 'Phone Number',
		name: 'phone',
		type: 'string',
		required: true,
		default: '',
		placeholder: '+1234567890',
		description: 'The phone number to search for (include country code)',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getByPhone'],
			},
		},
	},
];

/**
 * Execute get user by phone operation
 */
export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const phone = this.getNodeParameter('phone', index) as string;
	
	if (!phone || phone.length < 10) {
		throw new NodeOperationError(
			this.getNode(),
			'Invalid phone number format',
			{ itemIndex: index },
		);
	}

	const response = await privyApiRequest.call(this, {
		method: 'GET',
		endpoint: '/users',
		query: {
			phone: phone,
		},
	});

	const users = (response.data as IDataObject[]) || [];
	
	if (users.length === 0) {
		throw new NodeOperationError(
			this.getNode(),
			`No user found with phone: ${phone}`,
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
