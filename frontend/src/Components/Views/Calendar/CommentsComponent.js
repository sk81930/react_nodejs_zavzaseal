import React, { Fragment } from "react";
import { useDispatch } from 'react-redux';
import "./CommentsComponent.scss";
import { BsSend } from "react-icons/bs";
import { OPEN_PROFILE_MODAL, LOADER_SHOW } from '../../../constants/actionTypes';
import agent from '../../../agent';

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
export const callLoaderShow = (type) => ({
  type: LOADER_SHOW,
  payload: {
    type
  }
});

const CommentsComponent = ({commentText, setCommentText, taskData, commentsData, currentUser, getComments}) => {

  const dispatch = useDispatch();
  
  const handleTextChange = (e) => {
    setCommentText(e.target.value);
  };

  const addComment = async (task_id) => {
    const trimmedCommentText = commentText.trim();
    
    if (trimmedCommentText.length === 0) {
        return; // Exit if the comment is empty
    }

    const formDataNew = new FormData();

    formDataNew.append("commentText", trimmedCommentText);

    dispatch(callLoaderShow(true))


    try {
      // Assuming agent.Auth.editTask handles FormData
      const addCommentData = await agent.Auth.addComment(formDataNew, task_id);
      dispatch(callLoaderShow(false))

      setCommentText("");

      if(addCommentData && addCommentData.isSuccess){

          getComments(task_id);
          
      }

    } catch (error) {
      dispatch(callLoaderShow(false))
      if (error.response && error.response.body && error.response.body.message) {
          //setErrorMsg(error.response.body.message);
      }else{
          //setErrorMsg(error.message);
      }
      
      // Handle error, maybe show a message to the user
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addComment(taskData.id);
    }
  };




  return (
    <Fragment>
      <div className="comments-card">
        <h4 className="comments-title">Comments</h4>
        <div className="comment-textarea py-1">
          {(taskData && taskData.user_profile_image) ? (
            <img 
             src={(taskData && taskData.user_profile_image)? (process.env.REACT_APP_BACKEND+taskData.user_profile_image): "https://via.placeholder.com/40"}  
             onClick={() => dispatch(openProfileModal(taskData.user_id))}
             alt="User" className="user-image w-10 h-10 object-cover cursor-pointer" />
          ) : (
            <span className="w-11 rounded-circle profile-image-span me-2" onClick={() => dispatch(openProfileModal(taskData.user_id))}>
              <span>{taskData && taskData.user_first_name ? taskData.user_first_name[0].toUpperCase() : '?'}</span>
            </span>
          )}

          <div className="textarea-input">
            <input
              id="commentText"
              name="commentText"
              type="text"
              value={commentText}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Write a comment..."
            />
            <button type="button" className="btn btn-primary" onClick={() => addComment(taskData.id)}><BsSend /></button>
          </div>
        </div>

        {(commentsData && commentsData.length > 0) && (
          <div className="main-comments">
            {commentsData.map((comment) => (
              <div key={comment.id} className={`comments-data ${comment?.user?.id === currentUser?.id ? "me" : ""}`}>
                <div className="comments-header">
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

                  <div className="comment-content-wrap">
                    <div className="meta-row">
                      <span className="user-name">@{`${comment?.user?.first_name || ""}${comment?.user?.last_name || ""}`.toLowerCase()}</span>
                      <span className="created-time">{getTimeAgo(comment.created_at)}</span>
                    </div>
                    <p className="description">{comment.description || ''}</p>
                  </div>
                </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Fragment>
  );
};

export default CommentsComponent;
