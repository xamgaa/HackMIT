//Packages
const express = require('express');
const socket = require('socket.io');

//App Setup
const app = express();
const port = process.env.PORT || 3000

var server = app.listen(port, () => {
  console.log(`Example app listening at http://localhost:3000`);
})

//Static Files
app.use(express.static('./website'));

//Player Management
var inGame = false;
var players = [];
var queueOfPlayers = [];
var numberOfPlayers = 0;

//Time Management
var time = 33;
var elapsed = 0;

//Socket Setup
var io = socket(server);

io.on('connection', function(socket) {

  if(inGame || queueOfPlayers.length < 4) {
    newPlayer = new Object();
    newPlayer.id = socket.id;
    newPlayer.wpm = 0;
    newPlayer.rank = 0;
    newPlayer.name = ""
    queueOfPlayers.push(newPlayer);
    //add person to queue
  }
  else {

  }
  console.log("Player joined with id: " + socket.id + "\nNumber of players in queue: " + queueOfPlayers.length);

  //waitTime = waitInterval;
  socket.on('sendName', (name) => {
    for (let p = 0; p < queueOfPlayers.length; p++) {
      if (socket.id == queueOfPlayers[p].id) {
        queueOfPlayers[p].name = name;
      }
    }
  })


  if (queueOfPlayers.length >= 4 && !inGame) {
    for(var i = 0; i<4; i++) {
      players[i] = queueOfPlayers.shift();
    }
    for(var i = 0; i<4; i++) {
      console.log(players[i].id)
      io.to(players[i].id).emit('gameReady');
    }
    inGame = true;
    time = 33;
    setInterval(changeTime, 1000)
  }



  socket.on('disconnect', () => {

    for (var i = 0; i < players.length; i++)
    {
      if (socket.id == players[i].id)
      {
        players.splice(i, 1);
      }
    }

    for (var i = 0; i < queueOfPlayers.length; i++)
    {
      if (socket.id == queueOfPlayers[i].id)
      {
        queueOfPlayers.splice(i, 1);
      }
    }

    console.log('USER DISCONNECTED');
  });

  socket.on('wpm', (data) => {
    for (let i = 0; i < players.length; i++) {
      if (players[i].id == socket.id) {
        players[i].wpm = data;
      }
    }
  })
});

function calculateLevels() {
  if (players.length == 2) {
    io.to(players[0].id).emit("sendDifficulty", {
      difficulty: "medium",
      rank: players[0].rank
    });
    io.to(players[1].id).emit("sendDifficulty", {
      difficulty: "medium",
      rank: players[1].rank
    });
  }
  if (players.length == 3) {
    io.to(players[0].id).emit("sendDifficulty", {
      difficulty: "long",
      rank: players[0].rank
    })
    io.to(players[1].id).emit("sendDifficulty", {
      difficulty: "medium",
      rank: players[1].rank
    })
    io.to(players[2].id).emit("sendDifficulty", {
      difficulty: "short",
      rank: players[2].rank
    })
  }

  for (let j = 0; j < players.length; j++) {

    let level = (players[j].rank + 1) / numberOfPlayers;
    let difficulty = -1;

    if (level <= 0.25)
      difficulty = "long";
    else if (level > 0.25 && level <= 0.75)
      difficulty = "medium";
    else
      difficulty = "short";

    io.to(players[j].id).emit("sendDifficulty", {
      difficulty: difficulty,
      rank: players[j].rank
    })
  }
}

function selectionSort() {
  var minIdx, temp,
    len = players.length;
  for (var i = 0; i < len; i++) {
    minIdx = i;
    for (var j = i + 1; j < len; j++) {
      if (players[j].wpm < players[minIdx].wpm) {
        minIdx = j;
      }
    }
    temp = players[i];
    players[i] = players[minIdx];
    players[minIdx] = temp;
  }
  players.reverse();
  for (let k = 0; k < len; k++) {
    players[k].rank = k;
  }
  calculateLevels();
  io.emit('leaderboard', players)
}

function changeTime() {
  if (time <= 0) {
    eliminateLowest();
    time = 30;
  }
  time--;
  elapsed++;

  for(var i = 0; i<players.length; i++) {
    io.to(players[i].id).emit('time', {time:time, elapsed:elapsed});
  }

  console.log("Array Size: " + players.length + "\nQueue Size: " + queueOfPlayers.length);
  console.log(players);

}

//Removes the player with the lowest WPM from the game
function eliminateLowest() {
  if (inGame) {

    selectionSort();

    if(players.length =1)
    {
      io.to(players[0].id).emit("end", {
        name: players[0].name,
        wpm: players[0].wpm,
        win: true
      });
      inGame=false;
      endGame();
      checkReset();
    }
    if (players.length == 2)
    {
      io.to(players[0].id).emit("end", {
        name: players[0].name,
        wpm: players[0].wpm,
        win: true
      });
      io.to(players[1].id).emit("end", {
        name: players[1].name,
        wpm: players[1].wpm,
        win: false
      });

      console.log("Eliminating " + name + "(" + id + ")");
      inGame=false;
      endGame();
      checkReset();
    }
    else{
      var name = players[players.length - 1].name;
      var wpm = players[players.length - 1].wpm;
      var id = players[players.length - 1].id;

      //removes last person
      players.splice(players.length - 1, 1);


        io.to(id).emit("end", {
          name: name,
          wpm: wpm,
          win: false
        });
        console.log("Eliminating " + name + "(" + id + ")");
      }
    }
    //collects information of the person being eliminated

  }

function endGame()
{
  elapsed=0;
  time=33;
  players = [];
  console.log("GAME ENDED");
}
function checkReset()
{
  if (queueOfPlayers.length >= 4)
  {
    for(var i = 0; i<4; i++) {
      players[i] = queueOfPlayers.shift();
    }
    for(var i = 0; i<4; i++) {
      console.log(players[i].id)
      io.to(players[i].id).emit('gameReady');
    }
    inGame = true;
    time = 33;
    setInterval(changeTime, 1000)
  }
}
