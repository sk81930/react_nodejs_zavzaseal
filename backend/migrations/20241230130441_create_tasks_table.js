/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('tasks', function (table) {
      table.increments('id').primary();
      table.bigInteger('user_id').notNullable();
      table.bigInteger('deal_id');
      table.string('title');
      table.datetime('start_datetime').notNullable();
      table.datetime('end_datetime').notNullable();
      table.string('status');
      table.string('priority');
      table.string('color');
      table.timestamp('deleted_at').nullable();
      table.timestamps(true, true); 
    })
    .createTable('task_crew_members', function (table) {
      table.increments('id').primary();
      table.bigInteger('task_id').unsigned().notNullable().references('id').inTable('tasks').onDelete('CASCADE');
      table.bigInteger('user_id').unsigned().notNullable();
      table.timestamp('deleted_at').nullable();
      table.timestamps(true, true);
    })
    .createTable('task_products', function (table) {
      table.increments('id').primary();
      table.bigInteger('task_id').unsigned().notNullable().references('id').inTable('tasks').onDelete('CASCADE');
      table.string('product_name');
      table.string('product_price');
      table.text('extra_info');
      table.string('status');
      table.timestamp('deleted_at').nullable();
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTable('task_products')
    .dropTable('task_crew_members')
    .dropTable('tasks');
};
