/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { ChainConfig } from '../types/privy.types';

/**
 * Privy API base URL
 */
export const PRIVY_API_BASE = 'https://auth.privy.io/api/v1';

/**
 * Supported blockchain networks
 */
export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
	ethereum: {
		name: 'Ethereum Mainnet',
		chainId: 1,
		type: 'evm',
		symbol: 'ETH',
	},
	polygon: {
		name: 'Polygon',
		chainId: 137,
		type: 'evm',
		symbol: 'MATIC',
	},
	arbitrum: {
		name: 'Arbitrum One',
		chainId: 42161,
		type: 'evm',
		symbol: 'ETH',
	},
	optimism: {
		name: 'Optimism',
		chainId: 10,
		type: 'evm',
		symbol: 'ETH',
	},
	base: {
		name: 'Base',
		chainId: 8453,
		type: 'evm',
		symbol: 'ETH',
	},
	avalanche: {
		name: 'Avalanche C-Chain',
		chainId: 43114,
		type: 'evm',
		symbol: 'AVAX',
	},
	bsc: {
		name: 'BNB Smart Chain',
		chainId: 56,
		type: 'evm',
		symbol: 'BNB',
	},
	solana: {
		name: 'Solana Mainnet',
		chainId: 'mainnet-beta',
		type: 'solana',
		symbol: 'SOL',
	},
	'solana-devnet': {
		name: 'Solana Devnet',
		chainId: 'devnet',
		type: 'solana',
		symbol: 'SOL',
	},
	goerli: {
		name: 'Goerli Testnet',
		chainId: 5,
		type: 'evm',
		symbol: 'ETH',
	},
	sepolia: {
		name: 'Sepolia Testnet',
		chainId: 11155111,
		type: 'evm',
		symbol: 'ETH',
	},
	'polygon-mumbai': {
		name: 'Polygon Mumbai',
		chainId: 80001,
		type: 'evm',
		symbol: 'MATIC',
	},
	'base-goerli': {
		name: 'Base Goerli',
		chainId: 84531,
		type: 'evm',
		symbol: 'ETH',
	},
	'arbitrum-goerli': {
		name: 'Arbitrum Goerli',
		chainId: 421613,
		type: 'evm',
		symbol: 'ETH',
	},
};

/**
 * Chain options for n8n dropdowns
 */
export const CHAIN_OPTIONS = Object.entries(SUPPORTED_CHAINS).map(([value, config]) => ({
	name: config.name,
	value,
	description: `${config.type.toUpperCase()} - Chain ID: ${config.chainId}`,
}));

/**
 * EVM chain options only
 */
export const EVM_CHAIN_OPTIONS = Object.entries(SUPPORTED_CHAINS)
	.filter(([, config]) => config.type === 'evm')
	.map(([value, config]) => ({
		name: config.name,
		value,
		description: `Chain ID: ${config.chainId}`,
	}));

/**
 * Solana chain options only
 */
export const SOLANA_CHAIN_OPTIONS = Object.entries(SUPPORTED_CHAINS)
	.filter(([, config]) => config.type === 'solana')
	.map(([value, config]) => ({
		name: config.name,
		value,
		description: `${config.chainId}`,
	}));

/**
 * Get chain config by name or chain ID
 */
export function getChainConfig(chainIdentifier: string | number): ChainConfig | undefined {
	if (typeof chainIdentifier === 'string') {
		return SUPPORTED_CHAINS[chainIdentifier.toLowerCase()];
	}
	return Object.values(SUPPORTED_CHAINS).find(
		(chain) => chain.chainId === chainIdentifier,
	);
}

/**
 * Check if a chain is EVM-compatible
 */
export function isEvmChain(chainIdentifier: string): boolean {
	const chain = SUPPORTED_CHAINS[chainIdentifier.toLowerCase()];
	return chain?.type === 'evm';
}

/**
 * Check if a chain is Solana
 */
export function isSolanaChain(chainIdentifier: string): boolean {
	const chain = SUPPORTED_CHAINS[chainIdentifier.toLowerCase()];
	return chain?.type === 'solana';
}
