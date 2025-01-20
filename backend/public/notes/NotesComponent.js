import React, { Fragment, useState } from "react";
import "./NotesComponent.scss";
import { GrAttachment } from "react-icons/gr";
import { FaRegImage } from "react-icons/fa";


const NotesComponent = ({noteText, setNoteText, files, setFiles, images, setImages, notesData}) => {
  

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
  const dummyFiles = [
    { name: "File 1", preview: "https://via.placeholder.com/50" },
    { name: "File 2", preview: "https://via.placeholder.com/50" },
    { name: "File 3", preview: "https://via.placeholder.com/50" },
    { name: "Image 4", preview: "https://via.placeholder.com/50" },
  ];

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
                <p className="description">{note.description || 'No description available'}</p>
                <div className="d-flex justify-content-space-between">
                  <div className="user-info">
                    <img
                      src="https://via.placeholder.com/40"
                      alt="User"
                      className="user-image"
                    />
                    <span className="user-name">John Doe</span> {/* You can replace this with actual user info */}
                  </div>
                  <p className="created-time">
                    Created Time: {new Date(note.created_at).toLocaleDateString()} {/* Formatting the created time */}
                  </p>
                </div>
              </div>
              
              <div className="file-content">
                {note.attachments && note.attachments.length > 0 && note.attachments.map((attachment, index) => (
                  <div className="file-item" key={attachment.id}>
                    {/* Show different content based on the type */}
                    {attachment.type === 'image' ? (
                      <div className="image-item">
                        <img src={attachment.path} alt={`Attachment ${index + 1}`} className="file-preview" />
                        <span className="file-name">{attachment.path.split('/').pop()}</span>
                      </div>
                    ) : (
                      <div className="file-item">
                        <span className="file-name">{attachment.path.split('/').pop()}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Fragment>
  );
};

export default NotesComponent;
