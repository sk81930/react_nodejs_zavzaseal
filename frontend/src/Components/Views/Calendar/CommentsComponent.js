import React, { Fragment, useState } from "react";
import { useDispatch } from 'react-redux';
import "./CommentsComponent.scss";
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

const CommentsComponent = ({commentText, setCommentText, taskData, commentsData, currentUser}) => {

  const dispatch = useDispatch();
  
  const handleTextChange = (e) => {
    setCommentText(e.target.value);
  };
  return (
    <Fragment>
      <div className="comment-textarea mt-4">
        {(taskData && taskData.user_profile_image) ? (
          <img 
           src={(taskData && taskData.user_profile_image)? (process.env.REACT_APP_BACKEND+taskData.user_profile_image): "https://via.placeholder.com/40"}  
           onClick={() => dispatch(openProfileModal(taskData.user_id))}
           alt="User" className="user-image rounded-circle me-3 w-10 h-10 object-cover cursor-pointer" />
        ) : (
          <span className="w-11 rounded-circle profile-image-span me-3" onClick={() => dispatch(openProfileModal(taskData.user_id))}>
            <span>{taskData && taskData.user_first_name ? taskData.user_first_name[0].toUpperCase() : '?'}</span>
          </span>
        )}
       
        <textarea 
          id="commentText"
          name="commentText"
          value={commentText}
          onChange={handleTextChange}
          placeholder="Write a comment..." >
        </textarea>
      </div>  

      {(commentsData && commentsData.length > 0) && (
        <div className="main-comments mt-5">
          {commentsData.map((comment) => (
            <div key={comment.id} className={`comments-data ${comment.user.id === currentUser.id ? "me" : ""}`}>
              <div className="comments-header">
                <p className="description">{comment.description || ''}</p>
                <div className="d-flex justify-content-space-between">
                  <div className="user-info">

                    {(comment.user && comment.user.profile_image) ? (
                      <img
                        src={(comment.user.profile_image)? (process.env.REACT_APP_BACKEND+comment.user.profile_image): "https://via.placeholder.com/40"} 
                        alt="User"
                        className="user-image"
                        onClick={() => dispatch(openProfileModal(comment.user.id))}
                      />
                    ) : (
                      <span className="w-11 rounded-circle profile-image-span me-3" onClick={() => dispatch(openProfileModal(comment.user.id))}>
                        <span>{comment.user && comment.user.first_name ? comment.user.first_name[0].toUpperCase() : '?'}</span>
                      </span>
                    )}
                    
                    <span className="user-name"><b>{comment.user.first_name} {comment.user.last_name}</b></span>
                  </div>
                  <p className="created-time">
                    {getTimeAgo(comment.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Fragment>
  );
};

export default CommentsComponent;
