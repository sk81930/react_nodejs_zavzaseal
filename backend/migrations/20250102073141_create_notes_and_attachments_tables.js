exports.up = function(knex) {
  return knex.schema
    // Creating the 'notes' table
    .createTable('notes', function(table) {
      table.increments('id').primary();
      table.bigInteger('user_id').notNullable();
      table.bigInteger('task_id').notNullable();
      table.text('description'); 
      table.timestamp('deleted_at').nullable();
      table.timestamps(true, true); 
    })
    
    // Creating the 'attachments' table
    .createTable('attachments', function(table) {
      table.increments('id').primary();
      table.bigInteger('notes_id').unsigned().notNullable();
      table.foreign('notes_id').references('id').inTable('notes').onDelete('CASCADE');
      table.string('type'); 
      table.string('path'); 
      table.timestamp('deleted_at').nullable();
      table.timestamps(true, true); 
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('attachments') 
    .dropTableIfExists('notes'); 
};
