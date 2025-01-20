/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema
    .createTable('settings', function (table) {
      table.increments('id').primary();
      table.string('setting_key', 255).notNullable();
      table.text('setting_value', "longtext");
      table.string('user_id', 255).notNullable();
      table.timestamp('deleted_at').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
   return knex.schema.dropTable('users');
};
