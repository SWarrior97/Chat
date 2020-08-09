const chatForm = document.getElementById('chat-form');
const roomId = document.getElementById('room-id');
const btnLeaveRoom = document.getElementById('leaveRoom');
const chatMessages = document.querySelector('.chat-messages');

const socket = io();

socket.on('teste', msg => {
	console.log(msg)
	// Join chatroom
	socket.emit('joinRoom', roomId.innerText);
});

chatForm.addEventListener('submit', e => {
  e.preventDefault();

  // Get message text
  const msg = e.target.elements.msg.value;

  // Emit message to server
  socket.emit('chatMessage', {msg:msg,roomId:roomId.innerText});

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Message from server
socket.on('message', message => {
	if(message.text.msg){
		outputMessage(message);
	}else{
		outputMessage2(message);
	}
   
  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text.msg}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

// Output message to DOM
function outputMessage2(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
}



