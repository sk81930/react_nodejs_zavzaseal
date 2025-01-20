// models/User.js
const db = require('../config/connection.js'); // Import knex instance

class TimeLogs {
  // Constructor to set initial values or configuration
  constructor(data = null) {
  }

  // Fetch all users from the database
  static async getAll() {
    const users = await db('users').whereNull('deleted_at').select('*');
    return users.map(user => new User(user));
  }
  static async addTimeLog({user_id, task_id, check_in}) {
    try {
      // Insert the task
      const [time_logs] = await db('time_logs').insert({
        user_id,
        task_id,
        check_in
      }).returning('id');

      return time_logs;
    } catch (error) {
      throw new Error("Error creating task: " + error.message);
    }
  }
  static async updateTimeLog({check_out, logs}) {
    try {

      for (const log of logs) {
        const updatedRow = await db('time_logs')
          .where('id', log.id) 
          .update({
            check_out: check_out
          });
      }
      
      return true;

    } catch (error) {
      throw new Error("Error creating task: " + error.message);
    }
  }

  // Find a user by ID
  static async getTimeLogByTaskId(task_id) {
    const time_logs = await db('time_logs')
      .where({ task_id })
      .where(function() {
        this.whereNull('check_out') 
        //.orWhere('check_out', '0000-00-00 00:00:00') 
      }).select("*");
    return time_logs ? time_logs : null;
  }

  static async getLogsByUserId(user_id, type, start_date = "", end_date = "") {
      let query = db('time_logs').where({ user_id }).select("*").orderBy('check_in', 'desc');

      // Set default time range based on the `type`
      if (type === 'today') {
        // Get today's date (start and end of the day)
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
        
        query = query.whereBetween('check_in', [startOfDay, endOfDay]);

      } else if (type === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString();
        const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString();
        
        query = query.whereBetween('check_in', [startOfYesterday, endOfYesterday]);

      } else if (type === '7days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const startOf7DaysAgo = new Date(sevenDaysAgo.setHours(0, 0, 0, 0)).toISOString();
        
        query = query.where('check_in', '>=', startOf7DaysAgo);

      } else if (type === '30days') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const startOf30DaysAgo = new Date(thirtyDaysAgo.setHours(0, 0, 0, 0)).toISOString();
        
        query = query.where('check_in', '>=', startOf30DaysAgo);

      } else if (start_date && end_date) {
        // If start_date and end_date are provided, use them (convert to ISO strings)
        query = query.whereBetween('check_in', [new Date(start_date).toISOString(), new Date(end_date).toISOString()]);
      }

      const time_logs = await query;
      return time_logs.length ? time_logs : null;
  }
  static async getDateWiseLogs(user_id, logDate) {
      let query = db('time_logs')
                      .leftJoin('tasks', 'time_logs.task_id', 'tasks.id')
                      .leftJoin('users', 'time_logs.user_id', 'users.id')
                      .where({ 'time_logs.user_id': user_id })
                      .select("time_logs.*", "users.first_name", "users.last_name", "users.profile_image", "tasks.title")
                      .orderBy('time_logs.check_in', 'desc');

      const log_date = new Date(logDate);
      const startOfDay = new Date(log_date.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(log_date.setHours(23, 59, 59, 999)).toISOString();
      
      query = query.whereBetween('time_logs.check_in', [startOfDay, endOfDay]);

      const time_logs = await query;
      return time_logs.length ? time_logs : null;
  }

  static async getTimeLogs() {
    const time_logs = await db('time_logs')
      .join('users', 'time_logs.user_id', '=', 'users.id')  
      .select('time_logs.*', 'users.first_name', 'users.last_name','users.email', 'users.address', 'users.profile_image') 
      .orderBy('time_logs.user_id')
      .orderBy('time_logs.id', 'desc')
      .distinctOn('time_logs.user_id');

    return time_logs.length ? time_logs : null;
  }

  static async getPaginatedTimeLogs(page = 1, pagesize = 10, search = "") {

      page = parseInt(page);
      pagesize = parseInt(pagesize);

      let limit = pagesize;
      let offset = 0;

      if (page > 0) {
          offset = (page - 1) * limit;
      }

      let query = db('time_logs')
          .leftJoin('users', 'time_logs.user_id', '=', 'users.id') 
          .select(
              'time_logs.user_id', 
              db.raw('COUNT(time_logs.id) as log_count'), 
              'users.first_name', 
              'users.last_name', 
              'users.email'
          )
          .groupBy('time_logs.user_id', 'users.first_name', 'users.last_name', 'users.email'); 

      const whereCondition = function() {
          this.where('time_logs.deleted_at', null); 
      };

      query = query.where(whereCondition);

      if (search && search !== "") {
          const searchCondition = function() {
              this.where('users.first_name', 'ILIKE', `%${search}%`)
                  .orWhere('users.last_name', 'ILIKE', `%${search}%`)
                  .orWhere('users.email', 'ILIKE', `%${search}%`);
          };

          query = query.where(searchCondition);
      }

      let totalRowsQuery = db
          .count('* as total_rows') 
          .from(db.raw(`(${query.toString()}) as subquery`));

      const timeLogs = await query
          .limit(limit)
          .offset(offset)
          .orderBy('time_logs.user_id', 'desc');

      const totalRowsResult = await totalRowsQuery;
      const totalCount = totalRowsResult[0].total_rows; 

      const totalPages = Math.ceil(totalCount / pagesize);

      return {
          timeLogs,
          pagination: {
              totalCount,
              totalPages,
              currentPage: page,
              pagesize,
          },
      };
  }


}

module.exports = TimeLogs;
