exports.up = function(knex) {
  return knex.schema.createTable('leads', function(table) {
    table.increments('id').primary(); 
    table.string('lead_id').unique().notNullable(); 
    table.string('lead_type');
    table.text('website');
    table.text('website_domain');
    table.string('appointment');
    table.text('TITLE');
    table.string('NAME');
    table.string('LAST_NAME');
    table.string('BIRTHDATE');
    table.string('SOURCE_ID');
    table.string('STATUS_ID');
    table.text('COMMENTS');
    table.string('CURRENCY_ID');
    table.string('OPPORTUNITY');
    table.string('phone');
    table.string('DATE_CREATE');
    table.string('DATE_MODIFY');
    table.jsonb('lead_json_data');
    table.jsonb('edit_fields');
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true); 
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('leads'); // Rollback: Drops the leads table
};