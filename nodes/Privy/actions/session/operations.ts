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

// Create Session Properties
export const createProperties: INodeProperties[] = [
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'did:privy:xxxxx',
		description: 'The user ID to create session for',
		displayOptions: {
			show: {
				resource: ['session'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Expires In (Seconds)',
		name: 'expiresIn',
		type: 'number',
		default: 3600,
		description: 'Session expiration time in seconds',
		displayOptions: {
			show: {
				resource: ['session'],
				operation: ['create'],
			},
		},
	},
];

// Verify Session Properties
export const verifyProperties: INodeProperties[] = [
	{
		displayName: 'Session Token',
		name: 'sessionToken',
		type: 'string',
		required: true,
		default: '',
		description: 'The session token to verify',
		typeOptions: { password: true },
		displayOptions: {
			show: {
				resource: ['session'],
				operation: ['verify'],
			},
		},
	},
];

// Revoke Session Properties
export const revokeProperties: INodeProperties[] = [
	{
		displayName: 'Session ID',
		name: 'sessionId',
		type: 'string',
		required: true,
		default: '',
		description: 'The session ID to revoke',
		displayOptions: {
			show: {
				resource: ['session'],
				operation: ['revoke'],
			},
		},
	},
];

// Get Active Sessions Properties
export const getActiveProperties: INodeProperties[] = [
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'did:privy:xxxxx',
		description: 'The user ID to get sessions for',
		displayOptions: {
			show: {
				resource: ['session'],
				operation: ['getActive'],
			},
		},
	},
];

// Revoke All Sessions Properties
export const revokeAllProperties: INodeProperties[] = [
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'did:privy:xxxxx',
		description: 'The user ID to revoke all sessions for',
		displayOptions: {
			show: {
				resource: ['session'],
				operation: ['revokeAll'],
			},
		},
	},
];

// Execute Functions
export async function executeCreate(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	let userId = this.getNodeParameter('userId', index) as string;
	const expiresIn = this.getNodeParameter('expiresIn', index, 3600) as number;

	userId = formatPrivyDid(userId);
	if (!isValidPrivyDid(userId)) {
		throw new NodeOperationError(this.getNode(), 'Invalid user ID format', { itemIndex: index });
	}

	const response = await privyApiRequest.call(this, {
		method: 'POST',
		endpoint: '/sessions',
		body: {
			user_id: userId,
			expires_in: expiresIn,
		},
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}

export async function executeVerify(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const sessionToken = this.getNodeParameter('sessionToken', index) as string;

	const response = await privyApiRequest.call(this, {
		method: 'POST',
		endpoint: '/sessions/verify',
		body: { token: sessionToken },
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}

export async function executeRevoke(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const sessionId = this.getNodeParameter('sessionId', index) as string;

	await privyApiRequest.call(this, {
		method: 'DELETE',
		endpoint: `/sessions/${encodeURIComponent(sessionId)}`,
	});

	return [{
		json: { success: true, revoked: sessionId } as IDataObject,
		pairedItem: { item: index },
	}];
}

export async function executeGetActive(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	let userId = this.getNodeParameter('userId', index) as string;

	userId = formatPrivyDid(userId);
	if (!isValidPrivyDid(userId)) {
		throw new NodeOperationError(this.getNode(), 'Invalid user ID format', { itemIndex: index });
	}

	const response = await privyApiRequest.call(this, {
		method: 'GET',
		endpoint: `/users/${encodeURIComponent(userId)}/sessions`,
	});

	const sessions = (response.data as IDataObject[]) || (response.sessions as IDataObject[]) || [];
	return sessions.map((session) => ({
		json: session as IDataObject,
		pairedItem: { item: index },
	}));
}

export async function executeRevokeAll(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	let userId = this.getNodeParameter('userId', index) as string;

	userId = formatPrivyDid(userId);
	if (!isValidPrivyDid(userId)) {
		throw new NodeOperationError(this.getNode(), 'Invalid user ID format', { itemIndex: index });
	}

	await privyApiRequest.call(this, {
		method: 'DELETE',
		endpoint: `/users/${encodeURIComponent(userId)}/sessions`,
	});

	return [{
		json: { success: true, user_id: userId, message: 'All sessions revoked' } as IDataObject,
		pairedItem: { item: index },
	}];
}
