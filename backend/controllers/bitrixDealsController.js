const baseResponse = require("../Util/baseResponse.js");
const axios = require('axios');
const moment = require('moment');
const db = require('../config/connection.js');
const DealsModel = require('../models/Deals');
const MarketingReportModel = require('../models/MarketingReport');

const fs = require('fs');
const path = require('path');

// Define the log file path
const logFilePath = path.join(__dirname, 'log.txt');

class BitrixDealsController {
   
    constructor() {
        this.webhookUrl = 'https://crm.zavzaseal.com/rest/428/l39cposjiucv65cr/';
    }

    writeLog(message) {
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logFilePath, `[${timestamp}] ${message}\n`);
    }

    async getDeals(body, res) {

        const response = new baseResponse(res);

        try {
            let {page = 1, size = 50, search = ""} = body;

            let dealsData = await DealsModel.getPaginatedDeals(page,size,search);


            let data = {
                dealsData 
            };

            return response.sendResponse(data, true, "", 200);

        } catch (error) {
            console.error('Error during fetch operation1:', error.message);
            response.sendResponse(null, false, error.message, 500);
        }
    }
   
    
    async getDealsData(body, res) {

        const response = new baseResponse(res);

        try {
            let {page = 1, size = 50, search = "", source = "", website = "all",  leadType = "", sortField = "", sortOrder = "DESC"  } = body;


            let dealsData = await DealsModel.getDealsData(parseInt(page),parseInt(size),search,source,website,leadType,sortField,sortOrder);


            let data = {
                dealsData 
            };

            return response.sendResponse(data, true, "", 200);

        } catch (error) {
            console.error('Error during fetch operation1:', error.message);
            response.sendResponse(null, false, error.message, 500);
        }
    }
    async getDealById(body, res) {

        let response = new baseResponse(res);


        try {

            const {id} = body;

            let dealData = await DealsModel.getDealById(id);

           // console.log(leadData)
           
           return response.sendResponse(dealData, true, "dealData", 200);
        } catch (error) {
            console.error('Error during fetch operation:', error.message);
            return response.sendResponse(null, false, error.message, 500);
        }
    }

    async getBitrixDealsFromApi(body, res) {

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
          let deals = [];

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
            const response2 = await axios.post(this.webhookUrl + 'crm.deal.list', payload, {
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
              deals = [...deals, ...data.result];
            }

            start = data.next || false;

            //console.log(data)

          } while (start !== false);

          //console.log(deals)

          

          for (const dealData of deals) {
            await this.saveDealApi(dealData);
          }

          await this.getBitrixDealsFieldsFromApi(body,res,true);
          await this.saveDealsInDatabase(body,res,true);

          this.writeLog(`Fetched ${deals.length} deals from Bitrix24 API.`);

          console.log('Deals fetched and stored successfully.');
          return response.sendResponse(null, true, "Deals fetched and stored successfully!", 200);
        } catch (error) {
            console.error('Error during fetch operation:', error.message);
            return response.sendResponse(null, false, error.message, 500);
        }
    }
    async getBitrixDealsFieldsFromApi(body, res, direct = false) {

        let response = null;

        if(res.sendResponse){
            response = res;
        }else{
            response = new baseResponse(res);
        }
        try {
            let start = 0; 
            let fields = [];

            const response2 = await axios.post(this.webhookUrl + 'crm.deal.fields', {}, {
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

    async saveDealsInDatabase(body, res, direct = false) {

        let response = null;

        if(res.sendResponse){
            response = res;
        }else{
            response = new baseResponse(res);
        }
        try {

            let query = db("deals_api");
            const dealsData = await query.select("*").orderBy("id");

            for (const dealData of dealsData) {
                await this.saveDeal(dealData);
            }
            if(direct == true){
                return true
            }else{
               
              return response.sendResponse(null, true, "stored successfully!", 200);
            }

          
            
        } catch (error) {
            console.error('Error during fetch operation:', error.message);
            if(direct == true){
                return true
            }else{
               
                return response.sendResponse(null, false, error.message, 500);
            }
            return response.sendResponse(null, false, error.message, 500);
        }
    }



    async saveDealApi(dealData) {
        try {
          await db('deals_api')
            .insert({
              deal_id: dealData.ID,
              deal_json_data: dealData
            })
            .onConflict('deal_id')
            .merge(); 
        } catch (error) {
          console.error('Error during fetch operation:', error.message);
        }
    }
    async saveFieldData(field_key,fieldData) {
        try {
          await db('deal_fields_api')
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

    // async saveDeal(dealData) {
    //     try {
    //       await db('deals')
    //         .insert({
    //           deal_id: dealData.ID,
    //           title: dealData.TITLE,
    //           type: dealData.TYPE_ID,
    //           stage: dealData.STAGE_ID,
    //           currency: dealData.CURRENCY_ID,
    //           opportunity: dealData.OPPORTUNITY,
    //           is_manual_opportunity: dealData.IS_MANUAL_OPPORTUNITY,
    //           tax_value: dealData.TAX_VALUE,
    //           lead_id: dealData.LEAD_ID,
    //           begin_date: dealData.BEGINDATE,
    //           close_date: dealData.CLOSEDATE,
    //           comments: dealData.COMMENTS,
    //           additional_info: dealData.ADDITIONAL_INFO,
    //           is_new: dealData.IS_NEW,
    //           is_recurring: dealData.IS_RECURRING,
    //           is_return_customer: dealData.IS_RETURN_CUSTOMER,
    //           is_repeated_approach: dealData.IS_REPEATED_APPROACH,
    //           source_id: dealData.SOURCE_ID
    //         })
    //         .onConflict('deal_id') 
    //         .merge(); 
    //     } catch (error) {
    //       console.error('Error during fetch operation:', error.message);
    //     }
    // }

    async saveDeal(dealDataMain) {
        try {

            

            if(dealDataMain && dealDataMain.deal_json_data && dealDataMain.deal_json_data.ID){

                const dealData = dealDataMain.deal_json_data;

                await db('deals')
                        .insert({
                          deal_id: dealData.ID,
                          title: dealData.TITLE,
                          type: dealData.TYPE_ID,
                          stage: dealData.STAGE_ID,
                          currency: dealData.CURRENCY_ID,
                          opportunity: dealData.OPPORTUNITY,
                          is_manual_opportunity: dealData.IS_MANUAL_OPPORTUNITY,
                          tax_value: dealData.TAX_VALUE,
                          lead_id: dealData.LEAD_ID,
                          begin_date: dealData.BEGINDATE,
                          close_date: dealData.CLOSEDATE,
                          comments: dealData.COMMENTS,
                          additional_info: dealData.ADDITIONAL_INFO,
                          is_new: dealData.IS_NEW,
                          is_recurring: dealData.IS_RECURRING,
                          is_return_customer: dealData.IS_RETURN_CUSTOMER,
                          is_repeated_approach: dealData.IS_REPEATED_APPROACH,
                          source_id: dealData.SOURCE_ID
                        })
                        .onConflict('deal_id') 
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

}

module.exports = BitrixDealsController;
