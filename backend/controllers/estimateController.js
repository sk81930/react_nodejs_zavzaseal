const baseResponse = require("../Util/baseResponse.js");
const jwtHelper = require('../Util/jwtHelper.js');
const Estimate = require('../models/Estimate.js'); 
const settingModal = require('../models/Setting.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class EstimateController {
    /**
     * Constructor to initialize any defaults or dependencies
     */
    constructor() {}

    getEstimatesData = async (session, body, res) => {
        const response = new baseResponse(res);
        try {

            const estimates = await Estimate.getEstimates(session.id, body);

            return response.sendResponse({ estimates }, true, "Estimates fetched successfully", 200);
        } catch (error) {
            return response.sendResponse(null, false, "Failed to fetch estimates: " + error.message, 500);
        }
    }

    getEstimateById = async (session, params, res) => {     
        const response = new baseResponse(res);
        try {
            const estimate = await Estimate.getEstimateById(params.id);

            if (!estimate) {
                return response.sendResponse(null, false, "Estimate not found", 404);
            }

            return response.sendResponse({ estimate }, true, "Estimate fetched successfully", 200);
        } catch (error) {
            return response.sendResponse(null, false, "Failed to fetch estimate: " + error.message, 500);
        }
    }

    /**
     * Method to create a task
     * @param {Object} req - The request object containing task data
     * @param {Object} res - The response object
     */
    createEstimate = async (session, req, res) => {
        const response = new baseResponse(res);
        try {

            //console.log("Creating template with data:", session, body);

            // const {  deal_id, title, start: start_datetime, end: end_datetime,  color, crewMembers: crew_members, products } = req.body;

            // if (!title || !start_datetime || !end_datetime) {
            //     return response.sendResponse(null, false, "Title, start and end dates are required", 400);
            // }
            const estimateId = await Estimate.createEstimate(session.id, req, res);
            return response.sendResponse({ estimateId }, true, "Estimate created successfully", 201);
        } catch (error) {
            return response.sendResponse(null, false, "Failed to create estimate: " + error.message, 500);
        }
    }

    updateEstimate = async (session, params, req, res) => {
        const response = new baseResponse(res);
        try {

            //console.log("Creating template with data:", session, body);

            // const {  deal_id, title, start: start_datetime, end: end_datetime,  color, crewMembers: crew_members, products } = req.body;

            // if (!title || !start_datetime || !end_datetime) {
            //     return response.sendResponse(null, false, "Title, start and end dates are required", 400);
            // }

            const estimate = await Estimate.updateEstimate(params.id, session.id, req, res);

            return response.sendResponse({ estimate }, true, "Estimate updated successfully", 200);
        } catch (error) {
            return response.sendResponse(null, false, "Failed to update estimate: " + error.message, 500);
        }
    }
    createTemplate = async (session, body, res) => {
        const response = new baseResponse(res);
        try {

            //console.log("Creating template with data:", session, body);

            // const {  deal_id, title, start: start_datetime, end: end_datetime,  color, crewMembers: crew_members, products } = req.body;

            // if (!title || !start_datetime || !end_datetime) {
            //     return response.sendResponse(null, false, "Title, start and end dates are required", 400);
            // }

            const templateId = await Estimate.createTemplate({
                user_id : session.id,
                name: body.template_name,
                content: body.template_content
            });

            return response.sendResponse({ templateId }, true, "Task created successfully", 201);
        } catch (error) {
            return response.sendResponse(null, false, "Failed to create task: " + error.message, 500);
        }
    }
    getTemplates = async (session, query, res) => {
        const response = new baseResponse(res);
        try {

            //console.log("Creating template with data:", session, body);

            // const {  deal_id, title, start: start_datetime, end: end_datetime,  color, crewMembers: crew_members, products } = req.body;

            // if (!title || !start_datetime || !end_datetime) {
            //     return response.sendResponse(null, false, "Title, start and end dates are required", 400);
            // }

            const templates = await Estimate.getTemplates(session.id, query.search);

            return response.sendResponse({ templates }, true, "Templates fetched successfully", 200);
        } catch (error) {
            return response.sendResponse(null, false, "Failed to create task: " + error.message, 500);
        }
    }
    getLeadsBySearch = async (session, body, res) => {
        const response = new baseResponse(res);
        try {
           const leads = await Estimate.getLeadsBySearch(body.search);

            return response.sendResponse({ leads }, true, "Leads fetched successfully", 200);
        } catch (error) {
            return response.sendResponse(null, false, "Failed to create task: " + error.message, 500);
        }
    }
    getTemplateById = async (session, body, res) => {
        const response = new baseResponse(res);
        try {

            //console.log("Creating template with data:", session, body);

            const template = await Estimate.getTemplateById(body.id);

            if (!template) {
                return response.sendResponse(null, false, "Template not found", 404);
            }

            return response.sendResponse({ template }, true, "Template fetched successfully", 200);
        } catch (error) {
            return response.sendResponse(null, false, "Failed to fetch template: " + error.message, 500);
        }
    }
    
    updateTemplate = async (session, params, body, res) => {
        const response = new baseResponse(res);
        try {

            //console.log("Creating template with data:", session, body);

            const template = await Estimate.updateTemplate(params.id, body);

            return response.sendResponse({ template }, true, "Template updated successfully", 200);
        } catch (error) {
            return response.sendResponse(null, false, "Failed to fetch template: " + error.message, 500);
        }
    }
    deleteTemplate = async (session, params, body, res) => {
        const response = new baseResponse(res);
        try {

            //console.log("Creating template with data:", session, body);

            const template = await Estimate.deleteTemplate(params.id, body);

            return response.sendResponse({ template }, true, "Template deleted successfully", 200);
        } catch (error) {
            return response.sendResponse(null, false, "Failed to fetch template: " + error.message, 500);
        }
    }
    deleteEstimate = async (session, params, body, res) => {
        const response = new baseResponse(res);
        try {

            //console.log("Creating template with data:", session, body);

            const estimate = await Estimate.deleteEstimate(params.id, body);

            return response.sendResponse({ estimate }, true, "Estimate deleted successfully", 200);
        } catch (error) {
            return response.sendResponse(null, false, "Failed to fetch estimate: " + error.message, 500);
        }
    }
    downloadPDF = async (session, params, res) => {
        const response = new baseResponse(res);
        try {

            //console.log("Creating template with data:", session, body);

            const estimatePdf = await Estimate.downloadPDF(params.id, res);

            if(estimatePdf && estimatePdf.outputPath){
                return response.sendResponse(estimatePdf, true, "PDF downloaded successfully", 200);
                // return res.download(estimatePdf.outputPath, `estimate_${params.id}.pdf`, (err) => {
                //     if(err){
                //         return response.sendResponse(null, false, "Failed to download PDF", 500);
                //     }
                // });
            }else{
              return response.sendResponse(null, false, "Failed to download PDF", 500);
            }
        }catch(error){
            return response.sendResponse(null, false, "Failed to fetch estimate: " + error.message, 500);
        }
    }
    sendToXero = async (session, params,  res) => {
        const response = new baseResponse(res);

        const xero_client_id = await settingModal.getSettingByKey("xero_client_id");
        const xero_client_secret = await settingModal.getSettingByKey("xero_client_secret");
        const xero_redirect_uri = await settingModal.getSettingByKey("xero_redirect_uri");

        if(!xero_client_id || !xero_client_secret || !xero_redirect_uri){
            return response.sendResponse({}, false, "Xero settings not found", 400);
        }

       

        const estimationId = params.id;
        const tokens = await this.loadTokens(xero_client_id);

        const scopes = [
            'openid',
            'profile',
            'email',
            'offline_access',
            'accounting.transactions',
            'accounting.attachments',
            'accounting.settings',
            'files'
          ].join(' ');
        

        if (!tokens || !tokens.refresh_token) {
            const authUrl = `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=${xero_client_id}&redirect_uri=${encodeURIComponent(xero_redirect_uri)}&scope=${encodeURIComponent(scopes)}&state=${estimationId}`;
            return response.sendResponse({ authUrl }, true, "redirect to Xero", 200);
        }

        let newTokens = null;

        try {
            const tokenRes = await axios.post('https://identity.xero.com/connect/token',
                new URLSearchParams({
                  grant_type: 'refresh_token',
                  refresh_token: tokens.refresh_token
                }),
                {
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                  auth: {
                    username: xero_client_id,
                    password: xero_client_secret
                  }
                }
            );
    
            
    
            if(tokenRes && tokenRes.data && tokenRes.data.refresh_token){
                newTokens = tokenRes.data;
            }else{
    
                const authUrl = `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=${xero_client_id}&redirect_uri=${encodeURIComponent(xero_redirect_uri)}&scope=${encodeURIComponent(scopes)}&state=${estimationId}`;
                return response.sendResponse({ authUrl }, true, "redirect to Xero", 200);
    
            }
            
        } catch (error) {
            const authUrl = `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=${xero_client_id}&redirect_uri=${encodeURIComponent(xero_redirect_uri)}&scope=${encodeURIComponent(scopes)}&state=${estimationId}`;
            return response.sendResponse({ authUrl }, true, "redirect to Xero", 200);
        }


        if(!newTokens){
            return response.sendResponse({}, false, "Refresh token not found", 400);
        }
        
        
        

       

        try {
        
            // Save new tokens (refresh token rotates!)
            const updated = { ...newTokens, tenantId: tokens.tenantId };

            await this.saveTokens(updated, xero_client_id);

            const estimatePdf = await Estimate.downloadPDF(estimationId, res);

            let pdf_path = null;
            if(estimatePdf && estimatePdf.outputPath){
                pdf_path = estimatePdf.outputPath;
            }


            const quote = await Estimate.createXeroQuote(updated, estimationId, pdf_path);

            if(quote && quote.error){
              return response.sendResponse({ quote }, false, quote.error, 400);
            }else if(quote && quote.quote){
              return response.sendResponse({ quote: quote.quote }, true, "Quote send to Xero successfully", 200);
            }else{
              return response.sendResponse({ quote }, false, "Quote not send to Xero", 400);
            }
            
        } catch (err) {
            console.error('❌ Refresh failed:', err.response?.data || err.message);
            return response.sendResponse({}, false, err.response?.data || err.message, 400);
            // Token may be expired — fallback to login
            // const authUrl = `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=${process.env.XERO_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.XERO_REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}&state=${estimationId}`;
            // return response.sendResponse({ authUrl }, true, "redirect to Xero", 200);
        }
    }

    loadTokens = async (client_id) => {
        const projectRoot = process.cwd();
        const TOKENS_DIR = path.join(projectRoot, 'tokens');
        const filename = client_id 
            ? path.join(TOKENS_DIR, `${client_id}.json`) 
            : path.join(TOKENS_DIR, 'tokens.json');
    
        if (!fs.existsSync(filename)) return null;
    
        try {
            return JSON.parse(fs.readFileSync(filename, 'utf8'));
        } catch (err) {
            console.error('Failed to read token file:', err);
            return null;
        }
    };

    saveTokens = async (data, client_id) => {
        const projectRoot = process.cwd();
        const TOKENS_DIR = path.join(projectRoot, 'tokens');
        const filename = client_id 
            ? path.join(TOKENS_DIR, `${client_id}.json`) 
            : path.join(TOKENS_DIR, 'tokens.json');
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    }

    xero_callback = async (req, res) => {
        const response = new baseResponse(res);
        const { code, state: estimationId } = req.query;

        const xero_client_id = await settingModal.getSettingByKey("xero_client_id");
        const xero_client_secret = await settingModal.getSettingByKey("xero_client_secret");
        const xero_redirect_uri = await settingModal.getSettingByKey("xero_redirect_uri");

        if(!xero_client_id || !xero_client_secret || !xero_redirect_uri){
            return response.sendResponse({}, false, "Xero settings not found", 400);
        }

        if (!code) return response.sendResponse(null, false, "Missing authorization code", 400);

        try {
            // Exchange code for tokens
            const tokenRes = await axios.post('https://identity.xero.com/connect/token',
              new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: xero_redirect_uri
              }),
              {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                auth: { username: xero_client_id, password: xero_client_secret }
              }
            );
        
            const tokens = tokenRes.data;
        
            // Get tenant ID
            const tenantRes = await axios.get('https://api.xero.com/connections', {
              headers: { Authorization: `Bearer ${tokens.access_token}` }
            });
        
            const tenantId = tenantRes.data[0]?.tenantId;
            if (!tenantId) throw new Error('No Xero tenant found');

            const updated = { ...tokens, tenantId: tenantId };
        
            // Save new tokens
            await this.saveTokens(updated, xero_client_id);

            const estimatePdf = await Estimate.downloadPDF(estimationId, res);

            let pdf_path = null;
            if(estimatePdf && estimatePdf.outputPath){
                pdf_path = estimatePdf.outputPath;
            }


            const quote = await Estimate.createXeroQuote(updated, estimationId, pdf_path, true);

            if(quote && quote.error){
                return res.redirect(`${process.env.FRONTEND_URL}/estimates?error=${quote.error}`);
            }else if(quote && quote.quote){
              return res.redirect(`${process.env.FRONTEND_URL}/estimates?success=Quote send to Xero successfully`);
            }else{
              return res.redirect(`${process.env.FRONTEND_URL}/estimates?error=Quote not send to Xero`);
            }

           // return response.sendResponse({ quote }, true, "Quote created successfully", 200);
        
        } catch (err) {
            console.error('❌ Callback error:', err.response?.data || err.message);
            return res.redirect(`${process.env.FRONTEND_URL}/estimates?error=Callback error`);
        }
        
    }

    viewPDF = async (session, params, res) => {
        const response = new baseResponse(res);
        try {
            const pdf = await Estimate.viewPDF(params.id);
            return response.sendResponse({ pdf }, true, "PDF fetched successfully", 200);
        }
        catch (error) {
            return response.sendResponse(null, false, "Failed to fetch PDF: " + error.message, 500);
        }
    }

    sendEstimateEmail = async (session, body, res) => {
        const response = new baseResponse(res);
        try {
            const email = await Estimate.sendEstimateEmail(body);

            if(email && email.success){
                return response.sendResponse({ email }, true, "Email sent successfully", 200);
            }else{
                return response.sendResponse(null, false, "Failed to send email: " + email.error, 500);
            }

        }catch (error) {
            return response.sendResponse(null, false, "Failed to send email: " + error.message, 500);
        }
    }


}

module.exports = EstimateController;
