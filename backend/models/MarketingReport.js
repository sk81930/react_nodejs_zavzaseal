// models/User.js
const db = require('../config/connection.js'); // Import knex instance
var bcrypt = require("bcrypt");
const moment = require('moment');

class MarketingReport {
  // Constructor to set initial values or configuration
  constructor(data = null) {
    
  }

  
  static async getWebsiteData(
    page = 1,
    pagesize = 10,
    search = "",
    source,
    website,
    startDate,
    endDate,
    leadType,
    allsources
  ) {
    page = parseInt(page);
    pagesize = parseInt(pagesize);
    const limit = pagesize;
    const offset = page > 0 ? (page - 1) * limit : 0;

    // Base query: marketing_report joined with expenses on source
    let baseQuery = db("leads")
          .select(
            "SOURCE_ID",
            db.raw("COUNT(DISTINCT leads.id) as total_leads"),
            db.raw(`SUM(
              CASE 
                WHEN EXISTS (
                  SELECT 1 
                  FROM deals 
                  WHERE deals.lead_id = leads.lead_id
                ) THEN 1 
                ELSE 0 
              END
            ) as appointments_sum`)
          );

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

    const source_ids = [];
    let custom_source_ids = [];
    let customsources = null;

    if (source) {

      customsources = await db("lead_status_api")
          .select("STATUS_ID", "source_name", "NAME")
          .where("source_name", source);

      custom_source_ids = [source];

      for (const sourcesDdaa of customsources) {

        source_ids.push(sourcesDdaa.STATUS_ID);

      }

    }else{

      const allsourcesarray = allsources.split(',').map(s => s.trim());

      custom_source_ids = allsourcesarray;

      customsources = await db("lead_status_api")
          .select("STATUS_ID", "source_name", "NAME")
          .whereIn("source_name", allsourcesarray);
          
      for (const sourcesDdaa of customsources) {

        source_ids.push(sourcesDdaa.STATUS_ID);

      }

    }


    if (source_ids && source_ids.length > 0) {
      baseQuery = baseQuery.whereIn("SOURCE_ID", source_ids);
    }

    if (website && website !== "all") {
      baseQuery = baseQuery.where(`website`, website);
    }

    baseQuery = baseQuery.whereNotNull("SOURCE_ID").andWhere("SOURCE_ID", "!=", "");

    baseQuery = baseQuery.groupBy("SOURCE_ID").limit(limit).offset(offset);

    const leads = await baseQuery;





    const mergedSources = customsources.map(custom => {
      const match = leads.find(lead => lead.SOURCE_ID === custom.STATUS_ID);
      return {
        ...custom,
        ...match
      };
    });

    const grouped = {};

    for (const item of mergedSources) {
      const name = item.source_name;
      
      // Initialize group if not exists
      if (!grouped[name]) {
        grouped[name] = {
          source_name: name,
          total_leads: 0,
          appointments_sum: 0
        };
      }

      // Add values (convert strings to numbers)
      grouped[name].total_leads += Number(item.total_leads || 0);
      grouped[name].appointments_sum += Number(item.appointments_sum || 0);
    }

    // Convert object back to array
    const result = Object.values(grouped)

    const finalResult = custom_source_ids.map(source => {
      const found = result.find(r => r.source_name === source);
      return found || {
        source_name: source,
        total_leads: 0,
        appointments_sum: 0
      };
    });

    const dataPromises = finalResult.map(async (lead) => {

      let expenseQuery = db("expenses")
        .where("source", lead.source_name);


      if (startDate && endDate) {
        expenseQuery = expenseQuery.whereRaw(
          `TO_DATE(start_date, 'YYYY-MM-DD') >= ? AND TO_DATE(end_date, 'YYYY-MM-DD') <= ?`,
          [startDate, endDate]
        );
      }

      // Get the sum of cost, safely cast to numeric
      const result = await expenseQuery
        .sum({
          total_expense_cost_raw: db.raw(`
            CASE 
              WHEN cost ~ '^[0-9.]+$' THEN CAST(cost AS numeric) 
              ELSE 0 
            END
          `)
        })
        .first();

      lead.total_expenses = result.total_expense_cost_raw || 0;

      return lead;
    });



    await Promise.all(dataPromises);

    const filteredLeads = finalResult.filter(item => item.source_name && item.source_name.trim() !== '');


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


    const leadTypes = await db("leads")
    .distinct("lead_type")
    .whereNotNull("lead_type")
    .andWhere("lead_type", "!=", "")
    .orderBy("lead_type");

    return {leads: filteredLeads, sources, websites, leadTypes};
  }

  

}

module.exports = MarketingReport;
