/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('exhibit_items', table => {
     table.increments('id').primary();
     table.integer('estimation_id').unsigned().notNullable().references('id').inTable('estimations').onDelete('CASCADE');
     table.jsonb('textareas');
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
    return knex.schema.dropTable('exhibit_items');
 };
 