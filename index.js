const debug = require('debug')('APP:MAIN');
const _ = require('lodash');

const express = require('express'),
  app = express();

// Servir el cliente
app.use(express.static('client'));
app.use(express.static('bower_components'));

// Espera un json en el body, y lo transforma en un objeto
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// -----------------

const Match = require('./match');
const matches = [];

//API End Points
//API Servicios
//WEB METHOD (metodo web), WEB VERB (verbo web) = POST GET DELETE PUT PATCH
app.get('/match/:idMatch', function (req, res) {
  const idMatch = _.parseInt(_.get(req, 'params.idMatch'));  
  const match = _.find(matches, {id: idMatch});

  if(_.isNil(match)) {
  	return res.status(404).end();
  }

  return res.json(match.clean());
});

app.post('/match', function(req, res) {
  const id = matches.length + 1;
  const match = new Match(id);
  matches.push(match);  
  res.json(match.clean());
});

app.post('/match/:idMatch/:idPlayer/point', function(req, res) {
  const idMatch = _.parseInt(_.get(req, 'params.idMatch'));
  const idPlayer = _.parseInt(_.get(req, 'params.idPlayer'));  
  const match = _.find(matches, {id: idMatch});
  const turn = match.turn % 2;
  let validTurn = false;
  
  let matrix;

  if(_.isNil(match)) {
    return res.status(404).end();
  }  

  if(idPlayer === 1) {
    matrix = match.player2.getMap();
    if(turn === 0) {
      validTurn = true;
    }
  } if(idPlayer === 2) {
    matrix = match.player1.getMap();
    if(turn === 1) {
      validTurn = true;
    }
  }
  
  const action = _.get(req, 'body.action');
  const x = _.get(req, 'body.x');
  const y = _.get(req, 'body.y');
  const point = matrix.getPoint(x, y);  

  if(action === 'atack') {
    if(!validTurn) {
      return res.status(400).end();
    }

    point.fire();
    match.turnPlayed();

    if(point.boat) {
      match.turnPlayed();
    }
  }

  res.json(match.clean());
});
 
app.listen(3000)
