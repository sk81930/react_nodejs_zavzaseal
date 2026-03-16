import React, { Fragment, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MDBContainer, MDBCard, MDBCardBody, MDBCardHeader, MDBInput, MDBBtn } from 'mdb-react-ui-kit';
import agent from '../../../agent';
import { USERS, DELETE_USER, CLEAR_FLASH_MESSAGE } from '../../../constants/actionTypes';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2'; // For the confirmation dialog

const mapStateToProps = (state) => ({
  ...state,
  usersData: state.auth.usersData,
  userDeleteSuccess: state.auth.userDeleteSuccess,
  userDeleteError: state.auth.userDeleteError,
});

const mapDispatchToProps = (dispatch) => ({
  getUsers: (pageNumber, pageSize, search) => {
    dispatch({ type: USERS, payload: agent.Auth.getUsers(pageNumber, pageSize, search) });
  },
  deleteUser: (id) => {
    dispatch({ type: DELETE_USER, payload: agent.Auth.deleteUserById(id) });
  },
  clearFlash: () => {
    dispatch({ type: CLEAR_FLASH_MESSAGE });
  },
});

const Users = (props) => {
  const { getUsers, usersData,deleteUser,userDeleteSuccess,clearFlash, userDeleteError} = props;

  let navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    if (usersData && usersData.pagination) {
      const rows = usersData.users.map((item) => ({
        id: item.id,
        name: item.first_name + " " + item.last_name,
        role: item.role,
        email: item.email
      }));
      setTotalRows(usersData.pagination.totalCount);
      setData(rows);
      setLoading(false);
    }
  }, [usersData]);

  useEffect(() => {
    setLoading(true);
    getUsers(currentPage, perPage, searchText);
  }, [currentPage, perPage, searchText, getUsers]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page);
  };

  const handleEdit = (row) => {
    navigate("/users/edit/" + row.id);
  };

  useEffect(() => {
    if(userDeleteSuccess){
      setLoading(true);
      getUsers(currentPage, perPage, searchText);
      clearFlash();
      Swal.fire(
          'Deleted!',
          `${userDeleteSuccess}`,
          'success'
        );
    }
  }, [userDeleteSuccess, currentPage, perPage, searchText]);

  useEffect(() => {
    if(userDeleteError){
      setLoading(true);
      getUsers(currentPage, perPage, searchText);
      clearFlash();
      Swal.fire(
          'Error!',
          `${userDeleteError}`,
          'error'
        );
    }
  }, [userDeleteError, currentPage, perPage, searchText]);

  const handleDelete = (row) => {
    // Display a confirmation dialog before deletion
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete the user: ${row.name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUser(row.id);
        
      }
    });
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

  const handleAddUser = () => {
    navigate("/users/create");
  };

  const columns = [
    {
      name: 'Name',
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: 'Roles',
      selector: (row) => row.role,
      sortable: true,
    },
    {
      name: 'Email',
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: 'Action',
      cell: (row) => (
        <Fragment>
          {(row.role && row.role !== "super_admin") ? (
            <Fragment>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleEdit(row)}
                style={{ marginRight: '10px', background: '#2497cb' }}
              >
                Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(row)}
              >
                Delete
              </button>
            </Fragment>
          ) : ''}
        </Fragment>
      ),
    },
  ];

  return (
    <MDBContainer>
      <MDBCard className="roles_maincard users_maincard mt-4">
        <MDBCardHeader>
          <h3>Users</h3>
          <MDBBtn
            color="success"
            floating
            size="sm"
            onClick={handleAddUser}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              zIndex: 11,
              background: '#2497cb'
            }}
          >
            <i className="fa fa-plus"></i>
          </MDBBtn>
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
          ) : (
            <div>No users found</div>
          )}
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Users);
