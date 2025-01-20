exports.up = function(knex) {
  return knex.schema.createTable('deals', function(table) {
    table.increments('id').primary(); 
    table.string('deal_id').unique().notNullable(); 
    table.string('title'); 
    table.string('type'); 
    table.string('stage'); 
    table.string('currency'); 
    table.string('opportunity'); 
    table.string('is_manual_opportunity'); 
    table.string('tax_value'); 
    table.string('lead_id'); 
    table.string('company_id'); 
    table.string('begin_date'); 
    table.string('close_date'); 
    table.text('comments'); 
    table.text('additional_info'); 
    table.string('is_new'); 
    table.string('is_recurring'); 
    table.string('is_return_customer'); 
    table.string('is_repeated_approach'); 
    table.string('source_id'); 
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true); 
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('deals'); 
};
