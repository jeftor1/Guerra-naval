const Chance = require('chance');
const chance = new Chance();

class Boat {
  
  constructor() {    
  	const direccion = chance.integer({min: 1, max: 3});
    this.isSinglePoint = false;
    this.isHorizontal = false;
    this.isVertical = false;
    this.isSunken = false;

    this.points = [];

  	if(direccion === 1) {
      this.isSinglePoint = true;
  	  this.width = 1;
  	  this.heigth = 1;
  	} else if(direccion === 2) {
	    this.width = 1;
  	  this.heigth = 2;
      this.isVertical = true;
  	} else if(direccion === 3) {
	    this.width = 2;
  	  this.heigth = 1;
      this.isHorizontal = true;
  	}
  }

  addPoint(point) {
    this.points.push(point);
    point.setBoat(this);
  }

}

module.exports = Boat;
