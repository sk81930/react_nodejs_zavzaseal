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
  
  static async getWebsiteData(page = 1, pagesize = 10, search = "", source, website, startDate, endDate, leadType) {
    page = parseInt(page);
    pagesize = parseInt(pagesize);

    const limit = pagesize;
    let offset = 0;

    // Calculate offset if page > 0
    if (page > 0) {
      offset = (page - 1) * limit;
    }

    // Initialize the query for fetching deals and another for counting total deals
   let query = db("deals")
    .select(
      "source",
      db.raw("COUNT(*) as total_deals"),
      db.raw("SUM(CAST(opportunity AS numeric)) as opportunity_sum"),
      db.raw("SUM(CASE WHEN appointments ~ '^[0-9]+$' THEN CAST(appointments AS numeric) ELSE 0 END) as appointments_sum")
    );

    // Filter by date range on begin_date (assuming it's stored as string, convert to date)
    // if (startDate && endDate) {
    //   query = query.whereBetween(
    //     db.raw("to_date(begin_date, 'YYYY-MM-DD')"), // adjust format if needed
    //     [startDate, endDate]
    //   );
    // }

    // Filter by search in title
    if (search && search.trim() !== "") {
      query = query.where(function () {
        this.where("title", "ILIKE", `%${search}%`)
          .orWhere("website", "ILIKE", `%${search}%`)
          .orWhere("source", "ILIKE", `%${search}%`);
      });
    }
    if (leadType && leadType.trim() !== "") {
      var leadTypeData = "WEBFORM";

      if(leadType == "form_call"){

        leadTypeData = "CALL";

      }
      query = query.where("source_id", leadTypeData);
    }
    if (source) {
      query = query.where("source", source);
    }

    // Filter by website if provided
    if (website && website != "all") {
      query = query.where("website", website);

    }

    // Exclude rows where source is null or empty
    query = query.whereNotNull("source").andWhere("source", "!=", "");

    // Group by source
    query = query.groupBy("source");

    // Pagination
    query = query.limit(pagesize).offset(offset);

    const deals = await query;


    const sources = await db("deals")
    .distinct("source")
    .whereNotNull("source")
    .andWhere("source", "!=", "")
    .orderBy("source");

    const websites = await db("deals")
    .distinct("website")
    .whereNotNull("website")
    .andWhere("website", "!=", "")
    .orderBy("website");

    return {deals,sources,websites};


    // // Execute the query to count the total number of matching deals
    // const totalDeals = await querytotal.count("id as total").first();

    // const totalCount = parseInt(totalDeals.total, 10);
    // const totalPages = Math.ceil(totalCount / pagesize);

    // // Return deals with pagination info
    // return {
    //   deals,
    //   pagination: {
    //     totalCount,
    //     totalPages,
    //     currentPage: page,
    //     pagesize,
    //   },
    // };
  }
  static async getLeadsData(page = 1, pagesize = 10, search = "", source, website, leadType, sortField, sortOrder) {
    page = parseInt(page);
    pagesize = parseInt(pagesize);

    const limit = pagesize;
    const offset = (page - 1) * limit;

    // Base query to apply filters
    let baseQuery = db("deals");

    // Filter by search
    if (search && search.trim() !== "") {
      baseQuery = baseQuery.where(function () {
        this.where("title", "ILIKE", `%${search}%`)
          .orWhere("website", "ILIKE", `%${search}%`)
          .orWhere("source", "ILIKE", `%${search}%`);
      });
    }

    // Filter by lead type
    if (leadType && leadType.trim() !== "") {
      let leadTypeData = leadType === "form_call" ? "CALL" : "WEBFORM";
      baseQuery = baseQuery.where("source_id", leadTypeData);
    }

    // Filter by source
    if (source) {
      baseQuery = baseQuery.where("source", source);
    }

    // Filter by website
    if (website && website !== "all") {
      baseQuery = baseQuery.where("website", website);
    }

    // (Optional) Filter by date range (uncomment and adjust if needed)
    // if (startDate && endDate) {
    //   baseQuery = baseQuery.whereBetween(
    //     db.raw("to_date(begin_date, 'YYYY-MM-DD')"),
    //     [startDate, endDate]
    //   );
    // }

    // Clone base query to count total records
    const countQuery = await baseQuery.clone().count("id as total").first();

    let sortBy = "id";
    let sortDirection = "asc";

    // Validate and apply user-defined sorting
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

    // Apply sorting to the base query
    //baseQuery = baseQuery.orderBy(sortBy, sortDirection);

   //  console.log("SQL Query:", baseQuery.toString());



    const leads = await baseQuery.limit(limit).offset(offset);

  // console.log("SQL Query:", leads.toString());

    // // Execute queries
    // const [deals, totalResult, sources, websites] = await Promise.all([
    //   dealsQuery,
    //   countQuery,
    //   db("deals")
    //     .distinct("source")
    //     .whereNotNull("source")
    //     .andWhere("source", "!=", "")
    //     .orderBy("source"),
    //   db("deals")
    //     .distinct("website")
    //     .whereNotNull("website")
    //     .andWhere("website", "!=", "")
    //     .orderBy("website")
    // ]);

    const sources = await db("deals")
    .distinct("source")
    .whereNotNull("source")
    .andWhere("source", "!=", "")
    .orderBy("source");

    const websites = await db("deals")
    .distinct("website")
    .whereNotNull("website")
    .andWhere("website", "!=", "")
    .orderBy("website");


    const totalCount = parseInt(countQuery.total, 10) || 0;
    const totalPages = Math.ceil(totalCount / pagesize);

    return {
      leads,
      sources,
      websites,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        pagesize,
      }
    };
  }

  static async getDealsData(page = 1, pagesize = 10, search = "", source, website, leadType, sortField, sortOrder) {
    page = parseInt(page);
    pagesize = parseInt(pagesize);

    const limit = pagesize;
    const offset = (page - 1) * limit;

    let baseQuery = db("deals");

    if (search && search.trim() !== "") {
      baseQuery = baseQuery.where(function () {
        this.where("title", "ILIKE", `%${search}%`)
          .orWhere("lead_id", "ILIKE", `%${search}%`)
          .orWhere("deal_id", "ILIKE", `%${search}%`)
          .orWhere("source_id", "ILIKE", `%${search}%`)
      });
    }

    // if (leadType && leadType.trim() !== "") {
    //   //let leadTypeData = leadType;
    //   baseQuery = baseQuery.where("lead_type", leadType);
    // }

    if (source) {
      baseQuery = baseQuery.where("source_id", source);
    }

    // if (website && website !== "all") {
    //   baseQuery = baseQuery.whereRaw(`website LIKE ?`, [`%${website}%`]);
    // }
  //  console.log(website)


    const countQuery = await baseQuery.clone().count("id as total").first();

    let sortBy = "id";
    let sortDirection = "DESC";

    if (sortField && sortField !== "") {
      sortBy = sortField;

      if (sortOrder && (sortOrder.toLowerCase() === "asc" || sortOrder.toLowerCase() === "desc")) {
        sortDirection = sortOrder.toLowerCase();
      }
    }

   // baseQuery = baseQuery.orderBy(sortBy, sortDirection);

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


    const deals = await baseQuery.limit(limit).offset(offset);

   

    const dataPromises = deals.map(async (deal) => {

        if(deal.source_id && deal.source_id != ""){

          const status_data = await db("lead_status_api")
                .select("*")
                .where({
                  STATUS_ID: deal.source_id,
                  ENTITY_ID: "SOURCE"
                })
                .first();

          if (status_data) {
            deal.source_name = status_data.NAME;
          }else{
            deal.source_name = "";
          }
        }else{
          deal.source_name = "";
        }  

        return deal;
    });

    await Promise.all(dataPromises);

    


   


    const sourcesData = await db("deals")
    .distinct("source_id")
    .whereNotNull("source_id")
    .andWhere("source_id", "!=", "")
    .orderBy("source_id");


    const sources = [];

    for (const sourcesD of sourcesData) {

      const status_data = await db("lead_status_api")
              .select("*")
              .where({
                STATUS_ID: sourcesD.source_id,
                ENTITY_ID: "SOURCE"
              })
              .first(); // gets only the first matched row

            if (status_data) {
              sources.push(status_data);
            }

    }

    
    // const websitesData = await db("leads")
    // .distinct("website")
    // .whereNotNull("website")
    // .andWhere("website", "!=", "")
    // .orderBy("website");


    // const websitesDomains = [];

    // for (const websitesD of websitesData) {
    //   const url = new URL(websitesD.website);
    //   websitesDomains.push(url.hostname); 
    // }

    // const websites = [...new Set(websitesDomains)];


    // const leadTypes = await db("leads")
    // .distinct("lead_type")
    // .whereNotNull("lead_type")
    // .andWhere("lead_type", "!=", "")
    // .orderBy("lead_type");

    const totalCount = parseInt(countQuery.total, 10) || 0;
    const totalPages = Math.ceil(totalCount / pagesize);

    return {
      deals,
      sources,
      websites: null,
      leadTypes: null,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        pagesize,
      }
    };
  }

  static async getDealById(id) {

    try {
      let query = db("deals");
      const dealData = await query.where("id",id).first();

      if(dealData && dealData.id){

        let query = db("deals_api");
        const dealsApiData = await query.where("deal_id", dealData.deal_id).first();

        



        if(dealsApiData && dealsApiData.deal_json_data){

          

          const status_data = await db("lead_status_api")
                .where({
                  STATUS_ID: dealData.source_id,
                  ENTITY_ID: "SOURCE"
                }).first();
          if (status_data) {
            dealData.source_name = status_data.NAME;
          }else{
            dealData.source_name = "";
          }



          dealData.deal_json_data = dealsApiData.deal_json_data;


          const fields = {};

          const deal_fields_api_data = await db("deal_fields_api").select("*");
          if (deal_fields_api_data && deal_fields_api_data.length > 0) {
            for (const deal_fields_api of deal_fields_api_data) {
                fields[deal_fields_api.field_id] = deal_fields_api.field_json_data;
            }
            
          }
          dealData.fields = fields;

          dealData.lead_data = null;

          if(dealData.lead_id && dealData.lead_id != ""){



            const lead_data = await db("leads")
                .where({
                  lead_id: dealData.lead_id
                }).first();

            if (lead_data) {
              dealData.lead_data = lead_data;
            }

          }

         

          

          return dealData;

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
 


}

module.exports = Deals;
