const baseResponse = require("../Util/baseResponse.js");
const axios = require('axios');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const db = require('../config/connection.js');
const TimeLogsModel = require('../models/TimeLogs');
const UserModal = require('../models/User');

class TimeLogsController {
    // Main method to execute the fetching process

    addTimeLog = async (session, req, res) => {
        const response = new baseResponse(res);
        try {

            if (!req.body.task_id) {
                return response.sendResponse(null, false, "Task id required", 400);
            }

            const logs = await TimeLogsModel.getTimeLogByTaskId(req.body.task_id);



            if(req.body.log_type && req.body.log_type == "checkout" && logs && logs.length > 0){

                await TimeLogsModel.updateTimeLog({
                    check_out: req.body.check_out,
                    logs
                });

                return response.sendResponse({}, true, "Time Log Updated successfully", 201);

            }else{

                await TimeLogsModel.addTimeLog({
                    user_id : session.id,
                    task_id: req.body.task_id,
                    check_in: req.body.check_in
                });

                return response.sendResponse({}, true, "Time Log Added successfully", 201);

            }

            
        } catch (error) {
            return response.sendResponse(null, false, "Failed to create Time Log: " + error.message, 500);
        }
    }
    async getTimeLogs(body, res) {

        const response = new baseResponse(res);

        try {
            let {page = 1, pagesize = 10, search = ""} = body;

            let timeLogs = await TimeLogsModel.getPaginatedTimeLogs(page,pagesize,search);

            return response.sendResponse(timeLogs, true, "", 200);
        } catch (error) {
            console.error('Error during fetch operation:', error.message);
            response.sendResponse(null, false, error.message, 500);
        }
    }
    async getLogsByUserId(req, res) {

        const response = new baseResponse(res);

        try {
            const userId = req.params.userId;

            const { start_date = "", end_date = "", type = "today" } = req.query;
   
            if (!userId) {
                return response.sendResponse(null, false, "userId is required", 400);
            }


            const userLogsData = await TimeLogsModel.getLogsByUserId(userId, type, start_date, end_date);

            function calculateTotalHoursAndMinutes(checkIn, checkOut) {
                const checkInDate = moment(checkIn);
                const checkOutDate = moment(checkOut);
                const diffInMinutes = checkOutDate.diff(checkInDate, 'minutes');
                const hours = Math.floor(diffInMinutes / 60);
                const minutes = diffInMinutes % 60;
                const formattedHours = hours < 10 ? '0' + hours : hours;
                const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
                return `${formattedHours}:${formattedMinutes}`;
            }
            let finalTransformedData = null;
            let grand_total_hours = null;

            if(userLogsData && userLogsData.length > 0){

                const transformedData2 = userLogsData.reduce((acc, log) => {
                    const checkInDate = moment.utc(log.check_in).local().format('YYYY-MM-DD');
                    const check_in = moment.utc(log.check_in).local().format('YYYY-MM-DD HH:mm:ss');
                    let check_out;

                    let hasNull = false;

                    // Check if check_out exists
                    if (log.check_out) {
                        // If check_out exists, use it
                        check_out = moment.utc(log.check_out).local().format('YYYY-MM-DD HH:mm:ss');
                    } else {
                        hasNull = true;
                        // If check_out doesn't exist, set to 23:59:59, but only if check_in is not today
                        if (!moment(check_in).isSame(moment(), 'day')) {
                            check_out = moment.utc(log.check_in).local().set({ hour: 23, minute: 59, second: 59 }).format('YYYY-MM-DD HH:mm:ss');
                        } else {
                            // If today, keep check_out as the same time as check_in or set it to 23:59:59
                            check_out = moment.utc(log.check_in).local().set({ hour: moment().hour(),minute: moment().minute(), second: moment().second()}).format('YYYY-MM-DD HH:mm:ss');
                        }
                    }



                    const totalTime = calculateTotalHoursAndMinutes(check_in, check_out);

                    if (!acc[checkInDate]) acc[checkInDate] = {
                        totalMinutes: 0,
                        earliestCheckIn: moment(check_in),
                        latestCheckOut: moment(check_out),
                        hasNull,
                        logs: []
                    };

                    acc[checkInDate].logs.push({
                        check_in: check_in,
                        check_out: check_out,
                        total_hours: totalTime,
                        hasNull
                    });

                    const logDurationInMinutes = moment(check_out).diff(moment(check_in), 'minutes');
                    acc[checkInDate].totalMinutes += logDurationInMinutes;

                    if (moment(check_in).isBefore(acc[checkInDate].earliestCheckIn)) {
                        acc[checkInDate].earliestCheckIn = moment(check_in);
                    }
                    if (moment(check_out).isAfter(acc[checkInDate].latestCheckOut)) {
                        acc[checkInDate].latestCheckOut = moment(check_out);
                    }

                    return acc;
                }, {});

                let grand_total_minutes = 0;


                

                finalTransformedData = Object.keys(transformedData2).map(date => {
                    const data = transformedData2[date];
                    const totalHours = Math.floor(data.totalMinutes / 60);
                    const remainingMinutes = data.totalMinutes % 60;
                    const totalTimeFormatted = `${totalHours} h ${remainingMinutes} m`;

                    const totalTimeInMinutes = totalHours * 60 + remainingMinutes;
                    grand_total_minutes += totalTimeInMinutes;

                    return {
                        date: date,
                        start_time: data.earliestCheckIn.format('YYYY-MM-DD HH:mm:ss'),
                        end_time: data.latestCheckOut.format('YYYY-MM-DD HH:mm:ss'),
                        total_hours: totalTimeFormatted,
                        empty_end_time: data.hasNull,
                    };
                });


                if(grand_total_minutes > 0){

                    const totalHoursGrand = Math.floor(grand_total_minutes / 60);
                    const remainingMinutesGrand = grand_total_minutes % 60;
                    grand_total_hours = `${totalHoursGrand} h ${remainingMinutesGrand} m`;

                }
            }    

            const data = {
                userLogs: finalTransformedData,
                grand_total_hours,
            }

            return response.sendResponse(data, true, "Logs retrieved successfully", 200);
        } catch (error) {
            console.error('Error during fetch operation:', error.message);
            response.sendResponse(null, false, error.message, 500);
        }
    }
    async getDateWiseLogs(req, res) {

        const response = new baseResponse(res);

        try {
            const userId = req.params.userId;

            const { logDate } = req.query;
   
            if (!userId) {
                return response.sendResponse(null, false, "userId is required", 400);
            }


            const userLogsData = await TimeLogsModel.getDateWiseLogs(userId, logDate);

            const userData = await UserModal.findById(userId);

            let logData = null;

            if(userLogsData && userLogsData.length > 0){

                function calculateTotalHoursAndMinutes(checkIn, checkOut) {
                    const checkInDate = moment(checkIn);
                    const checkOutDate = moment(checkOut);
                    const diffInMinutes = checkOutDate.diff(checkInDate, 'minutes');
                    const hours = Math.floor(diffInMinutes / 60);
                    const minutes = diffInMinutes % 60;
                    const formattedHours = hours < 10 ? '0' + hours : hours;
                    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
                    return `${formattedHours}:${formattedMinutes}`;
                }

                logData = userLogsData.reduce((acc, log) => {
                    const checkInDate = moment.utc(log.check_in).local().format('YYYY-MM-DD');
                    const check_in = moment.utc(log.check_in).local().format('YYYY-MM-DD HH:mm:ss');
                    let check_out;

                    let hasNull = false;

                    // Check if check_out exists
                    if (log.check_out) {
                        // If check_out exists, use it
                        check_out = moment.utc(log.check_out).local().format('YYYY-MM-DD HH:mm:ss');
                    } else {
                        hasNull = true;
                        // If check_out doesn't exist, set to 23:59:59, but only if check_in is not today
                        if (!moment(check_in).isSame(moment(), 'day')) {
                            check_out = moment.utc(log.check_in).local().set({ hour: 23, minute: 59, second: 59 }).format('YYYY-MM-DD HH:mm:ss');
                        } else {
                            // If today, keep check_out as the same time as check_in or set it to 23:59:59
                            check_out = moment.utc(log.check_in).local().set({ hour: moment().hour(),minute: moment().minute(), second: moment().second()}).format('YYYY-MM-DD HH:mm:ss');
                        }
                    }



                    const logDurationInMinutes = moment(check_out).diff(moment(check_in), 'minutes');

                    const totalHours = Math.floor(logDurationInMinutes / 60);
                    const remainingMinutes = logDurationInMinutes % 60;
                    const totalTimeFormatted = `${totalHours} h ${remainingMinutes} m`;

                   

                    acc.push({
                        check_in: check_in,
                        check_out: check_out,
                        logDurationInMinutes: logDurationInMinutes,
                        total_hours: totalTimeFormatted,
                        name: log.first_name+" "+log.last_name,
                        profile_image: log.profile_image,
                        project_name: log.title,
                        empty_end_time: hasNull
                    });


                    return acc;
                }, []);

               
            } 

            const logsData = {
                 logData,
                 userData 
            }

            return response.sendResponse(logsData, true, "Logs retrieved successfully", 200);
        } catch (error) {
            console.error('Error during fetch operation:', error.message);
            response.sendResponse(null, false, error.message, 500);
        }
    }
   
}

module.exports = TimeLogsController;
