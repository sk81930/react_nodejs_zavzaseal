exports.up = function(knex) {
  return knex.schema.createTable('comments', function(table) {
    table.increments('id').primary();
    table.integer('user_id').notNullable();
    table.integer('task_id').notNullable(); 
    table.text('description').notNullable(); 
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true); 
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('comments');
};