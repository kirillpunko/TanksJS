const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

const http = require('http').Server(app);
const cors = require('cors');
const socketIO = require('socket.io')(http,{
  cors:{
    origin:'http://localhost:5173'
  }
});

// Создание GET маршрута
app.get('/express_backend', (req, res) => { //Строка 9
  console.log("Отправлено")
  res.json({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' }); //Строка 10

});

//массив состояний игроков
const playersState = {};

socketIO.on('connection',(socket)=>{
  console.log(`${socket.id} user connected`)
  socket.on('stateNow',(data)=>{
    playersState[socket.id] = data;
    socketIO.emit('responseState', Object.values(playersState));
  })
  socket.on('hit',(data)=>{
    socketIO.emit('responseHit', data);
  })
  socket.on('died',(data)=>{
    playersState[socket.id] = data;
    socketIO.emit('responseState', Object.values(playersState));
  })
  socket.on('disconnect',(reason)=>{
    let id = socket.id;
    delete playersState[id];
    console.log(`${socket.id} user disconnected`);
    socketIO.emit('responseState', Object.values(playersState));
  })
})

http.listen(port, () => console.log(`Listening on port ${port}`));

