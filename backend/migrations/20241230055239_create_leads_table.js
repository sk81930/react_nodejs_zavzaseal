exports.up = function(knex) {
  return knex.schema.createTable('leads', function(table) {
    table.increments('id').primary(); // Auto-incremented primary key for the table
    table.string('bitrix_id').unique().notNullable(); // Unique Bitrix ID for each lead
    table.string('title').notNullable(); // Title of the lead
    table.string('status').notNullable(); // Status of the lead
    table.timestamp('leads_created_at').defaultTo(knex.fn.now()).notNullable(); 
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true); 
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('leads'); // Rollback: Drops the leads table
};