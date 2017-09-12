(function() {
  angular.module('app',[])
  .constant('url', url)
  .constant('_', _)
  .constant('URL_ROOT', 'http://localhost:3000/index.html') 
  //.constant('URL_ROOT', 'http://ec2-13-58-188-36.us-east-2.compute.amazonaws.com:3000/index.html')
  .controller('SeaBattleController', SeaBattleController);

  SeaBattleController.$inject = ['$q', '$http', 'url', '_', 'URL_ROOT', '$interval'];

  function SeaBattleController($q, $http, url, _, URL_ROOT, $interval) {
    var vm = this;

    vm.atacking = false;
    vm.getMatrix = getMatrix;
    vm.getEnemyMatrix = getEnemyMatrix;
    vm.atack = atack;
    vm.isMyTurn = isMyTurn;
    vm.isGameOver = isGameOver;
    vm.getGanador = getGanador;

    activate();

    function getGanador() {
      var playerOne = _.get(vm, 'match.player1');
      var playerTwo = _.get(vm, 'match.player2');

      var isPlayerOneDone = isDone(playerOne);
      var isPlayerTwoDone = isDone(playerTwo);

      if(isPlayerOneDone) {
        return 'Jugador 2'
      } else if (isPlayerTwoDone) {
        return 'Jugador 1'
      }

    }

    function isGameOver() {
      var playerOne = _.get(vm, 'match.player1');
      var playerTwo = _.get(vm, 'match.player2');

      if(!playerOne || !playerTwo) {
        return false;
      }

      var isPlayerOneDone = isDone(playerOne);
      var isPlayerTwoDone = isDone(playerTwo);

      return isPlayerOneDone || isPlayerTwoDone;
    }    

    function isDone(player) {
      var boats = player.boats;      

      var isDone = !_.some(boats, function(boat) {
        return boat.isSunken === false;
      });
      
      return isDone;
    }

    function activate() {      
      checkMatch()
        .then(checkPlayer)
        .then(setInterval);
    }

    function setInterval() {
      $interval(function() {        
        if(!vm.atacking || !isMyTurn()) {          
          fetchMatch(getIdMatch());
        }
      }, 1250);
    }

    function atack(point) {      
      var URL = ['match/', getIdMatch(), '/', getIdPlayer(), '/point'].join('');

      $http.post(URL, {
        action: 'atack',
        x: point.x,
        y: point.y
      }).then(success, failure);
        
      function success(response) {
        var match = response.data;
        vm.atacking = false;
        var rows = _.get(match, 'player2.matrix.rows');
        vm.match = match;
      }

      function failure(response) {
        var status = response.status;
        if(status === 400) {
          swal('No es su turno. Debe esperar a que el otro jugador haga su jugada.')
        }        
      }
    }

    function getEnemyMatrix() {
      var matrix1 = _.get(vm, 'match.player1.matrix');
      var matrix2 = _.get(vm, 'match.player2.matrix');

      if(getIdPlayer() === 1) {
        return matrix2;
      } else {
        return matrix1;
      }
    }

    function getMatrix() {
      var matrix1 = _.get(vm, 'match.player1.matrix');
      var matrix2 = _.get(vm, 'match.player2.matrix');

      if(getIdPlayer() === 1) {
        return matrix1;
      } else if(getIdPlayer() === 2){
        return matrix2;
      }
    }

    function getIdPlayer() {
      var idPlayer = _.defaultTo(url('?id_player'), null);

      if(idPlayer) {
        return _.parseInt(idPlayer);
      }
      
      return null;
    }

    function isMyTurn() {
      var turn = _.get(vm, 'match.turn') % 2;
      if(getIdPlayer() === 1) {
        return turn === 0;
      } else if(getIdPlayer() === 2) {
        return turn === 1;
      }
    }

    function getIdMatch() {
      var idMatch = _.defaultTo(url('?id_match'), null);

      if(idMatch) {
        return _.parseInt(idMatch);
      }
      
      return null;
    }

    function checkPlayer() {
      return $q(function(resolve, reject) {
        if(_.isNil(getIdPlayer())) {
          swal({
            title: 'Aún no te has identificado',          
            showCancelButton: true,
            confirmButtonColor: "#C1C1C1",          
            confirmButtonText: 'Soy el jugador 1',
            cancelButtonText: 'Soy el jugador 2',
            closeOnConfirm: false,
            closeOnCancel: false
          },
          function(isConfirm) {
            var TITLE = 'Hecho!';
            var MESSAGE = ['Ahora eres el jugador ', isConfirm ? '1' : '2'].join('');

            swal({
              title: TITLE,
              text: MESSAGE,
              timer: 500,
              showConfirmButton: false
            }, function() {
              var queryParams = {
                'id_match': getIdMatch(),
                'id_player': isConfirm ? 1 : 2,
              };
              var query = $.param(queryParams);

              return redirectTo(query);
            });
          });
        } else {
          resolve();
        }
      }); 
    }

    function checkMatch() {
      return $q(function(resolve, reject) {
        if(_.isNil(getIdMatch())) {
          createMatch()
            .then(function(idMatch) {
              
              var queryParams = {
                'id_match': idMatch                
              };
              
              var query = $.param(queryParams);

              return redirectTo(query);
            });
        } else {
          fetchMatch(getIdMatch()).then(resolve);
        }
      });
    }

    function fetchMatch(idMatch) {
      return $q(function(resolve, reject) {
        var URL = 'match/' + idMatch;
        $http.get(URL)
          .then(function(response) {
            if(_.get(vm, 'match.turn') !== _.get(response, 'data.turn')) {
              vm.match = response.data;
            }

            resolve();
          }, function(response) {            
            return redirectTo($.param({}));
          });
      });
    }

    function createMatch() {
      var URL = 'match';
      return $q(function(resolve, reject) {
        return $http.post(URL)
          .then(function(response) {
            var match = response.data;

            resolve(match.id);
          });
      });
    }

    function getMatch() {
      var URL = 'match/' + idMatch;
      
      return $http.get(URL)
        .then(success, failure);

      function success(response) {
        return response.data;
      }

      function failure() {
        return createMatch();
      }
    }

    function redirectTo(query) {
      window.location = [URL_ROOT, '?', query].join('');
    }
  }

})();
