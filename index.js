var readline = require('readline');
var Admiral = require('./js/admiral.js');
var config = require('./config.json');

var admiral = new Admiral(config);
admiral.login();

var terminal = readline.createInterface({
  'input': process.stdin,
  'output': process.stdout
});

terminal.on('line', function(input) {
  input = input.toLowerCase();
  if (input=='quit' || input=='exit') {
    admiral.logout()
    .then(function () {
      console.log('Exiting...');
      process.exit();
    })
    .catch(function() {
      console.log(' Couldn\'t log out!');
    });
  }
});
