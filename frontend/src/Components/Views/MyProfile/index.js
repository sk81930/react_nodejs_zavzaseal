import React, { Fragment, useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { MDBContainer, MDBCard, MDBCardBody, MDBCardHeader, MDBInput, MDBBtn, MDBRow, MDBCol } from  '../../../mdb';
import { MDBSelect, MDBSelectInput, MDBSelectOption, MDBTextArea } from 'mdb-react-ui-kit';
import { useNavigate, useParams, Link} from 'react-router-dom';
import agent from '../../../agent';
import { useDropzone } from 'react-dropzone';
import Select from 'react-select'; // For react-select multi-select

import "./MyProfile.scss";

import { APP_LOAD } from '../../../constants/actionTypes';

const mapStateToProps = (state) => ({
  ...state,
  currentUser: state.auth.currentUser,
});

const mapDispatchToProps = (dispatch) => ({
   onAppLoad: (payload) => dispatch({ type: APP_LOAD, payload }),
});
const MyProfile = (props) => {
  const { currentUser, onAppLoad } = props;
  const [selectedFile, setSelectedFile] = useState(null);

  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);


  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    password:'',
    confirm_password:'',
    contactNumber: '',
    hourlySalary: '',
    additionalInfo: '',
    profileImage: null,
    removeImage: false,
  });



  useEffect(() => {
    if(currentUser){


      
       setFormData({
        firstName: currentUser.first_name,
        lastName: (currentUser.last_name)??'',
        password:'',
        confirm_password:'',
        email: currentUser.email,
        address: (currentUser.address)??'',
        contactNumber: (currentUser.contact_number)??'',
        hourlySalary: (currentUser.hourly_salary)??'',
        additionalInfo: (currentUser.additional_info)??"",
        profileImage: null,
        removeImage: false,
       })

       if(currentUser && currentUser.profile_image){
        setSelectedFile(process.env.REACT_APP_BACKEND+currentUser.profile_image)
       }else{
        setSelectedFile(null)
       }
    }
  }, [currentUser]);


  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };



  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    const formDataNew = new FormData();

    formDataNew.append("first_name", formData.firstName);
    formDataNew.append("last_name", formData.lastName);
    formDataNew.append("password", formData.password);
    formDataNew.append("confirm_password", formData.confirm_password);
    formDataNew.append("contact_number", formData.contactNumber);
    formDataNew.append("address", formData.address);
    formDataNew.append("additional_info", formData.additionalInfo);
    formDataNew.append("profile_image", formData.profileImage);
    formDataNew.append("removeImage", formData.removeImage);

    try {
      // Assuming agent.Auth.editTask handles FormData
      const updateData = await agent.Auth.updateProfile(formDataNew);


      if(updateData && updateData.isSuccess){

        setSuccessMsg(updateData.message);

        var userData = await agent.Auth.current();

        if(userData && userData.data && userData.data.user){
           onAppLoad(userData);
        }

          
      }

    } catch (error) {


      if (error.response && error.response.body && error.response.body.message) {
          setErrorMsg(error.response.body.message);
      }else{
          setErrorMsg(error.message);
      }
      
      // Handle error, maybe show a message to the user
    }

    
       

  };


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
    navigate("/dashboard")
  };


  return (
    <MDBContainer className="mt-5 create_user">
      <MDBCard>
        <MDBCardHeader>
          <h4>My Profile</h4>
        </MDBCardHeader>
        <MDBCardBody>
          {(currentUser) && (
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

              <MDBRow className="g-4 mb-4" encType="multipart/form-data">
                <MDBCol md="6">
                  <div className="form-group">
                    <label htmlFor="firstName">Password</label>
                    <MDBInput
                      name="password"
                      type="password"
                      onChange={handleChange}
                      required={(formData.confirm_password)?true:false}
                      className="form-control"
                      autocomplete="new-password"
                    />
                  </div>
                </MDBCol>

                <MDBCol md="6">
                  <div className="form-group">
                    <label htmlFor="lastName">Confirm Password</label>
                    <MDBInput
                      name="confirm_password"
                      type="password"
                      onChange={handleChange}
                      required={(formData.password)?true:false}
                      className="form-control"
                      autocomplete="new-password"
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
                      readOnly
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
                      readOnly
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
                <MDBBtn type="button" color="secondary" className="w-20"onClick={handleCancel}>Cancel</MDBBtn>
              </MDBCol>
            </form>
          )}  
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

export default connect(mapStateToProps, mapDispatchToProps)(MyProfile);
