/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('estimate_template', function(table) {
    table.increments('id').primary(); 
    table.bigInteger('user_id').notNullable();
    table.string('template_name').unique().notNullable(); 
    table.text('template_content', "longtext");
    table.integer('status').notNullable().defaultTo(1); // 0 or 1, default to 1
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true); 
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('estimate_template'); // Rollback: Drops the leads table
};




