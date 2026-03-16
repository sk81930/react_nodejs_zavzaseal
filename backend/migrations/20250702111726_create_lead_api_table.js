exports.up = function(knex) {
  return knex.schema.createTable('leads_api', function(table) {
    table.increments('id').primary(); 
    table.string('lead_id').unique().notNullable(); 
    table.jsonb('lead_json_data');
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true); 
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('leads_api'); // Rollback: Drops the leads table
};