// models/User.js
const db = require('../config/connection.js'); // Import knex instance
var bcrypt = require("bcrypt");

class User {
  // Constructor to set initial values or configuration
  constructor(data = null) {
    if(data){
      this.id = data.id;
      this.first_name = data.first_name;
      this.last_name = data.last_name;
      this.email = data.email;
      this.profile_image = data.profile_image;
      this.address = data.address;
      this.contact_number = data.contact_number;
    }
  }

  // Fetch all users from the database
  static async getAll() {
    const users = await db('users').whereNull('deleted_at').select('*');
    return users.map(user => new User(user));
  }
  static async getCrewMembers() {
    const users = await db('users').where('role', 'ILIKE', `%crew%`).whereNull('deleted_at').select('*');
    return users.map(user => new User(user));
  }
  static async getPaginatedUsers(page = 1, pagesize = 10, search = "") {
      page = parseInt(page);
      pagesize = parseInt(pagesize);

      let limit = pagesize;
      let offset = 0;

      // Calculate offset if page > 0
      if (page > 0) {
          offset = (page - 1) * limit;
      }

      // Initialize the query for fetching users and another for counting total users
      let query = db('users');
      let querytotal = db('users');

      const whereCondition = function() {
          this.where('deleted_at', null)
      };
      query = query.where(whereCondition);
      querytotal = querytotal.where(whereCondition);

      // If search term is provided, add search conditions for first_name and last_name
      if (search && search !== "") {
          const searchCondition = function() {
              this.where('first_name', 'ILIKE', `%${search}%`)
                  .orWhere('last_name', 'ILIKE', `%${search}%`)
                  .orWhere('email', 'ILIKE', `%${search}%`);
          };
          
          query = query.where(searchCondition);
          querytotal = querytotal.where(searchCondition);
      }

      // Apply pagination to the main query
      const users = await query.select('*').limit(limit).offset(offset).orderBy('id', 'desc');

      // Execute the query to count the total number of matching users (for pagination)
      const totalUsers = await querytotal.count('id as total').first();

      const totalCount = parseInt(totalUsers.total);
      const totalPages = Math.ceil(totalCount / pagesize);

      // Return users with pagination info
      return {
          users,
          pagination: {
              totalCount,
              totalPages,
              currentPage: page,
              pagesize,
          },
      };
}

  // Find a user by ID
  static async findById(id) {
    const user = await db('users').where({ id }).first().select("*");
    return user ? user : null;
  }
  static async findByEmail(email, id = null) {
    let query = db('users').where({ email });

    // If id is provided, exclude that specific user
    if (id) {
      query = query.whereNot('id', id);
    }

    // Execute the query and get the first result
    const user = await query.first();
    return user ? new User(user) : null;
  }

  // Create a new user
  static async create(data) {
    const [user] = await db('users').insert(data).returning('*');
    return new User(user);
  }

  // Update a user by ID
  static async update(id, data) {
    const [user] = await db('users')
      .where({ id })
      .update(data)
      .returning('*');
    return new User(user);
  }

  // Delete a user by ID
  static async delete(id) {
    await db('users').where({ id }).del();
  }
  static async softDelete(id) {
    const [user] = await db('users')
      .where({ id })
      .whereNot('role', "super_admin")
      .update({ deleted_at: db.fn.now() })
      .returning('*');
    return new User(user);
  }
  static async validPassword(user,password) {

    try{

      const userData = await db('users').where({ id: user.id }).first().select("*");


      const isMatch = await bcrypt.compare(password, userData.password); // 'user.password' is the hashed password

      if (isMatch) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error during password verification:', error);
      return false;
    }
  }
}

module.exports = User;
