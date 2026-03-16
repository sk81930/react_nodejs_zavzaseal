/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {

    // 1️⃣ Add new date columns (nullable first)
    await knex.schema.alterTable('tasks', table => {
      table.date('start_date');
      table.date('end_date');
    });
  
    // 2️⃣ Copy existing datetime → date (remove time)
    await knex('tasks').update({
      start_date: knex.raw('DATE(start_datetime)'),
      end_date: knex.raw('DATE(end_datetime)')
    });
  
    // 3️⃣ If original columns were NOT NULL, enforce NOT NULL
    await knex.schema.alterTable('tasks', table => {
      table.date('start_date').notNullable().alter();
      table.date('end_date').notNullable().alter();
    });
  
    // 4️⃣ Drop old datetime columns
    await knex.schema.alterTable('tasks', table => {
      table.dropColumn('start_datetime');
      table.dropColumn('end_datetime');
    });
  };
  
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = async function(knex) {
  
    // Reverse process if rollback needed
  
    await knex.schema.alterTable('tasks', table => {
      table.timestamp('start_datetime');
      table.timestamp('end_datetime');
    });
  
    await knex('tasks').update({
      start_datetime: knex.raw('start_date::timestamp'),
      end_datetime: knex.raw('end_date::timestamp')
    });
  
    await knex.schema.alterTable('tasks', table => {
      table.dropColumn('start_date');
      table.dropColumn('end_date');
    });
  };
  