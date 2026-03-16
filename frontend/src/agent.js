import superagentPromise from "superagent-promise";
import _superagent from "superagent";

const superagent = superagentPromise(_superagent, global.Promise);

const API_ROOT = process.env.REACT_APP_BACKEND;

let token = null;
const tokenPlugin = (req) => {
  	if (token) {
    	req.set("Authorization", `Bearer ${token}`);

  	}
  	req.set("Cache-Control", `no-cache`);
};

const responseBody = (res) => res.body;


const requests = {
	del: (url) =>
		superagent.del(`${API_ROOT}${url}`)
			.use(tokenPlugin)
			.then(responseBody),
	get: (url) =>	
		superagent.get(`${API_ROOT}${url}`)
			.use(tokenPlugin)
			.then(responseBody),
	put: (url, body) =>
		superagent
			.put(`${API_ROOT}${url}`, body)
			.use(tokenPlugin)
			.then(responseBody),
	post: (url, body) =>{
		const request = superagent
			.post(`${API_ROOT}${url}`, body)
			.use(tokenPlugin);
		
		// Only set Content-Type for JSON, let FormData set its own headers
		if (!(body instanceof FormData)) {
			request.set('Content-Type', 'application/json');
		}
		
		return request.then(responseBody);
	},
	getBlob: (url) =>
		superagent.get(`${API_ROOT}${url}`)
			.use(tokenPlugin)
			.responseType('blob')
			.then(res => res.body),		
}

const Auth = {
	current: () => requests.get("/auth/user"),
	login: (formData) => requests.post("/auth/login", formData),
	updateProfile: (formData) => requests.post("/auth/updateProfile", formData),
	ForgotPassword: (formData) => requests.post("/auth/ForgotPassword", formData),
	ResetPassword: (formData) => requests.post("/auth/ResetPassword", formData),
	getRoles: (pageNumber, pageSize, search) => requests.get(`/roles/getRoles?page=${pageNumber}&size=${pageSize}&search=${search}`),
	getUsers: (pageNumber, pageSize, search) => requests.get(`/users/getUsers?page=${pageNumber}&size=${pageSize}&search=${search}`),
	createUser: (formData) => requests.post(`/users/AddEditUser`, formData),
	getUserById: (id) => requests.get(`/users/getUserById/`+id),
	deleteUserById: (id) => requests.get(`/users/deleteUserById/`+id),
	getSettings: () => requests.get(`/settings/getSettings/`),
	saveSettings: (formData) => requests.post(`/settings/addEditSettings`, formData),
	getCallLogs: (params) => requests.get(`/calls/getCallLogs`+params ),
	getCallLogsChartData: (params) => requests.get(`/calls/getCallLogsChartData`+params ),
	getCallLogsToken: () => requests.get(`/calls/getCallLogsToken` ),
	
	getDeals: (search = "", pageNumber = 0, pageSize = 50) => requests.get(`/deals/getDeals?page=${pageNumber}&size=${pageSize}&search=${search}`),
	getCrewMembers: () => requests.get(`/users/getCrewMembers` ),
	getTasks: () => requests.get("/tasks/getTasks"),
	getTasksData: (search = "", page = 1, limit = 20) => requests.get(`/tasks/getTasksData?search=${encodeURIComponent(search)}&page=${page}&size=${limit}`),
	createNote: (formData) => requests.post("/tasks/createNote", formData),
	addTask: (formData) => requests.post("/tasks/addTask", formData),
	getTaskById: (taskId) => requests.get("/tasks/getTaskById/"+taskId),
	getNotes: (taskId) => requests.get("/tasks/getNotes/"+taskId),
	getNotesByType: (taskId) => requests.get("/tasks/getNotesByType/"+taskId),
	updateNote: (TaskId, formData) => requests.post("/tasks/updateNote/", { TaskId, formData }),
	updateLeadFields: (leadId, fields) => requests.post(`/leads/updateLeadFields`, { leadId, fields }),
	editTask: (formData,taskId) => requests.post("/tasks/editTask/"+taskId,formData),
	submitNotes: (formData,taskId) => requests.post("/tasks/submitNotes/"+taskId,formData),
	getComments: (taskId) => requests.get("/tasks/getComments/"+taskId),
	addComment: (formData,taskId) => requests.post("/tasks/addComment/"+taskId,formData),
	getTimeLogs: (pageNumber, pageSize, search) => requests.get(`/timeLogs/getTimeLogs?page=${pageNumber}&size=${pageSize}&search=${search}`),
	getLogsByUserId: (userId,type,start_date,end_date) => requests.get(`/timeLogs/getLogsByUserId/`+userId+`?type=${type}&start_date=${start_date}&end_date=${end_date}`),
	getDateWiseLogs: (userId,logDate) => requests.get(`/timeLogs/getDateWiseLogs/`+userId+`?logDate=${logDate}`),
  saveCrewAssignments: (taskId, body) => requests.post(`/tasks/saveCrewAssignments/${taskId}`, body),
	getTasksWithCrew: (page = 1, limit = 10) => requests.get(`/tasks/getTasksWithCrew?page=${page}&limit=${limit}`),
	
}

const Website = {
//   getWebsiteData: () => Promise.resolve({
//     isSuccess: true,
//     data: {
//       websiteData: [
//         { name: 'SEO', logo: require('./assets/images/growth.png'), totalLeads: 31, cost: null, appointments: 5, costPerLead: null },
//         { name: 'GLSA', logo: require('./assets/images/call_pick.svg'), totalLeads: 2, cost: 399, appointments: 1, costPerLead: 196 },
//         { name: 'Google Ads', logo: require('./assets/images/bedroom.png'), totalLeads: 0, cost: null, appointments: 0, costPerLead: null },
//       ]
//     }
//   }),
  getWebsiteData: (search, source, website, startDate, endDate, leadType,allsources) => requests.get(`/leads/getWebsiteData?search=${search}&source=${source}&website=${website}&startDate=${startDate}&endDate=${endDate}&leadType=${leadType}&allsources=${allsources}`),
  getLeadsData: (search, source, website, leadType, page = 1, limit = 10, sortField, sortOrder) =>
    requests.get(`/leads/getLeadsData?search=${search}&source=${source}&website=${website}&leadType=${leadType}&page=${page}&size=${limit}&sortField=${sortField}&sortOrder=${sortOrder}`),
  getLeadById: (id) => requests.get(`/leads/getLeadById/${id}`),
  updateLeadFields: (leadId, fields) => requests.post(`/leads/updateLeadFields`, { leadId, fields }),
  getDealsData: (search, source, website = "", leadType = "", page = 1, limit = 10, sortField, sortOrder) =>{
    return requests.get(`/deals/getDealsData?search=${search}&source=${source}&website=${website}&leadType=${leadType}&page=${page}&size=${limit}&sortField=${sortField}&sortOrder=${sortOrder}`)
  },
  getDealById: (id) => requests.get(`/deals/getDealById/${id}`),
  getSources: () => requests.get(`/leads/getSources`),
  addExpenses: (data) => requests.post('/leads/addExpenses', data),
  getReportFiltersData: () => requests.get(`/leads/getReportFiltersData`),
  getReports: (params) => requests.get(`/leads/getReports`+params ),
  getReportsChartData: (params) => requests.get(`/leads/getReportsChartData`+params ),
  getReportsToken: () => requests.get(`/leads/getReportsToken` ),
  
};

const estimates = {
  getEstimatesData: (search, status, customer, page = 1, limit = 10, sortField, sortOrder) =>
    requests.get(`/estimate/getEstimatesData?search=${search}&status=${status}&customer=${customer}&page=${page}&size=${limit}&sortField=${sortField}&sortOrder=${sortOrder}`),
  getEstimateById: (id) => requests.get(`/estimate/getEstimateById/${id}`),
  updateEstimate: (estimateId, estimateData) => requests.post(`/estimate/updateEstimate/${estimateId}`, estimateData),
  createEstimate: (estimateData) => requests.post(`/estimate/createEstimate`, estimateData),
  deleteEstimate: (estimateId) => requests.post(`/estimate/deleteEstimate/${estimateId}`, {delete: "true"}),
  getEstimateTemplates: (query = "") => requests.get(`/estimate/getTemplates?search=${query}`),
  getTemplateById: (id) => requests.get(`/estimate/getTemplateById/${id}`),
  createEstimateTemplate: (templateData) => requests.post(`/estimate/createTemplate`, templateData),
  updateEstimateTemplate: (templateId, templateData) => requests.post(`/estimate/updateTemplate/${templateId}`, templateData),
  deleteEstimateTemplate: (templateId) => requests.post(`/estimate/deleteTemplate/${templateId}`, {delete: "true"}),
  getLeadsBySearch: (search = "") => 
    requests.get(`/estimate/getLeadsBySearch?search=${search}`),
  downloadEstimatePDF: (estimateId) => requests.get(`/estimate/downloadPDF/${estimateId}`),
  viewEstimatePDF: (estimateId) => requests.get(`/estimate/viewPDF/${estimateId}`),
  sendEstimateToXero: (estimateId) => requests.get(`/estimate/sendToXero/${estimateId}`),
  sendEstimateEmail: (emailData) => requests.post(`/estimate/sendEstimateEmail`, emailData),
}

const common = {
}

const agent = {
	Auth,
	common,
	estimates,
	setToken: (_token) => {
    	token = _token;
  	},
	Website,
};

export default agent;