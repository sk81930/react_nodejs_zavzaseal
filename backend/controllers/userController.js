let baseResponse = require("../Util/baseResponse.js");
var bcrypt = require("bcrypt");
const jwtHelper = require('../Util/jwtHelper')
const UserModal = require('../models/User');

const fs = require('fs');
const { writeFile, readFile } = require("fs/promises");
const path = require('path');
const url = require('url');

class UserController {
	   /**
	    * @param {Model} model The default model object
	    * for the controller. Will be required to create
	    * an instance of the controller
	    */
	   constructor() {
	   }

       getUserRole = async (body, res) => {
				const response = new baseResponse(res);
				try {

					let userrole = await UserModal.findAll();

					let data = {
						userrole 
					};

					return response.sendResponse(data, true, "", 200);

				} catch(err) {
					console.log(err)
					response.sendResponse(null, false, err.message, 500);
				}

				return true;
		}
		getUsers = async (body, res) => {
				const response = new baseResponse(res);
				try {

					let {page = 1, pagesize = 10, search = ""} = body;

					// page = parseInt(page);
					// pagesize = parseInt(pagesize);

					// let limit = pagesize;

	                // let offset = 0;
	                // if(page > 0){
	                //  	offset = (page - 1) * limit;
	                // }

					let users = await UserModal.getPaginatedUsers(page,pagesize,search);

					let data = {
						users 
					};

					return response.sendResponse(data, true, "", 200);

				} catch(err) {
					console.log(err)
					response.sendResponse(null, false, err.message, 500);
				}

				return true;
		}
		getCrewMembers = async (body, res) => {
				const response = new baseResponse(res);
				try {

					let crewMembers = await UserModal.getCrewMembers();

					let data = {
						crewMembers 
					};

					return response.sendResponse(data, true, "", 200);

				} catch(err) {
					console.log(err)
					response.sendResponse(null, false, err.message, 500);
				}

				return true;
		}
		getUserById = async (body, res) => {

				const response = new baseResponse(res);
				try {

					const {id} = body;

					const user = await UserModal.findById(id);

			        if (!user) {
			            return response.sendResponse(null, false, "User not found!", 403);
			        }

					let data = {
						user 
					};

					return response.sendResponse(data, true, "", 200);

				} catch(err) {
					console.log(err)
					response.sendResponse(null, false, err.message, 500);
				}

				return true;
		}

		deleteUserById = async (body, res) => {
			
				const response = new baseResponse(res);
				try {

					const {id} = body;

					const user = await UserModal.softDelete(id);

			        if (!user) {
			            return response.sendResponse(null, false, "User not found!", 403);
			        }

					let data = {
						user 
					};

					return response.sendResponse(data, true, "User deleted Successfully", 200);

				} catch(err) {
					console.log(err)
					response.sendResponse(null, false, err.message, 500);
				}

				return true;
		}

		AddEditUser = async (body, fileData, res) => {
				const response = new baseResponse(res);
				try {

					const { id, first_name, last_name, email, address, contact_number, hourly_salary, additional_info, role ,password } = body;

					

					if(id && id > 0){
						this.updateUser(id, body, fileData, res);
						return;

					}


					const error = [];
	
					if (!String(first_name).trim()) {
						error.push("Name is required");
					}
					if (!String(email).trim()) {
						error.push("Email is required");
					}
					
					if (!(/^[\-0-9a-zA-Z\.\+_]+@[\-0-9a-zA-Z\.\+_]+\.[a-zA-Z]{2,}$/).test(String(email))) {
						error.push("Email is not valid.");
					}
					if (!String(address).trim()) {
						error.push("Address is required");
					}
					if (!String(contact_number).trim()) {
						error.push("Contact number is required");
					}
					if (!String(role).trim()) {
						error.push("Role is required");
					}
					

					const emailExist = await UserModal.findByEmail(email);

			        if (emailExist && emailExist.email) {
			         	error.push("Email already exist!");
			        }

			        if(error.length > 0){
			         	return response.sendResponse(null, false, error, 403);
			        }
                    
                    if (!String(password).trim()) {
                        var plainPassword = "Working@2024";
                    }else{
                        var plainPassword = password;
                        
                    }
					
				
					const saltRounds = 10;
  
					// Hash the password with bcrypt
					const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);


					let data = {
						first_name,
						last_name,
						email,
						password:hashedPassword,
						address,
						contact_number,
						hourly_salary,
						additional_info,
						role
					}


					if(fileData && fileData.profile_image && fileData.profile_image.path && fileData.profile_image.path != ""){

			        	let profile_image = await this.uploadAttachment(fileData.profile_image, res);

			        	if(profile_image && profile_image != ""){
			        		data.profile_image = profile_image;
			        	}
			        }


					const userdatareturn = await UserModal.create(
										            data
										         ).then(async userData => {
													    return userData;
													}).catch((error) => {
														return {error:error.message};
												   });

                    if(userdatareturn && userdatareturn.error){
						return response.sendResponse(null, false, userdatareturn.error, 403);
					}else if(userdatareturn && userdatareturn.id){
                        return response.sendResponse(null, true, "Successfully create user!", 200);
					}else{
						return response.sendResponse(null, false, "User not created1", 403);
					}
               

				} catch(err) {
					console.log(err)
					response.sendResponse(null, false, err.message, 500);
				}

				return true;
		}
		updateUser = async (id, body, fileData, res) => {
				const response = new baseResponse(res);
				try {

					const { first_name, last_name, email, password,address, contact_number, hourly_salary, additional_info, role, removeImage } = body;

					const error = [];
	
					if (!String(first_name).trim()) {
						error.push("Name is required");
					}
					if (!String(email).trim()) {
						error.push("Email is required");
					}
					
					if (!(/^[\-0-9a-zA-Z\.\+_]+@[\-0-9a-zA-Z\.\+_]+\.[a-zA-Z]{2,}$/).test(String(email))) {
						error.push("Email is not valid.");
					}
					if (!String(address).trim()) {
						error.push("Address is required");
					}
					if (!String(contact_number).trim()) {
						error.push("Contact number is required");
					}
					if (!String(role).trim()) {
						error.push("Role is required");
					}
					

					const emailExist = await UserModal.findByEmail(email,id);

			        if (emailExist && emailExist.email) {
			         	error.push("Email already exist!");
			        }

			        if(error.length > 0){
			         	return response.sendResponse(null, false, error, 403);
			        }
			        
			        
			       let data = {
						first_name,
						last_name,
						email,
						address,
						contact_number,
						hourly_salary,
						additional_info,
						role
    				}
				
					if (password) {
                        const saltRounds = 10;
                        data.password = await bcrypt.hash(password, saltRounds);
                    }

					if(removeImage && removeImage == "true"){
						data.profile_image = "";
					}


					if(fileData && fileData.profile_image && fileData.profile_image.path && fileData.profile_image.path != ""){

			        	let profile_image = await this.uploadAttachment(fileData.profile_image, res);

			        	if(profile_image && profile_image != ""){
			        		data.profile_image = profile_image;
			        	}
			        }


					let option_fields = data;

					const userdatareturn = await UserModal.update(id,data).then(async userData => {

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

		uploadAttachment = async (attachment, res) => {

			const response = new baseResponse(res);

			try{

				    var attachmentsData = [];

				    let root = path.resolve();

					let filepath = "/public/"+attachment.originalFilename;

	                var data = await readFile(attachment.path).then(async data => {

                	    var newPath = root+filepath;

					    let data2 = await writeFile(newPath,data).then(async fileData => {
										    return fileData;
										}).catch((error) => {
											return {error:error.message};
									    });

						return data2;	

					}).catch((error) => {
						return {error:error.message};
				    });
					if(data && data.error){
						return response.sendResponse(null, false, data.error, 500);
					}
	                   

				return filepath;
			} catch(err) {
				return null;
			}	

		}
		
}

module.exports = UserController