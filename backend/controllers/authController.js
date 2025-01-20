let baseResponse = require("../Util/baseResponse.js");
const jwtHelper = require('../Util/jwtHelper')
const User = require('../models/User');
var bcrypt = require("bcrypt");

let userController = new (require('./userController.js'))();

class AuthController {
   /**
    * @param {Model} model The default model object
    * for the controller. Will be required to create
    * an instance of the controller
    */
    constructor() {

    }

    login = async (body, res) => {
				const response = new baseResponse(res);
				try {

					const { email, password } = body;

					const user = await User.findByEmail(email);


					if (!user) {
					   return response.sendResponse(null, false, "Email not found!", 403);
					}
					const passwordValid = await User.validPassword(user,password);

					if (!passwordValid) {
						  return response.sendResponse(null, false, "Incorrect email and password combination!", 403);
					}

					let tokenObj = { id: user.id, email: user.email };
					let token = await jwtHelper.getToken(tokenObj);

					let data = {
						  user  : user,
						  token : token,
					}

		         return response.sendResponse(data, true, "Successfully login!", 200);

				} catch(err) {
					console.log(err)
					response.sendResponse(null, false, err.message, 500);
				}

				return true;
		}
		updateProfile = async (user, req, res) => {
				const response = new baseResponse(res);
				try {

						let data = {
							first_name : req.body.first_name,
							last_name : (req.body.last_name)??'',
							address : (req.body.address)??'',
							contact_number : (req.body.contact_number)??'',
							additional_info : (req.body.additional_info)??'',
						};

						const fileData = req.files;

						const password = req.body.password.trim();


						if(password != ""){
							if(password != req.body.confirm_password){
								return response.sendResponse(null, false, "Password not match!", 403);
							}
							const saltRounds = 10;
							const hashedPassword = await bcrypt.hash(password, saltRounds);
							data.password = hashedPassword;
						}
						if(req.body.removeImage && req.body.removeImage == "true"){
							data.profile_image = "";
						}


						if(fileData && fileData.profile_image && fileData.profile_image.path && fileData.profile_image.path != ""){

		        	let profile_image = await userController.uploadAttachment(fileData.profile_image, res);

		        	if(profile_image && profile_image != ""){
		        		data.profile_image = profile_image;
		        	}
		        }


						const userdatareturn = await User.update(user.id,data).then(async userData => {
												  if (userData) {
												     return userData;
												  }else{
												  	return {error:"User not found!"};
												  }
											}).catch((error) => {
												return {error:error.message};

										  });
						if(userdatareturn && userdatareturn.error){
							return response.sendResponse(null, false, userdatareturn.error, 403);
						}


		        return response.sendResponse(null, true, "Successfully update user!", 200);



				} catch(err) {
					console.log(err)
					response.sendResponse(null, false, err.message, 500);
				}

				return true;
		}

		user = async (body, res) => {
				const response = new baseResponse(res);
				try {

						const { email, password } = body;

		        const user = await UserModal.findOne({
		            where: {email}
		        });

		        if (!user) {
		            return response.sendResponse(null, false, "Email not found!", 403);
		        }
		        const passwordValid = await user.validPassword(password);

		        if (!passwordValid) {
		        	  return response.sendResponse(null, false, "Incorrect email and password combination!", 403);
		        }


		        let tokenObj = { id: user.id, email: user.email };
						let token = await jwtHelper.getToken(tokenObj);


		        let data = {
		        	  user  : user,
		        	  token : token,
		        }

		        return response.sendResponse(data, true, "Successfully login!", 200);

				} catch(err) {
					console.log(err)
					response.sendResponse(null, false, err.message, 500);
				}

				return true;
		}
}

module.exports = AuthController