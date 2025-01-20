import React, { useEffect, useState, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Nav, Collapse } from 'react-bootstrap';
import { FaHome, FaCalendarAlt, FaCog, FaBox, FaRegUser} from 'react-icons/fa';
import { BsChevronDown, BsChevronUp, BsIntersect } from 'react-icons/bs';
import { MdOutlineSettings } from "react-icons/md";
import { GoLog } from "react-icons/go";
import { BiPhoneCall } from "react-icons/bi";
import Loader from "../Views/loader.js";
import usePageTitle from './usePageTitle';



import { TbLogs } from "react-icons/tb";
import { CiLogout } from "react-icons/ci";
import { MDBDropdown, MDBDropdownMenu, MDBDropdownToggle } from 'mdb-react-ui-kit';
import ProfileModal from './ProfileModal';

import { OPEN_PROFILE_MODAL, CLOSE_PROFILE_MODAL, LOADER_SHOW } from '../../constants/actionTypes';

import "./style.scss";

export const openProfileModal = (userId) => ({
  type: OPEN_PROFILE_MODAL,
  payload: {
    userId
  }
});
export const callLoaderShow = (type) => ({
  type: LOADER_SHOW,
  payload: {
    type
  }
});



const AuthLayout = ({ children }) => {

  usePageTitle();

  const dispatch = useDispatch();
  const profileModalOpen = useSelector((state) => state.auth.profileModalOpen);
  const loaderShow = useSelector((state) => state.auth.loaderShow);



  const [openSettings, setOpenSettings] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [openReport, setOpenReport] = useState(true);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const navigate_to = useNavigate();
  const location = useLocation(); // Hook to get the current path

  const [userRoles, setUserRoles] = useState([]);




  useEffect(() => {
    if (!currentUser) {
      navigate_to('/');
    }
  }, [currentUser, navigate_to]);

  useEffect(() => {
    const script2 = document.createElement('script');
    script2.src = '/assets/js/mdb/js/mdb.umd.min.js';
    script2.async = true;
    script2.id = 'mdb-umd';

    const script3 = document.createElement('script');
    script3.src = '/assets/js/mdb.js?ver=1.0';
    script3.async = true;
    script3.id = 'mdb-custom';

    if (!document.getElementById('mdb-umd')) {
      document.body.appendChild(script2);
    }

    script2.onload = () => {
      if (!document.getElementById('mdb-custom')) {
        document.body.appendChild(script3);
      }
    };

    return () => {
      if (document.getElementById('mdb-umd')) {
        document.body.removeChild(script2);
      }
      if (document.getElementById('mdb-custom')) {
        document.body.removeChild(script3);
      }
    };
  }, []);

  useEffect(() => {
      if (currentUser && currentUser.role) {

        const userRoles = currentUser.role.split(','); 

        setUserRoles(userRoles);
        
      }
    }, [currentUser]);



  // Function to check if the current route matches the link's path
  const isActive = (path) => location.pathname === path;

  return (
    <Fragment>

      {currentUser && (
        <Fragment>
          <div className="main">
            <header>
              <nav
                id="main-sidenav"
                data-mdb-sidenav-init
                className="sidenav sidenav-sm shadow-1"
                data-mdb-hidden="false"
                data-mdb-accordion="true"
              >
                <Link className="ripple d-flex  pt-4 pb-2 mx-3" to="#">
                  <img id="MDB-logo" src={require("../../assets/images/zavza-logo.png")} alt="MDB Logo" draggable="false" />
                </Link>
                <div className="d-flex align-items-center g-5 pt-3 pb-0 mx-3">
                  <div className="user_img ">
                    {(currentUser && currentUser.profile_image) ? (
                      <a href="#" onClick={() => dispatch(openProfileModal(currentUser.id))}>
                        <img 
                          src={process.env.REACT_APP_BACKEND+currentUser.profile_image} 
                          className="w-11 rounded-circle" alt="Profile" style={{ width: "40px", height: "40px", objectFit: "cover" }} />
                      </a>
                    ) : (
                      <span className="w-11 rounded-circle profile-image-span" onClick={() => dispatch(openProfileModal(currentUser.id))}>
                        <span>{currentUser.first_name ? currentUser.first_name[0].toUpperCase() : '?'}</span>
                      </span>
                    )}
                  </div>
                  <div className="user_text px-3">
                    <h6 className="text-sm mb-0">{`${currentUser.first_name} ${currentUser.last_name}`}</h6>
                  </div>
                </div>
                <hr className="hr" />
                <Nav className="flex-column" style={{ width: '100%', padding: '7px',  gap: "0px" }}>
                  <Nav.Link as={Link} to="/dashboard" style={{ color: '#656161' }} active={isActive('/dashboard')}>
                    <FaHome />
                    <span>Home</span>
                  </Nav.Link>
                  {(userRoles && (userRoles.includes("super_admin") || userRoles.includes("admin") || userRoles.includes("crew"))) && (
                    <Fragment>
                      <Nav.Link as={Link} to="/calendars" style={{ color: '#656161' }} active={isActive('/calendars')}>
                        <FaCalendarAlt />
                        <span>Calendar</span>
                      </Nav.Link>
                      <Fragment></Fragment>  
                    </Fragment>
                  )}
                  {(userRoles && (userRoles.includes("super_admin") || userRoles.includes("admin"))) && (
                    <Fragment>
                      <Nav.Link
                        href="#"
                        onClick={() => setOpenSettings(!openSettings)}
                        style={{ color: '#656161', display: 'flex', justifyContent: 'space-between' }}
                        active={isActive('/settings')}
                      >
                        <div>
                          <FaCog />
                          <span>Settings</span>
                        </div>
                        {openSettings ? <BsChevronUp /> : <BsChevronDown />}
                      </Nav.Link>
                      <Collapse in={openSettings}>
                        <div>
                          <Nav.Link as={Link} to="/roles" style={{ color: '#656161', paddingLeft: '38px' }} active={isActive('/roles')}>
                            <BsIntersect />
                            <span>Roles</span>
                          </Nav.Link>
                          <Nav.Link as={Link} to="/users" style={{ color: '#656161', paddingLeft: '38px' }} active={isActive('/users')}>
                            <FaRegUser />
                            <span>Users</span>
                          </Nav.Link>
                          <Nav.Link as={Link} to="/ring-central-settings" style={{ color: '#656161', paddingLeft: '38px' }} active={isActive('/ring-central-settings')}>
                            <MdOutlineSettings />
                            <span>Ring Central Settings</span>
                          </Nav.Link>
                          <Nav.Link as={Link} to="/time-logs" style={{ color: '#656161', paddingLeft: '38px' }} active={isActive('/time-logs')}>
                            <GoLog />
                            <span>Time Log</span>
                          </Nav.Link>
                        </div>
                      </Collapse>
                      <Fragment></Fragment>  
                    </Fragment>  
                  )}
                  {(userRoles && (userRoles.includes("super_admin") || userRoles.includes("admin"))) && (
                    <Fragment>  
                      <Nav.Link
                        href="#"
                        onClick={() => setOpenReport(!openReport)}
                        style={{ color: '#656161', display: 'flex', justifyContent: 'space-between' }}
                        active={isActive('/report')}
                      >
                        <div>
                          <FaBox />
                          <span>Report</span>
                        </div>
                        {openReport ? <BsChevronUp /> : <BsChevronDown />}
                      </Nav.Link>
                      <Collapse in={openReport}>
                        <div>
                          <Nav.Link as={Link} to="/ring-central" style={{ color: '#656161', paddingLeft: '38px' }} active={isActive('/ring-central')}>
                            <BiPhoneCall />
                            <span>Ring Central</span>
                          </Nav.Link>
                        </div>
                      </Collapse>
                    </Fragment>  
                  )}
                </Nav>
              </nav>
              <nav id="main-navbar" className="navbar navbar-expand-lg navbar-light bg-white fixed-top shadow-1">
                <div className="container-fluid">
                  <button
                    data-mdb-toggle="sidenav"
                    data-mdb-target="#main-sidenav"
                    className="btn shadow-0 p-0 me-3 sidenav-btn-cst"
                    aria-controls="#main-sidenav"
                    aria-haspopup="true"
                  >
                    <i className="fas fa-bars fa-lg"></i>
                  </button>
                  <form className="d-none d-md-flex input-group w-auto my-auto">
                    <input id="search-focus" type="search" className="form-control rounded" placeholder="Search" />
                    <span className="input-group-text border-0">
                      <i className="fas fa-search text-secondary"></i>
                    </span>
                  </form>
                  <MDBDropdown>
                    <MDBDropdownToggle
                      tag="button"
                      className="btn btn-link p-0 profile-top"
                      style={{ borderRadius: "50%" }}
                    >
                      <a href="#">
                        {(currentUser && currentUser.profile_image) ? (
                          <img
                            src={(currentUser && currentUser.profile_image) ? process.env.REACT_APP_BACKEND+currentUser.profile_image : 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar.jpg'}
                            className="rounded-circle"
                            alt="Profile"
                            style={{ width: "40px", height: "40px", objectFit: "cover" }}
                          />
                        ) : (
                          <span className="w-11 rounded-circle profile-image-span">
                            <span>{currentUser.first_name ? currentUser.first_name[0].toUpperCase() : '?'}</span>
                          </span>
                        )}
                      </a>
                    </MDBDropdownToggle>
                    <MDBDropdownMenu>
                      <Link
                        to="/profile"
                        className="dropdown-item"
                        style={{ textDecoration: "none" }}
                      >
                        <FaRegUser className="me-2" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/ring-central-settings"
                        className="dropdown-item"
                        style={{ textDecoration: "none" }}
                      >
                        <MdOutlineSettings className="me-2" />
                        <span>Settings</span>
                      </Link>
                      <Link
                        to="/logout"
                        className="dropdown-item"
                        style={{ textDecoration: "none" }}
                      >
                        <CiLogout className="me-2" />
                        <span>Logout</span>
                      </Link>
                    </MDBDropdownMenu>
                  </MDBDropdown>
                </div>
              </nav>
            </header>
            <main className="mb-5" style={{ marginTop: "90px" }}>
              <div className="container">
                {children}
              </div>
            </main>
          </div>
        </Fragment>
      )}
      {(profileModalOpen) && (<ProfileModal />)}
      {(loaderShow) && (<Loader />)}
      
    </Fragment>
  );
};

export default AuthLayout;
