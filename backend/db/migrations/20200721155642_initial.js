const Knex = require('Knex');
Knex;

const tableNames = require('../../src/constants/tableNames');
const emailExtensions = require('../../src/constants/emailExtensions');
const countries = require('../../src/constants/countries');
const shapes = require('../../src/constants/shapes');
const rooms = require('../../src/constants/rooms');
const manufacturerTypes = require('../../src/constants/manufacturerTypes');
const itemTypes = require('../../src/constants/itemTypes');

const {
	createTable,
	references,
	url,
	image,
} = require('../../src/lib/tableUtils');

/**
 * @param {Knex} knex
 */
exports.up = async (knex) => {
	await Promise.all([
		createTable(knex, tableNames.domain, (table) => {
			table.text('name', 64).notNullable();
			table.enum('extension', emailExtensions).notNullable();
		}),

		createTable(knex, tableNames.county, (table) => {
			table.text('name', 64).notNullable();
			table.enum('country', countries).notNullable();
		}),

		createTable(knex, tableNames.size, (table) => {
			table.integer('width').notNullable();
			table.integer('height').notNullable();
			table.integer('depth').notNullable();
			table.double('volume').notNullable();
			table.enum('shape', shapes).notNullable();
		}),

		createTable(knex, tableNames.location, (table) => {
			table.enum('room', rooms).notNullable();
			table.integer('shelf');
			table.integer('row');
			image('image_url').notNullable();
		}),
	]);

	await Promise.all([
		createTable(knex, tableNames.email, (table) => {
			table.text('local_part', 254).notNullable();
			references(table, tableNames.domain);
		}),

		createTable(knex, tableNames.address, (table) => {
			table.text('street1', 64).notNullable();
			table.text('street2', 64);
			table.text('city', 100).notNullable();
			references(table, tableNames.county);
			table.text('postal_code', 32);
			table.double('latitude');
			table.double('longitude');
		}),

		createTable(knex, tableNames.storageInfo, (table) => {
			references(table, tableNames.size);
			table.integer('needs_refrigeration').notNullable();
			references(table, tableNames.location);
		}),
	]);

	await Promise.all([
		createTable(knex, tableNames.user, (table) => {
			references(table, tableNames.email).unique();
			table.string('name').notNullable();
			table.string('password', 127).notNullable();
			table.datetime('last_login');
		}),

		createTable(knex, tableNames.manufacturer, (table) => {
			table.text('name', 128).notNullable();
			image('logo_url').notNullable();
			url('url').notNullable();
			table.text('description', 1000);
			table.enum('type', manufacturerTypes).notNullable();
			references(table, tableNames.email);
			references(table, tableNames.address);
		}),
	]);

	await Promise.all([
		createTable(knex, tableNames.receipt, (table) => {
			image('image_url').notNullable();
			table.datetime('date').notNullable();
			references(table, tableNames.user);
			references(table, tableNames.address);
		}),

		createTable(knex, tableNames.item, (table) => {
			table.text('name', 64).notNullable();
			table.text('description', 1000);
			references(table, tableNames.storageInfo);
			references(table, tableNames.manufacturer);
			table.enum('item_type', itemTypes).notNullable();
			table.text('barcode', 16).notNullable();
		}),
	]);

	await Promise.all([
		createTable(knex, tableNames.itemInfo, (table) => {
			references(table, tableNames.item);
			table.datetime('expiration_date');
			references(table, tableNames.receipt);
			table.datetime('last_used');
			references(table, tableNames.user, true, 'last_used_by');
			table.double('weight');
		}),

		createTable(knex, tableNames.itemImage, (table) => {
			references(table, tableNames.item);
			image('image_url').notNullable();
		}),

		createTable(knex, tableNames.relatedItem, (table) => {
			references(table, tableNames.item);
			references(table, tableNames.item, true, 'related_item_id');
		}),
	]);
};

/**
 * @param {Knex} knex
 */
exports.down = async (knex) => {
	await Promise.all([
		tableNames.itemInfo,
		tableNames.itemImage,
		tableNames.relatedItem,
		tableNames.receipt,
		tableNames.item,
		tableNames.user,
		tableNames.manufacturer,
		tableNames.email,
		tableNames.address,
		tableNames.storageInfo,
		tableNames.domain,
		tableNames.county,
		tableNames.size,
		tableNames.location,
	].map(tablename => knex.schema.dropTable(tablename)));
};