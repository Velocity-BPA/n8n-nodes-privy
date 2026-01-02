/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

// User operations
import * as userList from './actions/user/list.operation';
import * as userGet from './actions/user/get.operation';
import * as userGetByEmail from './actions/user/getByEmail.operation';
import * as userGetByPhone from './actions/user/getByPhone.operation';
import * as userGetByWallet from './actions/user/getByWallet.operation';
import * as userGetByTwitter from './actions/user/getByTwitter.operation';
import * as userGetByDiscord from './actions/user/getByDiscord.operation';
import * as userCreate from './actions/user/create.operation';
import * as userDelete from './actions/user/delete.operation';
import * as userUpdateMetadata from './actions/user/updateMetadata.operation';

// Embedded wallet operations
import * as embeddedWalletList from './actions/embeddedWallet/list.operation';
import * as embeddedWalletGet from './actions/embeddedWallet/get.operation';
import * as embeddedWalletCreateEthereum from './actions/embeddedWallet/createEthereum.operation';
import * as embeddedWalletCreateSolana from './actions/embeddedWallet/createSolana.operation';
import * as embeddedWalletPregenerate from './actions/embeddedWallet/pregenerate.operation';
import * as embeddedWalletGetBalance from './actions/embeddedWallet/getBalance.operation';
import * as embeddedWalletGetTransactions from './actions/embeddedWallet/getTransactions.operation';

// Server wallet operations
import * as serverWalletList from './actions/serverWallet/list.operation';
import * as serverWalletCreate from './actions/serverWallet/create.operation';
import * as serverWalletGet from './actions/serverWallet/get.operation';
import * as serverWalletDelete from './actions/serverWallet/delete.operation';
import * as serverWalletSignMessage from './actions/serverWallet/signMessage.operation';
import * as serverWalletSignTransaction from './actions/serverWallet/signTransaction.operation';
import * as serverWalletSendTransaction from './actions/serverWallet/sendTransaction.operation';
import * as serverWalletPolicy from './actions/serverWallet/policy.operation';

// Delegated wallet operations
import * as delegatedWallet from './actions/delegatedWallet/operations';

// Session operations
import * as session from './actions/session/operations';

// Authentication operations
import * as authentication from './actions/authentication/operations';

// Linked account operations
import * as linkedAccount from './actions/linkedAccount/operations';

// Custom auth operations
import * as customAuth from './actions/customAuth/operations';

// Webhook operations
import * as webhook from './actions/webhook/operations';

// App config operations
import * as appConfig from './actions/appConfig/operations';

// Emit licensing notice once on load
const LICENSING_NOTICE = `[Velocity BPA Licensing Notice]
This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`;

let licenseNoticeShown = false;

export class Privy implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Privy',
		name: 'privy',
		icon: 'file:privy.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Privy wallet-as-a-service API',
		defaults: {
			name: 'Privy',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'privyApi',
				required: true,
			},
		],
		properties: [
			// Resource selector
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'App Configuration', value: 'appConfig' },
					{ name: 'Authentication', value: 'authentication' },
					{ name: 'Custom Auth', value: 'customAuth' },
					{ name: 'Delegated Wallet', value: 'delegatedWallet' },
					{ name: 'Embedded Wallet', value: 'embeddedWallet' },
					{ name: 'Linked Account', value: 'linkedAccount' },
					{ name: 'Server Wallet', value: 'serverWallet' },
					{ name: 'Session', value: 'session' },
					{ name: 'User', value: 'user' },
					{ name: 'Webhook', value: 'webhook' },
				],
				default: 'user',
			},

			// User operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['user'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create a user' },
					{ name: 'Delete', value: 'delete', action: 'Delete a user' },
					{ name: 'Get', value: 'get', action: 'Get a user by DID' },
					{ name: 'Get by Discord', value: 'getByDiscord', action: 'Get a user by Discord ID' },
					{ name: 'Get by Email', value: 'getByEmail', action: 'Get a user by email' },
					{ name: 'Get by Phone', value: 'getByPhone', action: 'Get a user by phone' },
					{ name: 'Get by Twitter', value: 'getByTwitter', action: 'Get a user by Twitter handle' },
					{ name: 'Get by Wallet', value: 'getByWallet', action: 'Get a user by wallet address' },
					{ name: 'List', value: 'list', action: 'List users' },
					{ name: 'Update Metadata', value: 'updateMetadata', action: 'Update user metadata' },
				],
				default: 'list',
			},

			// Embedded wallet operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['embeddedWallet'] } },
				options: [
					{ name: 'Create Ethereum Wallet', value: 'createEthereum', action: 'Create an Ethereum wallet' },
					{ name: 'Create Solana Wallet', value: 'createSolana', action: 'Create a Solana wallet' },
					{ name: 'Get', value: 'get', action: 'Get wallet details' },
					{ name: 'Get Balance', value: 'getBalance', action: 'Get wallet balance' },
					{ name: 'Get Transactions', value: 'getTransactions', action: 'Get wallet transactions' },
					{ name: 'List', value: 'list', action: 'List user wallets' },
					{ name: 'Pregenerate', value: 'pregenerate', action: 'Pregenerate wallet' },
				],
				default: 'list',
			},

			// Server wallet operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['serverWallet'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create a server wallet' },
					{ name: 'Delete', value: 'delete', action: 'Delete a server wallet' },
					{ name: 'Get', value: 'get', action: 'Get server wallet details' },
					{ name: 'Get Policy', value: 'getPolicy', action: 'Get wallet policy' },
					{ name: 'List', value: 'list', action: 'List server wallets' },
					{ name: 'Send Transaction', value: 'sendTransaction', action: 'Send a transaction' },
					{ name: 'Sign Message', value: 'signMessage', action: 'Sign a message' },
					{ name: 'Sign Transaction', value: 'signTransaction', action: 'Sign a transaction' },
					{ name: 'Update Policy', value: 'updatePolicy', action: 'Update wallet policy' },
				],
				default: 'list',
			},

			// Delegated wallet operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['delegatedWallet'] } },
				options: [
					{ name: 'Get', value: 'get', action: 'Get delegated wallet' },
					{ name: 'List', value: 'list', action: 'List delegated wallets' },
					{ name: 'Send Transaction', value: 'sendTransaction', action: 'Send a transaction' },
					{ name: 'Sign Message', value: 'signMessage', action: 'Sign a message' },
					{ name: 'Sign Transaction', value: 'signTransaction', action: 'Sign a transaction' },
					{ name: 'Sign Typed Data', value: 'signTypedData', action: 'Sign typed data EIP-712' },
				],
				default: 'list',
			},

			// Session operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['session'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create a session' },
					{ name: 'Get Active', value: 'getActive', action: 'Get active sessions' },
					{ name: 'Revoke', value: 'revoke', action: 'Revoke a session' },
					{ name: 'Revoke All', value: 'revokeAll', action: 'Revoke all sessions' },
					{ name: 'Verify', value: 'verify', action: 'Verify a session' },
				],
				default: 'create',
			},

			// Authentication operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['authentication'] } },
				options: [
					{ name: 'Get User by Access Token', value: 'getUserByToken', action: 'Get user by access token' },
					{ name: 'Verify Custom JWT', value: 'verifyCustomJwt', action: 'Verify custom JWT' },
					{ name: 'Verify Email OTP', value: 'verifyEmailOtp', action: 'Verify email OTP' },
					{ name: 'Verify SMS OTP', value: 'verifySmsOtp', action: 'Verify SMS OTP' },
				],
				default: 'verifyEmailOtp',
			},

			// Linked account operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['linkedAccount'] } },
				options: [
					{ name: 'Link Email', value: 'linkEmail', action: 'Link an email' },
					{ name: 'Link Phone', value: 'linkPhone', action: 'Link a phone number' },
					{ name: 'Link Wallet', value: 'linkWallet', action: 'Link a wallet' },
					{ name: 'List', value: 'list', action: 'List linked accounts' },
					{ name: 'Set Primary', value: 'setPrimary', action: 'Set primary account' },
					{ name: 'Unlink', value: 'unlink', action: 'Unlink an account' },
				],
				default: 'list',
			},

			// Custom auth operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['customAuth'] } },
				options: [
					{ name: 'Create Session', value: 'createSession', action: 'Create custom auth session' },
					{ name: 'Get Config', value: 'getConfig', action: 'Get custom auth config' },
					{ name: 'Update Config', value: 'updateConfig', action: 'Update custom auth config' },
				],
				default: 'createSession',
			},

			// Webhook operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['webhook'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create a webhook' },
					{ name: 'Delete', value: 'delete', action: 'Delete a webhook' },
					{ name: 'Get', value: 'get', action: 'Get webhook details' },
					{ name: 'Get Deliveries', value: 'getDeliveries', action: 'Get webhook deliveries' },
					{ name: 'List', value: 'list', action: 'List webhooks' },
					{ name: 'Retry Delivery', value: 'retryDelivery', action: 'Retry webhook delivery' },
					{ name: 'Update', value: 'update', action: 'Update a webhook' },
				],
				default: 'list',
			},

			// App config operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['appConfig'] } },
				options: [
					{ name: 'Get Login Methods', value: 'getLoginMethods', action: 'Get login methods' },
					{ name: 'Get Settings', value: 'getSettings', action: 'Get app settings' },
					{ name: 'Get Wallet Config', value: 'getWalletConfig', action: 'Get wallet configuration' },
					{ name: 'Update Login Methods', value: 'updateLoginMethods', action: 'Update login methods' },
					{ name: 'Update Settings', value: 'updateSettings', action: 'Update app settings' },
					{ name: 'Update Wallet Config', value: 'updateWalletConfig', action: 'Update wallet configuration' },
				],
				default: 'getSettings',
			},

			// ====================
			// User operation properties
			// ====================
			...userList.listProperties,
			...userGet.getProperties,
			...userGetByEmail.getByEmailProperties,
			...userGetByPhone.getByPhoneProperties,
			...userGetByWallet.getByWalletProperties,
			...userGetByTwitter.getByTwitterProperties,
			...userGetByDiscord.getByDiscordProperties,
			...userCreate.createProperties,
			...userDelete.deleteProperties,
			...userUpdateMetadata.updateMetadataProperties,

			// ====================
			// Embedded wallet operation properties
			// ====================
			...embeddedWalletList.listProperties,
			...embeddedWalletGet.getProperties,
			...embeddedWalletCreateEthereum.createEthereumProperties,
			...embeddedWalletCreateSolana.createSolanaProperties,
			...embeddedWalletPregenerate.pregenerateProperties,
			...embeddedWalletGetBalance.getBalanceProperties,
			...embeddedWalletGetTransactions.getTransactionsProperties,

			// ====================
			// Server wallet operation properties
			// ====================
			...serverWalletList.listProperties,
			...serverWalletCreate.createProperties,
			...serverWalletGet.getProperties,
			...serverWalletDelete.deleteProperties,
			...serverWalletSignMessage.signMessageProperties,
			...serverWalletSignTransaction.signTransactionProperties,
			...serverWalletSendTransaction.sendTransactionProperties,
			...serverWalletPolicy.getPolicyProperties,
			...serverWalletPolicy.updatePolicyProperties,

			// ====================
			// Delegated wallet operation properties
			// ====================
			...delegatedWallet.listProperties,
			...delegatedWallet.getProperties,
			...delegatedWallet.signMessageProperties,
			...delegatedWallet.signTransactionProperties,
			...delegatedWallet.sendTransactionProperties,
			...delegatedWallet.signTypedDataProperties,

			// ====================
			// Session operation properties
			// ====================
			...session.createProperties,
			...session.verifyProperties,
			...session.revokeProperties,
			...session.getActiveProperties,
			...session.revokeAllProperties,

			// ====================
			// Authentication operation properties
			// ====================
			...authentication.verifyEmailOtpProperties,
			...authentication.verifySmsOtpProperties,
			...authentication.verifyCustomJwtProperties,
			...authentication.getUserByAccessTokenProperties,

			// ====================
			// Linked account operation properties
			// ====================
			...linkedAccount.listProperties,
			...linkedAccount.linkEmailProperties,
			...linkedAccount.linkPhoneProperties,
			...linkedAccount.linkWalletProperties,
			...linkedAccount.unlinkProperties,
			...linkedAccount.setPrimaryProperties,

			// ====================
			// Custom auth operation properties
			// ====================
			...customAuth.createSessionProperties,
			...customAuth.getConfigProperties,
			...customAuth.updateConfigProperties,

			// ====================
			// Webhook operation properties
			// ====================
			...webhook.listProperties,
			...webhook.createProperties,
			...webhook.getProperties,
			...webhook.updateProperties,
			...webhook.deleteProperties,
			...webhook.getDeliveriesProperties,
			...webhook.retryDeliveryProperties,

			// ====================
			// App config operation properties
			// ====================
			...appConfig.getSettingsProperties,
			...appConfig.updateSettingsProperties,
			...appConfig.getLoginMethodsProperties,
			...appConfig.updateLoginMethodsProperties,
			...appConfig.getWalletConfigProperties,
			...appConfig.updateWalletConfigProperties,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// Show licensing notice once
		if (!licenseNoticeShown) {
			console.warn(LICENSING_NOTICE);
			licenseNoticeShown = true;
		}

		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let result: INodeExecutionData[] = [];

				// Route to appropriate handler based on resource and operation
				switch (resource) {
					case 'user':
						result = await executeUserOperation.call(this, operation, i);
						break;
					case 'embeddedWallet':
						result = await executeEmbeddedWalletOperation.call(this, operation, i);
						break;
					case 'serverWallet':
						result = await executeServerWalletOperation.call(this, operation, i);
						break;
					case 'delegatedWallet':
						result = await executeDelegatedWalletOperation.call(this, operation, i);
						break;
					case 'session':
						result = await executeSessionOperation.call(this, operation, i);
						break;
					case 'authentication':
						result = await executeAuthenticationOperation.call(this, operation, i);
						break;
					case 'linkedAccount':
						result = await executeLinkedAccountOperation.call(this, operation, i);
						break;
					case 'customAuth':
						result = await executeCustomAuthOperation.call(this, operation, i);
						break;
					case 'webhook':
						result = await executeWebhookOperation.call(this, operation, i);
						break;
					case 'appConfig':
						result = await executeAppConfigOperation.call(this, operation, i);
						break;
					default:
						throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
				}

				returnData.push(...result);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

// Helper functions for executing operations
async function executeUserOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'list':
			return userList.execute.call(this, index);
		case 'get':
			return userGet.execute.call(this, index);
		case 'getByEmail':
			return userGetByEmail.execute.call(this, index);
		case 'getByPhone':
			return userGetByPhone.execute.call(this, index);
		case 'getByWallet':
			return userGetByWallet.execute.call(this, index);
		case 'getByTwitter':
			return userGetByTwitter.execute.call(this, index);
		case 'getByDiscord':
			return userGetByDiscord.execute.call(this, index);
		case 'create':
			return userCreate.execute.call(this, index);
		case 'delete':
			return userDelete.execute.call(this, index);
		case 'updateMetadata':
			return userUpdateMetadata.execute.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown user operation: ${operation}`);
	}
}

async function executeEmbeddedWalletOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'list':
			return embeddedWalletList.execute.call(this, index);
		case 'get':
			return embeddedWalletGet.execute.call(this, index);
		case 'createEthereum':
			return embeddedWalletCreateEthereum.execute.call(this, index);
		case 'createSolana':
			return embeddedWalletCreateSolana.execute.call(this, index);
		case 'pregenerate':
			return embeddedWalletPregenerate.execute.call(this, index);
		case 'getBalance':
			return embeddedWalletGetBalance.execute.call(this, index);
		case 'getTransactions':
			return embeddedWalletGetTransactions.execute.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown embedded wallet operation: ${operation}`);
	}
}

async function executeServerWalletOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'list':
			return serverWalletList.execute.call(this, index);
		case 'create':
			return serverWalletCreate.execute.call(this, index);
		case 'get':
			return serverWalletGet.execute.call(this, index);
		case 'delete':
			return serverWalletDelete.execute.call(this, index);
		case 'signMessage':
			return serverWalletSignMessage.execute.call(this, index);
		case 'signTransaction':
			return serverWalletSignTransaction.execute.call(this, index);
		case 'sendTransaction':
			return serverWalletSendTransaction.execute.call(this, index);
		case 'getPolicy':
			return serverWalletPolicy.executeGetPolicy.call(this, index);
		case 'updatePolicy':
			return serverWalletPolicy.executeUpdatePolicy.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown server wallet operation: ${operation}`);
	}
}

async function executeDelegatedWalletOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'list':
			return delegatedWallet.executeList.call(this, index);
		case 'get':
			return delegatedWallet.executeGet.call(this, index);
		case 'signMessage':
			return delegatedWallet.executeSignMessage.call(this, index);
		case 'signTransaction':
			return delegatedWallet.executeSignTransaction.call(this, index);
		case 'sendTransaction':
			return delegatedWallet.executeSendTransaction.call(this, index);
		case 'signTypedData':
			return delegatedWallet.executeSignTypedData.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown delegated wallet operation: ${operation}`);
	}
}

async function executeSessionOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'create':
			return session.executeCreate.call(this, index);
		case 'verify':
			return session.executeVerify.call(this, index);
		case 'revoke':
			return session.executeRevoke.call(this, index);
		case 'getActive':
			return session.executeGetActive.call(this, index);
		case 'revokeAll':
			return session.executeRevokeAll.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown session operation: ${operation}`);
	}
}

async function executeAuthenticationOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'verifyEmailOtp':
			return authentication.executeVerifyEmailOtp.call(this, index);
		case 'verifySmsOtp':
			return authentication.executeVerifySmsOtp.call(this, index);
		case 'verifyCustomJwt':
			return authentication.executeVerifyCustomJwt.call(this, index);
		case 'getUserByToken':
			return authentication.executeGetUserByAccessToken.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown authentication operation: ${operation}`);
	}
}

async function executeLinkedAccountOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'list':
			return linkedAccount.executeList.call(this, index);
		case 'linkEmail':
			return linkedAccount.executeLinkEmail.call(this, index);
		case 'linkPhone':
			return linkedAccount.executeLinkPhone.call(this, index);
		case 'linkWallet':
			return linkedAccount.executeLinkWallet.call(this, index);
		case 'unlink':
			return linkedAccount.executeUnlink.call(this, index);
		case 'setPrimary':
			return linkedAccount.executeSetPrimary.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown linked account operation: ${operation}`);
	}
}

async function executeCustomAuthOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'createSession':
			return customAuth.executeCreateSession.call(this, index);
		case 'getConfig':
			return customAuth.executeGetConfig.call(this, index);
		case 'updateConfig':
			return customAuth.executeUpdateConfig.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown custom auth operation: ${operation}`);
	}
}

async function executeWebhookOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'list':
			return webhook.executeList.call(this, index);
		case 'create':
			return webhook.executeCreate.call(this, index);
		case 'get':
			return webhook.executeGet.call(this, index);
		case 'update':
			return webhook.executeUpdate.call(this, index);
		case 'delete':
			return webhook.executeDelete.call(this, index);
		case 'getDeliveries':
			return webhook.executeGetDeliveries.call(this, index);
		case 'retryDelivery':
			return webhook.executeRetryDelivery.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown webhook operation: ${operation}`);
	}
}

async function executeAppConfigOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getSettings':
			return appConfig.executeGetSettings.call(this, index);
		case 'updateSettings':
			return appConfig.executeUpdateSettings.call(this, index);
		case 'getLoginMethods':
			return appConfig.executeGetLoginMethods.call(this, index);
		case 'updateLoginMethods':
			return appConfig.executeUpdateLoginMethods.call(this, index);
		case 'getWalletConfig':
			return appConfig.executeGetWalletConfig.call(this, index);
		case 'updateWalletConfig':
			return appConfig.executeUpdateWalletConfig.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown app config operation: ${operation}`);
	}
}
