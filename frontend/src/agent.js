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
		return superagent
			.post(`${API_ROOT}${url}`, body)
			.use(tokenPlugin)
			.then(responseBody);
	},		
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
	addTask: (formData) => requests.post("/tasks/addTask", formData),
	getTaskById: (taskId) => requests.get("/tasks/getTaskById/"+taskId),
	getNotes: (taskId) => requests.get("/tasks/getNotes/"+taskId),
	editTask: (formData,taskId) => requests.post("/tasks/editTask/"+taskId,formData),
	submitNotes: (formData,taskId) => requests.post("/tasks/submitNotes/"+taskId,formData),
	getComments: (taskId) => requests.get("/tasks/getComments/"+taskId),
	getTimeLogs: (pageNumber, pageSize, search) => requests.get(`/timeLogs/getTimeLogs?page=${pageNumber}&size=${pageSize}&search=${search}`),
	getLogsByUserId: (userId,type,start_date,end_date) => requests.get(`/timeLogs/getLogsByUserId/`+userId+`?type=${type}&start_date=${start_date}&end_date=${end_date}`),
	getDateWiseLogs: (userId,logDate) => requests.get(`/timeLogs/getDateWiseLogs/`+userId+`?logDate=${logDate}`),
}


const common = {
}

export default {
	Auth,
	common,
	setToken: (_token) => {
    	token = _token;
  	},
};