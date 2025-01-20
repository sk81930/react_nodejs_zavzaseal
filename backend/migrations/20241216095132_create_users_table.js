/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema
    .createTable('users', function (table) {
      table.increments('id').primary();
      table.string('first_name', 255).notNullable();
      table.string('last_name', 255);
      table.string('email', 255).notNullable();
      table.text('password').notNullable();
      table.string('role', 255);
      table.string('address', 255);
      table.string('contact_number', 255);
      table.string('hourly_salary');
      table.text('additional_info');
      table.text('profile_image');
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
