/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('estimations', table => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable(); // Foreign key to users
        table.string('lead');
        table.string('lead_id');
        table.date('issue_date');
        table.date('expiry_date');
        table.string('quote_number');
        table.string('quote_id');
        table.string('title');
        table.text('summary');
        table.text('disclaimer');
        table.text('warranty');
        table.string('warranty_year');
        table.string('pdf_path');
        table.string('client_mail_sent');
        table.jsonb('totals'); // Store subtotal, total, discount etc.
        table.jsonb('address_image'); // image path
        table.enum('status', ['draft', 'publish', 'accepted', 'rejected']).defaultTo('draft');
        table.text('terms');
        table.timestamp('deleted_at').nullable();
        table.timestamps(true, true); // created_at, updated_at
    });
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
   return knex.schema.dropTable('estimations');
};
