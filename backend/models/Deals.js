// models/User.js
const db = require('../config/connection.js'); // Import knex instance
var bcrypt = require("bcrypt");
const moment = require('moment');

class Deals {
  // Constructor to set initial values or configuration
  constructor(data = null) {
    
  }

  static async getPaginatedDeals(page = 1, pagesize = 10, search = "") {
    page = parseInt(page);
    pagesize = parseInt(pagesize);

    const limit = pagesize;
    let offset = 0;

    // Calculate offset if page > 0
    if (page > 0) {
      offset = (page - 1) * limit;
    }

    // Initialize the query for fetching deals and another for counting total deals
    let query = db("deals");
    let querytotal = db("deals");


    // If search term is provided, add search conditions for title
    if (search && search.trim() !== "") {
      const searchCondition = function () {
        this.where("title", "ILIKE", `%${search}%`);
      };

      query = query.where(searchCondition);
      querytotal = querytotal.where(searchCondition);
    }

    // Apply pagination to the main query
    const deals = await query.select("id", "title").limit(limit).offset(offset);

    // Execute the query to count the total number of matching deals
    const totalDeals = await querytotal.count("id as total").first();

    const totalCount = parseInt(totalDeals.total, 10);
    const totalPages = Math.ceil(totalCount / pagesize);

    // Return deals with pagination info
    return {
      deals,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        pagesize,
      },
    };
  }
 


}

module.exports = Deals;
