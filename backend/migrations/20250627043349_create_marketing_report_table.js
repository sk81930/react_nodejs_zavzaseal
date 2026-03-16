exports.up = function(knex) {
  return knex.schema.createTable('marketing_report', function(table) {
    table.increments('id').primary(); 
    table.string('title'); 
    table.string('source'); 
    table.string('website'); 
    table.string('type'); 
    table.string('appointments'); 
    table.string('first_name'); 
    table.string('last_name'); 
    table.string('email'); 
    table.string('phone'); 
    table.text('comments'); 
    table.string('created_date');  
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true); 
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('marketing_report'); 
};
