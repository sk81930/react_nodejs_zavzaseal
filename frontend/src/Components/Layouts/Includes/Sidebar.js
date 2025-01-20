import React from 'react';
import { MDBSideNav, MDBSideNavNav, MDBNavLink } from '../../../mdb';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <MDBSideNav className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <button className="sidebar-toggle" onClick={toggleSidebar}>☰</button>
      </div>
      <MDBSideNavNav>
        <MDBNavLink to="#">Dashboard</MDBNavLink>
        <MDBNavLink to="#">Users</MDBNavLink>
        <MDBNavLink to="#">Settings</MDBNavLink>
        <MDBNavLink to="#">Reports</MDBNavLink>
        <MDBNavLink to="#">Logout</MDBNavLink>
      </MDBSideNavNav>
    </MDBSideNav>
  );
};

export default Sidebar;