var app = angular.module('calculator', ['ngRoute']);
var socket = io();

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    $routeProvider
      .when('/', {
          templateUrl: 'views/calculator.html',
          controller: 'CalcController',
          controllerAs: 'calc'
      });

    $locationProvider.html5Mode(true);
}]);

//Renders to page
app.controller('CalcController', ['Calculator', 'mySocket', function(Calculator, mySocket){
  this.title = 'Calculator';
  this.title2 = 'Last 10 calculations';

  this.data = Calculator.data;
  this.math = Calculator.math;
  this.numberClick = Calculator.numberClick;
  this.results = mySocket.data;
}]);

//recieves resultArray from server event broadcast
app.factory('mySocket', ['$timeout', function($timeout){
  var data = {
    resultArray: []
  };

  socket.on('results', function(resultArray){
    //force update of Angular bindings with resultArray
    $timeout(function() {
      data.resultArray = resultArray;
    });
    console.log('new resultsArray is', data.resultArray);
  });

  return {
    data: data
  }
}]);

//Do calculations and emit result to server
app.factory('Calculator', ['$location', 'mySocket', function($location, mySocket) {
  var data = {
      resultString: '',
      resultArray: [],
      secondNumberString: '',
      firstNumber: 0,
      secondNumber: 0,
      result: 0,
      operator: false,
      divide: false,
      multiply: false,
      subtract: false,
      add: false
  };

  var math = {
        divide: function(){
          if (data.operator == false) {
            data.resultString += '÷';
            data.operator = true;
            data.divide = true;
          }
        },
        multiply: function(){
          if (data.operator == false) {
            data.resultString += 'x';
            data.operator = true;
            data.multiply = true;
          }
        },
        subtract: function(){
          if (data.operator == false) {
            data.resultString += '-';
            data.operator = true;
            data.subtract = true;
          }
        },
        add: function(){
          if (data.operator == false) {
            data.resultString += '+';
            data.operator = true;
            data.add = true;
          }
        },
        calc: function(){
          if (data.add == true) {
            data.result = data.firstNumber + data.secondNumber;
            data.resultString += '=' + data.result;
            this.addResult();
            this.clear();
          } else if (data.subtract == true) {
            data.result = data.firstNumber - data.secondNumber;
            data.resultString += '=' + data.result;
            this.addResult();
            this.clear();
          } else if (data.multiply == true) {
            data.result = data.firstNumber * data.secondNumber;
            data.resultString += '=' + data.result;
            this.addResult();
            this.clear();
          } else if (data.divide == true) {
            data.result = data.firstNumber / data.secondNumber;
            data.resultString += '=' + data.result;
            this.addResult();
            this.clear();
          } else {
            console.log('you need an operator!');
          }
        },
        //update result array and send to server
        addResult: function() {
          data.resultArray = mySocket.data.resultArray;  //make sure working from server's resultArray
          data.resultArray.unshift(data.resultString);   //add new result

          if (data.resultArray.length > 10) {
            data.resultArray.pop();
          }

          //emit new resultArray to server
          socket.emit('results', data.resultArray);

        },
        //clear all variables for next calculation
        clear: function(){
            data.resultString = '';
            data.secondNumberString = '';
            data.firstNumber = 0;
            data.secondNumber = 0;
            data.result = 0;
            data.operator = false;
            data.divide = false;
            data.multiply = false;
            data.subtract = false;
            data.add = false;
        }
  };

  numberClick = function(number){
    //determine if this is first number or second number
    //update float and string with that number
    if (data.operator == true && data.firstNumber > 0) {
      data.secondNumberString += number;
      data.secondNumber = parseFloat(data.secondNumberString);
      data.resultString += number;
    } else {
      data.resultString += number;
      data.firstNumber = parseFloat(data.resultString);
    }
  };

  return {
      numberClick: numberClick,
      math: math,
      data: data
    };
}]);
