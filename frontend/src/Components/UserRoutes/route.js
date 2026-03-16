import Login from "../Views/Login";
import Dashboard from "../Views/Dashboard";
import Roles from "../Views/Roles";
import Users from "../Views/Users";
import UserCreateEdit from "../Views/Users/createEdit";
import Settings from "../Views/Settings";
import RingCentral from "../Views/RingCentral";
import Calendar from "../Views/Calendar";
import Crew from "../Views/Crew";
import TimeLogs from "../Views/TimeLogs";
import MyProfile from "../Views/MyProfile";
import WebsiteData from "../Views/WebsiteData";
import Trace from "../Views/Trace";
import Crm from "../Views/crm";
import LeadCost from "../Views/website/LeadCost";
import DummyReport from "../Views/DummyReport";
import Estimates from "../Views/Estimates";
import EstimatesTemplatesPage from "../Views/Estimates/EstimatesTemplatesPage";
import CreateTemplatePage from "../Views/Estimates/CreateTemplatePage";

export const baseRoutes = [
	{
		name: 'Home',
		path: '/',
		component: <Login />
	}
];

export const authSuperAdminRoutes = [
	{
		name: 'CRM',
		path: '/crm',
		component: <Crm />
	},
	{
		name: 'Estimates',
		path: '/estimates',
		component: <Estimates />
	},
	{
		name: 'Estimates Templates',
		path: '/estimates/templates',
		component: <EstimatesTemplatesPage />
	},
	{
		name: 'Create Template',
		path: '/estimates/templates/create',
		component: <CreateTemplatePage />
	},
	{
		name: 'Edit Template',
		path: '/estimates/templates/edit/:id',
		component: <CreateTemplatePage />
	},
	{
		name: 'Super Admin Dashboard',
		path: '/dashboard',
		component: <Dashboard />
	},
	{
		name: 'Roles',
		path: '/roles',
		component: <Roles />
	},
	{
		name: 'Users',
		path: '/users',
		component: <Users />
	},
	{
		name: 'Users',
		path: '/users/create',
		component: <UserCreateEdit />
	},
	{
		name: 'Users',
		path: '/users/edit/:id',
		component: <UserCreateEdit />
	},
	{
		name: 'Settings',
		path: '/settings',
		component: <Settings />
	},
	{
		name: 'Ring Central',
		path: '/ring-central',
		component: <RingCentral />
	},
	{
		name: 'Calendar',
		path: '/calendars',
		component: <Calendar />
	},
	{
		name: 'Trace',
		path: '/trace',
		component: <Trace />
	},
	{
		name: 'Crew',
		path: '/crew',
		component: <Crew />
	},
	{
		name: 'TimeLogs',
		path: '/time-logs',
		component: <TimeLogs />
	},
	{
		name: 'MyProfile',
		path: '/profile',
		component: <MyProfile />
	},
	{
		name: 'Marketing Report',
		path: '/marketing-report',
		component: <WebsiteData />
	},
	{
		name: 'Lead Cost',
		path: '/lead-cost',
		component: <LeadCost />
	},
	{
		name: 'Dummy Report',
		path: '/dummy-report',
		component: <DummyReport />
	},
];

export const authAdminRoutes = [
	{
		name: 'CRM',
		path: '/crm',
		component: <Crm />
	},
	{
		name: 'Estimates',
		path: '/estimates',
		component: <Estimates />
	},
	{
		name: 'Estimates Templates',
		path: '/estimates/templates',
		component: <EstimatesTemplatesPage />
	},
	{
		name: 'Create Template',
		path: '/estimates/templates/create',
		component: <CreateTemplatePage />
	},
	{
		name: 'Edit Template',
		path: '/estimates/templates/edit/:id',
		component: <CreateTemplatePage />
	},
	{
		name: 'Admin Dashboard',
		path: '/dashboard',
		component: <Dashboard />
	},
	{
		name: 'Roles',
		path: '/roles',
		component: <Roles />
	},
	{
		name: 'Users',
		path: '/users',
		component: <Users />
	},
	{
		name: 'Users',
		path: '/users/create',
		component: <UserCreateEdit />
	},
	{
		name: 'Users',
		path: '/users/edit/:id',
		component: <UserCreateEdit />
	},
	{
		name: 'Settings',
		path: '/settings',
		component: <Settings />
	},
	{
		name: 'Ring Central',
		path: '/ring-central',
		component: <RingCentral />
	},
	{
		name: 'Calendar',
		path: '/calendars',
		component: <Calendar />
	},
	{
		name: 'TimeLogs',
		path: '/time-logs',
		component: <TimeLogs />
	},
	{
		name: 'MyProfile',
		path: '/profile',
		component: <MyProfile />
	},
	{
		name: 'Marketing Report',
		path: '/marketing-report',
		component: <WebsiteData />
	},
	{
		name: 'Lead Cost',
		path: '/lead-cost',
		component: <LeadCost />
	},
	{
		name: 'Dummy Report',
		path: '/dummy-report',
		component: <DummyReport />
	},
];

export const authCrewRoutes = [
	{
		name: 'Admin Dashboard',
		path: '/dashboard',
		component: <Dashboard />
	},
	{
		name: 'Ring Central',
		path: '/ring-central',
		component: <RingCentral />
	},
	{
		name: 'Calendar',
		path: '/calendars',
		component: <Calendar />
	},
	{
		name: 'MyProfile',
		path: '/profile',
		component: <MyProfile />
	}
];

export const authOperationsRoutes = [
	{
		name: 'Admin Dashboard',
		path: '/dashboard',
		component: <Dashboard />
	},
	{
		name: 'MyProfile',
		path: '/profile',
		component: <MyProfile />
	}
];

export const authEstimatorRoutes = [
	{
		name: 'Estimates',
		path: '/estimates',
		component: <Estimates />
	},
	{
		name: 'Estimates Templates',
		path: '/estimates/templates',
		component: <EstimatesTemplatesPage />
	},
	{
		name: 'Create Template',
		path: '/estimates/templates/create',
		component: <CreateTemplatePage />
	},
	{
		name: 'Edit Template',
		path: '/estimates/templates/edit/:id',
		component: <CreateTemplatePage />
	},
	{
		name: 'Admin Dashboard',
		path: '/dashboard',
		component: <Dashboard />
	},
	{
		name: 'MyProfile',
		path: '/profile',
		component: <MyProfile />
	}
];
