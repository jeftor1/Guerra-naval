const terrain = require('../terrain');
const Matrix = terrain.Matrix;
const Boat = require('../boat');
const _ = require('lodash');

const NUM_BOATS = 10;

class Player {
  constructor() {
  	this.init();
  }

  init() {
    this.matrix = new Matrix();
    this.boats = [];
    this.placeBoats();
  }

  getMap() {
    return this.matrix;
  }

  cleanPointBoats() {
    this.boats.forEach((boat) => {
      boat.points.forEach((point) => {
        point.boat = true;
        point.empty = false;
      });
    });
  }

  placeBoats() {
    this.boats = _.range(NUM_BOATS).map(() => {
      const boat = new Boat();
      this.matrix.placeBoat(boat);

      return boat;
    });
  }

}

module.exports = Player;
