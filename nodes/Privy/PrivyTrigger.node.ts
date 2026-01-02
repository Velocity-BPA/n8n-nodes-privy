/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IDataObject,
} from 'n8n-workflow';
import { privyApiRequest, verifyWebhookSignature } from './transport';
import { WEBHOOK_EVENT_TYPE_OPTIONS } from './constants/webhookEvents';

// Emit licensing notice once on load
const LICENSING_NOTICE = `[Velocity BPA Licensing Notice]
This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`;

let licenseNoticeShown = false;

export class PrivyTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Privy Trigger',
		name: 'privyTrigger',
		icon: 'file:privy.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Starts workflow when Privy events occur',
		defaults: {
			name: 'Privy Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'privyApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				options: WEBHOOK_EVENT_TYPE_OPTIONS.map((event) => ({
					name: event.name,
					value: event.value,
					description: event.description,
				})),
				default: ['user.created'],
				description: 'Which events to listen for',
			},
			{
				displayName: 'Webhook Secret',
				name: 'webhookSecret',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'Secret key for webhook signature verification. Leave empty to skip verification.',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const webhookData = this.getWorkflowStaticData('node');

				// Check if we already have a webhook registered
				if (webhookData.webhookId) {
					try {
						const response = await privyApiRequest.call(this, {
							method: 'GET',
							endpoint: `/webhooks/${webhookData.webhookId}`,
						});

						const webhook = response as IDataObject;
						if (webhook && webhook.url === webhookUrl) {
							return true;
						}
					} catch {
						// Webhook doesn't exist, will create new one
					}
				}

				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				// Emit licensing notice once
				if (!licenseNoticeShown) {
					this.logger.warn(LICENSING_NOTICE);
					licenseNoticeShown = true;
				}

				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const events = this.getNodeParameter('events') as string[];
				const webhookData = this.getWorkflowStaticData('node');

				const body: IDataObject = {
					url: webhookUrl,
					events,
				};

				try {
					const response = await privyApiRequest.call(this, {
						method: 'POST',
						endpoint: '/webhooks',
						body,
					});

					const webhook = response as IDataObject;
					webhookData.webhookId = webhook.id;

					return true;
				} catch (error) {
					return false;
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId) {
					try {
						await privyApiRequest.call(this, {
							method: 'DELETE',
							endpoint: `/webhooks/${webhookData.webhookId}`,
						});
					} catch {
						// Continue even if delete fails
					}

					delete webhookData.webhookId;
				}

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const body = this.getBodyData() as IDataObject;
		const webhookSecret = this.getNodeParameter('webhookSecret', '') as string;
		const events = this.getNodeParameter('events') as string[];

		// Verify webhook signature if secret is provided
		if (webhookSecret) {
			const signature = req.headers['privy-signature'] as string;
			const timestamp = req.headers['privy-timestamp'] as string;
			const rawBody = JSON.stringify(body);

			if (!signature || !timestamp) {
				return {
					webhookResponse: { status: 401, body: 'Missing signature headers' },
				};
			}

			const isValid = verifyWebhookSignature(rawBody, signature, timestamp, webhookSecret);
			if (!isValid) {
				return {
					webhookResponse: { status: 401, body: 'Invalid signature' },
				};
			}
		}

		// Check if event type matches
		const eventType = body.type as string;
		if (!events.includes(eventType)) {
			// Event not subscribed, acknowledge but don't process
			return {
				webhookResponse: { status: 200, body: 'Event type not subscribed' },
			};
		}

		// Return webhook data for workflow
		return {
			workflowData: [
				this.helpers.returnJsonArray([
					{
						event: eventType,
						timestamp: body.timestamp || new Date().toISOString(),
						data: body.data || body,
						rawPayload: body,
					},
				]),
			],
		};
	}
}
