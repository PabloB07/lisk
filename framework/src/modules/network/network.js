const P2P = require('@liskhq/lisk-p2p').P2P;
const { createSystemComponent } = require('../../components/system');

/**
 * Network Module
 *
 * @namespace Framework.modules.network
 * @type {module.Network}
 */
module.exports = class Network {
	constructor(channel, options) {
		this.channel = channel;
		this.options = options;
		this.logger = null;
	}

	async bootstrap() {
		const loggerConfig = await this.channel.invoke(
			'lisk:getComponentConfig',
			'logger'
		);
		const storageConfig = await this.channel.invoke(
			'lisk:getComponentConfig',
			'storage'
		);
		const systemConfig = await this.channel.invoke(
			'lisk:getComponentConfig',
			'system'
		);

		this.logger = createLoggerComponent(loggerConfig);
		const dbLogger =
			storageConfig.logFileName &&
			storageConfig.logFileName === loggerConfig.logFileName
				? this.logger
				: createLoggerComponent(
						Object.assign({}, loggerConfig, {
							logFileName: storageConfig.logFileName,
						})
					);

		try {
			// Storage
			this.logger.debug('Initiating storage...');
			const storage = createStorageComponent(storageConfig, dbLogger);

			// System
			this.logger.debug('Initiating system...');
			const system = createSystemComponent(systemConfig, this.logger, storage);

			let p2pConfig = {
				...this.options,

			};

			this.p2p = new P2P({
				blacklistedPeers: options.blacklistedPeers || [],
				connectTimeout: options.connectTimeout === undefined ?
					5000 : options.connectTimeout,
				seedPeers: options.seedPeers || [],
				wsEngine: options.wsEngine || 'ws',
				nodeInfo: system.headers,
			});

			await this.p2p.start();
		} catch (error) {
			this.logger.fatal('Network initialization', {
				message: error.message,
				stack: error.stack,
			});
			process.emit('cleanup', error);
		}
	}

	async cleanup() {

	}
};
