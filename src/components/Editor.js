import React, { useState, useRef } from 'react';

function Editor({ onHighlight, onGetAssistance, onLanguageChange, onPronounce }) {
  const [content, setContent] = useState('');
  const editorRef = useRef(null);

  const getSelectedText = () => {
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (editorRef.current.contains(range.commonAncestorContainer)) {
          const selectedText = selection.toString().trim();
          console.log('Selected text:', selectedText); // Debug log
          return selectedText;
        }
      }
    }
    console.log('No text selected'); // Debug log
    return '';
  };

  const handleHighlight = (type) => {
    const selectedText = getSelectedText();
    if (selectedText) {
      console.log(`Sending ${type} request for:`, selectedText); // Debug log
      onHighlight(selectedText, type);
    } else {
      console.log('No text selected for highlight');
    }
  };

  const handleGetAssistance = () => {
    onGetAssistance(content);
  };

  const handlePronounce = () => {
    const selectedText = getSelectedText();
    if (selectedText) {
      onPronounce(selectedText);
    } else {
      console.log('No text selected for pronunciation');
    }
  };

  return (
    <div className="editor">
      <div className="toolbar">
        <select onChange={(e) => onLanguageChange(e.target.value)} className="language-select">
          <option value="spanish">Spanish</option>
          <option value="french">French</option>
          <option value="portuguese">Portuguese</option>
        </select>
        <button onClick={() => handleHighlight('D')} className="action-btn">Define</button>
        <button onClick={() => handleHighlight('C')} className="action-btn">Conjugate</button>
        <button onClick={handlePronounce} className="action-btn">Pronounce</button>
        <button onClick={handleGetAssistance} className="action-btn get-assistance-btn">Get Assistance</button>
      </div>
      <div
        ref={editorRef}
        className="content"
        contentEditable
        onInput={(e) => setContent(e.target.innerHTML)}
      />
    </div>
  );
}

export default Editor;
