import React from 'react';

function Modal({ children, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {children}
        <button onClick={onClose} className="modal-close">Close</button>
      </div>
    </div>
  );
}

export default Modal;
