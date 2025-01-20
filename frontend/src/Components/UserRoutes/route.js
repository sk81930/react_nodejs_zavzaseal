import Login from "../Views/Login";
import Dashboard from "../Views/Dashboard";
import Roles from "../Views/Roles";
import Users from "../Views/Users";
import UserCreateEdit from "../Views/Users/createEdit";
import Settings from "../Views/Settings";
import RingCentral from "../Views/RingCentral";
import Calendar from "../Views/Calendar";
import TimeLogs from "../Views/TimeLogs";
import MyProfile from "../Views/MyProfile";
export const baseRoutes = [
	{
		name: 'Home',
		path: '/',
		component: <Login />
	}
];

export const authSuperAdminRoutes = [
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
		path: '/ring-central-settings',
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
	}
];
export const authAdminRoutes = [
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
		path: '/ring-central-settings',
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
	}
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
