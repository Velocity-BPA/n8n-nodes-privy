/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/**
 * Privy API Credentials
 * 
 * Provides authentication for the Privy wallet-as-a-service platform.
 * Uses Basic Authentication with App ID and App Secret.
 */
export class PrivyApi implements ICredentialType {
	name = 'privyApi';
	displayName = 'Privy API';
	documentationUrl = 'https://docs.privy.io/guide/server/authorization';
	
	properties: INodeProperties[] = [
		{
			displayName: 'App ID',
			name: 'appId',
			type: 'string',
			default: '',
			required: true,
			description: 'Your Privy application ID from the dashboard',
			placeholder: 'clxxxxxxxxxxxxxxxxx',
		},
		{
			displayName: 'App Secret',
			name: 'appSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your Privy application secret key',
		},
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Production',
					value: 'production',
				},
				{
					name: 'Development',
					value: 'development',
				},
			],
			default: 'production',
			required: true,
			description: 'The Privy environment to use',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Basic {{Buffer.from($credentials.appId + ":" + $credentials.appSecret).toString("base64")}}',
				'privy-app-id': '={{$credentials.appId}}',
				'Content-Type': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://auth.privy.io/api/v1',
			url: '/apps/current',
			method: 'GET',
		},
	};
}
