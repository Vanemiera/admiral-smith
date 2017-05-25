//TODO: implement server greeting test

var AdminCommand = function(parent) {
  this.parent = parent;
};

AdminCommand.prototype.handleCommand = function(message) {
  //TODO: verify sender
  var subCommand = message.content.split(' ')[1].toLowerCase();
  if (subCommand == 'testnewmember') {
    this.testNewMember(message)
  }
};

module.exports = AdminCommand;

AdminCommand.prototype.testNewMember = function(message) {
  message.guild.fetchMember(message.author)
  .then(function(member) {
    this.parent.srvGrtr.handleNewMember(member);
  }.bind(this));
};
