/*
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

'use strict';

const _ = require('lodash');
const { stringToByte } = require('../utils/input_serializers');
const { NonSupportedOperationError } = require('../errors');
const filterTypes = require('../utils/filter_types');
const BaseEntity = require('./base_entity');

/**
 * Basic Transaction
 * @typedef {Object} BasicTransaction
 * @property {string} id
 * @property {string} blockId
 * @property {Integer} [height]
 * @property {Integer} [confirmations]
 * @property {Integer} type
 * @property {Number} timestamp
 * @property {string} senderPublicKey
 * @property {string} [recipientPublicKey]
 * @property {string} requesterPublicKey
 * @property {string} senderId
 * @property {string} recipientId
 * @property {string} amount
 * @property {string} fee
 * @property {string} signature
 * @property {string} signSignature
 * @property {Array.<string>} signatures
 */

/**
 * Transfer Transaction
 * @typedef {BasicTransaction} TransferTransaction
 * @property {Object} asset
 * @property {string} asset.data
 */

/**
 * Second Passphrase Transaction
 * @typedef {BasicTransaction} SecondPassphraseTransaction
 * @property {Object} asset
 * @property {Object} asset.signature
 * @property {string} asset.signature.publicKey
 */

/**
 * Delegate Transaction
 * @typedef {BasicTransaction} DelegateTransaction
 * @property {Object} asset
 * @property {Object} asset.delegate
 * @property {string} asset.delegate.username
 */

/**
 * Vote Transaction
 * @typedef {BasicTransaction} VoteTransaction
 * @property {Object} asset
 * @property {Array.<string>} asset.votes
 */

/**
 * Multisig Registration Transaction
 * @typedef {BasicTransaction} MultisigRegistrationTransaction
 * @property {Object} asset
 * @property {Object} asset.multisignature
 * @property {Integer} asset.multisignature.min
 * @property {Integer} asset.multisignature.lifetime
 * @property {Array.<string>} asset.multisignature.keysgroup
 */

/**
 * Dapp Registration Transaction
 * @typedef {BasicTransaction} DappRegistrationTransaction
 * @property {Object} asset
 * @property {Object} asset.dapp
 * @property {Integer} asset.dapp.type
 * @property {string} asset.dapp.name
 * @property {string} asset.dapp.description
 * @property {string} asset.dapp.tags
 * @property {string} asset.dapp.link
 * @property {string} asset.dapp.icon
 * @property {Integer} asset.dapp.category
 */

/**
 * InTransfer Transaction
 * @typedef {BasicTransaction} InTransferTransaction
 * @property {Object} asset
 * @property {Object} asset.inTransfer
 * @property {string} asset.inTransfer.dappId
 */

/**
 * OutTransfer Transaction
 * @typedef {BasicTransaction} OutTransferTransaction
 * @property {Object} asset
 * @property {Object} asset.outTransfer
 * @property {string} asset.outTransfer.dappId
 * @property {string} asset.outTransfer.transactionId
 */

/**
 * Transaction
 * @typedef {(TransferTransaction|SecondPassphraseTransaction|DelegateTransaction|VoteTransaction|MultisigRegistrationTransaction|DappRegistrationTransaction|InTransferTransaction|OutTransferTransaction)} Transaction
 */

/**
 * Transaction Filters
 * @typedef {Object} filters.Transaction
 */
const assetAttributesMap = {
	0: ['asset.data'],
	1: ['asset.signature.publicKey'],
	2: ['asset.delegate.username'],
	3: ['asset.votes'],
	4: [
		'asset.multisignature.min',
		'asset.multisignature.lifetime',
		'asset.multisignature.keysgroup',
	],
	5: [
		'asset.dapp.type',
		'asset.dapp.name',
		'asset.dapp.description',
		'asset.dapp.tags',
		'asset.dapp.link',
		'asset.dapp.icon',
		'asset.dapp.category',
	],
	6: ['asset.inTransfer.dappId'],
	7: ['asset.outTransfer.dappId', 'asset.outTransfer.transactionId'],
};

const sqlFiles = {
	select: 'transactions/get.sql',
	selectExtended: 'transactions/get_extended.sql',
	isPersisted: 'transactions/is_persisted.sql',
	count: 'transactions/count.sql',
	count_all: 'transactions/count_all.sql',
};

// eslint-disable-next-line no-unused-vars
const stringToByteOnlyInsert = (value, mode, alias, fieldName) => {
	if (mode === 'select') {
		return `$\{${alias}}`;
	}

	return value ? `DECODE($\{${alias}}, 'hex')` : 'NULL';
};

class Transaction extends BaseEntity {
	/**
	 * Constructor
	 * @param {BaseAdapter} adapter - Adapter to retrive the data from
	 * @param {filters.Transaction} defaultFilters - Set of default filters applied on every query
	 */
	constructor(adapter, defaultFilters = {}) {
		super(adapter, defaultFilters);

		this.addField('id', 'string', {
			filter: filterTypes.TEXT,
			fieldName: 't_id',
		});
		this.addField('blockId', 'string', {
			filter: filterTypes.TEXT,
			fieldName: 'b_id',
		});
		this.addField('blockHeight', 'string', {
			filter: filterTypes.NUMBER,
			fieldName: 'b_height',
		});
		this.addField('type', 'number', {
			filter: filterTypes.NUMBER,
			fieldName: 't_type',
		});
		this.addField('timestamp', 'number', {
			filter: filterTypes.NUMBER,
			fieldName: 't_timestamp',
		});
		this.addField(
			'senderPublicKey',
			'string',
			{
				filter: filterTypes.TEXT,
				format: 'publicKey',
				fieldName: 't_senderPublicKey',
			},
			stringToByteOnlyInsert
		);
		this.addField(
			'recipientPublicKey',
			'string',
			{
				filter: filterTypes.TEXT,
				format: 'publicKey',
				fieldName: 't_recipientPublicKey',
			},
			stringToByteOnlyInsert
		);
		this.addField(
			'requesterPublicKey',
			'string',
			{
				filter: filterTypes.TEXT,
				format: 'publicKey',
				fieldName: 't_requesterPublicKey',
			},
			stringToByteOnlyInsert
		);
		this.addField('senderId', 'string', {
			filter: filterTypes.TEXT,
			fieldName: 't_senderId',
		});
		this.addField('recipientId', 'string', {
			filter: filterTypes.TEXT,
			fieldName: 't_recipientId',
		});
		this.addField('amount', 'string', {
			filter: filterTypes.NUMBER,
			fieldName: 't_amount',
		});
		this.addField('fee', 'string', {
			filter: filterTypes.NUMBER,
			fieldName: 't_fee',
		});
		this.addField(
			'signature',
			'string',
			{ fieldName: 't_signature' },
			stringToByte
		);
		this.addField(
			'signSignature',
			'string',
			{ fieldName: 't_SignSignature' },
			stringToByte
		);
		this.addField('signatures', 'string', { fieldName: 't_signatures' });

		this.addFilter('data_like', filterTypes.CUSTOM, {
			condition: '"tf_data" LIKE ${data_like}',
		});

		this.addFilter('dapp_name', filterTypes.CUSTOM, {
			condition: '"dapp_name" = ${dapp_name}',
		});

		this.addFilter('dapp_link', filterTypes.CUSTOM, {
			condition: '"dapp_link" = ${dapp_link}',
		});

		this.SQLs = this.loadSQLFiles('transaction', sqlFiles);
	}

	/**
	 * Get one transaction
	 *
	 * @param {filters.Transaction|filters.Transaction[]} [filters = {}]
	 * @param {Object} [options = {}] - Options to filter data
	 * @param {Number} [options.limit=10] - Number of records to fetch
	 * @param {Number} [options.offset=0] - Offset to start the records
	 * @param {string} [options.sort] - Sort key for transaction e.g. amount:asc, amount:desc
	 * @param {Boolean} [options.extended=false] - Get extended fields for entity
	 * @param {Object} tx - Database transaction object
	 * @return {Promise.<Transaction, Error>}
	 */
	getOne(filters, options = {}, tx) {
		const expectedResultCount = 1;
		return this._getResults(filters, options, tx, expectedResultCount);
	}

	/**
	 * Get list of transactions
	 *
	 * @param {filters.Transaction|filters.Transaction[]} [filters = {}]
	 * @param {Object} [options = {}] - Options to filter data
	 * @param {Number} [options.limit=10] - Number of records to fetch
	 * @param {Number} [options.offset=0] - Offset to start the records
	 * @param {string} [options.sort] - Sort key for transaction e.g. amount:asc, amount:desc
	 * @param {Boolean} [options.extended=false] - Get extended fields for entity
	 * @param {Object} tx - Database transaction object
	 * @return {Promise.<Transaction[], Error>}
	 */
	get(filters, options = {}, tx) {
		return this._getResults(filters, options, tx);
	}

	/**
	 * Count transactions
	 *
	 * @param {filters.Transaction|filters.Transaction[]} [filters = {}]
	 * @param {Object} [_options = {}] - Options to filter data
	 * @param {Object} [tx] - Database transaction object
	 * @return {Promise.<Transaction[], Error>}
	 */
	// eslint-disable-next-line no-unused-vars
	count(filters, _options = {}, tx) {
		filters = Transaction._sanitizeFilters(filters);
		const mergedFilters = this.mergeFilters(filters);
		const parsedFilters = this.parseFilters(mergedFilters, {
			filterPrefix: 'AND',
		});

		const params = {
			parsedFilters,
		};
		const expectedResultCount = 1;

		const sql = parsedFilters === '' ? this.SQLs.count_all : this.SQLs.count;

		return this.adapter
			.executeFile(sql, params, { expectedResultCount }, tx)
			.then(data => +data.count);
	}

	/**
	 * Create transactions object
	 *
	 * @param {Transaction|Array.<Transaction>} data
	 * @param {Object} [_options]
	 * @param {Object} [tx] - Transaction object
	 * @return {*}
	 */
	// eslint-disable-next-line class-methods-use-this,no-unused-vars
	create(data, _options, tx) {
		throw new NonSupportedOperationError();
	}

	/**
	 * Update object record
	 *
	 * @override
	 * @throws {NonSupportedOperationError}
	 */
	// eslint-disable-next-line class-methods-use-this
	update() {
		throw new NonSupportedOperationError();
	}

	/**
	 * Update object record
	 *
	 * @override
	 * @throws {NonSupportedOperationError}
	 */
	// eslint-disable-next-line class-methods-use-this
	updateOne() {
		throw new NonSupportedOperationError();
	}

	/**
	 * Delete object record
	 *
	 * @override
	 * @throws {NonSupportedOperationError}
	 */
	// eslint-disable-next-line class-methods-use-this
	delete() {
		throw new NonSupportedOperationError();
	}

	/**
	 * Check if the record exists with following conditions
	 *
	 * @param {filters.Account} filters
	 * @param {Object} [_options]
	 * @param {Object} [tx]
	 * @returns {Promise.<boolean, Error>}
	 */
	isPersisted(filters, _options, tx) {
		const atLeastOneRequired = true;
		this.validateFilters(filters, atLeastOneRequired);
		const mergedFilters = this.mergeFilters(filters);
		const parsedFilters = this.parseFilters(mergedFilters);

		return this.adapter
			.executeFile(
				this.SQLs.isPersisted,
				{ parsedFilters },
				{ expectedResultCount: 1 },
				tx
			)
			.then(result => result.exists);
	}

	_getResults(filters, options, tx, expectedResultCount = undefined) {
		filters = Transaction._sanitizeFilters(filters);

		const mergedFilters = this.mergeFilters(filters);
		const parsedFilters = this.parseFilters(mergedFilters, {
			filterPrefix: 'AND',
		});

		const parsedOptions = _.defaults(
			{},
			_.pick(options, ['limit', 'offset', 'sort', 'extended']),
			_.pick(this.defaultOptions, ['limit', 'offset', 'sort', 'extended'])
		);

		// To have deterministic pagination add extra sorting
		if (parsedOptions.sort) {
			parsedOptions.sort = _.flatten([
				parsedOptions.sort,
				't_rowId:asc',
			]).filter(Boolean);
		} else {
			parsedOptions.sort = ['t_rowId:asc'];
		}

		const parsedSort = this.parseSort(parsedOptions.sort);

		const params = {
			limit: parsedOptions.limit,
			offset: parsedOptions.offset,
			parsedSort,
			parsedFilters,
		};

		return this.adapter
			.executeFile(
				parsedOptions.extended ? this.SQLs.selectExtended : this.SQLs.select,
				params,
				{ expectedResultCount },
				tx
			)
			.then(data => {
				if (expectedResultCount === 1) {
					return Transaction._formatTransactionResult(
						data,
						parsedOptions.extended
					);
				}

				return data.map(row =>
					Transaction._formatTransactionResult(row, parsedOptions.extended)
				);
			});
	}

	static _formatTransactionResult(row, extended) {
		const transaction = extended
			? {
					asset: {},
				}
			: {};

		Object.keys(row).forEach(k => {
			if (!k.match(/^asset./)) {
				transaction[k] = row[k];
			}
		});

		const transactionAssetAttributes =
			assetAttributesMap[transaction.type] || [];

		transactionAssetAttributes.forEach(assetKey => {
			// We only want to skip null and undefined, not other falsy values
			if (row[assetKey] !== null && row[assetKey] !== undefined) {
				_.set(transaction, assetKey, row[assetKey]);
			}
		});

		if (transaction.type === 0 && transaction.asset && transaction.asset.data) {
			try {
				transaction.asset.data = transaction.asset.data.toString('utf8');
			} catch (e) {
				// TODO: Add logging support
				// library.logger.error(
				// 	'Logic-Transfer-dbRead: Failed to convert data field into utf8'
				// );
				delete transaction.asset;
			}
		}

		if (transaction.signatures) {
			transaction.signatures = transaction.signatures.filter(Boolean);
		}
		return transaction;
	}

	static _sanitizeFilters(filters = {}) {
		const sanitizeFilterObject = filterObject => {
			if (filterObject.data_like) {
				filterObject.data_like = Buffer.from(filterObject.data_like, 'utf8');
			}
			return filterObject;
		};

		// PostgresSQL does not support null byte buffer so have to parse in javascript
		if (Array.isArray(filters)) {
			filters = filters.map(sanitizeFilterObject);
		} else {
			filters = sanitizeFilterObject(filters);
		}

		return filters;
	}
}

module.exports = Transaction;
