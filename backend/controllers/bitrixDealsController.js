const baseResponse = require("../Util/baseResponse.js");
const axios = require('axios');
const moment = require('moment');
const db = require('../config/connection.js');
const DealsModel = require('../models/Deals');
class BitrixDealsController {
   
    constructor() {
        this.webhookUrl = 'https://crm.zavzaseal.com/rest/428/l39cposjiucv65cr/';
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

    async getBitrixDeals(body, res) {

        let response = null;

        if(res.sendResponse){
            response = res;
        }else{
            response = new baseResponse(res);
        }

        try {
          let start = 0; 
          let deals = [];

          do {
            const response = await axios.get(this.webhookUrl + 'crm.deal.list', {
              params: { start }
            });

            const data = response.data;

            if (data.error) {
              return response.sendResponse(null, false, data.error + ': ' + data.error_description, 403);
            }

            if (data.result) {
              deals = [...deals, ...data.result];
            }

            start = data.next || false;

          } while (start !== false);


          for (const dealData of deals) {
            await this.saveDeal(dealData);
          }

          console.log('Deals fetched and stored successfully.');
          return response.sendResponse(null, true, "Deals fetched and stored successfully!", 200);
        } catch (error) {
            console.error('Error during fetch operation:', error.message);
            return response.sendResponse(null, false, error.message, 500);
        }
    }

    async saveDeal(dealData) {
        try {
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
        } catch (error) {
          console.error('Error during fetch operation:', error.message);
        }
    }

}

module.exports = BitrixDealsController;
