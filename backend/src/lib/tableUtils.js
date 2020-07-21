async function createTable(knex, tableName, cb) {
	await knex.schema.createTable(tableName, (table) => {
		table.increments().notNullable();
		table.timestamps(false, true);
		table.datetime('deleted_at');
		cb(table);
	});
}

function references(table, tableName, notNullable = true, columnName = '') {
	const definition = table
		.integer(`${columnName || tableName}_id`)
		.unsigned()
		.references('id')
		.inTable(tableName)
		.onDelete('cascade');

	if (notNullable) {
		definition.notNullable();
	}
	return definition;
}

function url(table, columnName) {
	return table.text(columnName, 2000);
}

function image(table, columnName) {
	return url(table, columnName);
}

module.exports = {
	createTable,
	references,
	url,
	image,
};