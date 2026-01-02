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

// Create Session Properties
export const createSessionProperties: INodeProperties[] = [
	{
		displayName: 'Provider ID',
		name: 'providerId',
		type: 'string',
		required: true,
		default: '',
		description: 'The custom auth provider identifier',
		displayOptions: {
			show: {
				resource: ['customAuth'],
				operation: ['createSession'],
			},
		},
	},
	{
		displayName: 'User Identifier',
		name: 'userIdentifier',
		type: 'string',
		required: true,
		default: '',
		description: 'Unique identifier for the user from your system',
		displayOptions: {
			show: {
				resource: ['customAuth'],
				operation: ['createSession'],
			},
		},
	},
	{
		displayName: 'Additional Claims (JSON)',
		name: 'claims',
		type: 'json',
		default: '{}',
		description: 'Additional claims to include in the session',
		displayOptions: {
			show: {
				resource: ['customAuth'],
				operation: ['createSession'],
			},
		},
	},
];

// Get Config Properties
export const getConfigProperties: INodeProperties[] = [
	{
		displayName: 'Provider ID',
		name: 'providerId',
		type: 'string',
		required: true,
		default: '',
		description: 'The custom auth provider identifier',
		displayOptions: {
			show: {
				resource: ['customAuth'],
				operation: ['getConfig'],
			},
		},
	},
];

// Update Config Properties
export const updateConfigProperties: INodeProperties[] = [
	{
		displayName: 'Provider ID',
		name: 'providerId',
		type: 'string',
		required: true,
		default: '',
		description: 'The custom auth provider identifier',
		displayOptions: {
			show: {
				resource: ['customAuth'],
				operation: ['updateConfig'],
			},
		},
	},
	{
		displayName: 'JWKS URI',
		name: 'jwksUri',
		type: 'string',
		default: '',
		description: 'JSON Web Key Set URI for token verification',
		displayOptions: {
			show: {
				resource: ['customAuth'],
				operation: ['updateConfig'],
			},
		},
	},
	{
		displayName: 'Issuer',
		name: 'issuer',
		type: 'string',
		default: '',
		description: 'Expected token issuer',
		displayOptions: {
			show: {
				resource: ['customAuth'],
				operation: ['updateConfig'],
			},
		},
	},
	{
		displayName: 'Audience',
		name: 'audience',
		type: 'string',
		default: '',
		description: 'Expected token audience',
		displayOptions: {
			show: {
				resource: ['customAuth'],
				operation: ['updateConfig'],
			},
		},
	},
	{
		displayName: 'User ID Claim',
		name: 'userIdClaim',
		type: 'string',
		default: 'sub',
		description: 'JWT claim to use as user identifier',
		displayOptions: {
			show: {
				resource: ['customAuth'],
				operation: ['updateConfig'],
			},
		},
	},
];

// Execute Functions
export async function executeCreateSession(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const providerId = this.getNodeParameter('providerId', index) as string;
	const userIdentifier = this.getNodeParameter('userIdentifier', index) as string;
	const claimsStr = this.getNodeParameter('claims', index, '{}') as string;

	let claims: IDataObject = {};
	try {
		claims = JSON.parse(claimsStr);
	} catch {
		throw new NodeOperationError(this.getNode(), 'Invalid JSON in claims', { itemIndex: index });
	}

	const response = await privyApiRequest.call(this, {
		method: 'POST',
		endpoint: `/custom-auth/${encodeURIComponent(providerId)}/sessions`,
		body: {
			user_id: userIdentifier,
			claims,
		},
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}

export async function executeGetConfig(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const providerId = this.getNodeParameter('providerId', index) as string;

	const response = await privyApiRequest.call(this, {
		method: 'GET',
		endpoint: `/custom-auth/${encodeURIComponent(providerId)}/config`,
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}

export async function executeUpdateConfig(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const providerId = this.getNodeParameter('providerId', index) as string;
	const jwksUri = this.getNodeParameter('jwksUri', index, '') as string;
	const issuer = this.getNodeParameter('issuer', index, '') as string;
	const audience = this.getNodeParameter('audience', index, '') as string;
	const userIdClaim = this.getNodeParameter('userIdClaim', index, 'sub') as string;

	const body: IDataObject = {};
	if (jwksUri) body.jwks_uri = jwksUri;
	if (issuer) body.issuer = issuer;
	if (audience) body.audience = audience;
	if (userIdClaim) body.user_id_claim = userIdClaim;

	const response = await privyApiRequest.call(this, {
		method: 'PUT',
		endpoint: `/custom-auth/${encodeURIComponent(providerId)}/config`,
		body,
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}
