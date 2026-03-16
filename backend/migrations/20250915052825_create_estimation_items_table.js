/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
   return knex.schema.createTable('estimation_items', table => {
    table.increments('id').primary();
    table.integer('estimation_id').unsigned().notNullable().references('id').inTable('estimations').onDelete('CASCADE');
    table.string('item');
    table.text('description');
    table.string('qty');
    table.decimal('price');
    table.decimal('discount');
    table.decimal('amount');
    table.string('account');
    table.string('taxRate');
    table.jsonb('gallery_images'); 
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
   return knex.schema.dropTable('estimation_items');
};
