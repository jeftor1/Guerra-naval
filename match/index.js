const Player = require('../player');
const _ = require('lodash');
const Chance = require('chance'),
  chance = new Chance();

class Match {
  constructor(id) {
    Object.assign(this, {
      id,
      player1: new Player(),
      player2: new Player(),
      turn: chance.bool() ? 1 : 0
    });
  }

  turnPlayed() {
    this.turn ++;
  }

  clean() {
    const newMatch = _.cloneDeep(this);
    const player1 = newMatch.player1;
    const player2 = newMatch.player2;

    player1.cleanPointBoats();
    player1.matrix.cleanPointMatrix();
    
    player2.cleanPointBoats();
    player2.matrix.cleanPointMatrix();

    return newMatch;
  } 
}

module.exports = Match;