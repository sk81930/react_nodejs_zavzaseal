import React, { Fragment, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MDBContainer, MDBCard, MDBCardBody, MDBCardHeader, MDBInput, MDBBtn, MDBRow, MDBCol } from  '../../../mdb';
import {  MDBTextArea } from 'mdb-react-ui-kit';
import agent from '../../../agent';
import { SETTINGS, SAVE_SETTINGS, CLEAR_FLASH_MESSAGE } from '../../../constants/actionTypes';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2'; // For the confirmation dialog

const mapStateToProps = (state) => ({
  ...state,
  SettingData: state.auth.getSettings,
  settingSaveSuccess: state.auth.settingSaveSuccess,
  settingSaveError: state.auth.settingSaveError,
});

const mapDispatchToProps = (dispatch) => ({
  submitForm: (values) => {
      dispatch({ type: SAVE_SETTINGS, payload: agent.Auth.saveSettings(values) });
  },
  getSettings: (values) => {
      dispatch({ type: SETTINGS, payload: agent.Auth.getSettings(values) });
  },
  clearFlash: () => {
    dispatch({ type: CLEAR_FLASH_MESSAGE });
  },
});

const Settings = (props) => {
  const { getSettings, clearFlash, submitForm, SettingData, settingSaveSuccess,settingSaveError} = props;

  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [formData, setFormData] = useState({
    client_id: '',
    secret_id: '',
    ringcentral_url: '',
    jwt_token: '',
    days_count: ''
  });


  const handleSubmit = (e) => {
    clearFlash();

    e.preventDefault();

    const formDataNew = new FormData();
    formDataNew.append("settings[client_id]", formData.client_id);
    formDataNew.append("settings[secret_id]", formData.secret_id);
    formDataNew.append("settings[ringcentral_url]", formData.ringcentral_url);
    formDataNew.append("settings[jwt_token]", formData.jwt_token);
    formDataNew.append("settings[days_count]", formData.days_count);
       
    submitForm(formDataNew);

  }
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  useEffect(() => {
    getSettings();
  }, []);

  useEffect(() => {
    if (settingSaveError) {
      setErrorMsg(settingSaveError);
      clearFlash();
    }
  }, [settingSaveError]);

  useEffect(() => {
    if (settingSaveSuccess) {
      setSuccessMsg(settingSaveSuccess);
      clearFlash();
    }
  }, [settingSaveSuccess]);

  useEffect(() => {
    if(SettingData){
      setFormData({
        client_id: (SettingData.client_id)?SettingData.client_id:'',
        secret_id: (SettingData.secret_id)?SettingData.secret_id:'',
        ringcentral_url: (SettingData.ringcentral_url)?SettingData.ringcentral_url:'',
        jwt_token: (SettingData.jwt_token)?SettingData.jwt_token:'',
        days_count: (SettingData.days_count)?SettingData.days_count:'',
      })
    }
  }, [SettingData]);

  return (
    <MDBContainer className="mt-5 create_user">
      <MDBCard>
        <MDBCardHeader>
          <h4>Ring Central Settings</h4>
        </MDBCardHeader>
        <MDBCardBody>
          <form onSubmit={handleSubmit}>
            {errorMsg ? 
                <div className="alert alert-danger" role="alert">{errorMsg}</div>
            : <Fragment /> }
            {successMsg ? 
              <div className="alert alert-success" role="alert">{successMsg}</div>
            : <Fragment /> }
            <MDBRow className="g-4 mb-4" encType="multipart/form-data">
              <MDBCol md="12">
                <div className="form-group">
                  <label htmlFor="client_id">Client ID</label>
                  <MDBInput
                    name="client_id"
                    type="text"
                    value={formData.client_id}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
              </MDBCol>
              <MDBCol md="12">
                <div className="form-group">
                  <label htmlFor="secret_id">Secret ID</label>
                  <MDBInput
                    name="secret_id"
                    type="text"
                    value={formData.secret_id}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
              </MDBCol>

              <MDBCol md="12">
                <div className="form-group">
                  <label htmlFor="ringcentral_url">Ring Central Url</label>
                  <MDBInput
                    name="ringcentral_url"
                    type="text"
                    value={formData.ringcentral_url}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
              </MDBCol>

              <MDBCol md="12">
                <div className="form-group">
                  <label htmlFor="jwt_token">JWT Token</label>
                  <MDBTextArea
                    name="jwt_token"
                    value={formData.jwt_token}
                    onChange={handleChange}
                    rows={4}
                    className="form-control"
                  />
                </div>
              </MDBCol>

              <MDBCol md="12">
                <div className="form-group">
                  <label htmlFor="days_count">Days</label>
                  <MDBInput
                    name="days_count"
                    type="number"
                    value={formData.days_count}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
              </MDBCol>
            </MDBRow>
            <MDBCol md="12" className="d-flex gap-4">
              <MDBBtn type="submit" color="primary" className="w-20">Submit</MDBBtn>
            </MDBCol>
          </form>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
