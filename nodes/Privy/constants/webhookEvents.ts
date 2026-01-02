/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { WebhookEventType } from '../types/privy.types';

/**
 * Supported webhook event types
 */
export const WEBHOOK_EVENT_TYPES: WebhookEventType[] = [
	'user.created',
	'user.updated',
	'user.deleted',
	'wallet.created',
	'wallet.updated',
	'linked_account.created',
	'linked_account.deleted',
	'session.created',
	'session.revoked',
];

/**
 * Webhook event type options for n8n dropdowns
 */
export const WEBHOOK_EVENT_TYPE_OPTIONS = [
	{ name: 'User Created', value: 'user.created', description: 'Triggered when a new user signs up' },
	{ name: 'User Updated', value: 'user.updated', description: 'Triggered when user profile changes' },
	{ name: 'User Deleted', value: 'user.deleted', description: 'Triggered when a user is deleted' },
	{ name: 'Wallet Created', value: 'wallet.created', description: 'Triggered when a new wallet is created' },
	{ name: 'Wallet Updated', value: 'wallet.updated', description: 'Triggered when wallet settings change' },
	{ name: 'Linked Account Created', value: 'linked_account.created', description: 'Triggered when new auth method added' },
	{ name: 'Linked Account Deleted', value: 'linked_account.deleted', description: 'Triggered when auth method removed' },
	{ name: 'Session Created', value: 'session.created', description: 'Triggered when user logs in' },
	{ name: 'Session Revoked', value: 'session.revoked', description: 'Triggered when session ends' },
];

/**
 * Event categories for grouping
 */
export const WEBHOOK_EVENT_CATEGORIES = {
	user: ['user.created', 'user.updated', 'user.deleted'],
	wallet: ['wallet.created', 'wallet.updated'],
	linkedAccount: ['linked_account.created', 'linked_account.deleted'],
	session: ['session.created', 'session.revoked'],
};

/**
 * Get category for an event type
 */
export function getEventCategory(eventType: WebhookEventType): string {
	for (const [category, events] of Object.entries(WEBHOOK_EVENT_CATEGORIES)) {
		if ((events as string[]).includes(eventType)) {
			return category;
		}
	}
	return 'other';
}

/**
 * Get display name for event type
 */
export function getEventDisplayName(eventType: WebhookEventType): string {
	const option = WEBHOOK_EVENT_TYPE_OPTIONS.find((opt) => opt.value === eventType);
	return option?.name ?? eventType;
}

/**
 * Parse event type from string
 */
export function parseEventType(eventString: string): WebhookEventType | undefined {
	return WEBHOOK_EVENT_TYPES.find((type) => type === eventString);
}
