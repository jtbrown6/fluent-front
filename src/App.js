import React, { useState } from 'react';
import Editor from './components/Editor';
import Chat from './components/Chat';
import OutputPane from './components/OutputPane';
import Modal from './components/Modal';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

function App() {
  const [definitionOutput, setDefinitionOutput] = useState('');
  const [conjugationOutput, setConjugationOutput] = useState('');
  const [assistanceOutput, setAssistanceOutput] = useState('');
  const [chatOutput, setChatOutput] = useState('');
  const [language, setLanguage] = useState('spanish');
  const [showModal, setShowModal] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  const handleHighlight = async (text, type) => {
    console.log(`Handling ${type} request for:`, text);
    try {
      let endpoint;
      let body;
      if (type === 'D') {
        endpoint = `${API_BASE_URL}/api/define`;
        body = { word: text };
      } else if (type === 'C') {
        endpoint = `${API_BASE_URL}/api/conjugate`;
        body = { verb: text };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      console.log(`${type} API response:`, data);

      if (type === 'D') {
        setDefinitionOutput(data.result);
      } else if (type === 'C') {
        const formattedConjugation = formatConjugation(data.result);
        setConjugationOutput(formattedConjugation);
      }
    } catch (error) {
      console.error(`Error fetching ${type === 'D' ? 'definition' : 'conjugation'}:`, error);
    }
  };

  const formatConjugation = (conjugationData) => {
    console.log('Formatting conjugation data:', conjugationData);
    const tenses = ['present', 'subjunctive', 'preterite', 'imperfect', 'future'];
    const personOrder = ['yo', 'tú', 'él/ella/usted', 'nosotros', 'ellos/ellas/ustedes'];
    let formattedOutput = '';

    tenses.forEach(tense => {
      if (conjugationData[tense]) {
        formattedOutput += `## ${tense.charAt(0).toUpperCase() + tense.slice(1)}\n\n`;
        formattedOutput += '| Person | Conjugation |\n';
        formattedOutput += '|--------|-------------|\n';
        personOrder.forEach(person => {
          let displayPerson = person;
          if (person === 'él/ella/usted') displayPerson = 'El/Ella';
          if (person === 'ellos/ellas/ustedes') displayPerson = 'Ellos/Ellas';
          formattedOutput += `| ${displayPerson} | ${conjugationData[tense][person]} |\n`;
        });
        formattedOutput += '\n';
      }
    });

    console.log('Formatted conjugation output:', formattedOutput);
    return formattedOutput;
  };

  const handleGetAssistance = async (text) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/assist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, language }),
      });
      const data = await response.json();
      setAssistanceOutput(data.result);
    } catch (error) {
      console.error('Error fetching assistance:', error);
    }
  };

  const handleChat = async (query) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      setChatOutput(prev => `${prev}\n\n**You:** ${query}\n\n**AI:** ${data.result}`);
    } catch (error) {
      console.error('Error fetching chat response:', error);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const handlePronounce = async (text) => {
    setSelectedText(text);
    setShowModal(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pronounce`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, language }),
      });
      const data = await response.json();
      console.log('Pronunciation data:', data);
    } catch (error) {
      console.error('Error fetching pronunciation:', error);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="left-pane">
          <Editor 
            onHighlight={handleHighlight} 
            onGetAssistance={handleGetAssistance}
            onLanguageChange={handleLanguageChange}
            onPronounce={handlePronounce}
          />
          <OutputPane title="Assistance" content={assistanceOutput} defaultOpen={true} />
        </div>
        <div className="right-panes">
          <OutputPane title="Definition" content={definitionOutput} defaultOpen={true} />
          <OutputPane title="Conjugation" content={conjugationOutput} defaultOpen={true} />
          <Chat onSendMessage={handleChat} chatOutput={chatOutput} />
        </div>
      </div>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2>Pronunciation</h2>
          <p>Playing pronunciation for: "{selectedText}"</p>
        </Modal>
      )}
    </div>
  );
}

export default App;
