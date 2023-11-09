const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const crypto = require('crypto');
const mongoose = require('mongoose');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose
.connect("mongodb+srv://tharujahanvi215:Syook9876@cluster0.eckauyj.mongodb.net/?retryWrites=true&w=majority")
  .then( async() => {
    await console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

  const dataSchema = new mongoose.Schema({
    name: String,
    origin: String,
    destination: String,
    secretKey: String,
    timestamp: { type: Date, default: Date.now }
  });

  const Data = mongoose.model('Data', dataSchema);

io.on('connection', (socket) => {
  console.log('Emitter connected');

  socket.on('dataStream', (encryptedMessageStream) => {
    const decryptedMessages = decryptAndValidate(encryptedMessageStream);

    // Save decryptedMessages to MongoDB and emit success/failure message
    decryptedMessages.forEach((message) => {
      const data = new Data(message);
      data.save();
    });

    console.log('Decrypted Messages:', decryptedMessages);
  });

  socket.on('disconnect', () => {
    console.log('Emitter disconnected');
  });
});

function decryptAndValidate(encryptedMessageStream) {
    const secretKey = 'chwhhi4rh4kj3h89hwhnf';

    // Split the | separated encrypted messages
    const encryptedMessages = encryptedMessageStream.split('|');
  
    // Array to store valid decrypted messages
    const validDecryptedMessages = [];
  
    encryptedMessages.forEach((encryptedMessage) => {
      try {
        // Decrypt using aes-256-ctr algorithm
        const decipher = crypto.createDecipheriv('aes-256-ctr', secretKey);
        let decryptedMessage = decipher.update(encryptedMessage, 'hex', 'utf8');
        decryptedMessage += decipher.final('utf8');
  
        // Parse the decrypted JSON object
        const decryptedObject = JSON.parse(decryptedMessage);
  
        // Validate the object integrity using the secret_key
        const { name, origin, destination, secret_key } = decryptedObject;
        const calculatedSecretKey = crypto
          .createHash('sha256')
          .update(`${name}${origin}${destination}`)
          .digest('hex');
  
        if (calculatedSecretKey === secret_key) {
          // If valid, add a timestamp and push to the valid array
          decryptedObject.timestamp = new Date();
          validDecryptedMessages.push(decryptedObject);
        } else {
          console.log('Invalid secret key. Data integrity compromised.');
        }
      } catch (error) {
        console.error('Error decrypting or validating message:', error.message);
      }
    });
  
    return validDecryptedMessages;
  }
  
  module.exports = { decryptAndValidate };
  
  server.listen(3001, () => {
      console.log('Listener listening on port 3001');
    });
    