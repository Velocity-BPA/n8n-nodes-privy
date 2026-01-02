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
import { privyApiRequest, privyApiRequestAllItems } from '../../transport';
import { WEBHOOK_EVENT_TYPE_OPTIONS } from '../../constants/webhookEvents';

// List Properties
export const listProperties: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all webhooks',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['list'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: { minValue: 1, maxValue: 1000 },
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['list'],
				returnAll: [false],
			},
		},
	},
];

// Create Properties
export const createProperties: INodeProperties[] = [
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'https://example.com/webhook',
		description: 'The webhook endpoint URL',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Events',
		name: 'events',
		type: 'multiOptions',
		options: WEBHOOK_EVENT_TYPE_OPTIONS.map((event) => ({
			name: event.name,
			value: event.value,
		})),
		default: [],
		description: 'Events to subscribe to',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
	},
];

// Get Properties
export const getProperties: INodeProperties[] = [
	{
		displayName: 'Webhook ID',
		name: 'webhookId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['get'],
			},
		},
	},
];

// Update Properties
export const updateProperties: INodeProperties[] = [
	{
		displayName: 'Webhook ID',
		name: 'webhookId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['update'],
			},
		},
	},
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		default: '',
		placeholder: 'https://example.com/webhook',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['update'],
			},
		},
	},
	{
		displayName: 'Events',
		name: 'events',
		type: 'multiOptions',
		options: WEBHOOK_EVENT_TYPE_OPTIONS.map((event) => ({
			name: event.name,
			value: event.value,
		})),
		default: [],
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['update'],
			},
		},
	},
	{
		displayName: 'Enabled',
		name: 'enabled',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['update'],
			},
		},
	},
];

// Delete Properties
export const deleteProperties: INodeProperties[] = [
	{
		displayName: 'Webhook ID',
		name: 'webhookId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['delete'],
			},
		},
	},
];

// Get Deliveries Properties
export const getDeliveriesProperties: INodeProperties[] = [
	{
		displayName: 'Webhook ID',
		name: 'webhookId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['getDeliveries'],
			},
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['getDeliveries'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: { minValue: 1, maxValue: 1000 },
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['getDeliveries'],
				returnAll: [false],
			},
		},
	},
];

// Retry Delivery Properties
export const retryDeliveryProperties: INodeProperties[] = [
	{
		displayName: 'Webhook ID',
		name: 'webhookId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['retryDelivery'],
			},
		},
	},
	{
		displayName: 'Delivery ID',
		name: 'deliveryId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['retryDelivery'],
			},
		},
	},
];

// Execute Functions
export async function executeList(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;

	const webhooks = await privyApiRequestAllItems.call(
		this,
		{ method: 'GET', endpoint: '/webhooks' },
		returnAll,
		limit,
	);

	return webhooks.map((webhook) => ({
		json: webhook as IDataObject,
		pairedItem: { item: index },
	}));
}

export async function executeCreate(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const url = this.getNodeParameter('url', index) as string;
	const events = this.getNodeParameter('events', index, []) as string[];
	const description = this.getNodeParameter('description', index, '') as string;

	if (!url.startsWith('https://')) {
		throw new NodeOperationError(this.getNode(), 'Webhook URL must use HTTPS', { itemIndex: index });
	}

	const body: IDataObject = {
		url,
		events,
	};
	if (description) body.description = description;

	const response = await privyApiRequest.call(this, {
		method: 'POST',
		endpoint: '/webhooks',
		body,
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}

export async function executeGet(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const webhookId = this.getNodeParameter('webhookId', index) as string;

	const response = await privyApiRequest.call(this, {
		method: 'GET',
		endpoint: `/webhooks/${encodeURIComponent(webhookId)}`,
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}

export async function executeUpdate(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const webhookId = this.getNodeParameter('webhookId', index) as string;
	const url = this.getNodeParameter('url', index, '') as string;
	const events = this.getNodeParameter('events', index, []) as string[];
	const enabled = this.getNodeParameter('enabled', index, true) as boolean;

	const body: IDataObject = { enabled };
	if (url) {
		if (!url.startsWith('https://')) {
			throw new NodeOperationError(this.getNode(), 'Webhook URL must use HTTPS', { itemIndex: index });
		}
		body.url = url;
	}
	if (events.length > 0) body.events = events;

	const response = await privyApiRequest.call(this, {
		method: 'PUT',
		endpoint: `/webhooks/${encodeURIComponent(webhookId)}`,
		body,
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}

export async function executeDelete(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const webhookId = this.getNodeParameter('webhookId', index) as string;

	await privyApiRequest.call(this, {
		method: 'DELETE',
		endpoint: `/webhooks/${encodeURIComponent(webhookId)}`,
	});

	return [{ json: { success: true, deleted: webhookId }, pairedItem: { item: index } }];
}

export async function executeGetDeliveries(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const webhookId = this.getNodeParameter('webhookId', index) as string;
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;

	const deliveries = await privyApiRequestAllItems.call(
		this,
		{ method: 'GET', endpoint: `/webhooks/${encodeURIComponent(webhookId)}/deliveries` },
		returnAll,
		limit,
	);

	return deliveries.map((delivery) => ({
		json: delivery as IDataObject,
		pairedItem: { item: index },
	}));
}

export async function executeRetryDelivery(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const webhookId = this.getNodeParameter('webhookId', index) as string;
	const deliveryId = this.getNodeParameter('deliveryId', index) as string;

	const response = await privyApiRequest.call(this, {
		method: 'POST',
		endpoint: `/webhooks/${encodeURIComponent(webhookId)}/deliveries/${encodeURIComponent(deliveryId)}/retry`,
	});

	return [{ json: response as IDataObject, pairedItem: { item: index } }];
}
