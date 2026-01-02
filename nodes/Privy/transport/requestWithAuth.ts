/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHookFunctions,
	IWebhookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import { PRIVY_API_BASE } from '../constants/chains';

type PrivyContext = IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions;

/**
 * Request options interface
 */
export interface PrivyRequestOptions {
	method: IHttpRequestMethods;
	endpoint: string;
	body?: IDataObject;
	query?: IDataObject;
	headers?: IDataObject;
}

/**
 * Make an authenticated request to the Privy API
 * 
 * @param context - The n8n execution context
 * @param options - Request options
 * @returns Promise resolving to the API response
 */
export async function privyApiRequest(
	this: PrivyContext,
	options: PrivyRequestOptions,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('privyApi');
	
	if (!credentials) {
		throw new NodeOperationError(this.getNode(), 'No credentials provided for Privy API');
	}

	const appId = credentials.appId as string;
	const appSecret = credentials.appSecret as string;
	
	// Create Basic Auth header
	const authString = Buffer.from(`${appId}:${appSecret}`).toString('base64');

	const requestOptions: IHttpRequestOptions = {
		method: options.method,
		url: `${PRIVY_API_BASE}${options.endpoint}`,
		headers: {
			'Authorization': `Basic ${authString}`,
			'privy-app-id': appId,
			'Content-Type': 'application/json',
			...options.headers,
		},
		json: true,
	};

	if (options.body && Object.keys(options.body).length > 0) {
		requestOptions.body = options.body;
	}

	if (options.query && Object.keys(options.query).length > 0) {
		requestOptions.qs = options.query;
	}

	try {
		const response = await this.helpers.httpRequest(requestOptions);
		return response as IDataObject;
	} catch (error) {
		if (error instanceof NodeApiError) {
			throw error;
		}
		
		const errorObj = error as { response?: { data?: JsonObject; status?: number } };
		const errorData = errorObj.response?.data;
		const statusCode = errorObj.response?.status;
		
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: (errorData?.message as string) || 'Privy API request failed',
			description: (errorData?.error as string) || 'Unknown error occurred',
			httpCode: statusCode?.toString(),
		});
	}
}

/**
 * Make a paginated request to the Privy API
 * 
 * @param context - The n8n execution context
 * @param options - Request options
 * @param returnAll - Whether to return all results
 * @param limit - Maximum number of results to return
 * @returns Promise resolving to array of results
 */
export async function privyApiRequestAllItems(
	this: IExecuteFunctions,
	options: PrivyRequestOptions,
	returnAll: boolean,
	limit: number,
): Promise<IDataObject[]> {
	const results: IDataObject[] = [];
	let cursor: string | undefined;
	
	do {
		const query = { ...options.query };
		if (cursor) {
			query.cursor = cursor;
		}
		if (!returnAll && limit) {
			query.limit = Math.min(limit - results.length, 100);
		}

		const response = await privyApiRequest.call(this, {
			...options,
			query,
		});

		const data = (response.data as IDataObject[]) || [];
		results.push(...data);

		cursor = response.next_cursor as string | undefined;

		if (!returnAll && results.length >= limit) {
			break;
		}
	} while (cursor);

	return returnAll ? results : results.slice(0, limit);
}

/**
 * Validate Ethereum address format
 * 
 * @param address - Address to validate
 * @returns Boolean indicating if address is valid
 */
export function isValidEthereumAddress(address: string): boolean {
	return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate Solana address format
 * 
 * @param address - Address to validate
 * @returns Boolean indicating if address is valid
 */
export function isValidSolanaAddress(address: string): boolean {
	// Base58 encoded, 32-44 characters
	return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

/**
 * Validate Privy DID format
 * 
 * @param did - DID to validate
 * @returns Boolean indicating if DID is valid
 */
export function isValidPrivyDid(did: string): boolean {
	return /^did:privy:[a-zA-Z0-9]+$/.test(did);
}

/**
 * Normalize Ethereum address to checksum format
 * 
 * @param address - Address to normalize
 * @returns Checksummed address
 */
export function normalizeEthereumAddress(address: string): string {
	// Simple lowercase normalization (full checksum requires keccak256)
	return address.toLowerCase();
}

/**
 * Verify webhook signature using HMAC-SHA256
 * 
 * @param payload - Raw webhook payload
 * @param signature - Signature from header
 * @param timestamp - Timestamp from header
 * @param secret - Webhook secret
 * @returns Boolean indicating if signature is valid
 */
export function verifyWebhookSignature(
	payload: string,
	signature: string,
	timestamp: string,
	secret: string,
): boolean {
	const crypto = require('crypto');
	// Privy signature includes timestamp in the signed payload
	const signedPayload = `${timestamp}.${payload}`;
	const expectedSignature = crypto
		.createHmac('sha256', secret)
		.update(signedPayload)
		.digest('hex');
	
	try {
		return crypto.timingSafeEqual(
			Buffer.from(signature),
			Buffer.from(expectedSignature),
		);
	} catch {
		return false;
	}
}

/**
 * Parse Privy DID to extract the user ID
 * 
 * @param did - Full DID string
 * @returns User ID portion
 */
export function parsePrivyDid(did: string): string {
	if (did.startsWith('did:privy:')) {
		return did.slice(10);
	}
	return did;
}

/**
 * Format user ID as Privy DID
 * 
 * @param userId - User ID
 * @returns Full DID string
 */
export function formatPrivyDid(userId: string): string {
	if (userId.startsWith('did:privy:')) {
		return userId;
	}
	return `did:privy:${userId}`;
}

/**
 * Alias for formatPrivyDid
 */
export const formatDidWithPrefix = formatPrivyDid;
