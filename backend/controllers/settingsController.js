let baseResponse = require("../Util/baseResponse.js");
var bcrypt = require("bcrypt");
const jwtHelper = require('../Util/jwtHelper')
const SettingModal = require('../models/Setting');

class SettingsController {

	addEditSettings = async (session, body, res) => {
			const response = new baseResponse(res);
			try {

				if(body && body.settings && Object.keys(body.settings).length > 0){

					

					const datareturn = await SettingModal.addEditData(body.settings,session.id).then(async Data => {
												    return Data;
												}).catch((error) => {
													return {error:error.message};
											   });

	                if(datareturn && datareturn.error){
						return response.sendResponse(null, false, datareturn.error, 403);
					}else{
						return response.sendResponse(null, true, "Settings saved successfully!", 200);
					}

				}else{
					return response.sendResponse(null, false, "Settings data not found", 403);
				}
				


				
           

			} catch(err) {
				console.log(err)
				response.sendResponse(null, false, err.message, 500);
			}

			return true;
	}
	getSettings = async (session, res) => {
			const response = new baseResponse(res);
			try {

				let datareturn = await SettingModal.getSettings().then(async data => {
					                                if(data && data.length > 0){
					                                	console.log(data)
					                                }
												    return data;
												}).catch((error) => {
													return {error:error.message};
											   });
			    const result = datareturn.reduce((acc, { setting_key, setting_value }) => {
				  acc[setting_key] = setting_value;
				  return acc;
				}, {});
				let data = {
					"settings": result 
				};

				return response.sendResponse(data, true, "", 200);

           

			} catch(err) {
				console.log(err)
				response.sendResponse(null, false, err.message, 500);
			}

			return true;
	}
	   
}
module.exports = SettingsController