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

// Verify Email OTP Properties
export const verifyEmailOtpProperties: INodeProperties[] = [
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['authentication'],
				operation: ['verifyEmailOtp'],
			},
		},
	},
	{
		displayName: 'OTP Code',
		name: 'code',
		type: 'string',
		required: true,
		default: '',
		description: 'The one-time password sent to the email',
		displayOptions: {
			show: {
				resource: ['authentication'],
				operation: ['verifyEmailOtp'],
			},
		},
	},
];

// Verify SMS OTP Properties
export const verifySmsOtpProperties: INodeProperties[] = [
	{
		displayName: 'Phone Number',
		name: 'phone',
		type: 'string',
		placeholder: '+1234567890',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['authentication'],
				operation: ['verifySmsOtp'],
			},
		},
	},
	{
		displayName: 'OTP Code',
		name: 'code',
		type: 'string',
		required: true,
		default: '',
		description: 'The one-time password sent via SMS',
		displayOptions: {
			show: {
				resource: ['authentication'],
				operation: ['verifySmsOtp'],
			},
		},
	},
];

// Verify Custom JWT Properties
export const verifyCustomJwtProperties: INodeProperties[] = [
	{
		displayName: 'JWT Token',
		name: 'token',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		default: '',
		description: 'The custom JWT token to verify',
		displayOptions: {
			show: {
				resource: ['authentication'],
				operation: ['verifyCustomJwt'],
			},
		},
	},
	{
		displayName: 'Provider ID',
		name: 'providerId',
		type: 'string',
		required: true,
		default: '',
		description: 'The custom auth provider identifier',
		displayOptions: {
			show: {
				resource: ['authentication'],
				operation: ['verifyCustomJwt'],
			},
		},
	},
];

// Get User by Access Token Properties
export const getUserByAccessTokenProperties: INodeProperties[] = [
	{
		displayName: 'Access Token',
		name: 'accessToken',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		default: '',
		description: 'The Privy access token to decode',
		displayOptions: {
			show: {
				resource: ['authentication'],
				operation: ['getUserByAccessToken'],
			},
		},
	},
];

// Execute Functions
export async function executeVerifyEmailOtp(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const email = this.getNodeParameter('email', index) as string;
	const code = this.getNodeParameter('code', index) as string;

	if (!email.includes('@')) {
		throw new NodeOperationError(this.getNode(), 'Invalid email address', { itemIndex: index });
	}

	const response = await privyApiRequest.call(this, {
		method: 'POST',
		endpoint: '/auth/email/verify',
		body: {
			email,
			code,
		},
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}

export async function executeVerifySmsOtp(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const phone = this.getNodeParameter('phone', index) as string;
	const code = this.getNodeParameter('code', index) as string;

	const response = await privyApiRequest.call(this, {
		method: 'POST',
		endpoint: '/auth/sms/verify',
		body: {
			phone_number: phone,
			code,
		},
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}

export async function executeVerifyCustomJwt(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const token = this.getNodeParameter('token', index) as string;
	const providerId = this.getNodeParameter('providerId', index) as string;

	const response = await privyApiRequest.call(this, {
		method: 'POST',
		endpoint: '/auth/custom/verify',
		body: {
			token,
			provider_id: providerId,
		},
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}

export async function executeGetUserByAccessToken(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const accessToken = this.getNodeParameter('accessToken', index) as string;

	const response = await privyApiRequest.call(this, {
		method: 'POST',
		endpoint: '/auth/token/verify',
		body: {
			access_token: accessToken,
		},
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}
