const debug = require('debug')('APP:TERRAIN');
const _ = require('lodash');

const Chance = require('chance'),
  chance = new Chance();

const WIDTH = 10;
const HEIGHT = 10;

class Matrix {
  constructor() {
    this.rows = [];
    
    _.range(HEIGHT).forEach((y) => {
      this.addRowColumns(y);
    });    
  }

  addRowColumns(y) {
    this.rows.push(_.range(WIDTH).map((x) => {
      return new Point(x, y, this);
    }));
  }

  getPoint(x, y) {
    return this.rows[y][x];
  }

  cleanPointMatrix() {
    this.rows.forEach((row) => {
      row.forEach((point) => {
        delete point.matrix;
        if(point.boat) {
          point.empty = false;
        } else {
          point.empty = true
        }
      })
    });
  }
  
  placeBoat(boat) {
    const x = chance.integer({min: 0, max: 9});
    const y = chance.integer({min: 0, max: 9});
    
    const point = this.getPoint(x, y);

    const top = point.getTop();
    const right = point.getRight();
    const bot = point.getBot();    
    const left = point.getLeft();    
    
    const posibleHorizontal = _.compact([left, right]);
    const posibleVertical = _.compact([top, bot]);

    const canLeft = left && checkPlacementConstrains(boat, left);
    const canRight = right && checkPlacementConstrains(boat, right);
    const canTop = top && checkPlacementConstrains(boat, top);
    const canBot = bot && checkPlacementConstrains(boat, bot);
    const canCurrentPoint = checkPlacementConstrains(boat, point);

    if(!canCurrentPoint) {
      return this.placeBoat(boat);
    }

    if(boat.isHorizontal) {
      if(!canLeft && !canRight) {
        return this.placeBoat(boat);
      } else if(canLeft && canRight){
        if(chance.bool()) {
          boat.addPoint(left);          
        } else {
          boat.addPoint(right);          
        }
      } else if(canLeft) {
        boat.addPoint(left);
      } else {
        boat.addPoint(right);
      }      
    } else if(boat.isVertical) {
      if(!canTop && !canBot) {
        return this.placeBoat(boat);
      } else if(canTop && canBot) {
        if(chance.bool()) {
          boat.addPoint(top);
        } else {
          boat.addPoint(bot);
        }
      } else if(canTop) {
        boat.addPoint(top);
      } else {
        boat.addPoint(bot);
      }
    }

    boat.addPoint(point);
    return true;

    function checkPlacementConstrains(boat, point) {
      const points = _.compact([
        point.getBot(), point.getBotLeft(), point.getBotRight(),
        point.getLeft(), point.getRight(),
        point.getTop(), point.getTopLeft(), point.getTopRight()
      ]);

      const valid = points.map((point) => {
        return _.isNil(point.boat) || point.boat === boat;
      });

      const isInvalidValid = _.some(valid, function(element) {
        return element === false;
      });

      return !isInvalidValid;
    }
  }
}

class Point {
  
  constructor(x, y, matrix) {
    this.x = x;
    this.y = y;
    this.boat = null;
    this.fired = false;
    this.matrix = matrix;
    this.revealed = false;
    this.isSunken = false;
  }

  fire() {
    this.fired = true;
    this.setRevealed();

    if(!_.isNil(this.boat)) {
      this.boat.isSunken = !_.some(this.boat.points, ['fired', false]);
      if(this.boat.isSunken) {
        this.isSunken = true;
        this.boat.points.forEach((point) => {
          point.isSunken = true;
          point.nearPoints()
            .top.setRevealed()
            .topRight.setRevealed()
            .right.setRevealed()
            .botRight.setRevealed()
            .bot.setRevealed()
            .botLeft.setRevealed()
            .left.setRevealed()
            .topLeft.setRevealed();
        });
      }
    }
  }

  setRevealed() {
    this.revealed = true;
  }

  nearPoints() {
    const topPoint = this.getTop();
    const topRight = this.getTopRight();
    const rightPoint = this.getRight();
    const botRight = this.getBotRight();
    const botPoint = this.getBot();
    const topLeft = this.getTopLeft();
    const leftPoint = this.getLeft();
    const botLeft = this.getBotLeft();

    const points = {
      top: {
        setRevealed: function() { return setRevealed(topPoint); },
        isSunkenBoat: function() { return isSunkenBoat(topPoint); }
      },

      bot: {
        setRevealed: function() { return setRevealed(botPoint); },
        isSunkenBoat: function() { return isSunkenBoat(botPoint); }
      },

      topRight: {
        setRevealed: function() { return setRevealed(topRight); },
        isSunkenBoat: function() { return isSunkenBoat(topRight); }
      },

      botRight: {
        setRevealed: function() { return setRevealed(botRight); },
        isSunkenBoat: function() { return isSunkenBoat(botRight); }
      },

      topLeft: {
        setRevealed: function() { return setRevealed(topLeft); },
        isSunkenBoat: function() { return isSunkenBoat(topLeft); }
      },

      botLeft: {
        setRevealed: function() { return setRevealed(botLeft); },
        isSunkenBoat: function() { return isSunkenBoat(botLeft); }
      },

      left: {
        setRevealed: function() { return setRevealed(leftPoint); },
        isSunkenBoat: function() { return isSunkenBoat(leftPoint); }
      },

      right: {
        setRevealed: function() { return setRevealed(rightPoint); },
        isSunkenBoat: function() { return isSunkenBoat(rightPoint); }
      }
    };

    return points;

    function setRevealed(point) {
      if(!_.isNil(point)) {
        point.setRevealed();
      }

      return points;
    }

    function isSunkenBoat(point) {
      if(!_.isNil(point)) {
        return point.isSunken;
      }

      return false;
    }
  }

  getRight() {
    if(this.x < 9) {
      return this.matrix.getPoint(this.x + 1, this.y);
    }

    return null;    
  }

  getLeft() {
    if(this.x > 0) {
      return this.matrix.getPoint(this.x - 1, this.y);
    }

    return null;
  }

  getBot() {
    if(this.y < 9) {      
      return this.matrix.getPoint(this.x, this.y + 1);
    }

    return null;
  }

  getBotRight() {
    if(this.getBot() && this.getRight()) {
      return this.matrix.getPoint(this.x + 1, this.y + 1);
    }

    return null
  }

  getBotLeft() {
    if(this.getBot() && this.getLeft()) {
      return this.matrix.getPoint(this.x - 1, this.y + 1);
    }

    return null
  }

  getTop() {    
    if(this.y > 0) {
      return this.matrix.getPoint(this.x, this.y - 1);
    }

    return null;
  }

  getTopRight() {
    if(this.getTop() && this.getRight()) {
      return this.matrix.getPoint(this.x + 1, this.y - 1);
    }

    return null
  }

  getTopLeft() {
    if(this.getTop() && this.getLeft()) {
      return this.matrix.getPoint(this.x - 1, this.y - 1);
    }

    return null
  }

  setBoat(boat) {
    this.boat = boat;
  }

  hasBoat() {
    return !!this.boat;
  }

  isFired() {
    return this.fired;
  }

  isEmpty() {
  	return !this.hasBoat();
  }

  isRevealed() {
  	this.revealed || this.isFired() || this.nearSunkenBoat();
  }

  isRedMarked() {
  	return this.isFired() && this.hasBoat();
  }

  nearSunkenBoat() {
  	return this.nearPoints.top.isSunkenBoat() || this.nearPoints.bot.isSunkenBoat() || this.nearPoints.left.isSunkenBoat() || this.nearPoints.right.isSunkenBoat();
  }
}

module.exports = { Matrix, Point };
