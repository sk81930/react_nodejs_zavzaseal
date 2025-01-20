let baseResponse = require("../Util/baseResponse.js");
var bcrypt = require("bcrypt");
const jwtHelper = require('../Util/jwtHelper')
const RolesModal = require('../models/Role');

class RolesController {

	
	getRoles = async (session, body, res) => {
			const response = new baseResponse(res);
			try {

				let {page = 1, size = 10, search = ""} = body;

				let datareturn = await RolesModal.getAllPaginate(page,size, search).then(async data => {
					                                if(data && data.length > 0){
					                                	console.log(data)
					                                }
												    return data;
												}).catch((error) => {
													return {error:error.message};
											   });

                if(datareturn && datareturn.error){
                	return response.sendResponse(null, false, datareturn.error, 403);
                }									

				let data = {
					"roles": datareturn 
				};

				return response.sendResponse(data, true, "", 200);

           

			} catch(err) {
				console.log(err)
				response.sendResponse(null, false, err.message, 500);
			}

			return true;
	}
	   
}
module.exports = RolesController