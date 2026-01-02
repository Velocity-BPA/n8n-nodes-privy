/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	isValidEthereumAddress,
	isValidSolanaAddress,
	formatDidWithPrefix,
	verifyWebhookSignature,
} from '../../nodes/Privy/transport/requestWithAuth';

describe('Transport Utilities', () => {
	describe('isValidEthereumAddress', () => {
		it('should validate correct Ethereum addresses', () => {
			expect(isValidEthereumAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f3bD12')).toBe(true);
			expect(isValidEthereumAddress('0x0000000000000000000000000000000000000000')).toBe(true);
		});

		it('should reject invalid Ethereum addresses', () => {
			expect(isValidEthereumAddress('')).toBe(false);
			expect(isValidEthereumAddress('not-an-address')).toBe(false);
			expect(isValidEthereumAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f3bD1')).toBe(false); // too short
			expect(isValidEthereumAddress('742d35Cc6634C0532925a3b844Bc9e7595f3bD12')).toBe(false); // missing 0x
		});
	});

	describe('isValidSolanaAddress', () => {
		it('should validate correct Solana addresses', () => {
			expect(isValidSolanaAddress('DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK')).toBe(true);
			expect(isValidSolanaAddress('11111111111111111111111111111111')).toBe(true); // system program
		});

		it('should reject invalid Solana addresses', () => {
			expect(isValidSolanaAddress('')).toBe(false);
			expect(isValidSolanaAddress('not-an-address')).toBe(false);
			expect(isValidSolanaAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f3bD12')).toBe(false); // eth address
		});
	});

	describe('formatDidWithPrefix', () => {
		it('should add did:privy: prefix if missing', () => {
			expect(formatDidWithPrefix('abc123')).toBe('did:privy:abc123');
		});

		it('should not duplicate prefix if already present', () => {
			expect(formatDidWithPrefix('did:privy:abc123')).toBe('did:privy:abc123');
		});

		it('should handle empty strings', () => {
			expect(formatDidWithPrefix('')).toBe('did:privy:');
		});
	});

	describe('verifyWebhookSignature', () => {
		const secret = 'test-secret';
		const payload = '{"type":"user.created"}';
		const timestamp = '1704067200';

		it('should verify valid signatures', () => {
			// Generate a proper signature
			const crypto = require('crypto');
			const signedPayload = `${timestamp}.${payload}`;
			const signature = crypto.createHmac('sha256', secret)
				.update(signedPayload)
				.digest('hex');

			expect(verifyWebhookSignature(payload, signature, timestamp, secret)).toBe(true);
		});

		it('should reject invalid signatures', () => {
			expect(verifyWebhookSignature(payload, 'invalid-signature', timestamp, secret)).toBe(false);
		});

		it('should reject modified payloads', () => {
			const crypto = require('crypto');
			const signedPayload = `${timestamp}.${payload}`;
			const signature = crypto.createHmac('sha256', secret)
				.update(signedPayload)
				.digest('hex');

			const modifiedPayload = '{"type":"user.deleted"}';
			expect(verifyWebhookSignature(modifiedPayload, signature, timestamp, secret)).toBe(false);
		});
	});
});
