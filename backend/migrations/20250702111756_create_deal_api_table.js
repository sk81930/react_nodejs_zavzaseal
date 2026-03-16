exports.up = function(knex) {
  return knex.schema.createTable('deals_api', function(table) {
    table.increments('id').primary(); 
    table.string('deal_id').unique().notNullable(); 
    table.jsonb('deal_json_data');
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true); 
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('deals_api'); // Rollback: Drops the leads table
};