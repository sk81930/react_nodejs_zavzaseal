import {
  APP_LOAD,
  LOGIN,
  CLEAR_LOGIN_MESSAGE,
  REGISTER,
  ASYNC_START,
  UPDATE_FIELD_AUTH,
  LOGOUT,
  CLEAR_LOGOUT,
  LOAD_APP_LOAD,
  ROLES,
  USERS,
  GET_USER_BY_ID,
  CREATE_USER,
  DELETE_USER,
  SETTINGS,
  SAVE_SETTINGS,
  CLEAR_FLASH_MESSAGE,
  CALL_LOGS,
  CALL_LOGS_CHART_DATA_FIRST,
  CALL_LOGS_CHART_DATA_SECOND,
  CALL_LOGS_TOKEN,
  REPORTS,
  REPORTS_CHART_DATA_FIRST,
  REPORTS_CHART_DATA_SECOND,
  REPORTS_TOKEN,
  GET_DEALS,
  GET_CREW_MEMBER,
  ADD_TASK,
  OPEN_PROFILE_MODAL,
  CLOSE_PROFILE_MODAL,
  LOADER_SHOW,
  LOADER_HIDE,
  WEBSITE_DATA,
  WEBSITE_DATA_CHART,
} from '../constants/actionTypes';

export default (state = {
  reports: null,
  reportsError: null,
  reportsChartData1: null,
  reportsChartData2: null,
  reportsToken: null,
}, action) => {
  switch (action.type) {
    case APP_LOAD:

      return {
        ...state,
        appLoaded: true,
        currentUser:
          action.payload && action.payload.data && action.payload.data.user
            ? action.payload.data.user
            : null,
         
      };
    case LOAD_APP_LOAD:{
      return {
        ...state,
        appLoaded: action.payload,
      }; 
    }   
    case LOGIN:
    case REGISTER:{
      return {
        ...state,
        loginData: action.error || action.payload ? action.payload : null,
        token: action.payload && action.payload.data && action.payload.data.token ? action.payload.data.token: null, 
      };
    }  
    case LOGOUT:{
      localStorage.removeItem("jwt");
      return { ...state, logoutRedirectTo: true, loginData: null, token: null, currentUser: false, isAdmin: null};
    }
  case ROLES:{
      return {
        ...state,
        rolesData: action.payload && action.payload.data && action.payload.data.roles ? action.payload.data.roles: null, 
      };
    } 
  case USERS:{
      return {
        ...state,
        usersData: action.payload && action.payload.data && action.payload.data.users ? action.payload.data.users: null, 
      };
    } 
  case GET_USER_BY_ID:{
      return {
        ...state,
        editUserData: action.payload && action.payload.data && action.payload.data.user ? action.payload.data.user: null, 
        editUserDataError: action.payload && action.payload.isSuccess === false ? "not exist!": null, 
      };
    }   
  case CREATE_USER:{
      return {
        ...state,
        flashError: action.error && action.payload.isSuccess === false ? action.payload.message: null, 
        flashSuccess: action.payload && action.payload.isSuccess && action.payload.message ? action.payload.message: null, 
      };
    } 
  case DELETE_USER:{
      return {
        ...state,
        userDeleteError: action.error && action.payload.isSuccess === false ? action.payload.message: null, 
        userDeleteSuccess: action.payload && action.payload.isSuccess && action.payload.message ? action.payload.message: null, 
      };
    }  
  case SETTINGS:{
      return {
        ...state,
        settingGetError: action.error && action.payload.isSuccess === false ? action.payload.message: null, 
        getSettings: action.payload && action.payload.isSuccess && action.payload.data && action.payload.data.settings? action.payload.data.settings: null, 
      };
    }    
  case SAVE_SETTINGS:{
      return {
        ...state,
        settingSaveError: action.error && action.payload.isSuccess === false ? action.payload.message: null, 
        settingSaveSuccess: action.payload && action.payload.isSuccess && action.payload.message ? action.payload.message: null, 
      };
    }  
  case CALL_LOGS:{
      return {
        ...state,
        callLogsError: action.error && action.payload.isSuccess === false ? action.payload.message: null, 
        callLogs: action.payload && action.payload.isSuccess && action.payload.data && action.payload.data.callLogs? action.payload.data.callLogs: null, 
      };
    }  
  case CALL_LOGS_CHART_DATA_FIRST:{
      return {
        ...state,
        callLogsChartData1: action.payload && action.payload.isSuccess && action.payload.data && action.payload.data.chartData? action.payload.data.chartData: null, 
      };
    } 
  case CALL_LOGS_TOKEN:{
      return {
        ...state,
        callLogsToken: action.payload && action.payload.isSuccess && action.payload.data && action.payload.data.token? action.payload.data.token: null, 
      };
    }  
  case CALL_LOGS_CHART_DATA_SECOND:{
      return {
        ...state,
        callLogsChartData2: action.payload && action.payload.isSuccess && action.payload.data && action.payload.data.chartData? action.payload.data.chartData: null, 
      };
    }   
  case REPORTS:{
      return {
        ...state,
        reportsError: action.error && action.payload.isSuccess === false ? action.payload.message: null, 
        reports: action.payload && action.payload.isSuccess && action.payload.data && action.payload.data.reports? action.payload.data.reports: null, 
      };
    }  
  case REPORTS_CHART_DATA_FIRST:{
      return {
        ...state,
        reportsChartData1: action.payload && action.payload.isSuccess && action.payload.data && action.payload.data.chartData? action.payload.data.chartData: null, 
      };
    } 
  case REPORTS_CHART_DATA_SECOND:{
      return {
        ...state,
        reportsChartData2: action.payload && action.payload.isSuccess && action.payload.data && action.payload.data.chartData? action.payload.data.chartData: null, 
      };
    }   
  case REPORTS_TOKEN:{
      return {
        ...state,
        reportsToken: action.payload && action.payload.isSuccess && action.payload.data && action.payload.data.token? action.payload.data.token: null, 
      };
    }  
  case GET_DEALS:{
      return {
        ...state,
        dealsData: action.payload && action.payload.isSuccess && action.payload.data && action.payload.data.dealsData? action.payload.data.dealsData: null, 
      };
    } 
  case GET_CREW_MEMBER:{
      return {
        ...state,
        crewMembers: action.payload && action.payload.isSuccess && action.payload.data && action.payload.data.crewMembers? action.payload.data.crewMembers: null, 
      };
    }  
  case ADD_TASK: {
    return {
      ...state,
  
      addTaskError:
        action.payload && action.payload.isSuccess === false
          ? action.payload.message
          : null,
  
      // STORE FULL RESPONSE
      addTaskSuccess:
        action.payload && action.payload.isSuccess
          ? action.payload
          : null,
    };
  } 
  case OPEN_PROFILE_MODAL:{
    var ModalUserId = null;
    if(action.payload && action.payload.userId){
      ModalUserId = action.payload.userId;
    }
    return { ...state, profileModalOpen: true, ModalUserId   };
  }
  case CLOSE_PROFILE_MODAL:{
    return { ...state, profileModalOpen: false, ModalUserId: null };      
  }
  case LOADER_SHOW:{
    var loader_show = false;
    if(action.payload && action.payload.type == true){
      loader_show = true;
    }
    return { ...state, loaderShow: loader_show  };
  }
  case LOADER_HIDE:{
    return { ...state, loaderShow: false  };
  }
  case CLEAR_LOGOUT:{
      return { ...state, logoutRedirectTo: false,redirectTo: false };  
    }
    case ASYNC_START:
      if (action.subtype === LOGIN || action.subtype === REGISTER) {
        return { ...state, inProgress: true };
      }
      break;
    case UPDATE_FIELD_AUTH:
      return { ...state, [action.key]: action.value };
    case CLEAR_LOGIN_MESSAGE:
        return {
            ...state,
            loginData : null,
        };
    case CLEAR_FLASH_MESSAGE:
        return {
            ...state,
            flashError : null,
            flashSuccess : null,
            editUserDataError : null,
            userDeleteError : null,
            userDeleteSuccess : null,
            settingSaveSuccess : null,
            settingSaveError : null,
            settingGetError: null,
            addTaskError: null,
            addTaskSuccess: null,
        }; 
    case WEBSITE_DATA: {
      return {
        ...state,
        websiteDataError: action.error && action.payload.isSuccess === false ? action.payload.message : null,
        websiteData: action.payload && action.payload.isSuccess && action.payload.data && action.payload.data.websiteData ? action.payload.data.websiteData : null,
      };
    }
    case WEBSITE_DATA_CHART: {
      return {
        ...state,
        websiteChartData: action.payload && action.payload.isSuccess && action.payload.data && action.payload.data.chartData ? action.payload.data.chartData : null,
      };
    }
    default:
      return state;
  }

  return state;
};
