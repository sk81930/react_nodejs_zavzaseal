exports.up = function(knex) {
  return knex.schema.createTable('time_logs', function(table) {
    table.increments('id').primary();
    table.integer('user_id').notNullable();
    table.integer('task_id').notNullable(); 
    table.string('check_in');
    table.string('check_out');
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true); 
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('time_logs');
};