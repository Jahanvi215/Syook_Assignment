const fs = require('fs');
const io = require('socket.io-client');
const crypto = require('crypto');

const socket = io('http://localhost:3001'); 

const userData = JSON.parse(fs.readFileSync(__dirname + '/data.json', 'utf8'));

function generateRandomMessages() {
  const encryptedMessages = userData.map((user) => {
    const { name, origin, destination } = user;
    const secretKey = crypto.createHash('sha256').update(JSON.stringify(user)).digest('hex');
    const payload = { name, origin, destination, secretKey };
    const encryptedMessage = encryptMessage(payload);
    return encryptedMessage;
  });

  return encryptedMessages.join('|');
}

function encryptMessage(message) {
  // secret key for AES encryption
  const secretKey = 'chwhhi4rh4kj3h89hwhnf';
  
  // Convert the message object to a JSON string
  const jsonString = JSON.stringify(message);
  
  // Create an initialization vector
  const iv = crypto.randomBytes(16);

  // Encrypt using aes-256-cbc algorithm
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
  
  let encryptedMessage = cipher.update(jsonString, 'utf8', 'hex');
  
  encryptedMessage += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encryptedMessage;
}

module.exports = { encryptMessage };

function sendMessages() {
  const messageStream = generateRandomMessages();
  socket.emit('dataStream', messageStream);
}

setInterval(sendMessages, 10000);