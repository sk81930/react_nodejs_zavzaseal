exports.up = function(knex) {
  return knex.schema.createTable('lead_fields_api', function(table) {
    table.increments('id').primary(); 
    table.string('field_id').unique().notNullable(); 
    table.jsonb('field_json_data');
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true); 
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('lead_fields_api'); // Rollback: Drops the leads table
};