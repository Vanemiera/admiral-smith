var AdminCommand = function(parent) {
  this.parent = parent;
};

AdminCommand.prototype.handleCommand = function(message) {
  if (!message.author.id == this.parent.config.superUser) return;
  var words = message.content.split(' ');
  if (words.length < 2) return;
  var subCommand = words[1].toLowerCase();
  if (subCommand == 'testnewmember') {
    this.testNewMember(message);
  }
};

module.exports = AdminCommand;

AdminCommand.prototype.testNewMember = function(message) {
  message.guild.fetchMember(message.author)
    .then(function(member) {
      message.channel.send('Private message with greeting text sent to <@' + message.author.id + '>!');
      this.parent.srvGrtr.handleNewMember(member);
    }.bind(this));
};
