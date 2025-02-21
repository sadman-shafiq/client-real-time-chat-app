"use client";
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import styles from './Chat.module.css';

const socket = io('https://server-real-time-chat-app.onrender.com');

const Chat = () => {
  const [username, setUsername] = useState('');
  const [tempUsername, setTempUsername] = useState('');

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off('chat message');
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      const messageObj = { username, text: message };
      socket.emit('chat message', messageObj);
      console.log('Message sent:', messageObj);
      setMessage('');
    }
  };

  if (!username) {
    return (
      <div className={styles.usernameContainer}>
        <h2>Enter Your Username</h2>
        <input
          type="text"
          value={tempUsername}
          onChange={(e) => setTempUsername(e.target.value)}
          placeholder="Username"
          className={styles.input}
        />
        <button
          onClick={() => {
            if (tempUsername.trim()) {
              setUsername(tempUsername);
            }
          }}
          className={styles.sendButton}
        >
          Set Username
        </button>
      </div>
    );
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.header}>
        <h2>Welcome, {username}!</h2>
      </div>
      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <div key={index} className={styles.message}>
            <strong>{msg.username}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className={styles.inputGroup}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
          className={styles.input}
        />
        <button onClick={sendMessage} className={styles.sendButton}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
