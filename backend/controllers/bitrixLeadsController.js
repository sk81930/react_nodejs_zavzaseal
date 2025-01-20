const baseResponse = require("../Util/baseResponse.js");
const axios = require('axios');
const moment = require('moment');
const db = require('../config/connection.js');
class BitrixLeadsController {
   
    constructor() {
        this.webhookUrl = 'https://crm.zavzaseal.com/rest/428/mpqgc4acszqy2n26/';
    }

    async getBitrixLeads(body, res) {

        let response = null;

        if(res.sendResponse){
            response = res;
        }else{
            response = new baseResponse(res);
        }
        try {
          let start = 0; 
          let leads = [];

          do {
            const response = await axios.get(this.webhookUrl + 'crm.lead.list', {
              params: { start }
            });

            const data = response.data;



            if (data.error) {
                return response.sendResponse(null, false, data.error + ': ' + data.error_description, 403);
            }

            if (data.result) {
              leads = [...leads, ...data.result];
            }

            start = data.next || false;

          } while (start !== false);


          for (const leadData of leads) {
            await this.saveLead(leadData);
          }

          console.log('Leads fetched and stored successfully.');
          return response.sendResponse(null, true, "Leads fetched and stored successfully!", 200);
        } catch (error) {
            console.error('Error during fetch operation:', error.message);
            return response.sendResponse(null, false, error.message, 500);
        }
    }

    async saveLead(leadData) {
        try {
          await db('leads')
            .insert({
              bitrix_id: leadData.ID,
              title: leadData.TITLE,
              status: leadData.STATUS_ID,
              leads_created_at: leadData.DATE_CREATE,
            })
            .onConflict('bitrix_id')
            .merge(); 
        } catch (error) {
          console.error('Error during fetch operation:', error.message);
        }
    }

}

module.exports = BitrixLeadsController;
