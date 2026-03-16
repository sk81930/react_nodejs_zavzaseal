const db = require('../config/connection.js');
const MailHelperSingleton = require('../helpers/MailHelper');

const moment = require('moment');
const path = require('path');
const fs = require('fs');
const { writeFile, readFile } = require("fs/promises");
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const PDFLib = require('pdf-lib');
const { XeroClient } = require('xero-node');
const axios = require('axios');
const e = require('express');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class Estimate {
  constructor(data = null) {
  }

  static async createEstimate(userId, req, res) {
    try {
       const {
        lead,
        leadId,
        issueDate,
        expiryDate,
        title,
        summary,
        disclaimer,
        warranty,
        warrantyYear,
        totals,
        exhibits,
        items,
        terms
      } = req.body;

      const quoteNumber = await this.generateQuoteNumber();

  

      const files = req.files || {};
      

      const addressImageFile = files.addressImage;
      const addressImage = addressImageFile ? await this.uploadAttachment(addressImageFile) : null;

      // Insert the estimate
      const [estimate] = await db('estimations').insert({
        user_id: userId,
        lead,
        lead_id: leadId,
        issue_date:  moment().format('YYYY-MM-DD'),
        title,
        summary,
        disclaimer,
        warranty,
        warranty_year: warrantyYear,
        totals: totals ? totals : null,
        address_image: addressImage,
        terms: terms ? terms : null
      }).returning('id');

      const estimateId = estimate.id;

      const itemList = JSON.parse(items);

      const toNullableDecimal = (value) => {
        if (value === '' || value === null || value === undefined) return null;
        return value;
      };

      for (let i = 0; i < itemList.length; i++) {
        const item = itemList[i];

        const galleryImages = [];

        for (let j = 0; j < 10; j++) {
          const fieldKey = `galleryImages_${i}_${j}`;
          if (files[fieldKey]) {
            const uploaded = await this.uploadAttachment(files[fieldKey]);
            if (uploaded) galleryImages.push(uploaded);
          }
        }

        await db('estimation_items').insert({
          estimation_id: estimateId,
          item: item.item,
          description: item.description,
          qty: item.qty,
          price: toNullableDecimal(item.price),
          amount: toNullableDecimal(item.amount),
          discount: toNullableDecimal(item.discount),
          account: item.account,
          taxRate: item.taxRate,
          gallery_images: galleryImages.length > 0 ? JSON.stringify(galleryImages) : null
        });
      }

      let exhibitList = [];

      if(exhibits){
        exhibitList = JSON.parse(exhibits);
      }



      for (let i = 0; i < exhibitList.length; i++) {
        const exhibit = exhibitList[i];
        const exhibitName = (exhibit.name || '').trim();

        const textareas = exhibit.textareas;

        const textareaList = [];

        for (let jTextarea = 0; jTextarea < textareas.length; jTextarea++) {
          const textarea = textareas[jTextarea];
          const content = textarea.content;

          if(content !== ""){
            textareaList.push({
                content: content,
                title: textarea.title ? textarea.title : "Text Area " + (jTextarea + 1),
                id: textarea.id
            });
          }
        }

        const exhibitImages = [];

        for (let j = 0; j < 10; j++) {
          const fieldKey = `exhibitImages_${i}_${j}`;
          if (files[fieldKey]) {
            const uploaded = await this.uploadAttachment(files[fieldKey]);

            
            if (uploaded) exhibitImages.push(uploaded);
          }
        }
        

        let existingImages = [];
        if (exhibit.images && Array.isArray(exhibit.images) && exhibit.images.length > 0) {
           for (let k = 0; k < exhibit.images.length; k++) {
            const img = exhibit.images[k];
            if (img && img.originalPath) {
              existingImages.push({
                filename: img.name || '',
                path: img.originalPath || img.path || '',
                type: img.type || '',
                size: img.size || 0
              });
            }
          }
          if (existingImages.length > 0) {
            exhibitImages.unshift(...existingImages);
          }
        }




        await db('exhibit_items').insert({
          estimation_id: estimateId,
          name: exhibitName !== '' ? exhibitName : null,
          textareas: textareaList.length > 0 ? JSON.stringify(textareaList) : null,
          gallery_images: exhibitImages.length > 0 ? JSON.stringify(exhibitImages) : null
        });
      }

      return estimateId;

    } catch (error) {
      console.error("Error creating estimate: " + error.message);
      throw new Error("Error creating estimate: " + error.message);
    }
  }
  static async updateEstimate(estimateId, userId, req, res) {
    try {
       const {
        lead,
        leadId,
        issueDate,
        expiryDate,
        title,
        summary,
        disclaimer,
        warranty,
        warrantyYear,
        totals,
        items,
        exhibits,
        status,
        terms
      } = req.body;


      const itemList2 = JSON.parse(items);
      

      const files = req.files || {};

      // console.log("Files received for update:", files);
      // console.log("Files received for update:", JSON.stringify(itemList2, null, 2));

      // return;

 
      

      const addressImageFile = files.addressImage;
      const addressImage = addressImageFile ? await this.uploadAttachment(addressImageFile) : null;
 
      let updateData = {
          lead,
          lead_id: leadId,
          title,
          summary,
          disclaimer,
          warranty,
          warranty_year: warrantyYear,
          terms: terms ? terms : null,
          totals: totals ? totals : null
      }

      let hasAddressImage = false;

      if(req.body?.addressImage){
        hasAddressImage = true;
      }

      if(addressImage){
        updateData.address_image = addressImage;
      }else if(!hasAddressImage){
        updateData.address_image = null;
      }

     



      // Update the estimate
      const [estimate] = await db('estimations')
        .where({ id: estimateId })
        .update(updateData)
        .returning('*');

      

      if (!estimate) {
        throw new Error("Estimate not found or not updated");
      }

      // Delete existing items
      await db('estimation_items')
        .where({ estimation_id: estimateId })
        .del();

      const itemList = JSON.parse(items);

      const toNullableDecimal = (value) => {
        if (value === '' || value === null || value === undefined) return null;
        return value;
      };

      for (let i = 0; i < itemList.length; i++) {
        const item = itemList[i];

        const galleryImages = [];

        for (let j = 0; j < 10; j++) {
          const fieldKey = `galleryImages_${i}_${j}`;
          if (files[fieldKey]) {
            const uploaded = await this.uploadAttachment(files[fieldKey]);
            if (uploaded) galleryImages.push(uploaded);
          }
        }

        let existingImages = [];
        if (item.galleryImages && Array.isArray(item.galleryImages) && item.galleryImages.length > 0) {
           for (let k = 0; k < item.galleryImages.length; k++) {
            const img = item.galleryImages[k];
            if (img && img.originalPath) {
              existingImages.push({
                filename: img.name || '',
                path: img.originalPath || img.path || '',
                type: img.type || '',
                size: img.size || 0
              });
            }
          }
          if (existingImages.length > 0) {
            galleryImages.unshift(...existingImages);
          }
        }

        //console.log("Final gallery images for item:", item, galleryImages);




        await db('estimation_items').insert({
          estimation_id: estimateId,
          item: item.item,
          description: item.description,
          qty: item.qty,
          price: toNullableDecimal(item.price),
          amount: toNullableDecimal(item.amount),
          discount: toNullableDecimal(item.discount),
          account: item.account,
          taxRate: item.taxRate,
          gallery_images: galleryImages.length > 0 ? JSON.stringify(galleryImages) : null
        });
      }

      // Delete existing items
      await db('exhibit_items')
        .where({ estimation_id: estimateId })
        .del();

      let exhibitList = [];

      if(exhibits){
        exhibitList = JSON.parse(exhibits);
      }  


      for (let i = 0; i < exhibitList.length; i++) {
        const exhibit = exhibitList[i];
        const exhibitName = (exhibit.name || '').trim();

        const textareas = exhibit.textareas;

        const textareaList = [];

        for (let jTextarea = 0; jTextarea < textareas.length; jTextarea++) {
          const textarea = textareas[jTextarea];
          const content = textarea.content;

          if(content !== ""){
            textareaList.push({
                content: content,
                title: textarea.title ? textarea.title : "Text Area " + (jTextarea + 1),
                id: textarea.id
            });
          }
        }

        const exhibitImages = [];

        for (let j = 0; j < 10; j++) {
          const fieldKey = `exhibitImages_${i}_${j}`;
          if (files[fieldKey]) {
            const uploaded = await this.uploadAttachment(files[fieldKey]);

            
            if (uploaded) exhibitImages.push(uploaded);
          }
        }
        

        let existingImages = [];
        if (exhibit.images && Array.isArray(exhibit.images) && exhibit.images.length > 0) {
           for (let k = 0; k < exhibit.images.length; k++) {
            const img = exhibit.images[k];
            if (img && img.originalPath) {
              existingImages.push({
                filename: img.name || '',
                path: img.originalPath || img.path || '',
                type: img.type || '',
                size: img.size || 0
              });
            }
          }
          if (existingImages.length > 0) {
            exhibitImages.unshift(...existingImages);
          }
        }




        await db('exhibit_items').insert({
          estimation_id: estimateId,
          name: exhibitName !== '' ? exhibitName : null,
          textareas: textareaList.length > 0 ? JSON.stringify(textareaList) : null,
          gallery_images: exhibitImages.length > 0 ? JSON.stringify(exhibitImages) : null
        });
      }

      return estimate;

    } catch (error) {
      throw new Error("Error updating estimate: " + error.message);
    }
  }

  // Static method to get estimates with pagination, search, and filters

  static async getEstimates(userId, body) {
    try {
      const { page = 1, size = 10, search = "", status = "", customer = "all", sortField = "id", sortOrder = "asc" } = body;
      const limit = parseInt(size, 10);
      const offset = (parseInt(page, 10) - 1) * limit;

      let baseQuery = db("estimations").whereNull('deleted_at');

      // Search filter
      if (search && search.trim() !== "") {
        baseQuery = baseQuery.where(function () {
          this.where("quote_number", "ILIKE", `%${search}%`)
            .orWhere("title", "ILIKE", `%${search}%`)
            .orWhere("summary", "ILIKE", `%${search}%`)
            .orWhere("lead", "ILIKE", `%${search}%`)
            .orWhere("lead_id", "ILIKE", `%${search}%`);
        });
      }

      // Status filter
      if (status && status.trim() !== "") {
        baseQuery = baseQuery.where("status", status);
      }

      // Customer filter
      if (customer && customer !== "all") {
        baseQuery = baseQuery.where("lead_id", customer);
      }

      // Count total for pagination
      const countQuery = await baseQuery.clone().count("id as total").first();
      const totalCount = parseInt(countQuery.total, 10) || 0;
      const totalPages = Math.ceil(totalCount / limit);

      // Sorting
      let sortBy = "id";
      let sortDirection = "desc";

      if (sortField && sortField !== "") {
        sortBy = sortField;
      }

      if (sortOrder && (sortOrder.toLowerCase() === "desc" || sortOrder.toLowerCase() === "asc")) {
        sortDirection = sortOrder.toLowerCase();
      }

      baseQuery = baseQuery.orderBy(sortBy, sortDirection);

      // Pagination
      const estimates = await baseQuery.limit(limit).offset(offset);

     // console.log("Estimates:", baseQuery);

      const dataPromises = estimates.map(async (estimate) => {

        const lead_data = await db("leads")
              .select("*")
              .where({
                lead_id: estimate.lead_id,
              })
              .first();
        if (lead_data) {
          estimate.lead_data = lead_data;
        }else{
          estimate.lead_data = null;
        }
        return estimate;
      });

      await Promise.all(dataPromises);

      return {
        success: true,
        data: estimates,
        pagination: {
          totalCount,
          totalPages,
          currentPage: page,
          pageSize: limit,
        }
      };

    } catch (error) {
      console.error("Failed to fetch estimates:", error.message);
      return {
        success: false,
        message: "Error fetching estimates",
        error: error.message,
      };
    }
  }

  // Static method to get estimate by ID
  static async getEstimateById(estimateId) {
    try {
      const estimate = await db('estimations')
        .where('id', estimateId)
        .first();

      if (!estimate) {
        return null;
      }

      const lead_data = await db("leads")
              .select("*")
              .where({
                lead_id: estimate.lead_id,
              })
              .first();
      if (lead_data) {
        estimate.lead_data = lead_data;
      }else{
        lead.lead_data = null;
      }

      // Fetch related items
      const items = await db('estimation_items')
        .where('estimation_id', estimateId)
        .select('*');

      // Optional: parse gallery_images if stored as JSON
      const parsedItems = items.map(item => ({
        ...item,
        gallery_images: typeof item.gallery_images === 'string'
          ? JSON.parse(item.gallery_images)
          : item.gallery_images
      }));

      const exhibitItems = await db('exhibit_items')
        .where('estimation_id', estimateId)
        .select('*');

      // Optional: parse gallery_images if stored as JSON
      const parsedExhibitItems = exhibitItems.map(item => ({
        ...item,
        gallery_images: typeof item.gallery_images === 'string'
          ? JSON.parse(item.gallery_images)
          : item.gallery_images
      }));

      return {
        ...estimate,
        items: parsedItems,
        exhibitItems: parsedExhibitItems
      };

    } catch (error) {
      console.error("Error fetching estimate by ID:", error.message);
      return null;
    }
  }


  // Static method to get all tasks along with associated crew members and products

  static async getTemplates(userId, search) {
      try {
      // Query to fetch all tasks with their related crew members and products
      let query = db('estimate_template')
        .orderBy('estimate_template.created_at', 'desc');
      
      if (search && search.trim() !== '') {
        query = query.where('template_name', 'ilike', `%${search}%`)
                    .orWhere('template_content', 'ilike', `%${search}%`);
      }
      
      const templates = await query;
      return templates;
    } catch (error) {
      throw new Error("Error fetching tasks with relations: " + error.message);
    }
  }


  // Static method to get template by ID along with associated crew members and products
  static async getTemplateById(templateId) {
    try {
        const templateData = await db('estimate_template')
          .where('estimate_template.id', templateId)
          .first();

        if (templateData) {
            return templateData;
        } else {
          return null; // Task not found
        }
    } catch (error) {
      console.error('Error fetching task data:', error);
      return null;
    }    
  }
  static async getLeadsBySearch(search) {
    try {
        const trimmedSearch = (search || '').trim();
        const leads = await db('leads')
          .whereRaw(`(TRIM(COALESCE("NAME",'')) || ' ' || TRIM(COALESCE("LAST_NAME",''))) ILIKE ?`, [`%${trimmedSearch}%`])
          .orWhereRaw(`TRIM("NAME") ILIKE ?`, [`%${trimmedSearch}%`])
          .orWhereRaw(`TRIM("LAST_NAME") ILIKE ?`, [`%${trimmedSearch}%`])
          .orWhere('TITLE', 'ilike', `%${trimmedSearch}%`)
          .orWhere('phone', 'ilike', `%${trimmedSearch}%`)
          .orWhereRaw(`lead_json_data->>'ADDRESS' ILIKE ?`, [`%${trimmedSearch}%`])
          .orWhereRaw(`lead_json_data->>'ADDRESS_2' ILIKE ?`, [`%${trimmedSearch}%`])
          .orWhereRaw(`lead_json_data->>'COMPANY_TITLE' ILIKE ?`, [`%${trimmedSearch}%`])
          .orWhereRaw(`lead_json_data->>'ADDRESS_COUNTRY' ILIKE ?`, [`%${trimmedSearch}%`])
          .orWhereRaw(`lead_json_data::text ILIKE ?`, [`%${trimmedSearch}%`])
          .limit(20)
          .select();
        //console.log(leads);
        return leads;
    } catch (error) {
      console.error('Error fetching leads:', error);
      return [];
    }
  }

  // Static method to create a new task
  static async createTemplate({ user_id, name, content }) {
    try {
      // Insert the task
      const [template] = await db('estimate_template').insert({
        user_id,
        template_name: name,
        template_content: content
      }).returning('id');
      return template.id;
    } catch (error) {
      throw new Error("Error creating task: " + error.message);
    }
  }
 
  static async updateTemplate(templateId, body) {
    try {

      const updatedTemplate = await db('estimate_template')
        .where({ id: templateId })
        .update({
          template_name: body.template_name,
          template_content: body.template_content
        })
        .returning('*');

     
      return updatedTemplate;

    } catch (error) {
      throw new Error("Error editing task: " + error.message);
    }
  }
  static async deleteTemplate(templateId, body) {
    try {

      const deletedTemplate = await db('estimate_template')
        .where({ id: templateId })
        .del();

      return deletedTemplate;

    } catch (error) {
      throw new Error("Error deleting task: " + error.message);
    }
  }

  static async deleteEstimate(estimateId, userId) {
    try {

      const deletedEstimate = await db('estimations')
        .where({ id: estimateId})
        .update({ deleted_at: db.fn.now() });

      if (!deletedEstimate) {
        throw new Error("Estimate not found or not deleted");
      }

      // Optionally, you can also soft delete related items
      await db('estimation_items')
        .where({ estimation_id: estimateId })
        .update({ deleted_at: db.fn.now() });

      return deletedEstimate;

    } catch (error) {
      throw new Error("Error deleting estimate: " + error.message);
    }
  }


  // Static method to update an existing task
  static async updateTask(taskId, data) {
    try {
      const updatedTask = await db('tasks')
        .where({ id: taskId })
        .update(data);

      if (!updatedTask) {
        throw new Error("Task not found or not updated");
      }

      return updatedTask;
    } catch (error) {
      throw new Error("Error updating task: " + error.message);
    }
  }


  // Static method to delete a task (soft delete)
  static async deleteTask(taskId) {
    try {
      const deletedTask = await db('tasks')
        .where({ id: taskId })
        .update({ deleted_at: db.fn.now() });

      if (!deletedTask) {
        throw new Error("Task not found or not deleted");
      }

      return deletedTask;
    } catch (error) {
      throw new Error("Error deleting task: " + error.message);
    }
  }

  // Helper function to compress PDF using Ghostscript (if available)
  static async compressPDF(inputPath, outputPath = null) {
    try {
      // Validate input file exists
      if (!fs.existsSync(inputPath)) {
        console.log('Input PDF file does not exist, skipping compression');
        return inputPath;
      }

      // Use outputPath if provided, otherwise create a temp compressed file
      const compressedPath = outputPath || inputPath.replace('.pdf', '_compressed.pdf');
      
      // Check if Ghostscript is available with timeout
      try {
        await Promise.race([
          execAsync('which gs'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
        ]);
      } catch (error) {
        // Ghostscript not available or timeout, skip compression
        console.log('Ghostscript not available or timeout, skipping PDF compression');
        return inputPath;
      }

      // Compress PDF using Ghostscript with timeout
      // -dNOPAUSE -dBATCH: non-interactive mode
      // -sDEVICE=pdfwrite: output as PDF
      // -dCompatibilityLevel=1.4: PDF version
      // -dPDFSETTINGS=/ebook: medium quality, good compression (options: /screen, /ebook, /printer, /prepress)
      // -dColorImageResolution=150: reduce color image resolution to 150 DPI
      // -dGrayImageResolution=150: reduce grayscale image resolution to 150 DPI
      // -dMonoImageResolution=300: keep monochrome at 300 DPI
      const command = `gs -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dColorImageResolution=150 -dGrayImageResolution=150 -dMonoImageResolution=300 -sOutputFile="${compressedPath}" "${inputPath}"`;
      
      // Add timeout to compression (60 seconds max)
      try {
        await Promise.race([
          execAsync(command, { timeout: 60000 }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Compression timeout')), 60000))
        ]);
      } catch (error) {
        // Compression failed or timed out, clean up and return original
        if (fs.existsSync(compressedPath)) {
          try {
            fs.unlinkSync(compressedPath);
          } catch (e) {
            // Ignore cleanup errors
          }
        }
        console.log('PDF compression failed or timed out, using original:', error.message);
        return inputPath;
      }
      
      // Check if compressed file exists and is smaller
      if (fs.existsSync(compressedPath)) {
        const originalSize = fs.statSync(inputPath).size;
        const compressedSize = fs.statSync(compressedPath).size;
        
        // If compressed file is smaller, replace original
        if (compressedSize < originalSize && compressedSize > 0) {
          if (outputPath === null) {
            // Replace original file
            try {
              fs.unlinkSync(inputPath);
              fs.renameSync(compressedPath, inputPath);
              console.log(`PDF compressed: ${originalSize} bytes -> ${compressedSize} bytes (${Math.round((1 - compressedSize/originalSize) * 100)}% reduction)`);
              return inputPath;
            } catch (error) {
              console.error('Error replacing original PDF:', error.message);
              return inputPath;
            }
          } else {
            console.log(`PDF compressed: ${originalSize} bytes -> ${compressedSize} bytes (${Math.round((1 - compressedSize/originalSize) * 100)}% reduction)`);
            return compressedPath;
          }
        } else {
          // Compressed file is larger or invalid, keep original
          if (fs.existsSync(compressedPath) && outputPath === null) {
            try {
              fs.unlinkSync(compressedPath);
            } catch (e) {
              // Ignore cleanup errors
            }
          }
          return inputPath;
        }
      }
      
      return inputPath;
    } catch (error) {
      console.error('Error compressing PDF:', error.message);
      // Return original path if compression fails
      return inputPath;
    }
  }

  static async  uploadAttachment(file) {
    const root = path.resolve();
    let filename = `${Date.now()}_${file.originalFilename}`;

    filename = filename.replace(/ /g, "_");
    filename = filename.replace(" ", "_");
    const filePath = `/public/estimation/${filename}`;
    const fullPath = path.join(root, filePath);


    var data = await readFile(file.path).then(async data => {

                          var newPath = root+filePath;

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
      return null;
    }
              

    return {
      filename: file.originalFilename,
      path: filePath,
      type: file.type,
      size: file.size
    };
  };

  static async  generateQuoteNumber() {  
    const lastEstimation = await db('estimations')
      .orderBy('id', 'desc')
      .first();

    let nextNumber = 1;

    if (lastEstimation && lastEstimation.id) {
      nextNumber = lastEstimation.id + 1;
    }

    const formattedNumber = String(nextNumber).padStart(4, '0'); // 0001, 0002, ...
    return `E-${formattedNumber}`;
  };
  static async renderTemplate(template, variables) {
    // Replace each {{ variable }} with bolded value (HTML <b>)
    return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
      const value = variables[key] || '';
      return `<b>${value}</b>`;
    });
  }

  static getAccountCodeFromAccount(accountName) {
    // Map common account names to Xero account codes
    const accountMapping = {
      'Services': '200',
      'Labor': '210', 
      'Materials': '220',
      'Equipment': '230',
      'Subcontractors': '240',
      'Overhead': '250',
      'Profit': '260',
      'Tax': '270',
      'Discount': '280',
      'Other': '290'
    };
    
    if (!accountName) return '200'; // Default to Services
    
    // Try exact match first
    if (accountMapping[accountName]) {
      return accountMapping[accountName];
    }
    
    // Try case-insensitive match
    const lowerAccountName = accountName.toLowerCase();
    for (const [key, value] of Object.entries(accountMapping)) {
      if (key.toLowerCase() === lowerAccountName) {
        return value;
      }
    }
    
    // Try partial match
    for (const [key, value] of Object.entries(accountMapping)) {
      if (lowerAccountName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerAccountName)) {
        return value;
      }
    }
    
    return '200'; // Default fallback
  }

  static async downloadPDF(estimateId, res) {
      try {
        
          const estimate = await this.getEstimateById(estimateId);
          if (!estimate) {
              throw new Error("Estimate not found");
          }

          const backedUrl = process.env.BACKED_URL;

          const leadData = await db('leads')
                .where("lead_id", estimate.lead_id).first();


          let customer_name = "";
          let customer_address = "";
          if(leadData && leadData.lead_json_data){
            customer_name = leadData.lead_json_data.NAME ? leadData.lead_json_data.NAME : "";
            customer_name += leadData.lead_json_data.LAST_NAME ? " "+leadData.lead_json_data.LAST_NAME : "";

            if(customer_name.trim() === ""){
              customer_name = leadData.lead_json_data.TITLE ? leadData.lead_json_data.TITLE : "";
            }

            //customer_address = leadData.lead_json_data.ADDRESS ? leadData.lead_json_data.ADDRESS : "";

            if(leadData.lead_json_data.UF_CRM_LEAD_1708606658714){
              customer_address = leadData.lead_json_data.UF_CRM_LEAD_1708606658714;
            }else if(leadData.lead_json_data.ADDRESS){
              customer_address = leadData.lead_json_data.ADDRESS;
            }
          }   
          
          let year_warranty = "";
          if(estimate.warranty_year && estimate.warranty_year !== ""){
            if(estimate.warranty_year == "10"){
              year_warranty = "Ten (10) years";
            }else if(estimate.warranty_year == "20"){
              year_warranty = "Twenty (20) years";
            }else if(estimate.warranty_year == "30"){
              year_warranty = "Thirty (30) years";
            }else if(estimate.warranty_year == "40"){
              year_warranty = "Forty (40) years";
            }else if(estimate.warranty_year == "50"){
              year_warranty = "Fifty (50) years";
            }else{
              year_warranty = estimate.warranty_year + " years";
            }
          }

          customer_address = customer_address.replace(", USA", '');
          

          const variables = {
            customer_name,
            customer_address,
            year_warranty
          };

          let warrantyText = await this.renderTemplate(estimate.warranty, variables);
          let disclaimerText = await this.renderTemplate(estimate.disclaimer, variables);
          disclaimerText = disclaimerText.replace(/\n/g, '');
          disclaimerText = disclaimerText.replace(/\r\r/g, '\r');

          warrantyText = warrantyText.replace(/\n/g, '');
          warrantyText = warrantyText.replace(", USA", '');


          const data = {
            ...variables,
            estimate_id: estimate.id,
            warranty_year: estimate.warranty_year,
            address_image: estimate.address_image ? backedUrl + estimate.address_image.path : null,
            warrantyText,
            disclaimerText,
            estimate,
            items: estimate.items,
            exhibits: estimate.exhibitItems,
            totals: estimate.totals,
            terms: estimate.terms
          };
          

            //console.log("Data for estimate:", JSON.stringify(estimate.items, null, 2));

          //  res.render('estimate', data);

          //  return;

          // Generate PDF
          const projectRoot = process.cwd();
          const outputDir = path.join(projectRoot, 'public', 'generated_pdfs');
          
          // Ensure output directory exists
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }

          const outputPath = path.join(outputDir, `estimate_${estimateId}.pdf`);
          
          // Render the template to HTML string
          const templatePath = path.join(projectRoot,  'templates', 'estimate.ejs');
          const template = fs.readFileSync(templatePath, 'utf8');
          const html = ejs.render(template, data);

          // Get logo as base64
          const logoPath = path.join(projectRoot, 'public', 'zavzalogo.png');
          const logoBase64 = fs.readFileSync(logoPath, 'base64');
          const base64Logo = `data:image/png;base64,${logoBase64}`;

          // Generate PDF using Puppeteer
         // console.log('Starting PDF generation...');
         // console.log('Output path:', outputPath);
        //  console.log('HTML length:', html.length);
          
          try {
            const browser = await puppeteer.launch({
              headless: true,
              executablePath: '/usr/bin/google-chrome-stable',
              args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox', 
                '--disable-dev-shm-usage',
                '--disable-web-security', // Allow loading local resources
                '--disable-features=IsolateOrigins,site-per-process',
                '--disable-images', // Disable image loading for faster rendering (images are already in HTML)
                '--disable-javascript'
              ]
            });
            
            const page = await browser.newPage();
            
            // Optimize page settings for smaller PDF size (optional - can be disabled if causing issues)
            // try {
            //   await page.setRequestInterception(true);
            //   page.on('request', (req) => {
            //     // Block unnecessary resources to reduce size (keep images and stylesheets)
            //     const resourceType = req.resourceType();
            //     if (resourceType === 'font' || resourceType === 'websocket' || resourceType === 'manifest') {
            //       req.abort();
            //     } else {
            //       req.continue();
            //     }
            //   });
            // } catch (error) {
            //   // If request interception fails, continue without it
            //   console.log('Request interception not available, continuing without it');
            // }
            
            // Set content with optimized wait strategy
            await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
            
            // Wait for page layout optimization script to complete
            // await page.waitForFunction(() => {
            //   return window.__pageLayoutOptimized === true;
            // }, { timeout: 10000 }).catch(() => {
            //   // Continue even if timeout (script might have already completed)
            //   console.log('Layout optimization script timeout or already completed');
            // });
            
            // Additional small delay to ensure layout is stable
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Generate PDF with headerTemplate and footerTemplate and optimization options
            await page.pdf({
              path: outputPath,
              format: 'A4',
              margin: {
                top: '1.0in',
                bottom: '1.2in',
              },
              headerTemplate: `
                <div style="text-align: left; margin-left: 0.4in; margin-top: -0.2in; font-size: 12px; color: #000; padding: 15px; width: 100%;">
                  <img src="${base64Logo}" alt="zavzaSeal Logo" style="width: 200px; height: auto;" />
                </div>
              `,
              footerTemplate: `
                <div style="text-align: left; margin-left: 0.8in; font-size: 12px; color: #000; padding: 15px; width: 100%; line-height: 1.2;">
                  Zavza Seal LLC–HQ: 176-8 Central Ave., Farmingdale, NY—Offices: Bohemia, Center Moriches & Brooklyn <br>WEB: <a href="https://zavzaseal.com">https://zavzaseal.com</a> – Phones: 631.980.1800 - - 718.400.7005
                  <div style="text-align: right; margin-top: -12px; margin-right: 1.2in; font-size: 11px; color: #000;">
                    Page <span class="pageNumber"></span> of <span class="totalPages"></span>
                  </div>
                </div>
              `,
              displayHeaderFooter: true,
              preferCSSPageSize: true,
              printBackground: true,
              // Optimize for smaller file size - use quality setting if available
              scale: 0.98 // Slightly reduce scale (98% instead of 100%) to reduce file size
            });
            
            await browser.close();
          
            if (!fs.existsSync(outputPath)) {
              return null;
            }

            // Compress the PDF to reduce file size
            const compressedPath = await this.compressPDF(outputPath);
            const finalOutputPath = compressedPath !== outputPath ? compressedPath : outputPath;
          //  const finalOutputPath = outputPath;

            //console.log("Final Output Path:", finalOutputPath);

            //console.log('PDF sent successfully');
            
            // Send the PDF file
            // res.download(outputPath, `estimate_${estimate.quote_number}.pdf`, (err) => {
            //   if (err) {
            //     console.error('Error sending PDF:', err);
            //     res.status(500).json({ error: 'Failed to send PDF: ' + err.message });
            //   } else {
            //     console.log('PDF sent successfully');
            //     // Save the file permanently - do not delete
            //   }
            // });
            // const data2 = {
            //   estimate
            // };
            const pricingPdf = await this.downloadPricingPDF(data, res);
            if(pricingPdf && pricingPdf.outputPath){
              // Compress pricing PDF as well (with error handling)
              let compressedPricingPath = pricingPdf.outputPath;
              // try {
              //   compressedPricingPath = await this.compressPDF(pricingPdf.outputPath);
              // } catch (error) {
              //   console.error('Error compressing pricing PDF, using original:', error.message);
              // }
              return this.mergePDFs(finalOutputPath, compressedPricingPath, estimateId);
            }else{
              return {outputPath: finalOutputPath};
            }
            
           // return {outputPath};
            
          } catch (error) {
            console.error('PDF generation error:', error);
            return null;
          }

      } catch (error) {
          console.error('PDF generation error:', error);
          return null;
      } 
  }  
  
  static async downloadPricingPDF(data, res) {
      try {
          const projectRoot = process.cwd();
          const outputDir = path.join(projectRoot, 'public', 'generated_pdfs');
          
          // Ensure output directory exists
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }

          const outputPath = path.join(outputDir, `pricing_estimate_${data.estimate.id}.pdf`);
          
          // Render the template to HTML string
          const templatePath = path.join(projectRoot, 'templates', 'pricing.ejs');
          const template = fs.readFileSync(templatePath, 'utf8');
          
          // Get logo as base64
          const logoPath = path.join(projectRoot, 'public', 'zavzalogo.png');
          const logoBase64 = fs.readFileSync(logoPath, 'base64');
          const base64Logo = `data:image/png;base64,${logoBase64}`;
          
          // Add base64Logo to data
          data.base64Logo = base64Logo;
          
          const html = ejs.render(template, data);


          // res.render('pricing', data);
          // return;


          

          // Generate PDF using Puppeteer
        // console.log('Starting pricing PDF generation...');
        // console.log('Output path:', outputPath);
        // console.log('HTML length:', html.length);
          
          try {
            const browser = await puppeteer.launch({
              headless: true,
              executablePath: '/usr/bin/google-chrome-stable',
              args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            });
            
            const page = await browser.newPage();
            
            // Set content
            await page.setContent(html, { waitUntil: 'networkidle0' });
            
            // Generate PDF
            await page.pdf({
              path: outputPath,
              format: 'A4',
              margin: {
                top: '0.2in',
                bottom: '0.4in',
              },
              printBackground: true
            });
            
            await browser.close();
          
            if (!fs.existsSync(outputPath)) {
              throw new Error('PDF file was not created');
            }

          // console.log('Pricing PDF generated successfully:', outputPath);
            return { outputPath, success: true };
            
          } catch (error) {
            console.error('PDF generation error:', error);
            return null;
          }

      } catch (error) {
          console.error('Pricing PDF generation error:', error);
          return null;
      } 
  }   

  static async mergePDFs(pdf1, pdf2, estimateId) {
    try {
      const projectRoot = process.cwd();
      const outputDir = path.join(projectRoot, 'public', 'generated_pdfs');
      const outputPath = path.join(outputDir, `merged_estimate_${estimateId}.pdf`);

      // Read the PDF files
      const pdf1Bytes = fs.readFileSync(pdf1);
      const pdf2Bytes = fs.readFileSync(pdf2);

      // Create a new PDF document
      const mergedPdf = await PDFLib.PDFDocument.create();

      // Load the first PDF
      const pdf1Doc = await PDFLib.PDFDocument.load(pdf1Bytes);
      const pdf1Pages = await mergedPdf.copyPages(pdf1Doc, pdf1Doc.getPageIndices());
      pdf1Pages.forEach((page) => mergedPdf.addPage(page));

      // Load the second PDF
      const pdf2Doc = await PDFLib.PDFDocument.load(pdf2Bytes);
      const pdf2Pages = await mergedPdf.copyPages(pdf2Doc, pdf2Doc.getPageIndices());
      pdf2Pages.forEach((page) => mergedPdf.addPage(page));

      // Save the merged PDF
      const mergedPdfBytes = await mergedPdf.save();
      fs.writeFileSync(outputPath, mergedPdfBytes);

      if(outputPath){

          const pdf_path = outputPath.replace(projectRoot, '');
          let updateData = {
              pdf_path: pdf_path
          }
          // Update the estimate
          const [estimate] = await db('estimations')
            .where({ id: estimateId })
            .update(updateData)
            .returning('*');
      }

     // console.log('PDFs merged successfully:', outputPath);
      return { outputPath, success: true };
    } catch (error) {
      console.error('Error merging PDFs:', error);
      return null;
    }
  }
  static async createXeroQuote(xeroTokenData, estimationId, pdf_path = null, redirect = false) {

    //console.log('✅ Xero token data:', xeroTokenData);
    try {

        const estimate = await this.getEstimateById(estimationId);
        if (!estimate) {
           if(!redirect){
            return {
              isSuccess: false,
              message: "Estimate not found"
            }
           }else{
            throw new Error("Estimate not found");
           }
        }

        const leadData = await db('leads')
              .where("lead_id", estimate.lead_id).first();


        let customer_name = "";
        let customer_address = "";
        if(leadData && leadData.lead_json_data){
          customer_name = leadData.lead_json_data.NAME ? leadData.lead_json_data.NAME : "";
          customer_name += leadData.lead_json_data.LAST_NAME ? " "+leadData.lead_json_data.LAST_NAME : "";

          if(customer_name.trim() === ""){
            customer_name = leadData.lead_json_data.TITLE ? leadData.lead_json_data.TITLE : "";
          }

          //customer_address = leadData.lead_json_data.ADDRESS ? leadData.lead_json_data.ADDRESS : "";
          if(leadData.lead_json_data.UF_CRM_LEAD_1708606658714){
            customer_address = leadData.lead_json_data.UF_CRM_LEAD_1708606658714;
          }else if(leadData.lead_json_data.ADDRESS){
            customer_address = leadData.lead_json_data.ADDRESS;
          }
        }   

        //console.log(estimate)

        // Build customer name from lead data
        let customerName = "";
        let customerEmail = "";
        
        if(leadData && leadData.lead_json_data){
          customerName = leadData.lead_json_data.NAME ? leadData.lead_json_data.NAME : "";
          customerName += leadData.lead_json_data.LAST_NAME ? " " + leadData.lead_json_data.LAST_NAME : "";
          
          if(customerName.trim() === ""){
            customerName = leadData.lead_json_data.TITLE ? leadData.lead_json_data.TITLE : "";
          }
          
          // Extract email from lead data
          if(leadData.lead_json_data.EMAIL && Array.isArray(leadData.lead_json_data.EMAIL) && leadData.lead_json_data.EMAIL.length > 0) {
            customerEmail = leadData.lead_json_data.EMAIL[0].VALUE || "";
          }
        }
        
        // If no customer name found, use lead name
        if(!customerName || customerName.trim() === "") {
          customerName = estimate.lead || `Estimate ${estimate.id}`;
        }
        
        // If no email found, use a default
        if(!customerEmail || customerEmail.trim() === "") {
          customerEmail = "";
        }

        const lineItems = estimate.items.map((item, index) => {
          // Build description for each item
         // const description = `Subject Area ${String.fromCharCode(65 + index)}: ${item.item || 'Untitled Item'}`+ (item.description ? `\n${item.description}` : "");
          const description = (item.description ? `\n${item.description}` : "");
        
          return {
            Description: this.htmlToPlainTextWithBullets(description),  // Remove newlines
            Quantity: parseFloat(item.qty) || 1,
            UnitAmount: parseFloat(item.price) || 0,
            LineAmount: parseFloat(item.amount) || 0,
            TaxType: item.taxRate === "Tax Exempt" ? "NONE" : "OUTPUT",
            DiscountAmount: parseFloat(item.discount) || 0
          };
        });

        // Set quote dates
        const issueDate = estimate.issue_date ? new Date(estimate.issue_date) : new Date();
        const expiryDate = estimate.expiry_date ? new Date(estimate.expiry_date) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

        const quote = {
          Contact: {
            Name: customerName,
            EmailAddress: customerEmail
          },
          Date: moment().format('YYYY-MM-DD'),
          LineItems: lineItems,
          //status: "DRAFT", // Options: DRAFT, SENT, ACCEPTED, DECLINED, INVOICED
          Title: estimate.lead || `Quote for ${customerName}`,
          Reference: `E-000${estimate.id}`,
          Summary: estimate.summary || ""
        };
       

        let datasend = null;

        if(estimate.quote_id && estimate.quote_id !== ""){
          quote.quoteID = estimate.quote_id;
          quote.QuoteNumber = estimate.quote_number;
          datasend = await this.updateQuatexero(estimate.quote_id, quote, xeroTokenData);
        }else{
          datasend = await this.createQuatexero(quote, xeroTokenData);
        }
        

        

        if(datasend && datasend.error){
          if(!redirect){
            return {
              isSuccess: false,
              message: "Error sending estimate to Xero: " + datasend.error
            }
          }else{
            throw new Error("Error sending estimate to Xero: " + datasend.error);
          }
        }

        if(datasend && datasend.Quotes && datasend.Quotes.length > 0){
          if(datasend.Quotes[0] && datasend.Quotes[0].QuoteNumber){

            if(pdf_path){
              await this.uploadPdfToXeroQuote(datasend.Quotes[0].QuoteID, pdf_path, xeroTokenData);
            }

            // console.log('✅ Quote:', JSON.stringify(datasend, null, 2));

            // return
              
            let updateData = {
                quote_number: datasend.Quotes[0].QuoteNumber,
                quote_id: datasend.Quotes[0].QuoteID
            }
            // Update the estimate
            const [estimate] = await db('estimations')
              .where({ id: estimationId })
              .update(updateData)
              .returning('*');

            return {
              isSuccess: true,
              message: "Quote created successfully",
              quote: datasend.Quotes[0]
            }

          }else{

            if(!redirect){
              return {
                error: "Quate not created"
              }
            }else{
              throw new Error("Quate not created");
            }

          }
        }else{
          if(!redirect){
            return {
              error: "Quate not created"
            }
          }else{
            throw new Error("Quate not created");
          }
        }

        //console.log('✅ Quote created successfully:', datasend);

       
      
        // const response = await xero.accountingApi.createQuotes(xeroTokenData.tenantId, { quotes: [quote] });
        // console.log("Quote sent:", response.body);

        // const quotePayload = {
        //   quotes: [
        //     {
        //       contact: { name: `Client Estimation ${estimationId}` },
        //       lineItems: [
        //         {
        //           description: `Quote for Estimation ID ${estimationId}`,
        //           quantity: 1,
        //           unitAmount: 800,
        //           accountCode: "200"
        //         }
        //       ],
        //       date: new Date().toISOString().split('T')[0],
        //       expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        //       reference: estimationId,
        //       status: 'DRAFT'
        //     }
        //   ]
        // };
      
        // const res = await axios.post(
        //   'https://api.xero.com/api.xro/2.0/Quotes',
        //   quotePayload,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${accessToken}`,
        //       'xero-tenant-id': tenantId,
        //       'Content-Type': 'application/json'
        //     }
        //   }
        // );




          
        

    }catch(error){

      if(!redirect){
        return {
          error: "Error sending estimate to Xero: " + error.message
        }
      }else{
        throw new Error("Error sending estimate to Xero: " + error.message);
      }
    }
  }
  static async viewPDF(estimateId) {
    try {
      const estimate = await this.getEstimateById(estimateId);
      if (!estimate) {
        return null;
      }
      if(estimate.pdf_path && estimate.pdf_path !== ""){
        return process.env.BACKED_URL + estimate.pdf_path;
      }else{
        return null;
      }
    } catch (error) {
      console.error('Error viewing PDF:', error);
      return null;
    }
  }

  static async uploadPdfToXeroQuote(
    quoteId,
    pdfPath,
    xeroTokenData,
  ) {
    const fileName = path.basename(pdfPath);
    const fileData = fs.readFileSync(pdfPath);
    
  
    const url = `https://api.xero.com/api.xro/2.0/Quotes/${quoteId}/Attachments/${fileName}`;
  
    try {
      const response = await axios.post(url, fileData, {
        headers: {
          'Authorization': `Bearer ${xeroTokenData.access_token}`,
          'xero-tenant-id': xeroTokenData.tenantId,
          'Content-Type': 'application/pdf',
          'Content-Length': fileData.length
        }
      });
  
     // console.log('✅ PDF uploaded to quote:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Error uploading PDF:', err.response?.data || err.message);
    }
  }

  static  htmlToPlainTextWithBullets(html) {
    // Replace <li> tags with bullet points
    let text = html.replace(/<\/li>/gi, '\n')              // Replace closing li tags with newline
                   .replace(/<li>/gi, '• ')               // Replace opening li tags with bullet
                   .replace(/<\/?ul>/gi, '\n')            // Replace ul tags with newlines
  
    // Remove all other tags
    text = text.replace(/<\/?[^>]+(>|$)/g, '');
  
    // Decode HTML entities (like &nbsp;)
    text = text.replace(/&nbsp;/g, ' ');
  
    // Trim extra spaces & normalize newlines
    text = text.replace(/\n\s*\n/g, '\n').trim();
  
    return text;
  }

  static async updateQuatexero(quoteId, quote, xeroTokenData) {
    try {
      const quotePayload = {
        Quotes: [quote]
      };
      const response2 = await axios.post(`https://api.xero.com/api.xro/2.0/Quotes/${quoteId}`, quotePayload, {
        headers: {
          Authorization: `Bearer ${xeroTokenData.access_token}`,
          'Xero-tenant-id': xeroTokenData.tenantId,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return response2?.data || null;
    }catch(error){
      console.error('Error sending estimate to Xero2:', error.message);
      return {error: error.message};
    }
  }

  static async createQuatexero(quote, xeroTokenData) {
    try {
      const quotePayload = {
        Quotes: [
          quote
        ]
      };
      const response2 = await axios.post('https://api.xero.com/api.xro/2.0/Quotes', quotePayload, {
        headers: {
          Authorization: `Bearer ${xeroTokenData.access_token}`,
          'Xero-tenant-id': xeroTokenData.tenantId,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return response2?.data || null;
    }catch(error){
      console.error('Error sending estimate to Xero2:', error.message);
      return {error: error.message};
    }
  }

  static async sendEstimateEmail(body) {
    try {
      const { estimateId, sentTo, emailHeader, emailBody, cc, bcc, mode } = body;
      
      // Validate required fields
      if (!estimateId || !sentTo || !emailBody) {
        return { 
          success: false, 
          error: "Missing required fields: estimateId, sentTo, emailBody" 
        };
      }

      // Get estimate details
      const estimate = await this.getEstimateById(estimateId);
      if (!estimate) {
        return { 
          success: false, 
          error: "Estimate not found" 
        };
      }

      // Initialize mail helper using singleton
      const mailHelper = MailHelperSingleton.getInstance();

      // Prepare PDF attachment if available
      let pdfPath = null;
      if (estimate.pdf_path) {
        const projectRoot = process.cwd();
        pdfPath = path.join(projectRoot, estimate.pdf_path);
        
        // Check if PDF file exists
        if (!fs.existsSync(pdfPath)) {
          console.warn(`PDF file not found: ${pdfPath}`);
          pdfPath = null;
        }
      }

      // Send email using mail helper
      const result = await mailHelper.sendEstimateEmail({
        estimateId: estimateId,
        sentTo: sentTo,
        emailHeader: emailHeader || `Estimate ${mode === 'approval' ? 'Approval' : 'Request'} - #${estimateId}`,
        emailBody: emailBody,
        cc: cc || [],
        bcc: bcc || [],
        mode: mode || 'approval',
        pdfPath: pdfPath,
        // Force using Estimates SMTP credentials from settings
        useEstimateSmtp: true
      });

      if (result.success) {
        // Log email sent event (optional)
        //console.log(`Estimate email sent successfully for estimate ${estimateId} to ${sentTo}`);

        if(mode === "client"){
          await db('estimations')
          .where({ id: estimateId })
          .update({
            client_mail_sent: "true"
          })
          .returning('*');
        }
        
        return {
          success: true,
          message: "Email sent successfully",
          messageId: result.messageId
        };
      } else {
        return {
          success: false,
          error: result.error || "Failed to send email",
          message: result.message
        };
      }

    } catch (error) {
      //console.error('Error sending estimate email:', error.message);
      return { 
        success: false, 
        error: "Error sending estimate email: " + error.message 
      };
    }
  }
}

module.exports = Estimate;
