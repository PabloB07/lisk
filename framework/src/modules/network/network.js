const P2P = require('@liskhq/lisk-p2p').P2P;

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
		this.p2p = new P2P({
			blacklistedPeers: options.blacklistedPeers || [],
			connectTimeout: options.connectTimeout === undefined ?
				5000 : options.connectTimeout,
			seedPeers: options.seedPeers || [],
			wsEngine: options.wsEngine || 'ws',
			nodeInfo: {
				wsPort: options.wsPort || 5000,
				nethash:
					options.nethash,
				version: options.version,
				os: options.os,
				height: 0,
				options: {
					broadhash: options.nethash, // Initially, we just set the broadhash to nethash.
					nonce: options.nonce,
				},
			},
		});
	}

	async bootstrap() {
	}

	async cleanup() {

	}
};
