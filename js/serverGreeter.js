fs = require('fs');

var ServerGreeter = function(parent) {
  this.parent = parent;
};

module.exports = ServerGreeter;

ServerGreeter.prototype.handleNewMember = function (member) {
  var greetText = fs.readFileSync('ressources/greeting.txt', 'utf8');
  member.send(greetText);
  console.log("Welcomed " + member.user.username + " to the server");
};
