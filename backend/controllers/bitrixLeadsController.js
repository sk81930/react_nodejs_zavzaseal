const baseResponse = require("../Util/baseResponse.js");
const axios = require('axios');
const moment = require('moment');
const db = require('../config/connection.js');
const LeadsModal = require('../models/Leads');
const MarketingReportModel = require('../models/MarketingReport');

const fs = require('fs');
const path = require('path');

// Define the log file path
const logFilePath = path.join(__dirname, 'log.txt');


class BitrixLeadsController {
   
    constructor() {
        this.webhookUrl = 'https://crm.zavzaseal.com/rest/428/mpqgc4acszqy2n26/';
    }
    writeLog(message) {
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logFilePath, `[${timestamp}] ${message}\n`);
    }
    async getLeadsData(body, res) {

        const response = new baseResponse(res);

        try {
            let {page = 1, size = 50, search = "", source = "", website = "all",  leadType = "", sortField = "", sortOrder = "DESC"  } = body;


            let dealsData = await LeadsModal.getLeadsData(parseInt(page),parseInt(size),search,source,website,leadType,sortField,sortOrder);


            let data = {
                dealsData 
            };

            return response.sendResponse(data, true, "", 200);

        } catch (error) {
            console.error('Error during fetch operation1:', error.message);
            response.sendResponse(null, false, error.message, 500);
        }
    }
    async getWebsiteData(body, res) {

        const response = new baseResponse(res);

        try {
            let {page = 1, size = 50, search = "", source = "", website = "all", startDate = "", endDate = "", leadType = "", allsources } = body;

            let leadsData = await MarketingReportModel.getWebsiteData(page,size,search,source,website,startDate,endDate,leadType,allsources);


            let data = {
                leadsData 
            };

            return response.sendResponse(data, true, "", 200);

        } catch (error) {
            console.error('Error during fetch operation1:', error.message);
            response.sendResponse(null, false, error.message, 500);
        }
    }
    /*async updateLeadFields(body, res) {

        const response = new baseResponse(res);

        try {
            
            const {leadId, fields} = body;


            let fields_data = {};

            if (fields.NAME) {
                const nameParts = fields.NAME.trim().split(" ");
                const firstName = nameParts.shift(); // Removes the first element
                const lastName = nameParts.join(" "); // Joins the remaining parts

                fields_data.NAME = firstName;
                fields_data.LAST_NAME = lastName;
            }
            if (fields.SOURCE_ID) {
                fields_data.SOURCE_ID = fields.SOURCE_ID;
            }
            // for lead date
            if (fields.UF_CRM_1672141384) {
                fields_data.UF_CRM_1672141384 = fields.UF_CRM_1672141384;
            }
            // for Referrer domain
            if (fields.UF_CRM_1709039182) {
                fields_data.UF_CRM_1709039182 = fields.UF_CRM_1709039182;
            }

            // for Page of form submission
            if (fields.UF_CRM_1709039197) {
                fields_data.UF_CRM_1709039197 = fields.UF_CRM_1709039197;
            }

            // for Previous page URL
            if (fields.UF_CRM_1709039208) {
                fields_data.UF_CRM_1709039208 = fields.UF_CRM_1709039208;
            }

            // for IP Address
            if (fields.UF_CRM_1709039219) {
                fields_data.UF_CRM_1709039219 = fields.UF_CRM_1709039219;
            }

            // for address
            if (fields.ADDRESS) {
                fields_data.ADDRESS = fields.ADDRESS;
            }

            // for City
            if (fields.UF_CRM_1631295564) {
                fields_data.UF_CRM_1631295564 = fields.UF_CRM_1631295564;
            }

            // for State
            if (fields.UF_CRM_1631295727) {
                fields_data.UF_CRM_1631295727 = fields.UF_CRM_1631295727;
            }

            // for ZIP Code
            if (fields.UF_CRM_1631295577) {
                fields_data.UF_CRM_1631295577 = fields.UF_CRM_1631295577;
            }

            // for comments
            if (fields.COMMENTS) {
                fields_data.COMMENTS = fields.COMMENTS;
            }

            // // 
            // if (fields.UF_CRM_1709039182) {
            //     fields_data.UF_CRM_1709039182 = fields.UF_CRM_1709039182;
            // }

            // // 
            // if (fields.UF_CRM_1709039182) {
            //     fields_data.UF_CRM_1709039182 = fields.UF_CRM_1709039182;
            // }

            // // 
            // if (fields.UF_CRM_1709039182) {
            //     fields_data.UF_CRM_1709039182 = fields.UF_CRM_1709039182;
            // }

            console.log(fields_data)

            if (Object.keys(fields_data).length > 0) {
                const updatePayload = {
                  id: leadId,
                  fields: fields_data
                };
                    console.log(updatePayload)

                try {
                      // const updateResponse = await axios.post(
                      //   this.webhookUrl + 'crm.lead.update',
                      //   updatePayload,
                      //   {
                      //     headers: {
                      //       'Content-Type': 'application/json',
                      //       'Accept': 'application/json'
                      //     }
                      //   }
                      // );

                    await this.getBitrixSingleLeadFromApi(leadId, body, res);

                    return response.sendResponse(null, true, "Successfully update", 200);

                } catch (err) {
                    return response.sendResponse(null, true, err.message, 500);
                    console.error(`Failed to update lead:`,  err.message);
                }
              }else{
                return response.sendResponse(null, true, "Update fields empty", 500);
            }

        } catch (error) {
            console.error('Error during fetch operation1:', error.message);
            response.sendResponse(null, false, error.message, 500);
        }
    }*/

    async updateLeadFields(body, res) {

        const response = new baseResponse(res);

        try {
            
            const {leadId, fields} = body;

            

            let fields_data = {};
            let core_field_data = {};
            
            if ('NAME' in fields) {
                const nameParts = fields.NAME.trim().split(" ");
                const firstName = nameParts.shift(); // Removes the first element
                const lastName = nameParts.join(" "); // Joins the remaining parts

                fields_data.NAME = firstName;
                fields_data.LAST_NAME = lastName;

                core_field_data.NAME = firstName;
                core_field_data.LAST_NAME = lastName;
            }
            if ('TITLE' in fields) {
                fields_data.TITLE = fields.TITLE;
                core_field_data.TITLE = fields.TITLE;
            }
            if ('SOURCE_ID' in fields) {
                fields_data.SOURCE_ID = fields.SOURCE_ID;
                core_field_data.SOURCE_ID = fields.SOURCE_ID;
            }
            // for lead date
            if ('UF_CRM_1672141384' in fields) {
                const lead_date = new Date(fields.UF_CRM_1672141384);
                const lead_datestring = lead_date.toISOString(); 
                fields_data.UF_CRM_1672141384 = lead_datestring;
            }
            // for Referrer domain
            if ('UF_CRM_1709039182' in fields) {
                fields_data.UF_CRM_1709039182 = fields.UF_CRM_1709039182;
            }

            // for Page of form submission
            if ('UF_CRM_1709039197' in fields) {
                fields_data.UF_CRM_1709039197 = fields.UF_CRM_1709039197;
            }

            // for Previous page URL
            if ('UF_CRM_1709039208' in fields) {
                fields_data.UF_CRM_1709039208 = fields.UF_CRM_1709039208;
            }

            // for IP Address
            if ('UF_CRM_1709039219' in fields) {
                fields_data.UF_CRM_1709039219 = fields.UF_CRM_1709039219;
            }

            // for address
            if ('ADDRESS' in fields) {
                fields_data.ADDRESS = fields.ADDRESS;
            }

            // for City
            if ('UF_CRM_1631295564' in fields) {
                fields_data.UF_CRM_1631295564 = fields.UF_CRM_1631295564;
            }

            // for State
            if ('UF_CRM_1631295727' in fields) {
                fields_data.UF_CRM_1631295727 = fields.UF_CRM_1631295727;
            }

            // for ZIP Code
            if ('UF_CRM_1631295577' in fields) {
                fields_data.UF_CRM_1631295577 = fields.UF_CRM_1631295577;
            }

            // for Phone
            if ('PHONE' in fields) {
                fields_data.PHONE = fields.PHONE;
            }
            // for comments
            if ('COMMENTS' in fields) {
                fields_data.COMMENTS = fields.COMMENTS;
                core_field_data.COMMENTS = fields.COMMENTS;
            }

            // for Estimater
            if ('UF_CRM_1671573088' in fields) {
                fields_data.UF_CRM_1671573088 = fields.UF_CRM_1671573088;
            }

            // for Appointment Date/Time
            if ('UF_CRM_1671573599' in fields) {
                fields_data.UF_CRM_1671573599 = fields.UF_CRM_1671573599;
            }

            // for Project description
            if ('UF_CRM_1672946127' in fields) {
                fields_data.UF_CRM_1672946127 = fields.UF_CRM_1672946127;
            }

            // for Other Project description
            if ('UF_CRM_1693388917' in fields) {
                fields_data.UF_CRM_1693388917 = fields.UF_CRM_1693388917;
            }

            // for Financial program (NG/PP/HRT)
            if ('UF_CRM_1682351561' in fields) {
                fields_data.UF_CRM_1682351561 = fields.UF_CRM_1682351561;
            }

            // for New text
            if ('UF_CRM_LEAD_1708612888272' in fields) {
                fields_data.UF_CRM_LEAD_1708612888272 = fields.UF_CRM_LEAD_1708612888272;
            }



            if (Object.keys(fields_data).length > 0) {


                let field_keys = Object.keys(fields_data);

                const leads_data = await db("leads")
                                    .where({
                                      lead_id: leadId
                                    }).select("edit_fields","lead_json_data").first();



                let merged_edit_fields = [];

                if (leads_data && Array.isArray(leads_data.edit_fields)) {
                  // Merge existing with new and deduplicate
                  merged_edit_fields = Array.from(new Set([...leads_data.edit_fields, ...field_keys]));
                } else {
                  // No existing edit_fields in DB
                  merged_edit_fields = field_keys;
                }

                merged_edit_fields = JSON.stringify(merged_edit_fields);

                core_field_data.edit_fields = merged_edit_fields;


                

               

                if(leads_data.lead_json_data){

                    const merged_data = { ...leads_data.lead_json_data, ...fields_data };

                    core_field_data.lead_json_data = merged_data;

                }

                await db('leads')
                  .where('lead_id', leadId)
                  .update(core_field_data);
       
                return response.sendResponse(null, true, "Successfully update", 200);
               
            }else{
                return response.sendResponse(null, true, "Update fields empty", 500);
            }

        } catch (error) {
            console.error('Error during fetch operation1:', error.message);
            response.sendResponse(null, false, error.message, 500);
        }
    }
    async getBitrixSingleLeadFromApi(lead_id,body,res) {

        
        try {

            const payload = {
              ID: lead_id
            };

            const response2 = await axios.post(this.webhookUrl + 'crm.lead.get', payload, {
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json'
                                  }
                                })

            const data = response2.data;

            if (data.result) {
                await this.saveLeadApi(data.result);
                await this.saveLeadsInDatabase(body,res, true);
            }
            return true;
        } catch (error) {
            console.error('Error during fetch operation:', error.message);
            return false;
        }
    }

    async getBitrixLeadsFromApi(body, res) {

        let response = null;

        if(res.sendResponse){
            response = res;
        }else{
            response = new baseResponse(res);
        }
        try {

          const today = new Date();
          const fromDate = new Date(today);
          fromDate.setDate(today.getDate() - 2); // 2 days before

          const toDate = new Date(today);
          toDate.setDate(today.getDate() + 1); // 1 day after

          // Format dates to Bitrix24 expected format: YYYY-MM-DDTHH:mm:ss
          const formatDate = (date) => date.toISOString().split('.')[0];
          let start = 0; 
          let leads = [];

          //   const payload = {
          //     select: ['*', 'UF_*'],
          //     start: 200 * 2,
          //     order: {
          //       STATUS_ID: 'ASC'
          //     }
          //   };

          //   const response2 = await axios.post(this.webhookUrl + 'crm.lead.list', payload, {
          //                         headers: {
          //                           'Content-Type': 'application/json',
          //                           'Accept': 'application/json'
          //                         }
          //                       })


          // return response.sendResponse(response2.data, true, "Leads fetched and stored successfully!", 200);
          //    console.log(JSON.stringify(response.data,null,2))

          do {
            const payload = {
              select: ['*', 'UF_*', 'EMAIL', 'PHONE'],
              start: start,
              filter: {
                '>=DATE_CREATE': formatDate(fromDate),
                '<=DATE_CREATE': formatDate(toDate)
              },
              limit: 2000
            };
            const response2 = await axios.post(this.webhookUrl + 'crm.lead.list', payload, {
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json'
                                  }
                                })

            const data = response2.data;



            if (data.error) {
                return response.sendResponse(null, false, data.error + ': ' + data.error_description, 403);
            }

            if (data.result) {
              leads = [...leads, ...data.result];
            }

            start = data.next || false;

            //console.log(data)

          } while (start !== false);

          
          //console.log(leads)


          for (const leadData of leads) {
            await this.saveLeadApi(leadData);
          }

          await this.getBitrixLeadsStatusFromApi(body,res, true);
          await this.getBitrixLeadsFieldsFromApi(body,res, true);
          await this.saveLeadsInDatabase(body,res, true);

          this.writeLog(`Fetched ${leads.length} leads from Bitrix24 API.`);


          console.log('Leads fetched and stored successfully.');
          return response.sendResponse(null, true, "Leads fetched and stored successfully!", 200);
        } catch (error) {
            console.error('Error during fetch operation:', error.message);
            return response.sendResponse(null, false, error.message, 500);
        }
    }
    async getBitrixLeadsStatusFromApi(body, res, direct = false) {

        let response = null;

        if(res.sendResponse){
            response = res;
        }else{
            response = new baseResponse(res);
        }
        try {
          let start = 0; 
          let statuses = [];

        

            const response2 = await axios.post(this.webhookUrl + 'crm.status.list', {}, {
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json'
                                  }
                                })

            const data = response2.data;



            if (data.error) {
                return response.sendResponse(null, false, data.error + ': ' + data.error_description, 403);
            }

            if (data.result) {
              statuses = data.result;
            }


          // return response.sendResponse(response2.data, true, "Leads fetched and stored successfully!", 200);
          //    console.log(JSON.stringify(response.data,null,2))

         

         // console.log(statuses)


          for (const statusData of statuses) {
            await this.saveStatusData(statusData);
          }
           console.log('Status fetched and stored successfully.');
           if(direct == true){
                return true
            }else{
               
                return response.sendResponse(null, true, "Status fetched and stored successfully!", 200);
            }

         
        } catch (error) {
             console.error('Error during fetch operation:', error.message);
             if(direct == true){
                return true
            }else{
             
              return response.sendResponse(null, false, error.message, 500);
            }
            
        }
    }
    async getBitrixLeadsFieldsFromApi(body, res, direct = false) {

        let response = null;

        if(res.sendResponse){
            response = res;
        }else{
            response = new baseResponse(res);
        }
        try {
            let start = 0; 
            let fields = [];

            const response2 = await axios.post(this.webhookUrl + 'crm.lead.fields', {}, {
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json'
                                  }
                                })

            const data = response2.data;

            if (data.error) {
                return response.sendResponse(null, false, data.error + ': ' + data.error_description, 403);
            }

            if (data.result) {
              fields = data.result;
            }


         //  // return response.sendResponse(response2.data, true, "Leads fetched and stored successfully!", 200);
         //  //    console.log(JSON.stringify(response.data,null,2))

         


            for (const [fieldKey, fieldData] of Object.entries(fields)) {
              await this.saveFieldData(fieldKey, fieldData);
            }

            console.log('Fields fetched and stored successfully.');

            if(direct == true){
                return true
            }else{
                return response.sendResponse(null, true, "Fields fetched and stored successfully!", 200);

            }

       
          
        } catch (error) {
            console.error('Error during fetch operation:', error.message);
            if(direct == true){
                return true
            }else{
                 
                return response.sendResponse(null, false, error.message, 500);

            }
            
        }
    }

    async saveLeadApi(leadData) {
        try {
          await db('leads_api')
            .insert({
              lead_id: leadData.ID,
              lead_json_data: leadData
            })
            .onConflict('lead_id')
            .merge(); 
        } catch (error) {
          console.error('Error during fetch operation:', error.message);
        }
    }
    async saveStatusData(statusData) {
        try {
          await db('lead_status_api')
            .insert({
              status_main_id: statusData.ID,
              ENTITY_ID: statusData.ENTITY_ID,
              STATUS_ID: statusData.STATUS_ID,
              NAME: statusData.NAME,
              NAME_INIT: statusData.NAME_INIT,
              CATEGORY_ID: statusData.CATEGORY_ID,
            })
            .onConflict('status_main_id')
            .merge(); 
        } catch (error) {
          console.error('Error during fetch operation:', error.message);
        }
    }
    async saveFieldData(field_key,fieldData) {
        try {
          await db('lead_fields_api')
            .insert({
              field_id: field_key,
              field_json_data: fieldData,
            })
            .onConflict('field_id')
            .merge(); 
        } catch (error) {
          console.error('Error during fetch operation:', error.message);
        }
    }

    async saveLeadsInDatabase(body, res, direct = false) {

        let response = null;

        if(res.sendResponse){
            response = res;
        }else{
            response = new baseResponse(res);
        }
        try {

            let query = db("leads_api");
            const leadsData = await query.select("*").orderBy("id");

            for (const leadData of leadsData) {
                await this.saveLead(leadData);
            }

            if(direct == true){
                return true;
            }else{

                return response.sendResponse(null, true, "stored successfully!", 200);

            }

          
            
        } catch (error) {
             if(direct == true){

                return true;

            }else{

                return response.sendResponse(null, false, error.message, 500);

            }
           
        }
    }
    async saveLead(leadData) {
        try {

            

            if(leadData && leadData.lead_json_data && leadData.lead_json_data.ID){


                let lead_json_data = leadData.lead_json_data;


                const leads_db_data = await db("leads")
                                    .where({
                                      lead_id: leadData.lead_id
                                    }).select("edit_fields","lead_json_data").first();

                if(leads_db_data && leads_db_data.edit_fields){

                    const all_fields = leads_db_data.edit_fields;
                    const json_data = leads_db_data.lead_json_data;

                    const filteredData = {};

                    all_fields.forEach(key => {
                      if (key in json_data) {
                        filteredData[key] = json_data[key];
                      }
                    });

                    if (Object.keys(filteredData).length > 0) {

                        lead_json_data = { ...lead_json_data, ...filteredData };

                    } 

                }


                let type = "Call";

                if (lead_json_data.TITLE && lead_json_data.TITLE != "" && lead_json_data.TITLE.toLowerCase().includes("form")) {
                  type = "Form";
                } 

                let website_domain = "";

                if (lead_json_data.UF_CRM_1709039182 && lead_json_data.UF_CRM_1709039182 != "") {
                  website_domain = lead_json_data.UF_CRM_1709039182;
                } 

                let website = "";

                if (lead_json_data.UF_CRM_1752571588 && lead_json_data.UF_CRM_1752571588 != "") {
                  website = lead_json_data.UF_CRM_1752571588;
                } 

                const TITLE = lead_json_data.TITLE;
                const NAME = lead_json_data.NAME;
                const LAST_NAME = lead_json_data.LAST_NAME;
                const BIRTHDATE = lead_json_data.BIRTHDATE;
                const SOURCE_ID = lead_json_data.SOURCE_ID;
                const STATUS_ID = lead_json_data.STATUS_ID;
                const COMMENTS = lead_json_data.COMMENTS;
                const CURRENCY_ID = lead_json_data.CURRENCY_ID;
                const OPPORTUNITY = lead_json_data.OPPORTUNITY;
                const DATE_CREATE = lead_json_data.DATE_CREATE;
                const DATE_MODIFY = lead_json_data.DATE_MODIFY;
                //const phone = lead_json_data.phone;

                await db('leads')
                    .insert({
                      lead_id: leadData.lead_id,
                      lead_type: type,
                      website: website,
                      website_domain: website_domain,
                      TITLE: TITLE,
                      NAME: NAME,
                      LAST_NAME: LAST_NAME,
                      BIRTHDATE: BIRTHDATE,
                      SOURCE_ID: SOURCE_ID,
                      STATUS_ID: STATUS_ID,
                      COMMENTS: COMMENTS,
                      CURRENCY_ID: CURRENCY_ID,
                      OPPORTUNITY: OPPORTUNITY,
                      DATE_CREATE: DATE_CREATE,
                      DATE_MODIFY: DATE_MODIFY,
                      lead_json_data: lead_json_data,
                    })
                    .onConflict('lead_id')
                    .merge(); 




            }
            // await db('leads')
            // .insert({
            //   lead_id: leadData.ID,
            //   lead_type: leadData
            // })
            // .onConflict('lead_id')
            // .merge(); 
           //console.log(leadData)
        } catch (error) {
          console.error('Error during fetch operation:', error.message);
        }
    }

    async getLeadById(body, res) {

        let response = new baseResponse(res);


        try {

            const {id} = body;

            let leadData = await LeadsModal.getLeadById(id);

           // console.log(leadData)
           
           return response.sendResponse(leadData, true, "leadData", 200);
        } catch (error) {
            console.error('Error during fetch operation:', error.message);
            return response.sendResponse(null, false, error.message, 500);
        }
    }
    async getReportFiltersData(body, res) {

        let response = new baseResponse(res);


        try {


            let data = await LeadsModal.getReportFiltersData();

           // console.log(leadData)
           
           return response.sendResponse(data, true, "sources", 200);
        } catch (error) {
            console.error('Error during fetch operation:', error.message);
            return response.sendResponse(null, false, error.message, 500);
        }
    }
    async getSources(body, res) {

        let response = new baseResponse(res);


        try {

            const {id} = body;

            let sources = await LeadsModal.getSources();

           // console.log(leadData)
           
           return response.sendResponse(sources, true, "sources", 200);
        } catch (error) {
            console.error('Error during fetch operation:', error.message);
            return response.sendResponse(null, false, error.message, 500);
        }
    }
    async addExpenses(body, res) {

        let response = new baseResponse(res);


        try {

            let expenses = await LeadsModal.addExpenses(body);

            if(expenses && expenses.expanse_id){

                return response.sendResponse(expenses, true, "Already add cost on that date range.", 200);

            }

           // console.log(leadData)
           
           return response.sendResponse(expenses, true, "sources", 200);
        } catch (error) {
            console.error('Error during fetch operation:', error.message);
            return response.sendResponse(null, false, error.message, 500);
        }
    }

     async getReports(body, res) {

        const response = new baseResponse(res);

        try {
            let {page = 1, pagesize = 10 } = body;

            let reports = await LeadsModal.getReports(page,pagesize,body);


            return response.sendResponse(reports, true, "", 200);
        } catch (error) {
            console.error('Error during fetch operation:', error.message);
            response.sendResponse(null, false, error.message, 500);
        }
    }
    async getReportsChartData(body, res) {

        const response = new baseResponse(res);

        try {
            let {page = 1, pagesize = 10 } = body;

            let reports = await LeadsModal.getReportsChartData(page,pagesize,body);


            return response.sendResponse(reports, true, "", 200);
        } catch (error) {
            console.error('Error during fetch operation:', error.message);
            response.sendResponse(null, false, error.message, 500);
        }
    }

}

module.exports = BitrixLeadsController;
