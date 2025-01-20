// seeds/insert_dummy_user.js
const bcrypt = require('bcrypt');

exports.seed = async function(knex) {

  // Dummy user data
  const first_name = 'Super';
  const last_name = 'admin';
  const email = 'virender@zavzaseal.com';
  const plainPassword = 'Working@2024';
  const saltRounds = 10;
  
  // Hash the password with bcrypt
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

  // Check if the user already exists by email
  const userExists = await knex('users')
    .where({ email })
    .first(); // Fetch only one record (first match)

  if (!userExists) {
    // If user does not exist, insert the new user
    await knex('users').insert({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role: "super_admin",
    });

    console.log('Dummy user inserted successfully!');
  } else {
    console.log('User already exists. No insertion made.');
  }

};
