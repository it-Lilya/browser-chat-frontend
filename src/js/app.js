const moment = require('moment');

const form = document.querySelector('.modal-window');
const textarea = document.querySelector('.textarea');

const messagesList = document.querySelector('.messages__list');
const usersList = document.querySelector('.users__list');

const chatWindow = document.querySelector('.chat');

let nick;
let nickYou;
let arrayUsers = [];

form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (form.name.value === '') {
    // eslint-disable-next-line no-alert
    alert('Введите псевдоним');
    return;
  }
  nick = { nickname: `${form.name.value}` };
  nickYou = nick.nickname;

  (async () => {
    const response = await fetch('http://localhost:3000/nicknames', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nick),
    });
    const json = await response.json();
    if (json.status === 'Псевдоним уже существует!') {
      document.querySelector('.warning').classList.add('active');
      setTimeout(() => {
        form.name.value = '';
        document.querySelector('.warning').classList.remove('active');
      }, 600);
    }
    if (json.status === 'OK') {
      document.querySelector('.warning').classList.remove('active');
      setTimeout(() => {
        form.classList.add('hide');
        chatWindow.classList.remove('hidden');
        form.name.value = '';
        // setInterval(() => {
        // usersList.textContent = ''
        // eslint-disable-next-line no-use-before-define
        get();
        // }, 2000);
      }, 0);
    }
  })();

  const get = async () => {
    await fetch('http://localhost:3000/nicknames-list')
      .then((res) => res.json())
      .then((data) => {
        arrayUsers = data;
        data.forEach((el) => {
          const newUser = document.createElement('li');
          newUser.id = `${el.nickname}`;
          newUser.className = 'user';
          newUser.innerHTML = `${el.nickname}`;
          usersList.appendChild(newUser);
        });
        console.log(arrayUsers);
      });
  };
});

const ws = new WebSocket('ws://localhost:3000/ws');

textarea.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const body = { name: nick.nickname, time: moment().format('DD.MM.YY hh:mm'), message: textarea.value };

    ws.send(JSON.stringify(body));
    textarea.value = '';
  }
});
let dataMessage;

ws.addEventListener('message', (e) => {
  const dataList = JSON.parse(e.data);
  const { chat: message } = dataList;

  message.forEach((mes) => {
    if (mes !== 'undefined') {
      dataMessage = JSON.parse(mes);
      const nicknamesChat = [];
      nicknamesChat.push(dataMessage.name);

      nicknamesChat.forEach((el) => {
        if (el === nickYou) {
          const newMes = document.createElement('li');
          newMes.className = 'new-mes';
          newMes.innerHTML = `
          <div class="chat-containers">
          <p class="you">YOU</p>
          <p class="second">${dataMessage.time}</p>
          </div>
          <p class="mes-text">${dataMessage.message}</p>
          `;
          messagesList.appendChild(newMes);
        } else {
          const newMes = document.createElement('li');
          newMes.className = 'new-mess';
          newMes.innerHTML = `
          <div class="chat-containers">
          <p class="nickname">${dataMessage.name}</p>
          <p class="second">${dataMessage.time}</p>
          </div>
          <p class="mes-text">${dataMessage.message}</p>
          `;
          messagesList.appendChild(newMes);
        }
      });
    }
  });
});

ws.addEventListener('close', () => {
  const deleteLi = document.getElementById(`${nickYou}`);
  usersList.removeChild(deleteLi);
  console.log('ws close');

  console.log(usersList);
});
