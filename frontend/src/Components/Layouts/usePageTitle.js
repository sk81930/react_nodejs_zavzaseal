import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

const usePageTitle = () => {
  const location = useLocation(); 
  const params = useParams(); 

  useEffect(() => {
    const routeTitles = {
      '/dashboard': 'Dashboard',
      '/calendars': 'Calendar',
      '/roles': 'Roles',
      '/users': 'Users',
      '/ring-central-settings': 'Ring Central Settings',
      '/time-logs': 'Time Logs',
      '/profile': 'My Profile',
      '/ring-central': 'Ring Central',
    };

    let currentTitle = routeTitles[location.pathname] || 'Zavzaseal'; 

    if (location.pathname.startsWith('/users/edit')) {
      currentTitle = `Edit User - ${params.id}`; 
    }else if (location.pathname.startsWith('/users/create')) {
      currentTitle = `Create User`; 
    }


    document.title = currentTitle;
  }, [location, params]); 
};

export default usePageTitle;
