import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

function OutputPane({ title, content, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    if (content) {
      setIsOpen(true);
    }
  }, [content]);

  const renderTable = (tableContent) => {
    const rows = tableContent.split('\n').filter(row => row.trim() !== '');
    return (
      <table style={{borderCollapse: 'collapse', width: '100%', margin: '0 auto', fontSize: '0.9em'}}>
        <thead>
          <tr>
            {rows[0].split('|').filter(cell => cell.trim()).map((cell, index) => (
              <th key={index} style={{border: '1px solid #4a4a4a', padding: '6px', backgroundColor: '#2d2d2d', color: '#e0e0e0'}}>
                {cell.trim()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(2).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.split('|').filter(cell => cell.trim()).map((cell, cellIndex) => (
                <td key={cellIndex} style={{border: '1px solid #4a4a4a', padding: '6px', color: '#e0e0e0'}}>
                  {cell.trim()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderConjugationContent = () => {
    const parts = content.split('##').filter(part => part.trim() !== '');
    const rows = [];
    for (let i = 0; i < parts.length; i += 2) {
      rows.push(parts.slice(i, i + 2));
    }

    return (
      <div style={{overflowY: 'auto', maxHeight: '100%'}}>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} style={{display: 'flex', marginBottom: '20px'}}>
            {row.map((part, partIndex) => {
              const [title, ...contentLines] = part.split('\n');
              const tableContent = contentLines.join('\n');
              return (
                <div key={partIndex} style={{flex: 1, marginRight: partIndex === 0 ? '10px' : '0'}}>
                  <h3 style={{fontSize: '1em', marginBottom: '5px'}}>{title.trim()}</h3>
                  {renderTable(tableContent)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`output-pane ${title.toLowerCase()} ${isOpen ? 'open' : ''}`}>
      <div className="output-header" onClick={() => setIsOpen(!isOpen)}>
        {title} {isOpen ? '▼' : '▶'}
      </div>
      {isOpen && (
        <div className="output-content">
          {content.includes('|') ? renderConjugationContent() : <ReactMarkdown>{content}</ReactMarkdown>}
        </div>
      )}
    </div>
  );
}

export default OutputPane;
