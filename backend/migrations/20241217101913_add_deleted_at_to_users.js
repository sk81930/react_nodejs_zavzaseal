
exports.up = function(knex) {
  return knex.schema.table('users', function(table) {
    // Add the `deleted_at` column (nullable timestamp)
    table.timestamp('deleted_at').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table) {
    // Rollback: Remove the `deleted_at` column if migration is rolled back
    table.dropColumn('deleted_at');
  });
};