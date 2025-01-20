import React from 'react';
import { MDBNavbar, MDBNavbarBrand, MDBNavbarNav, MDBNavItem, MDBNavLink } from '../../../mdb';

const Header = ({ toggleSidebar }) => {
  return (
    <MDBNavbar light bgColor="primary">
      <MDBNavbarBrand>
        Admin Dashboard
      </MDBNavbarBrand>
      <MDBNavbarNav className="ms-auto">
        <MDBNavItem>
          <MDBNavLink onClick={toggleSidebar}>☰</MDBNavLink>
        </MDBNavItem>
      </MDBNavbarNav>
    </MDBNavbar>
  );
};

export default Header;
