exports.up = function(knex) {
  return knex.schema.createTable('lead_status_api', function(table) {
    table.increments('id').primary(); 
    table.string('status_main_id').unique().notNullable(); 
    table.string('ENTITY_ID'); 
    table.string('STATUS_ID'); 
    table.string('NAME'); 
    table.string('source_name'); 
    table.string('NAME_INIT'); 
    table.string('CATEGORY_ID'); 
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true); 
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('lead_status_api'); // Rollback: Drops the leads table
};