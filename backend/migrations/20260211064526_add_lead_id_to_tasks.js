/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {

    await knex.schema.alterTable('tasks', table => {
      table
        .bigInteger('lead_id')
        .unsigned()
        .nullable();
    });
  
    // Add foreign key constraint
    await knex.schema.alterTable('tasks', table => {
      table
        .foreign('lead_id', 'fk_tasks_lead_id')
        .references('id')
        .inTable('leads')
        .onDelete('SET NULL')
        .onUpdate('CASCADE');
    });
  
    // Add index for performance
    await knex.schema.alterTable('tasks', table => {
      table.index(['lead_id'], 'idx_tasks_lead_id');
    });
  };
  
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = async function(knex) {
  
    await knex.schema.alterTable('tasks', table => {
      table.dropForeign('lead_id', 'fk_tasks_lead_id');
      table.dropIndex(['lead_id'], 'idx_tasks_lead_id');
      table.dropColumn('lead_id');
    });
  
  };
  