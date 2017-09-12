const should = require('chai').should();
const Match = require('../match');
const _ = require('lodash');

describe('Match', function () {
  let match, player1, player2;

  beforeEach(() => {
  	match = new Match();
  });

  it('new match', async function () {
  	should.exist(match);
  });

  it('player1 and player 2', function() {
  	player1 = _.get(match, 'player1');
  	player2 = _.get(match, 'player2');

  	should.exist(player1);
  	should.exist(player1);
  });

  it('player1 and player 2 terrains', function() {  	
  	const player1TarrainLines = _.get(player1.getMap(), 'rows');
  	const player2TarrainLines = _.get(player2.getMap(), 'rows');

  	should.exist(player1TarrainLines);
  	player1TarrainLines.should.have.lengthOf(10);

  	should.exist(player2TarrainLines);
  	player2TarrainLines.should.have.lengthOf(10);
  });

  it('Player 1 matrix and boats', function() {
    const boats = player1.boats;
    const matrix = player1.matrix;

    should.exist(matrix);
    
    boats.should.be.an('array');
    boats.should.have.lengthOf(3);

    boats.forEach((boat) => {
      boat.heigth.should.be.at.least(1);
      boat.heigth.should.be.at.most(2);
      boat.width.should.be.at.least(1);
      boat.width.should.be.at.most(2);
    });


    matrix.rows.should.have.lengthOf(10);

    matrix.getPoint(1,0).x.should.be.equal(1);
    matrix.getPoint(1,2).y.should.be.equal(2);
  });

  it('Boats are in their matrix points', function() {
    const boats = player1.boats;
    
    boats.forEach((boat) => {
      boat.points.forEach((point) => {
        point.hasBoat().should.equal(true);
        point.boat.should.equal(boat);
      });
    });
  });

  it('To Json', function() {
    match.clean();
    
    match.player1.matrix.rows.forEach((row) => {
      row.forEach((point) => {
        should.not.exist(point.matrix);
      });
    });

    match.player1.boats.forEach((boat) => {
      boat.points.forEach((point) => {
        if(!!point.boat) {
          point.boat.should.be.a('boolean');
        } else {
          should.not.exist(point.boat);
        }
      })      
    });
  });
});

function getMap(player) {
  return player.getMap();
}
