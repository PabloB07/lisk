module.exports = {
  blacklistedPeers: [],
  connectTimeout: 5000,
  seedPeers: [],
  wsEngine: 'ws',
  nodeInfo: {
    wsPort: 5000,
    // nethash: options.nethash,
    // version: options.version,
    // os: options.os,
    height: 0,
    options: {
      // broadhash: options.nethash, // Initially, we just set the broadhash to nethash.
      // nonce: options.nonce
    },
  },
};
