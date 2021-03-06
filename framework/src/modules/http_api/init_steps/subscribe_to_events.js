module.exports = ({ channel }, { wsServer }) => {
	channel.subscribe('chain:blocks:change', event => {
		wsServer.sockets.emit('blocks/change', event.data);
	});
	channel.subscribe('chain:signature:change', event => {
		wsServer.sockets.emit('signature/change', event.data);
	});
	channel.subscribe('chain:transactions:change', event => {
		wsServer.sockets.emit('transactions/change', event.data);
	});
	channel.subscribe('chain:rounds:change', event => {
		wsServer.sockets.emit('rounds/change', event.data);
	});
	channel.subscribe('chain:multisignatures:signature:change', event => {
		wsServer.sockets.emit('multisignatures/signature/change', event.data);
	});
	channel.subscribe('chain:delegates:fork', event => {
		wsServer.sockets.emit('delegates/fork', event.data);
	});
	channel.subscribe('chain:loader:sync', event => {
		wsServer.sockets.emit('loader/sync', event.data);
	});
};
