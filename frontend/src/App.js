import './App.css';
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001'); 

function App() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('dataStream', (decryptedMessages) => {
      // Update the messages state with the latest data
      setMessages((prevMessages) => [...prevMessages, ...decryptedMessages]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Syook || Associate Software Engineer -BackEnd</h1>
      <h2>Data Stream</h2>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{JSON.stringify(message)}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
