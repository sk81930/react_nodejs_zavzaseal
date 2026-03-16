exports.up = function(knex) {
  return knex.schema.createTable('expenses', function(table) {
    table.increments('id').primary(); 
    table.string('source'); 
    table.string('start_date'); 
    table.string('end_date'); 
    table.string('cost'); 
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true); 
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('expenses'); 
};
