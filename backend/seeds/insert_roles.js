
exports.seed = async function(knex) {

  // Check if the user already exists by email
  const rolesExists = await knex('roles')
    .first(); // Fetch only one record (first match)

  if (!rolesExists) {
    let data = [
      {
         name: "Super Admin",
         slug: "super_admin",
      },
      {
         name: "Admin",
         slug: "admin",
      },
      {
         name: "Operations",
         slug: "operations",
      },
      {
         name: "Estimator",
         slug: "estimator",
      },
      {
         name: "Crew",
         slug: "crew",
      }
    ];
    // If user does not exist, insert the new user
    await knex('roles').insert(data);

    console.log('Roles inserted successfully!');
  } else {
    console.log('Roles already exists. No insertion made.');
  }

};
