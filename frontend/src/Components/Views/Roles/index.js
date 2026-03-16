import React, { Fragment, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { MDBContainer, MDBCard, MDBCardBody, MDBCardHeader, MDBInput, MDBBtn, MDBRow, MDBCol } from 'mdb-react-ui-kit';

import agent from '../../../agent';
import { ROLES } from '../../../constants/actionTypes';

import DataTable from 'react-data-table-component';

const mapStateToProps = (state) => ({
  ...state,
  loginData: state.auth.loginData,
  rolesData: state.auth.rolesData,
});

const mapDispatchToProps = (dispatch) => ({
  getRoles: (pageNumber, pageSize, search) => {
    dispatch({ type: ROLES, payload: agent.Auth.getRoles(pageNumber, pageSize, search) });
  },
});
const Roles = (props) => {
  const { getRoles, rolesData } = props;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    if (rolesData && rolesData.pagination) {
      const rows = rolesData.roles.map((item) => ({
        id: item.id,
        name: item.name,
      }));
      
      setTotalRows(rolesData.pagination.totalCount);
      setData(rows);
      setLoading(false);
    }
  }, [rolesData]);

  useEffect(() => {
    setLoading(true);
    getRoles(currentPage, perPage, searchText);
  }, [currentPage, perPage, searchText, getRoles]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page);
  };

  const handleEdit = (row) => {
    console.log("Editing row", row);
  };

  const handleDelete = (row) => {
    console.log("Deleting row", row);
  };

  const handleSelectAll = (state) => {
    if (state.selectedCount === data.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data.map(row => row.id));
    }
  };

  const handleRowSelect = (state) => {
    setSelectedRows(state.selectedRows.map(row => row.id));
  };

  const columns = [
    {
      name: 'ID',
      selector: (row) => row.id,
      sortable: true,
    },
    {
      name: 'Name',
      selector: (row) => row.name,
      sortable: true,
    }
  ];

  return (
    <MDBContainer>
      <MDBCard className="roles_maincard mt-4">
        <MDBCardHeader>
          <h3>Roles</h3>
        </MDBCardHeader>
        <MDBCardBody>
          {(data && data.length > 0) ? (
              <DataTable
                columns={columns}
                data={data}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                onChangePage={handlePageChange}
                onChangeRowsPerPage={handlePerPageChange}
                progressPending={loading}
                highlightOnHover
                pointerOnHover
                subHeader
                subHeaderComponent={
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{
                      width: '200px',
                      padding: '8px',
                      marginBottom: '10px',
                      marginRight: '20px',
                    }}
                  />
                }
              />
          ) : '' }    
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
};


export default connect(mapStateToProps, mapDispatchToProps)(Roles);