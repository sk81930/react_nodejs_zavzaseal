/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // 1️⃣ Add column as nullable first
    await knex.schema.alterTable('task_crew_members', table => {
      table.date('work_date');
    });
  
    // 2️⃣ Backfill existing rows
    // Use created_at date as work_date (recommended)
    await knex('task_crew_members')
      .whereNull('work_date')
      .update({
        work_date: knex.raw('DATE(created_at)')
      });
  
    // 3️⃣ Make column NOT NULL
    await knex.schema.alterTable('task_crew_members', table => {
      table.date('work_date').notNullable().alter();
    });
  
    // 4️⃣ Add composite index
    await knex.schema.alterTable('task_crew_members', table => {
      table.index(['task_id', 'work_date'], 'idx_task_crew_task_date');
    });
  
    // 5️⃣ Add unique constraint to prevent duplicates
    await knex.schema.alterTable('task_crew_members', table => {
      table.unique(
        ['task_id', 'user_id', 'work_date'],
        'unique_task_user_date'
      );
    });
  };
  
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = async function(knex) {
    await knex.schema.alterTable('task_crew_members', table => {
      table.dropUnique(
        ['task_id', 'user_id', 'work_date'],
        'unique_task_user_date'
      );
  
      table.dropIndex(
        ['task_id', 'work_date'],
        'idx_task_crew_task_date'
      );
  
      table.dropColumn('work_date');
    });
  };
  