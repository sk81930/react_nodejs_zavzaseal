import React, { Fragment, useState } from "react";
import { useDispatch } from 'react-redux';
import "./NotesComponent.scss";
import { GrAttachment } from "react-icons/gr";
import { FaRegImage, FaFile, FaDownload, FaEye } from "react-icons/fa";
import { CiFileOn } from "react-icons/ci";

import SideModal from '../../Layouts/SideModal';
import { OPEN_PROFILE_MODAL } from '../../../constants/actionTypes';

export const openProfileModal = (userId) => ({
  type: OPEN_PROFILE_MODAL,
  payload: {
    userId
  }
});


const getTimeAgo = (timestamp) => {

  

  const now = new Date();
  const createdTime = new Date(timestamp);
  const timeDifference = now - createdTime; // Difference in milliseconds

  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
};

const NotesComponent = ({noteText, setNoteText, files, setFiles, images, setImages, notesData}) => {

  const dispatch = useDispatch();
  

  const handleTextChange = (e) => {
    setNoteText(e.target.value);
  };

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles([...files, ...uploadedFiles]);
  };

  const handleImageUpload = (e) => {
    const uploadedImages = Array.from(e.target.files);
    setImages([...images, ...uploadedImages]);
  };

  const removeFile = (fileName) => {
    setFiles(files.filter((file) => file.name !== fileName));
  };

  const removeImage = (imageName) => {
    setImages(images.filter((image) => image.name !== imageName));
  };
  const handlePreviewClick = (url) => {
    window.open(url, "_blank");
  };


  const renderAttachment = (attachment) => {
      const fileName = attachment.path.split("/").pop();

      // Extract the file extension
      const fileExtension = attachment.path.split('.').pop().toLowerCase();

      // Check if the file is an image based on the file extension
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(fileExtension);

      const handleDownload = (e, path, fileName) => {
        e.preventDefault();
        window.open(process.env.REACT_APP_BACKEND + path, "_blank");
      };

    return (
      <div key={attachment.id} className="attachment-wrap mt-2 me-2 cursor-pointer border rounded-md overflow-hidden position-relative">
        <div className="attachment-img w-100 border-bottom">
          {isImage ? (
            <img
              src={process.env.REACT_APP_BACKEND + attachment.path}
              alt={fileName}
              className="w-100 object-cover"
            />
          ) : (
            <div className="thumb-file"><CiFileOn className="w-100 object-cover" style={{fontSize: "18px"}} /></div> 
          )}
        </div>
        <div className="attachment-content d-flex p-1">
          <div className="me-1 icon-img">
            {isImage ? (
              <FaRegImage className="w-100 object-cover" style={{fontSize: "18px"}} />
            ) : (
              <FaFile className="w-100 object-cover" style={{fontSize: "18px"}} />
            )}
          </div>
          <p className="img-text mb-0 overflow-hidden">{fileName}</p>
        </div>
        <div className="hover-attachment justify-content-between flex-col w-100">
          <div className="attachment-content d-flex p-0">
            <p className="mb-0 overflow-hidden">{fileName}</p>
          </div>
          <div className="attachment-content d-flex align-items-center justify-content-center">
            {/* Download Button */}
            <a
              href={process.env.REACT_APP_BACKEND + attachment.path}
              className="download-img me-1"
              download
              target="_blank"
            >
              <div className="load-hover">
                <FaDownload />
              </div>
            </a>

            {/* Preview Button (Only for Images) */}
            {isImage && (
              <a
                href="#"
                className="preview-img"
                onClick={() => handlePreviewClick(process.env.REACT_APP_BACKEND + attachment.path)}
              >
                <div className="preview-hover">
                  <FaEye />
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };
  return (
    <Fragment>
      <div className="textarea-container">
        <h3 className="title">Add a Notes</h3>
        <textarea
          className="textarea"
          id="message"
          name="message_notes"
          rows="5"
          placeholder="Add a more detailed description..."
          value={noteText}
          onChange={handleTextChange}
        ></textarea>
        <div className="attachment-icons">
          {/* Image Upload */}
          <label htmlFor="image_upload">
            <FaRegImage />
          </label>
          <input
            type="file"
            id="image_upload"
            name="image_upload_notes"
            accept="image/*"
            style={{ display: "none" }}
            multiple
            onChange={handleImageUpload}
          />

          {/* File Upload */}
          <label htmlFor="attachment">
            <GrAttachment />
          </label>
          <input
            type="file"
            id="attachment"
            name="attachment_notes"
            style={{ display: "none" }}
            multiple
            onChange={handleFileUpload}
          />
            <div className="image-preview-container">
              {images.map((image, index) => (
                <p className="file-preview" key={index}>
                  {image.name}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="remove-icon"
                    onClick={() => removeImage(image.name)}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </p>
              ))}
              {files.map((file, index) => (
                <p className="file-preview" key={index}>
                  {file.name}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="remove-icon"
                    onClick={() => removeFile(file.name)}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </p>
              ))}
            </div>
        </div>

       
      </div>
      {(notesData && notesData.length > 0) && (
        <div className="main-notes">
          {notesData.map((note) => (
            <div key={note.id} className="notes-data">
              <div className="notes-header">
                <p className="description">{note.description || ''}</p>
                <div className="d-flex justify-content-space-between">
                  <div className="user-info">
                    {(note.user && note.user.profile_image) ? (
                
                        <img
                          src={(note.user.profile_image)? (process.env.REACT_APP_BACKEND+note.user.profile_image): "https://via.placeholder.com/40"} 
                          alt="User"
                          className="user-image"
                          onClick={() => dispatch(openProfileModal(note.user.id))}
                        />
                      
                    ) : (
                      <span className="w-11 rounded-circle profile-image-span me-3" onClick={() => dispatch(openProfileModal(note.user.id))}>
                        <span>{note.user.first_name ? note.user.first_name [0].toUpperCase() : '?'}</span>
                      </span>
                    )}
                   
                    <span className="user-name"><b>Created By</b> {note.user.first_name} {note.user.last_name}</span>
                  </div>
                  {/* Format the created time to a human-readable date */}
                  <p className="created-time">
                    Created Time: {getTimeAgo(note.created_at)}
                  </p>
                </div>
              </div>

              <div className="file-content">
                <div className="attachment-main-wrap d-flex flex-wrap">
                  {note.attachments && note.attachments.length > 0 && note.attachments.map((attachment) => {
                          const filePath = `${process.env.REACT_APP_BACKEND + attachment.path}`;
                          const fileName = attachment.path.split("/").pop();

                          // Conditionally call either renderImageAttachment or renderFileAttachment
                          if (attachment.path.match(/\.(jpg|jpeg|png|gif)$/)) {
                            return renderAttachment(attachment,"image"); // Image attachment
                          } else {
                            return renderAttachment(attachment,"doc"); // File attachment
                          }
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Fragment>
  );
};

export default NotesComponent;
