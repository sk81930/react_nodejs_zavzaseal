import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const AudioPopup = ({ audioSrc, closePopup }) => {
  return (
    <Modal show={!!audioSrc} onHide={closePopup}>
      <Modal.Header closeButton>
        <Modal.Title>Audio Playback</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {audioSrc ? (
          <audio controls src={audioSrc} style={{width:"100%"}}>
            Your browser does not support the audio element.
          </audio>
        ) : (
          <div>No audio available</div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={closePopup}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AudioPopup;
