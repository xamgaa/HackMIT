//Packages
const express = require('express')
const socket = require('socket.io')

//App Setup
const app = express()
const port = process.env.PORT || 3000

var server = app.listen(port, () => {
  console.log(`Example app listening at http://localhost:3000`);
})

//Static Files
app.use(express.static('./website'));


//Player Management
var players = [];
var numberOfPlayers = 0;

var waitTime = 15;
const waitInterval = 15;
setInterval(countDown, 1000);


//Socket Setup
var io = socket(server);


io.on('connection', function(socket){

  let i=0;
  for(i = 0; i<players.length;i++) {
      if(players[i].id == socket.id) {
        break;
      }

  }
  if(i == players.length) {
    //Initialize new player
      let newPlayer = new Object();
      newPlayer.id = socket.id;
      newPlayer.wpm = 0;
      newPlayer.rank = 0;
      newPlayer.name = "";
      players.push(newPlayer);
      numberOfPlayers++;
  }

  console.log("Player joined with id: " + socket.id +"\nNumber of players: " + numberOfPlayers);

  waitTime = waitInterval;

  if (numberOfPlayers < 2)
  {
    socket.emit('gameReady', false);
  }
  else if (numberOfPlayers == 10)
  {
    socket.emit('gameReady', true);
  } else if(waitTime <= 0 && numberOfPlayers >= 2)
  {
    socket.emit('gameReady', true);
  }




  socket.on('disconnect', () => {
    numberOfPlayers--;
    console.log('user disconnected');
  });
  socket.on('wpm', (data) => {
    for(let i = 0; i<players.length;i++) {
      if(players[i].id == socket.id) {
        players[i].wpm = data;
      }

  }
    console.log(players);
  })
});

function countDown()
{
  waitTime--;
  console.log("Wait Time: " + waitTime);
}
