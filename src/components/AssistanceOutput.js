import React from 'react';
import ReactMarkdown from 'react-markdown';

function AssistanceOutput({ response }) {
  return (
    <div className="assistance-output">
      <h3>Assistance</h3>
      <div className="assistance-content">
        <ReactMarkdown>{response}</ReactMarkdown>
      </div>
    </div>
  );
}

export default AssistanceOutput;
