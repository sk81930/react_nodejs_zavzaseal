// models/User.js
const db = require('../config/connection.js'); // Import knex instance
var bcrypt = require("bcrypt");

class Setting {
  // Constructor to set initial values or configuration
  constructor(data = null) {
    
  }

  static async getAll() {
    const roles = await db('roles').select('*');
    return roles.map(role => role);
  }
  static async getAllPaginate(page = 1, pagesize = 10, search = "") {


      page = parseInt(page);
      pagesize = parseInt(pagesize);

      let limit = pagesize;

      let offset = 0;
      if(page > 0){
          offset = (page - 1) * limit;
      }
      if(search != ""){

      }

      var query = db('roles');
      var querytotal = db('roles');

      // If there is a search term, add a filter for 'name' field.
      if (search && search !== "") {
          var query =  query.where('name', 'ILIKE', `%${search}%`);
          querytotal = querytotal.where('name', 'ILIKE', `%${search}%`);
      }
      const roles = await query.select('*').limit(limit).offset(offset);
      const totalRoles = await querytotal.count('id as total').first();

      const totalCount = parseInt(totalRoles.total);
      const totalPages = Math.ceil(totalCount / pagesize); 

      return {
        roles,
        pagination: {
          totalCount,
          totalPages,
          currentPage: page,
          pagesize,
        },
      };
  }

  // Update a user by ID
  // static async update(id, data) {
  //   const [user] = await db('users')
  //     .where({ id })
  //     .update(data)
  //     .returning('*');
  //   return new User(user);
  // }

}

module.exports = Setting;
