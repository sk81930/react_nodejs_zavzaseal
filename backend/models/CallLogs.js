// models/User.js
const db = require('../config/connection.js'); // Import knex instance
var bcrypt = require("bcrypt");
const moment = require('moment');

class CallLogs {
  // Constructor to set initial values or configuration
  constructor(data = null) {
    
  }

  static async getData(page = 1, pagesize = 10, body) {
      page = parseInt(page);
      pagesize = parseInt(pagesize);

      let limit = pagesize;
      let offset = 0;

      // Calculate offset if page > 0
      if (page > 0) {
          offset = (page - 1) * limit;
      }

      // Extract query parameters
      const callType = body.type || '';
      const dateFrom = body.startDate || '';
      const dateTo = body.endDate || '';
      const phoneNumber = body.callReceivingNumber || '';
      const sortField = body.sortField || 'date_time';
      const sortDirection = body.sortDirection || 'desc';

      // Initialize the base query for logs
      let logQuery = db('ringcentral_call_logs').select('*');

      // Initialize the base query for count
      let countQuery = db('ringcentral_call_logs').count('* as total');

      // Custom where function to apply filters dynamically
      const applyFilters = (query) => {
          if (callType && callType !== '') {
              query.where('result', callType);
          }

          if (dateFrom && dateTo) {
              const startDateFormatted = moment(dateFrom).format('YYYY-MM-DD HH:mm:ss');
              const endDateFormatted = moment(dateTo).format('YYYY-MM-DD HH:mm:ss');
              query.whereBetween('date_time', [startDateFormatted, endDateFormatted]);
          }

          if (phoneNumber) {
              query.where(function() {
                  this.where('to', 'LIKE', `%${phoneNumber}%`)
                      .orWhere('from', 'LIKE', `%${phoneNumber}%`);
              });
          }

          return query;
      };

      // Apply filters to both the logQuery and countQuery
      logQuery = applyFilters(logQuery);
      countQuery = applyFilters(countQuery);

      // Apply sorting to the logQuery
      logQuery = logQuery.orderBy(sortField, sortDirection);

      // Apply pagination limit and offset to the logQuery
      logQuery = logQuery.limit(pagesize).offset(offset);

      // Execute the queries concurrently
      const [callLogs, totalCountResult] = await Promise.all([
          logQuery,
          countQuery.first()  // Get the count result from the count query
      ]);

      const totalCount = totalCountResult.total;
      const totalPages = Math.ceil(totalCount / pagesize);

      // Return the call logs with pagination info
      return {
          callLogs,
          pagination: {
              totalCount,
              totalPages,
              currentPage: page,
              pagesize,
          },
      };
  }
  static async getChartData(body) {
      const type = body.type || 'All'; // Get call type from the request (default 'All')

      let startDate = body.startDate ? new Date(body.startDate) : null;
      let endDate = body.endDate ? new Date(body.endDate) : null;


      if(body.chart && body.chart == "2"){

        startDate = body.startDate2 ? new Date(body.startDate2) : null;
        endDate = body.endDate2 ? new Date(body.endDate2) : null;

      }


      


      


      const phoneNumber = body.callReceivingNumber || null; // Get phone number from the request (optional)

      let typeArray = [];
      
      // If 'All' is selected, fetch all distinct result types
      if (type === 'All') {
        const distinctResults = await db('ringcentral_call_logs').distinct('result').pluck('result');
        typeArray = distinctResults;
      } else {
        typeArray = [type]; // Only include the selected type
      }

      let query = db('ringcentral_call_logs')
        .whereIn('result', typeArray)
        .select('result')
        .count('* as count')
        .groupBy('result');
      
      // Add date range filter if provided
      if (startDate && endDate) {
        query = query.whereBetween('date_time', [startDate, endDate]);
      }

      // Add phone number filter if provided
      if (phoneNumber) {
        query = query.where(function() {
          this.where('to', 'LIKE', `%${phoneNumber}%`)
              .orWhere('from', 'LIKE', `%${phoneNumber}%`);
        });
      }

      try {
        const result = await query;


        // Prepare labels and values for response
        const labels = result.map(item => item.result);
        const values = result.map(item => item.count);

        return {
          labels,
          values
        };
      } catch (error) {
        console.error('Error fetching call logs:', error);
        throw new Error('Error fetching call logs');
      }
  }



}

module.exports = CallLogs;
