require('dotenv').config();
const express = require('express');
const cors = require('cors');
const formData = require('express-form-data');
const bodyParser = require("body-parser")
const fs = require('fs');
const path = require('path');

var app = express();
var http = require('http').createServer(app);


let dbConfig = require(`./config/connection.js`);
let indexRoute = require('./routes/index.js');
let authRoute = require('./routes/account/auth.js');
let userRoute = require('./routes/account/userRoute.js');
let settingsRoute = require('./routes/settings/settingsRoute.js');
let rolesRoute = require('./routes/roles/rolesRoute.js');

let callsRoute = require('./routes/calls/callsRoute.js');

//let bitrixLeadsRoute = require('./routes/leads/bitrixLeadsRoute.js');
let dealsRoute = require('./routes/deals/dealsRoute.js');
let leadsRoute = require('./routes/leads/leadsRoute.js');

let taskRoute = require('./routes/tasks/taskRoute.js');

let timeLogsRoute = require('./routes/timeLogs/timeLogsRoute.js');

let estimateRoute = require('./routes/estimate/estimateRoute.js');

app.use('/backend/public',express.static('public'));

const logFile = path.join(__dirname, 'cron-log.txt');



app.use(cors());

app.use(express.json());   
app.use(express.urlencoded({extended: false})); 
app.use(formData.parse());

app.use(bodyParser.urlencoded({extended: false}))

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));


app.use(function(req, res, next) {
  	res.header('server', '*');
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
 	next();
});

app.use(function(req, res, next) {
   req.rootUrl = function() {
      return req.protocol + "://" + req.get('host');
   }
   return next();
});

// Routes
app.use("/backend/",indexRoute);
app.use("/backend/auth",authRoute);
app.use("/backend/users",userRoute);
app.use("/backend/settings",settingsRoute);
app.use("/backend/roles",rolesRoute);
app.use("/backend/calls",callsRoute);
app.use("/backend/deals",dealsRoute);
app.use("/backend/leads",leadsRoute);
app.use("/backend/tasks",taskRoute);
app.use("/backend/timeLogs",timeLogsRoute);
app.use("/backend/estimate",estimateRoute);


var listener = http.listen(process.env.PORT || 9001, function () {
   let _msgg = `Server listening on port: ${listener.address().port} with config: ${process.env.NODE_ENV}`;
  	console.log(_msgg)
});

const cron = require('node-cron');
const callLogsController = new (require('./controllers/callLogsController.js'))();
const bitrixLeadsController = new (require('./controllers/bitrixLeadsController.js'))();
const bitrixDealsController = new (require('./controllers/bitrixDealsController.js'))();


function logToFile(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFile(logFile, logMessage, (err) => {
        if (err) console.error('Error writing to log file:', err);
    });
}

//  const timestamp = new Date().toString();

// console.log(timestamp);

// Schedule the cron job to run every day at 4 PM
cron.schedule('00 01 * * *', async () => {
    console.log('Running cron job at 01 AM..');
    logToFile('Running cron job at 01 AM...');
    try {
        // Replace with the actual task you want to run, such as fetching call logs
        await callLogsController.fetch({}, { sendResponse: () => {} });
        logToFile('Call logs Cron job completed successfully');
    } catch (error) {
        logToFile('Error during cron job:', error.message);
    }
});
cron.schedule('30 02 * * *', async () => {
    console.log('Running cron job at 02:30 AM...');
    logToFile('Running cron job at 02:30 AM...');
    try {
        // Replace with the actual task you want to run, such as fetching call logs
        await bitrixLeadsController.getBitrixLeadsFromApi({}, { sendResponse: () => {} });
        logToFile('getBitrixLeads Cron job completed successfully');
    } catch (error) {
        logToFile('Error during cron job:', error.message);
    }
});
cron.schedule('00 03 * * *', async () => {
    console.log('Running cron job at 03:00 AM...');
    logToFile('Running cron job at 03:00 AM...');
    try {
        // Replace with the actual task you want to run, such as fetching call logs
        await bitrixDealsController.getBitrixDealsFromApi({}, { sendResponse: () => {} });
        logToFile('getBitrixDeals Cron job completed successfully');
    } catch (error) {
        logToFile('Error during cron job:', error.message);
    }
});