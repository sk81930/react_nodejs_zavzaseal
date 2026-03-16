import React, { Fragment, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MDBContainer, MDBCard, MDBCardBody, MDBCardHeader, MDBInput, MDBBtn, MDBRow, MDBCol, MDBTextArea, MDBTabs, MDBTabsItem, MDBTabsLink, MDBTabsContent } from  'mdb-react-ui-kit';
import agent from '../../../agent';
import { SETTINGS, SAVE_SETTINGS, CLEAR_FLASH_MESSAGE, LOADER_SHOW } from '../../../constants/actionTypes';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2'; // For the confirmation dialog
import "./settings.scss";
const mapStateToProps = (state) => ({
  ...state,
  settingSaveSuccess: state.auth.settingSaveSuccess,
  settingSaveError: state.auth.settingSaveError,
});

const mapDispatchToProps = (dispatch) => ({
  submitForm: (values) => {
      dispatch({ type: SAVE_SETTINGS, payload: agent.Auth.saveSettings(values) });
  },
  getSettings: async (setSettingData, setErrorMsg, callLoaderShow) => {

      callLoaderShow(true);

      try {

        const getSettingsData = await agent.Auth.getSettings();

        callLoaderShow(false);

        if(getSettingsData && getSettingsData.data && getSettingsData.data.settings){

          setSettingData(getSettingsData.data.settings);

        }else{

          setSettingData(null);

        }

      } catch (error) {
         callLoaderShow(false);
         setErrorMsg(error.message);
         setSettingData(null);
      }

      
      //dispatch({ type: SETTINGS, payload: agent.Auth.getSettings(values) });
  },
  clearFlash: () => {
    dispatch({ type: CLEAR_FLASH_MESSAGE });
  },
  callLoaderShow: (type) => {
    dispatch({ type: LOADER_SHOW, payload: { type } });
  },
});

const Settings = (props) => {
  const { getSettings, clearFlash, submitForm, settingSaveSuccess,settingSaveError, callLoaderShow} = props;

  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [xeroErrorMsg, setXeroErrorMsg] = useState(null);
  const [xeroSuccessMsg, setXeroSuccessMsg] = useState(null);
  const [SettingData, setSettingData] = useState(null);

  const [formData, setFormData] = useState({
    client_id: '',
    secret_id: '',
    ringcentral_url: '',
    jwt_token: '',
    days_count: ''
  });

  const [xeroFormData, setXeroFormData] = useState({
    xero_client_id: '',
    xero_client_secret: '',
    xero_redirect_uri: ''
  });

  // SMTP state
  const [activeSmtpTab, setActiveSmtpTab] = useState('general');
  const [smtpFormData, setSmtpFormData] = useState({
    smtp_host: '',
    smtp_port: '',
    smtp_secure: '', // none | ssl | tls
    smtp_from_email: '',
    smtp_username: '',
    smtp_password: ''
  });
  const [smtpGeneralMsg, setSmtpGeneralMsg] = useState(null);
  const [smtpGeneralErr, setSmtpGeneralErr] = useState(null);

  const [smtpEstimatesFormData, setSmtpEstimatesFormData] = useState({
    estimates_smtp_host: '',
    estimates_smtp_port: '',
    estimates_smtp_secure: '', // none | ssl | tls
    estimates_smtp_from_email: '',
    estimates_smtp_username: '',
    estimates_smtp_password: ''
  });
  const [smtpEstimatesMsg, setSmtpEstimatesMsg] = useState(null);
  const [smtpEstimatesErr, setSmtpEstimatesErr] = useState(null);

  const handleSmtpTabClick = (tab) => (e) => {
    e.preventDefault();
    if (activeSmtpTab !== tab) setActiveSmtpTab(tab);
  };


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
  const handleSmtpChange = (e) => {
    const { name, value } = e.target;
    setSmtpFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSmtpEstimatesChange = (e) => {
    const { name, value } = e.target;
    setSmtpEstimatesFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSmtpSubmit = (e) => {
    e.preventDefault();
    clearFlash();
    setSmtpGeneralErr(null);
    setSmtpGeneralMsg(null);

    const formDataNew = new FormData();
    formDataNew.append('settings[smtp_host]', smtpFormData.smtp_host);
    formDataNew.append('settings[smtp_port]', smtpFormData.smtp_port);
    formDataNew.append('settings[smtp_secure]', smtpFormData.smtp_secure);
    formDataNew.append('settings[smtp_from_email]', smtpFormData.smtp_from_email);
    formDataNew.append('settings[smtp_username]', smtpFormData.smtp_username);
    formDataNew.append('settings[smtp_password]', smtpFormData.smtp_password);

    submitForm(formDataNew);
    setSmtpGeneralMsg('SMTP (General) Settings Saved Successfully!');
  };

  const handleSmtpEstimatesSubmit = (e) => {
    e.preventDefault();
    clearFlash();
    setSmtpEstimatesErr(null);
    setSmtpEstimatesMsg(null);

    const formDataNew = new FormData();
    formDataNew.append('settings[estimates_smtp_host]', smtpEstimatesFormData.estimates_smtp_host);
    formDataNew.append('settings[estimates_smtp_port]', smtpEstimatesFormData.estimates_smtp_port);
    formDataNew.append('settings[estimates_smtp_secure]', smtpEstimatesFormData.estimates_smtp_secure);
    formDataNew.append('settings[estimates_smtp_from_email]', smtpEstimatesFormData.estimates_smtp_from_email);
    formDataNew.append('settings[estimates_smtp_username]', smtpEstimatesFormData.estimates_smtp_username);
    formDataNew.append('settings[estimates_smtp_password]', smtpEstimatesFormData.estimates_smtp_password);

    submitForm(formDataNew);
    setSmtpEstimatesMsg('SMTP (Estimates) Settings Saved Successfully!');
  };

  const handleXeroSubmit = (e) => {
    clearFlash();
    setXeroErrorMsg(null);
    setXeroSuccessMsg(null);

    e.preventDefault();

    const formDataNew = new FormData();
    formDataNew.append("settings[xero_client_id]", xeroFormData.xero_client_id);
    formDataNew.append("settings[xero_client_secret]", xeroFormData.xero_client_secret);
    formDataNew.append("settings[xero_redirect_uri]", xeroFormData.xero_redirect_uri);
       
    submitForm(formDataNew);

    // Show success message for Xero settings
    setXeroSuccessMsg("Xero Settings Saved Successfully!");

  }
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleXeroChange = (e) => {
    const { name, value } = e.target;
    setXeroFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  useEffect(() => {
    getSettings(setSettingData, setErrorMsg, callLoaderShow);
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

  // For now, we'll simulate Xero success message
  // You can replace this with actual API response handling
  useEffect(() => {
    if (settingSaveSuccess && settingSaveSuccess.includes('xero')) {
      setXeroSuccessMsg("Xero Settings Saved Successfully!");
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
      });

      setXeroFormData({
        xero_client_id: (SettingData.xero_client_id)?SettingData.xero_client_id:'',
        xero_client_secret: (SettingData.xero_client_secret)?SettingData.xero_client_secret:'',
        xero_redirect_uri: (SettingData.xero_redirect_uri)?SettingData.xero_redirect_uri:'',
      });

      setSmtpFormData({
        smtp_host: (SettingData.smtp_host)?SettingData.smtp_host:'',
        smtp_port: (SettingData.smtp_port)?SettingData.smtp_port:'',
        smtp_secure: (SettingData.smtp_secure)?SettingData.smtp_secure:'',
        smtp_from_email: (SettingData.smtp_from_email)?SettingData.smtp_from_email:'',
        smtp_username: (SettingData.smtp_username)?SettingData.smtp_username:'',
        smtp_password: (SettingData.smtp_password)?SettingData.smtp_password:'',
      });

      setSmtpEstimatesFormData({
        estimates_smtp_host: (SettingData.estimates_smtp_host)?SettingData.estimates_smtp_host:'',
        estimates_smtp_port: (SettingData.estimates_smtp_port)?SettingData.estimates_smtp_port:'',
        estimates_smtp_secure: (SettingData.estimates_smtp_secure)?SettingData.estimates_smtp_secure:'',
        estimates_smtp_from_email: (SettingData.estimates_smtp_from_email)?SettingData.estimates_smtp_from_email:'',
        estimates_smtp_username: (SettingData.estimates_smtp_username)?SettingData.estimates_smtp_username:'',
        estimates_smtp_password: (SettingData.estimates_smtp_password)?SettingData.estimates_smtp_password:'',
      });
    }
  }, [SettingData]);

  return (
    <MDBContainer className="mt-5 create_user setting_wrap roles_maincard">
      {/* Ring Central Settings Card */}
      <MDBCard className="mb-4">
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
              <MDBBtn type="submit" color="primary" className="w-20">Save Ring Central Settings</MDBBtn>
            </MDBCol>
          </form>
        </MDBCardBody>
      </MDBCard>

      {/* Xero Settings Card */}
      <MDBCard>
        <MDBCardHeader>
          <h4>Xero Settings</h4>
        </MDBCardHeader>
        <MDBCardBody>
          <form onSubmit={handleXeroSubmit}>
            {xeroErrorMsg ? 
                <div className="alert alert-danger" role="alert">{xeroErrorMsg}</div>
            : <Fragment /> }
            {xeroSuccessMsg ? 
              <div className="alert alert-success" role="alert">{xeroSuccessMsg}</div>
            : <Fragment /> }
            <MDBRow className="g-4 mb-4" encType="multipart/form-data">
              <MDBCol md="12">
                <div className="form-group">
                  <label htmlFor="xero_client_id">Xero Client ID</label>
                  <MDBInput
                    name="xero_client_id"
                    type="text"
                    value={xeroFormData.xero_client_id}
                    onChange={handleXeroChange}
                    required
                    className="form-control"
                  />
                </div>
              </MDBCol>
              <MDBCol md="12">
                <div className="form-group">
                  <label htmlFor="xero_client_secret">Xero Client Secret</label>
                  <MDBInput
                    name="xero_client_secret"
                    type="text"
                    value={xeroFormData.xero_client_secret}
                    onChange={handleXeroChange}
                    required
                    className="form-control"
                  />
                </div>
              </MDBCol>

              <MDBCol md="12">
                <div className="form-group">
                  <label htmlFor="xero_redirect_uri">Xero Redirect URI</label>
                  <MDBInput
                    name="xero_redirect_uri"
                    type="text"
                    value={xeroFormData.xero_redirect_uri}
                    onChange={handleXeroChange}
                    required
                    className="form-control"
                  />
                </div>
              </MDBCol>
            </MDBRow>
            <MDBCol md="12" className="d-flex gap-4">
              <MDBBtn type="submit" color="primary" className="w-20">Save Xero Settings</MDBBtn>
            </MDBCol>
          </form>
        </MDBCardBody>
      </MDBCard>

      {/* SMTP Settings Card with Tabs */}
      <MDBCard className="mt-4">
        <MDBCardHeader>
          <h4>SMTP Settings</h4>
        </MDBCardHeader>
        <MDBCardBody>
          <MDBTabs className="mb-3">
            <MDBTabsItem>
              <MDBTabsLink onClick={handleSmtpTabClick('general')} active={activeSmtpTab === 'general'}>
                General SMTP Options
              </MDBTabsLink>
            </MDBTabsItem>
            <MDBTabsItem>
              <MDBTabsLink onClick={handleSmtpTabClick('estimates')} active={activeSmtpTab === 'estimates'}>
                Estimates SMTP Options
              </MDBTabsLink>
            </MDBTabsItem>
          </MDBTabs>

          <MDBTabsContent>
            {activeSmtpTab === 'general' && (
            <div className="tab-pane show active">
              <form onSubmit={handleSmtpSubmit}>
                {smtpGeneralErr ? 
                  <div className="alert alert-danger" role="alert">{smtpGeneralErr}</div>
                : <Fragment /> }
                {smtpGeneralMsg ? 
                  <div className="alert alert-success" role="alert">{smtpGeneralMsg}</div>
                : <Fragment /> }

                <MDBRow className="g-4 mb-4" encType="multipart/form-data">
                  <MDBCol md="12">
                    <div className="form-group">
                      <label htmlFor="smtp_host">SMTP Host</label>
                      <MDBInput
                        name="smtp_host"
                        type="text"
                        value={smtpFormData.smtp_host}
                        onChange={handleSmtpChange}
                        required
                        className="form-control"
                      />
                    </div>
                  </MDBCol>
                  <MDBCol md="12">
                    <div className="form-group">
                      <label htmlFor="smtp_port">SMTP Port</label>
                      <MDBInput
                        name="smtp_port"
                        type="number"
                        value={smtpFormData.smtp_port}
                        onChange={handleSmtpChange}
                        required
                        className="form-control"
                      />
                    </div>
                  </MDBCol>
                  <MDBCol md="12">
                    <div className="form-group">
                      <label htmlFor="smtp_secure">Security (none/ssl/tls)</label>
                      <MDBInput
                        name="smtp_secure"
                        type="text"
                        value={smtpFormData.smtp_secure}
                        onChange={handleSmtpChange}
                        className="form-control"
                      />
                    </div>
                  </MDBCol>
                  <MDBCol md="12">
                    <div className="form-group">
                      <label htmlFor="smtp_from_email">From Email</label>
                      <MDBInput
                        name="smtp_from_email"
                        type="email"
                        value={smtpFormData.smtp_from_email}
                        onChange={handleSmtpChange}
                        required
                        className="form-control"
                      />
                    </div>
                  </MDBCol>
                  <MDBCol md="12">
                    <div className="form-group">
                      <label htmlFor="smtp_username">Email / Username</label>
                      <MDBInput
                        name="smtp_username"
                        type="text"
                        value={smtpFormData.smtp_username}
                        onChange={handleSmtpChange}
                        required
                        className="form-control"
                      />
                    </div>
                  </MDBCol>
                  <MDBCol md="12">
                    <div className="form-group">
                      <label htmlFor="smtp_password">Password</label>
                      <MDBInput
                        name="smtp_password"
                        type="password"
                        value={smtpFormData.smtp_password}
                        onChange={handleSmtpChange}
                        required
                        className="form-control"
                      />
                    </div>
                  </MDBCol>
                </MDBRow>
                <MDBCol md="12" className="d-flex gap-4">
                  <MDBBtn type="submit" color="primary" className="w-20">Save General SMTP</MDBBtn>
                </MDBCol>
              </form>
            </div>
            )}

            {activeSmtpTab === 'estimates' && (
            <div className="tab-pane show active">
              <form onSubmit={handleSmtpEstimatesSubmit}>
                {smtpEstimatesErr ? 
                  <div className="alert alert-danger" role="alert">{smtpEstimatesErr}</div>
                : <Fragment /> }
                {smtpEstimatesMsg ? 
                  <div className="alert alert-success" role="alert">{smtpEstimatesMsg}</div>
                : <Fragment /> }

                <MDBRow className="g-4 mb-4" encType="multipart/form-data">
                  <MDBCol md="12">
                    <div className="form-group">
                      <label htmlFor="estimates_smtp_host">SMTP Host</label>
                      <MDBInput
                        name="estimates_smtp_host"
                        type="text"
                        value={smtpEstimatesFormData.estimates_smtp_host}
                        onChange={handleSmtpEstimatesChange}
                        required
                        className="form-control"
                      />
                    </div>
                  </MDBCol>
                  <MDBCol md="12">
                    <div className="form-group">
                      <label htmlFor="estimates_smtp_port">SMTP Port</label>
                      <MDBInput
                        name="estimates_smtp_port"
                        type="number"
                        value={smtpEstimatesFormData.estimates_smtp_port}
                        onChange={handleSmtpEstimatesChange}
                        required
                        className="form-control"
                      />
                    </div>
                  </MDBCol>
                  <MDBCol md="12">
                    <div className="form-group">
                      <label htmlFor="estimates_smtp_secure">Security (none/ssl/tls)</label>
                      <MDBInput
                        name="estimates_smtp_secure"
                        type="text"
                        value={smtpEstimatesFormData.estimates_smtp_secure}
                        onChange={handleSmtpEstimatesChange}
                        className="form-control"
                      />
                    </div>
                  </MDBCol>
                  <MDBCol md="12">
                    <div className="form-group">
                      <label htmlFor="estimates_smtp_from_email">From Email</label>
                      <MDBInput
                        name="estimates_smtp_from_email"
                        type="email"
                        value={smtpEstimatesFormData.estimates_smtp_from_email}
                        onChange={handleSmtpEstimatesChange}
                        required
                        className="form-control"
                      />
                    </div>
                  </MDBCol>
                  <MDBCol md="12">
                    <div className="form-group">
                      <label htmlFor="estimates_smtp_username">Email / Username</label>
                      <MDBInput
                        name="estimates_smtp_username"
                        type="text"
                        value={smtpEstimatesFormData.estimates_smtp_username}
                        onChange={handleSmtpEstimatesChange}
                        required
                        className="form-control"
                      />
                    </div>
                  </MDBCol>
                  <MDBCol md="12">
                    <div className="form-group">
                      <label htmlFor="estimates_smtp_password">Password</label>
                      <MDBInput
                        name="estimates_smtp_password"
                        type="password"
                        value={smtpEstimatesFormData.estimates_smtp_password}
                        onChange={handleSmtpEstimatesChange}
                        required
                        className="form-control"
                      />
                    </div>
                  </MDBCol>
                </MDBRow>
                <MDBCol md="12" className="d-flex gap-4">
                  <MDBBtn type="submit" color="primary" className="w-20">Save Estimates SMTP</MDBBtn>
                </MDBCol>
              </form>
            </div>
            )}
          </MDBTabsContent>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
