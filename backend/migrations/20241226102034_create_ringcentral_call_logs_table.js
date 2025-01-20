/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema
    .createTable('ringcentral_call_logs', function (table) {
      table.increments('id').primary();
      table.string('id_api', 255);
      table.string('type', 255);
      table.string('from', 255);
      table.string('to', 255);
      table.string('name', 255);
      table.string('date_time', 255);
      table.string('recording', 255);
      table.string('action	', 255);
      table.string('result	', 255);
      table.string('length	', 255);
      table.text('recording_data',"longtext");
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
  return knex.schema.dropTable('ringcentral_call_logs');
};
