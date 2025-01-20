const baseResponse = require("../Util/baseResponse.js");
const axios = require('axios');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const db = require('../config/connection.js');
const SettingModal = require('../models/Setting');
const CallLogsModel = require('../models/CallLogs');

class CallLogsController {
    // Main method to execute the fetching process
    async getCallLogs(body, res) {

        const response = new baseResponse(res);

        try {
            let {page = 1, pagesize = 10 } = body;

            let callLogs = await CallLogsModel.getData(page,pagesize,body);

            let data = {
                callLogs 
            };

            return response.sendResponse(data, true, "", 200);
        } catch (error) {
            console.error('Error during fetch operation:', error.message);
            response.sendResponse(null, false, error.message, 500);
        }
    }
    async getCallLogsChartData(body, res) {

        const response = new baseResponse(res);

        try {
            let {page = 1, pagesize = 10 } = body;

            let chartData = await CallLogsModel.getChartData(body);

            let data = {
                chartData 
            };

            return response.sendResponse(data, true, "", 200);
        } catch (error) {
            console.error('Error during fetch operation:', error.message);
            response.sendResponse(null, false, error.message, 500);
        }
    }
    async getCallLogsToken(body, res) {

        const response = new baseResponse(res);

        try {
            const credentials = await this.getAPISettings();

            if (!credentials.client_id) {
                return response.sendResponse(null, false, "API credentials not found", 403);
            }

            const accessToken = await this.getAccessToken(credentials);

            if (!accessToken) {
                return response.sendResponse(null, false, "Failed to retrieve access token", 403);
            }
            let data = {
                token: accessToken 
            };

            return response.sendResponse(data, true, "", 200);
        } catch (error) {
            console.error('Error during fetch operation:', error.message);
            response.sendResponse(null, false, error.message, 500);
        }
    }
    async fetch(body, res) {

        let response = null;

        if(res.sendResponse){
            response = res;
        }else{
            response = new baseResponse(res);
        }

        try {
            // Fetch API credentials and log data
            const credentials = await this.getAPISettings();

            if (!credentials.client_id) {
                return response.sendResponse(null, false, "API credentials not found", 403);
            }

            const accessToken = await this.getAccessToken(credentials);

            if (!accessToken) {
                return response.sendResponse(null, false, "Failed to retrieve access token", 403);
            }

            const daysCount = credentials.days_count;
            const now = moment().subtract(daysCount, 'days');
            const startDate = now.toISOString();

            // Delete records older than the required number of days
            await db('ringcentral_call_logs').where('date_time', '<', startDate).del();

            let page = 1;
            let perPage = 1000;
            let end = 1;
            let counter = 0;

            do {
                const params = {
                    dateFrom: startDate,
                    dateTo: moment().toISOString(),
                    page,
                    perPage
                };

                const url = `${credentials.ringcentral_url}/restapi/v1.0/account/~/call-log`;
                const fetchResponse = await this.fetchCallLogs(url, params, accessToken);

                

                if (fetchResponse.records && fetchResponse.records.length > 0) {
                    for (const dealData of fetchResponse.records) {
                        await this.updateOrCreateReport(dealData);
                    }


                    // Check if there is another page of records
                    if (fetchResponse.navigation && fetchResponse.navigation.nextPage) {
                        //console.log(fetchResponse.navigation);
                        page++;
                        end++;
                    } else {
                        break;
                    }
                } else {
                    break; // Exit loop if no records found
                }

                counter++;
                // if (counter % 10 === 0) {
                //     console.log('Sleeping for 30 seconds...');
                //     await this.sleep(30000); // Sleep for 30 seconds
                // }
                console.log('Sleeping for 20 seconds...');
                await this.sleep(20000);

            } while (page <= end);

            console.log('Data retrieval complete');
            return response.sendResponse(null, true, "Data retrieval complete!", 200);
        } catch (error) {
            console.error('Error during fetch operation:', error.message);
            return response.sendResponse(null, false, error.message, 500);
        }
    }

    // Method to fetch call logs from RingCentral API
    async fetchCallLogs(url, params, token, retries = 5) {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = `${url}?${queryString}`;

        try {
            const response = await axios.get(fullUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 429 && retries > 0) {

                // Extract Retry-After header, or fallback to exponential backoff

                const retryAfter = error.response.headers['retry-after']

                    ? parseInt(error.response.headers['retry-after']) * 1000 // Retry-After in seconds

                    : Math.pow(2, 5 - retries) * 1000; // Exponential backoff



                console.log(`Rate limit exceeded. Retrying in ${retryAfter / 1000} seconds...`);

                await this.sleep(retryAfter); // Wait before retrying



                return this.fetchCallLogs(url, params, token, retries - 1); // Retry the request

            }else{
                console.error('Error fetching call logs:', error.message);
                if (error.response) {
                    console.error('Response status:', error.response.status);
                    console.error('Response headers:', error.response.headers);
                }
                return { records: [] };
            }
        }
    }

    // Fetch the latest API credentials from the database
    async getAPISettings() {
        try {
            const data = await SettingModal.getSettings();
            if (data && data.length > 0) {
                const result = data.reduce((acc, { setting_key, setting_value }) => {
                    acc[setting_key] = setting_value;
                    return acc;
                }, {});
                return result;
            }
            return null;
        } catch (error) {
            console.error('Error fetching API settings:', error.message);
            throw new Error('Error fetching API settings');
        }
    }

    // Method to fetch the access token from RingCentral
    async getAccessToken(credentials) {
        const authUrl = `${credentials.ringcentral_url}/restapi/oauth/token`;
        try {
            const response = await axios.post(authUrl, new URLSearchParams({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: credentials.jwt_token
            }).toString(), {
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(`${credentials.client_id}:${credentials.secret_id}`).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            return response.data.access_token || null;
        } catch (error) {
            console.error('Error fetching access token:', error.message);
            throw new Error('Error fetching access token');
        }
    }

    

    // Method to update or create call log in the database using Knex
    async updateOrCreateReport(dealData) {
        try {
            const {
                id,
                type,
                from,
                to,
                startTime,
                direction,
                action,
                result,
                duration,
                recording
            } = dealData;

            let recordingData = null;

            if (recording) {
                recordingData = JSON.stringify(recording);
                const recordingContentUrl = recording.contentUri;
                const recordingId = recording.id;
            }

            // Check if the record already exists in the database
            const existingRecord = await db('ringcentral_call_logs')
                .where('id_api', id)
                .first();

            if (existingRecord) {
                // Update the existing record if it exists
                await db('ringcentral_call_logs')
                    .where('id_api', id)
                    .update({
                        type,
                        from: from.phoneNumber,
                        to: to.phoneNumber,
                        name: from.name,
                        date_time: startTime,
                        recording: direction,
                        action,
                        result,
                        length: duration,
                        recording_data: recordingData
                    });
            } else {
                // Insert the new record if it doesn't exist
                await db('ringcentral_call_logs')
                    .insert({
                        id_api: id,
                        type,
                        from: from.phoneNumber,
                        to: to.phoneNumber,
                        name: from.name,
                        date_time: startTime,
                        recording: direction,
                        action,
                        result,
                        length: duration,
                        recording_data: recordingData
                    });
            }
        } catch (error) {
            console.error('Error updating or creating report:', error);
        }
    }

    // Helper method to save recordings to file
    async saveRecordingToFile(url, recordingId) {
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer'
            });
            const filePath = path.resolve(__dirname, 'recording', `${recordingId}.mp3`);

            fs.writeFileSync(filePath, response.data);
            console.log(`Recording saved to ${filePath}`);
        } catch (error) {
            console.error('Error saving recording:', error);
        }
    }

    // Helper method to sleep for a period
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = CallLogsController;
