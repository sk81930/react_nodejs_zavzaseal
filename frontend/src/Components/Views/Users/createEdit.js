import React, { Fragment, useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';

import { MDBContainer, MDBCard, MDBCardBody, MDBCardHeader, MDBInput, MDBBtn, MDBRow, MDBCol, MDBSelect, MDBSelectInput, MDBSelectOption, MDBTextArea } from 'mdb-react-ui-kit';
import { useNavigate, useParams, Link} from 'react-router-dom';
import agent from '../../../agent';
import { useDropzone } from 'react-dropzone';
import Select from 'react-select'; // For react-select multi-select

import "./users.scss";

import { USERS, GET_USER_BY_ID, CREATE_USER, ROLES, CLEAR_FLASH_MESSAGE, LOADER_SHOW } from '../../../constants/actionTypes';

const mapStateToProps = (state) => ({
  ...state,
  editUserData: state.auth.editUserData,
  editUserDataError: state.auth.editUserDataError,
  rolesData: state.auth.rolesData,
  flashError: state.auth.flashError,
  flashSuccess: state.auth.flashSuccess,
});

const mapDispatchToProps = (dispatch) => ({
  submitForm: (values) => {
      dispatch({ type: CREATE_USER, payload: agent.Auth.createUser(values) });
  },
  getUsers: (pageNumber, pageSize, search) => {
    dispatch({ type: USERS, payload: agent.Auth.getUsers(pageNumber, pageSize, search) });
  },
  getRoles: (pageNumber, pageSize, search) => {
    dispatch({ type: ROLES, payload: agent.Auth.getRoles(pageNumber, pageSize, search) });
  },
  getUserById: (id) => {
    dispatch({ type: GET_USER_BY_ID, payload: agent.Auth.getUserById(id) });
  },
  clearFlash: () => {
    dispatch({ type: CLEAR_FLASH_MESSAGE });
  },
});

export const callLoaderShow = (type) => ({
  type: LOADER_SHOW,
  payload: {
    type
  }
});

const UserCreateEdit = (props) => {
  const { editUserDataError, getRoles, rolesData, submitForm, flashError, clearFlash, flashSuccess } = props;
  const [selectedFile, setSelectedFile] = useState(null);
  const [roleOptions, setRoleOptions] = useState(null);
  const [editUserData, setEditUserData] = useState(null);

  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const dispatch = useDispatch();

  const { id = null } = useParams();

  const getUserById = async (user_id) => {
    dispatch(callLoaderShow(true))

    try {

      // Assuming agent.Auth.editTask handles FormData
      const userDataResponse = await agent.Auth.getUserById(user_id);

      dispatch(callLoaderShow(false))

      if(userDataResponse && userDataResponse.data && userDataResponse.data.user){
        setEditUserData(userDataResponse.data.user)
      }else{
        navigate("/users")
      }

    } catch (error) {
      dispatch(callLoaderShow(false))
      navigate("/users")
    }

  }

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    hourlySalary: '',
    additionalInfo: '',
    selectedRoles: [],
    profileImage: null,
    removeImage: false,
  });

  useEffect(() => {
    if(id){
       getUserById(id);
    }
  }, [id]);

  useEffect(() => {
    if(editUserDataError){
        clearFlash();
        navigate("/users")
    }
  }, [editUserDataError]);

  useEffect(() => {
    if(editUserData && roleOptions){

       var roless = [];

       if(editUserData && editUserData.role){
          const roles_array = editUserData.role.split(",");
          const selectedOptions = roles_array.map(role => 
            roleOptions.find(option => option.value === role)
          );
          roless = selectedOptions;
       }
       setFormData({
        firstName: editUserData.first_name,
        lastName: editUserData.last_name,
        email: editUserData.email,
        address: editUserData.address,
        contactNumber: editUserData.contact_number,
        hourlySalary: editUserData.hourly_salary,
        additionalInfo: editUserData.additional_info,
        selectedRoles: roless,
        profileImage: null,
        removeImage: false,
       })

       if(editUserData && editUserData.profile_image){
        setSelectedFile(process.env.REACT_APP_BACKEND+editUserData.profile_image)
       }else{
        setSelectedFile(null)
       }
    }
  }, [editUserData, roleOptions]);

  useEffect(() => {
    getRoles(1, 1000, "");
  }, [getRoles]);

  useEffect(() => {
    if (rolesData && rolesData.pagination) {
      const rows = rolesData.roles.map((item) => ({
        value: item.slug,
        label: item.name,
      }));
      
      setRoleOptions(rows);
    }
  }, [rolesData]);

  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle multi-select box change
  const handleSelectChange = (value) => {
    setFormData((prevData) => ({ ...prevData, selectedRoles: value }));
  };

  // Handle form submit
  const handleSubmit = (e) => {
    clearFlash();
    e.preventDefault();
    
        // Password Match Validation
       if (formData.password !== formData.confirmPassword) {
          setErrorMsg("Passwords do not match");
          return;
        }
    
        // Password Strength Validation
        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    
        if (!passwordRegex.test(formData.password)) {
          setErrorMsg(
            "Password must be at least 8 characters and include uppercase, lowercase, number and special character."
          );
          return;
        }
    
    var roles = [];
    formData.selectedRoles.forEach(function(roleOpt){
        roles.push(roleOpt.value);
    });
    const formDataNew = new FormData();
    if(id){
      formDataNew.append("id", id);
    }
    formDataNew.append("first_name", formData.firstName);
    formDataNew.append("removeImage", formData.removeImage);
    formDataNew.append("last_name", formData.lastName);
    formDataNew.append("email", formData.email);
    formDataNew.append("password", formData.password);
    formDataNew.append("contact_number", formData.contactNumber);
    formDataNew.append("hourly_salary", formData.hourlySalary);
    formDataNew.append("address", formData.address);
    formDataNew.append("additional_info", formData.additionalInfo);
    formDataNew.append("profile_image", formData.profileImage);
    formDataNew.append("role", roles.join(","));
       
    submitForm(formDataNew);
  };

  useEffect(() => {
      if (flashError) {
        setErrorMsg(flashError);
        clearFlash();
      }
    }, [flashError]);

    useEffect(() => {
      if (flashSuccess) {
        setSuccessMsg(flashSuccess);
        clearFlash();
        setTimeout(function(){
             navigate("/users");
        },2000)
      }
    }, [flashSuccess]);

  // Drag-and-drop functionality for the profile image
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setFormData((prevData) => ({ ...prevData, profileImage: file }));
    setSelectedFile(URL.createObjectURL(file)); // Preview the image
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
       'image/jpeg': [],
       'image/png': [],
       'image/webp': [],
       'image/heic': [],
       'image/jfif': [],
    },
  });

  // Function to remove the selected image
  const removeSelectedImage = () => {
    setSelectedFile(null); // Reset the file preview
    setFormData((prevData) => ({ ...prevData, profileImage: null, removeImage: true })); // Reset the formData
  };
  const handleCancel = () => {
    navigate("/users")
  };


  return (
    <MDBContainer className="mt-5 create_user roles_maincard user_wrap">
      <MDBCard>
        <MDBCardHeader>
          <h4>{(id)?'Edit User':'Create User'}</h4>
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
              <MDBCol md="6">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <MDBInput
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
              </MDBCol>

              <MDBCol md="6">
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <MDBInput
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
              </MDBCol>
            </MDBRow>

            <MDBRow className="g-4 mb-4">
              <MDBCol md="6">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <MDBInput
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
              </MDBCol>

              <MDBCol md="6">
                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <MDBInput
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
              </MDBCol>
            </MDBRow>
            
            <MDBRow className="g-4 mb-4">
              <MDBCol md="6">
                <div className="form-group">
                  <label>Password</label>
                  <MDBInput
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!id}
                    className="form-control"
                  />
                </div>
              </MDBCol>
            
              <MDBCol md="6">
                <div className="form-group">
                  <label>Confirm Password</label>
                  <MDBInput
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={!id}
                    className="form-control"
                  />
                </div>
              </MDBCol>
            </MDBRow>

            <MDBRow className="g-4 mb-4">
              <MDBCol md="6">
                <div className="form-group">
                  <label htmlFor="contactNumber">Contact Number</label>
                  <MDBInput
                    name="contactNumber"
                    type="text"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
              </MDBCol>

              <MDBCol md="6">
                <div className="form-group">
                  <label htmlFor="hourlySalary">Hourly Salary</label>
                  <MDBInput
                    name="hourlySalary"
                    type="number"
                    value={formData.hourlySalary}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
              </MDBCol>
            </MDBRow>

            <MDBRow className="g-4 mb-4">
              <MDBCol md="12">
                <div className="form-group">
                  <label htmlFor="additionalInfo">Additional Info</label>
                  <MDBTextArea
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleChange}
                    rows={4}
                    className="form-control"
                  />
                </div>
              </MDBCol>
            </MDBRow>

            <MDBRow className="g-4 mb-4">
              <MDBCol md="6">
                <div className="form-group">
                  <label htmlFor="selectedRoles">Select Roles</label>
                  <Select
                    isMulti
                    name="selectedRoles"
                    options={roleOptions}
                    onChange={handleSelectChange}
                    value={formData.selectedRoles}
                    required
                  />
                </div>
              </MDBCol>

              <MDBCol md="6">
                <label>Profile Image</label>
                {!selectedFile && (
                  <div className="drag-drop-container" {...getRootProps()} style={styles.dragDropContainer}>
                    <input {...getInputProps()} />
                    <p style={{fontSize: "12px", margin: "0"}}>Drag & drop a profile image here, or Browse</p>
                  </div>
                )}

                {selectedFile && (
                  <div className="main-image-cont">
                    <div className="image-container" style={styles.imageContainer}>
                      <div className="innersec">
                        <img src={selectedFile} alt="Profile" style={styles.imagePreview} />
                        <MDBBtn
                          className="removePr"
                          size="sm"
                          onClick={removeSelectedImage}
                          style={styles.removeButton}
                        >
                          Remove Image
                        </MDBBtn>
                      </div>
                    </div>
                  </div>
                )}
              </MDBCol>
            </MDBRow>
            
            

            <MDBCol md="12" className="d-flex gap-4">
              <MDBBtn type="submit" color="primary" className="w-20">Submit</MDBBtn>
              <MDBBtn type="button" color="secondary" className="cancel_btn_wrap w-20"onClick={handleCancel}>Cancel</MDBBtn>
            </MDBCol>
          </form>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
};

// Inline styles for a cleaner design
const styles = {
  dragDropContainer: {
    border: '2px dashed #007bff',
    borderRadius: '50%', // Circle style
    padding: '12px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    marginTop: '20px',
    backgroundColor: '#f8f9fa',
    transition: 'background-color 0.3s ease',
    width: '120px',
    height: '120px',
  },
  imageContainer: {
    position: 'relative',
    display: 'inline-block',
    marginTop: '20px',
  },
  imagePreview: {
    width: '120px',
    height: '120px',
    borderRadius: '50%', 
    objectFit: 'cover',
  },
  removeButton: {
    position: "absolute",
    top: "25%",
    right: "10%",
    display: "none",
    background: "#ff000047",
    color: "#fff",
    width: "80%",
    padding: "5px",
    fontSize: "12px",
    cursor: "pointer",
  },
};

export default connect(mapStateToProps, mapDispatchToProps)(UserCreateEdit);
