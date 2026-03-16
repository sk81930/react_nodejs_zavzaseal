// models/User.js
const db = require('../config/connection.js'); // Import knex instance
var bcrypt = require("bcrypt");
const moment = require('moment');
const { parseISO, startOfMonth, subMonths, endOfMonth, addMonths, format } = require('date-fns');


class Leads {
  // Constructor to set initial values or configuration
  constructor(data = null) {
    
  }
  static async getLeadsData(page = 1, pagesize = 10, search = "", source, website, leadType, sortField, sortOrder) {
    page = parseInt(page);
    pagesize = parseInt(pagesize);

    const limit = pagesize;
    const offset = (page - 1) * limit;

    let baseQuery = db("leads");

    if (search && search.trim() !== "") {
      baseQuery = baseQuery.where(function () {
        this.where("TITLE", "ILIKE", `%${search}%`)
          .orWhere("lead_id", "ILIKE", `%${search}%`)
          .orWhere("NAME", "ILIKE", `%${search}%`)
          .orWhere("LAST_NAME", "ILIKE", `%${search}%`)
          .orWhere("website", "ILIKE", `%${search}%`)
          .orWhere("SOURCE_ID", "ILIKE", `%${search}%`)
          .orWhereRaw("regexp_replace(phone, '[^0-9]', '', 'g') ILIKE ?", [`%${search.replace(/\D/g, '')}%`])
      });
    }



    if (leadType && leadType.trim() !== "") {
      //let leadTypeData = leadType;
      baseQuery = baseQuery.where("lead_type", leadType);
    }

    if (source) {
      baseQuery = baseQuery.where("SOURCE_ID", source);
    }

    if (website && website !== "all") {
      baseQuery = baseQuery.where(`website`, website);
    }
    
    const countQuery = await baseQuery.clone().count("id as total").first();

    let sortBy = "id";
    let sortDirection = "DESC";

    if (sortField && sortField !== "") {
      sortBy = sortField;

      if (sortOrder && (sortOrder.toLowerCase() === "asc" || sortOrder.toLowerCase() === "desc")) {
        sortDirection = sortOrder.toLowerCase();
      }
    }

    if (sortField === "opportunity") {
      baseQuery = baseQuery.orderByRaw(`
        CASE 
          WHEN opportunity IS NULL OR opportunity IN ('0', '0.00', '') THEN 1 
          ELSE 0 
        END, 
        CAST(opportunity AS NUMERIC) ${sortDirection}
      `);
    }else if (sortField === "appointments") {
      baseQuery = baseQuery.orderByRaw(`
        CASE 
          WHEN appointments IS NULL OR appointments IN ('0', '0.00', '') THEN 1 
          ELSE 0 
        END, 
        CAST(appointments AS NUMERIC) ${sortDirection}
      `);
    }else {
      baseQuery = baseQuery.orderBy(sortBy, sortDirection);
    }


    const leads = await baseQuery.limit(limit).offset(offset);

    const dataPromises = leads.map(async (lead) => {

        const status_data = await db("lead_status_api")
              .select("*")
              .where({
                STATUS_ID: lead.SOURCE_ID,
                ENTITY_ID: "SOURCE"
              })
              .first();
        if (status_data) {
          lead.source_name = status_data.NAME;
        }else{
          lead.source_name = "";
        }


        return lead;
    });

    await Promise.all(dataPromises);





    const fields = {};

    const lead_fields_api_data = await db("lead_fields_api").select("*");
    if (lead_fields_api_data && lead_fields_api_data.length > 0) {
      for (const lead_fields_api of lead_fields_api_data) {
          fields[lead_fields_api.field_id] = lead_fields_api.field_json_data;
      }
      
    }


   


    const sourcesData = await db("leads")
    .distinct("SOURCE_ID")
    .whereNotNull("SOURCE_ID")
    .andWhere("SOURCE_ID", "!=", "")
    .orderBy("SOURCE_ID");


    const sources = [];

    for (const sourcesD of sourcesData) {

      const status_data = await db("lead_status_api")
              .select("*")
              .where({
                STATUS_ID: sourcesD.SOURCE_ID,
                ENTITY_ID: "SOURCE"
              })
              .first(); // gets only the first matched row

            if (status_data) {
              sources.push(status_data);
            }

    }

    
    const websitesData = await db("lead_fields_api")
    .andWhere("field_id", "UF_CRM_1752571588").first();

    let websites = [];

    if(websitesData && websitesData.field_json_data && websitesData.field_json_data.items){
        
        websites = websitesData.field_json_data.items;

    }


    // const websitesDomains = [];

    // for (const websitesD of websitesData) {
    //   try {
    //     const url = new URL(websitesD.website);
    //     websitesDomains.push(url.hostname);
    //   } catch (error) {
    //     //console.error(`Invalid URL: ${websitesD.website}`, error.message);
    //   }
    // }

    // const websites = [...new Set(websitesDomains)];




    const leadTypes = await db("leads")
    .distinct("lead_type")
    .whereNotNull("lead_type")
    .andWhere("lead_type", "!=", "")
    .orderBy("lead_type");

    const totalCount = parseInt(countQuery.total, 10) || 0;
    const totalPages = Math.ceil(totalCount / pagesize);

    return {
      leads,
      sources,
      websites,
      leadTypes,
      fields,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        pagesize,
      }
    };
  }

  static async getLeadById(id) {

    try {
      let query = db("leads");
      const leadData = await query.where("id",id).first();

      if(leadData && leadData.id){



        if(leadData.lead_json_data){

          let type = "Call";

          if (leadData.lead_json_data.TITLE && leadData.lead_json_data.TITLE != "" && leadData.lead_json_data.TITLE.toLowerCase().includes("form")) {
            type = "Form";
          } 

          leadData.type = type;

          const status_data = await db("lead_status_api")
                .where({
                  STATUS_ID: leadData.SOURCE_ID,
                  ENTITY_ID: "SOURCE"
                }).first();
          if (status_data) {
            leadData.source_name = status_data.NAME;
          }else{
            leadData.source_name = "";
          }

          const sources = await db("lead_status_api")
                .where({
                  ENTITY_ID: "SOURCE"
                }).select("*");


          const fields = {};

          const lead_fields_api_data = await db("lead_fields_api").select("*");
          if (lead_fields_api_data && lead_fields_api_data.length > 0) {
            for (const lead_fields_api of lead_fields_api_data) {
                fields[lead_fields_api.field_id] = lead_fields_api.field_json_data;
            }
            
          }
          leadData.fields = fields;
          leadData.sources = sources;

          return leadData;

        }else{
          return null;
        }

      }else{
        return null;
      }


      


    } catch (error) {

      console.log(error.message)
      return null;
    }
   

   
  }
  static async getReportFiltersData() {

    try {
      

      const project_type = await db("dummy_report")
                .distinct("project_type")
                .whereNotNull("project_type")
                .andWhere("project_type", "!=", "")
                .orderBy("project_type");
      
      const lead_funnel = await db("dummy_report")
                .distinct("lead_funnel")
                .whereNotNull("lead_funnel")
                .andWhere("lead_funnel", "!=", "")
                .orderBy("lead_funnel");

      const locations = await db("dummy_report")
                .distinct("address")
                .whereNotNull("address")
                .andWhere("address", "!=", "")
                .orderBy("address");          
      
      return {projectTypes: project_type, leadFunnels: lead_funnel, projectLocations: locations}

    } catch (error) {

      console.log(error.message)
      return null;
    }
   

   
  }
  static async getSources() {

    try {
      

      const sources = await db("lead_status_api")
                .where({
                  ENTITY_ID: "SOURCE"
                }).select("*");

      
      return {sources}

    } catch (error) {

      console.log(error.message)
      return null;
    }
   

   
  }
  static async addExpenses(body) {

    try {

      if (body.expanse_id) {
        await db('expenses')
          .where('id', body.expanse_id)
          .update({
            start_date: body.start_date,
            end_date: body.end_date,
            cost: body.amount,
          });

        return { id: body.expanse_id };
      }

      const existing = await db('expenses')
        .where('source', body.source_id)
        .andWhere(function () {
          this.where('start_date', '<=', body.end_date)
              .andWhere('end_date', '>=', body.start_date);
        })
        .first();

      if (existing) {
        // Conflict found
        return { error: 'Expense with overlapping date range already exists.', expanse_id: existing.id };
      }


      const [expense] = await db('expenses').insert({
        source: body.source_id,
        start_date: body.start_date,
        end_date: body.end_date,
        cost: body.amount,
      }).returning('id');

      if(expense.id){

        return {id: expense.id};

      }else{
        return null;
      }

      

    } catch (error) {

      console.log(error.message)
      return null;
    }
   

   
  }

  static async getReports(page = 1, pagesize = 10, body) {
      page = parseInt(page);
      pagesize = parseInt(pagesize);

      let limit = pagesize;
      let offset = 0;

      // Calculate offset if page > 0
      if (page > 0) {
          offset = (page - 1) * limit;
      }

      const leadMonth = body.leadMonth || '';
      const projectType = body.projectType || '';
      const leadFunnel = body.leadFunnel || '';
      const projectLocation = body.projectLocation || '';
      const tags = body.tags || '';
      const startDate = body.startDate || '';
      const endDate = body.endDate || '';

      let logQuery = db('dummy_report').select('*');

      const applyFilters = (query) => {
          // if (leadMonth && leadMonth !== '') {
          //     query.where('lead_month', 'LIKE', `%${leadMonth}%`)
          // }

          if (projectType && projectType !== '') {
              query.where('project_type', 'LIKE', `%${projectType}%`)
          }

          if (leadFunnel && leadFunnel !== '') {
              query.where('lead_funnel', 'LIKE', `%${leadFunnel}%`)
          }

          if (projectLocation && projectLocation !== '') {
              query.where('address', 'LIKE', `%${projectLocation}%`)
          }
          if (tags && tags !== '') {
              query.where('tags', 'LIKE', `%${tags}%`)
          }

          // if (tags && tags !== '') {
          //     query.where(function() {
          //         this.where('project_type', 'LIKE', `%${tags}%`)
          //             .orWhere('lead_funnel', 'LIKE', `%${tags}%`);
          //     });
          // }

          if (startDate && endDate) {
             const startDateFormatted = moment.utc(startDate).format('YYYY-MM-DD');
             const endDateFormatted = moment.utc(endDate).format('YYYY-MM-DD');

              query.whereBetween('project_month', [startDateFormatted, endDateFormatted]);
          }


          return query;
      };

      logQuery = applyFilters(logQuery);

      logQuery =  logQuery.orderBy("id");

      const [reports] = await Promise.all([
          logQuery
      ]);


      return {reports};

  }
  static async getReportsChartData(page = 1, pagesize = 10, body) {


     
      let reportData2 = await this.getReports(page, pagesize, body);
      

      const leadMonth = body.leadMonth || '';
      const projectType = body.projectType || '';
      const leadFunnel = body.leadFunnel || '';
      const projectLocation = body.projectLocation || '';
      const tags = body.tags || '';
      const startDate = body.startDate || '';
      const endDate = body.endDate || '';

      const lead_sources = ["GLSA", "ANGI", "Google Ads", "Thumbtack", "FaceBook", "SEO"];

      let logQuery = db('dummy_report').select(
            "lead_funnel as source",
            db.raw("COUNT(DISTINCT id) as total_project"),
            db.raw(`SUM(
              CASE 
                  WHEN price ~ '^[0-9.]+$' THEN CAST(price AS numeric) 
                  ELSE 0 
              END
            ) as price_total`)
          );

      const applyFilters = (query) => {
          // if (leadMonth && leadMonth !== '') {
          //     query.where('lead_month', 'LIKE', `%${leadMonth}%`)
          // }

          if (projectType && projectType !== '') {
              query.where('project_type', 'LIKE', `%${projectType}%`)
          }

          if (leadFunnel && leadFunnel !== '') {
              query.where('lead_funnel', 'LIKE', `%${leadFunnel}%`)
          }

          if (projectLocation && projectLocation !== '') {
              query.where('address', 'LIKE', `%${projectLocation}%`)
          }
          if (tags && tags !== '') {
              query.where('tags', 'LIKE', `%${tags}%`)
          }
          const lead_sources_lower = lead_sources.map(src => src.toLowerCase());

          query.whereRaw(`LOWER(lead_funnel) IN (${lead_sources_lower.map(() => '?').join(',')})`, lead_sources_lower);

          if (startDate && endDate) {
              const startDateFormatted = moment.utc(startDate).format('YYYY-MM-DD');
              const endDateFormatted = moment.utc(endDate).format('YYYY-MM-DD');
              query.whereBetween('project_month', [startDateFormatted, endDateFormatted]);
          }


          return query;
      };

      logQuery = applyFilters(logQuery);

      logQuery = logQuery.groupBy("lead_funnel");

      var reportData = await logQuery;

      


     let expense_data_ready = [];



      for (let i = 0; i < lead_sources.length; i++) {
        const source = lead_sources[i];

        let expenseQuery = db("expenses_dummy").where("source", source);

        if (startDate && endDate) {
          expenseQuery = expenseQuery.where(function () {
                            this.where("start_date", "<=", endDate)
                                .andWhere("end_date", ">=", startDate);
                          })
          // expenseQuery = expenseQuery.whereRaw(
          //   `TO_DATE(start_date, 'YYYY-MM-DD') >= ? AND TO_DATE(end_date, 'YYYY-MM-DD') <= ?`,
          //   [startDate, endDate]
          // );
        }

        const result = await expenseQuery
          .sum({
            expanse_cost: db.raw(`
              CASE 
                WHEN cost ~ '^[0-9.]+$' THEN CAST(cost AS numeric) 
                ELSE 0 
              END
            `),
            // roi: db.raw(`
            //   CASE 
            //     WHEN roi_cost ~ '^[0-9.]+$' THEN CAST(roi_cost AS numeric) 
            //     ELSE 0 
            //   END
            // `),
            appointments: db.raw(`
              CASE 
                WHEN appointments ~ '^[0-9.]+$' THEN CAST(appointments AS numeric) 
                ELSE 0 
              END
            `),
            jobs_booked: db.raw(`
              CASE 
                WHEN jobs_booked ~ '^[0-9.]+$' THEN CAST(jobs_booked AS numeric) 
                ELSE 0 
              END
            `)
          })
          .first();

        expense_data_ready.push({
          source: source,
          expanse_cost: result.expanse_cost,
         // roi: result.roi,
          appointments: result.appointments,
          jobs_booked: result.jobs_booked
        });
      }

      const sourceCount = reportData2.reports.reduce((acc, report) => {

        acc[report.lead_funnel.toLowerCase()] = (acc[report.lead_funnel.toLowerCase()] || 0) + 1;

        return acc;
      }, {});
      


      const expense_data = expense_data_ready.map(sourceData => {
        const matched = reportData.find(
                          item => item.source?.toLowerCase() === sourceData.source.toLowerCase()
                        );
        const matched2 = sourceCount[sourceData.source?.toLowerCase()] || 0;
        return {
          source: sourceData.source,
          total_project: matched?.total_project || '0',
          price_total: matched?.price_total || '0',
          expanse_cost: sourceData?.expanse_cost || '0',
          roi: matched?.price_total || '0',
          appointments: sourceData?.appointments || '0',
          jobs_booked: matched2 || '0'
        };
      });

      
      

    //  console.log(reportData2)

      let yearData = null;

      

      if(startDate){

        const groupedLeads = reportData2.reports.reduce((acc, report) => {
          // Extract year-month from lead_date (YYYY-MM-DD)
          const monthKey = report.lead_date.slice(0, 7); // e.g., '2025-07'

          // Increment the count
          acc[monthKey] = (acc[monthKey] || 0) + 1;

          return acc;
        }, {});

        const parsedStartDate2 = parseISO(startDate); // e.g., '2025-01-15'
        const monthRanges = [];

        // Generate ranges for current + previous 3 months
        for (let i = 0; i <= 3; i++) {
          const monthDate = subMonths(parsedStartDate2, i);
          const from = format(startOfMonth(monthDate), 'yyyy-MM-dd');
          const to = format(endOfMonth(monthDate), 'yyyy-MM-dd');
          const label = format(monthDate, 'yyyy-MM'); // For display or mapping

          monthRanges.push(label);
        }

        const filteredLeads = monthRanges.map(month => ({
          month,
          total_leads: groupedLeads[month] || 0
        }));

        yearData = filteredLeads;

        //console.log(yearData);

      }

      return {expense_data,yearData};

      //console.log(expense_data)

      
  }
  
}

module.exports = Leads;
