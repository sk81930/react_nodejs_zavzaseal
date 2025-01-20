import React, { Fragment, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MDBContainer, MDBCard, MDBCardBody, MDBCardHeader, MDBInput, MDBBtn } from 'mdb-react-ui-kit';
import agent from '../../../agent';
import {} from '../../../constants/actionTypes';
import DataTable from 'react-data-table-component';

import WorkingLogsModal from './WorkingLogsModal';

import { FaEye } from "react-icons/fa";


const mapStateToProps = (state) => ({
  ...state,
});

const mapDispatchToProps = (dispatch) => ({});

const TimeLogs = (props) => {

  const {} = props;

  let navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);

  const [isOpen, setIsOpen] = useState(false);
  const [onHide, setOnHide] = useState(false);
  const [logsUserId, setLogsUserId] = useState(null);


  const getTimeLogs = async (currentPage,perPage,searchText) => {
    setLoading(true);
    try {
      
      const Response = await agent.Auth.getTimeLogs(currentPage,perPage,searchText);
      setLoading(false);

      if (Response && Response.data && Response.data.pagination && Response.data.timeLogs && Response.data.timeLogs.length > 0) {

        const {timeLogs, pagination} = Response.data;

        const rows = timeLogs.map((item) => ({
          user_id: item.user_id,
          first_name: item.first_name,
          last_name: item.last_name,
          email: item.email
        }));
        setTotalRows(pagination.totalCount);
        setData(rows);
      } else {
        setData([]);
      }
    } catch (error) {
      setLoading(false);
      console.log(error.message);
      setData([]);
    }
  };

  useEffect(() => {
   
  }, []);

  useEffect(() => {
      getTimeLogs(currentPage,perPage,searchText);
  }, [currentPage, perPage, searchText]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page);
  };

 

  const handleShowLog = (row) => {
    setIsOpen(true);
    setLogsUserId(row.user_id);
  };

  const columns = [
    {
      name: 'First Name',
      selector: (row) => row.first_name,
      sortable: true,
    },
    {
      name: 'Last Name',
      selector: (row) => row.last_name,
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
            <Fragment>
              <button
                className="btn btn-primary btn-sm"
                style={{ marginRight: '10px', background: '#2497cb' }}
                onClick={() => handleShowLog(row)}
              >
                <FaEye />
              </button>
            </Fragment>
        </Fragment>
      ),
    },
  ];

  return (
    <Fragment>
      <WorkingLogsModal isOpen={isOpen} setIsOpen={setIsOpen} onHide={onHide} setOnHide={setOnHide} logsUserId={logsUserId} />
      <MDBContainer>
        <MDBCard className="mt-4">
          <MDBCardHeader>
            <h3>Time Logs</h3>
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
              <div>No Time logs found</div>
            )}
          </MDBCardBody>
        </MDBCard>
      </MDBContainer>
    </Fragment>  
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(TimeLogs);
