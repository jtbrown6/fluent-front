import React, { useState } from 'react';
import Editor from './components/Editor';
import Chat from './components/Chat';
import OutputPane from './components/OutputPane';
import Modal from './components/Modal';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

function App() {
  const [definitionOutput, setDefinitionOutput] = useState('');
  const [conjugationOutput, setConjugationOutput] = useState('');
  const [assistanceOutput, setAssistanceOutput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [language, setLanguage] = useState('spanish');
  const [pronounceError, setPronounceError] = useState('');

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
      const response = await fetch(`${API_BASE_URL}/api/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      const newMessage = { role: 'user', content: query };
      const newResponse = { role: 'assistant', content: data.result };
      setChatHistory(prevHistory => [...prevHistory, newMessage, newResponse]);
    } catch (error) {
      console.error('Error fetching chat response:', error);
    }
  };

  const handleResetConversation = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/reset_conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setChatHistory([]);
    } catch (error) {
      console.error('Error resetting conversation:', error);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const handlePronounce = async (text) => {
    setPronounceError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/pronounce`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: text }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get pronunciation');
      }
      
      const data = await response.json();
      console.log('Pronunciation data:', data);
      
      if (data.audio) {
        // Convert base64 audio content to audio blob
        const audioData = atob(data.audio);
        const arrayBuffer = new ArrayBuffer(audioData.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < audioData.length; i++) {
          uint8Array[i] = audioData.charCodeAt(i);
        }
        const audioBlob = new Blob([uint8Array], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        // Add a slight delay before playing
        setTimeout(() => {
          audio.play();
        }, 500); // 500ms delay
        
        // Clean up the URL after playing
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };
      }
    } catch (error) {
      console.error('Error fetching pronunciation:', error);
      const errorMessage = error.message.includes('Audio') 
        ? 'Text-to-speech service is currently unavailable. Please try again later. The translation service is still working to translate your text.'
        : error.message;
      setPronounceError(errorMessage);
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
          <Chat 
            onSendMessage={handleChat} 
            chatHistory={chatHistory} 
            onResetConversation={handleResetConversation}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
