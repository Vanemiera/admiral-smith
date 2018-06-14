var AdminCommand = function(parent) {
  this.parent = parent;
};

AdminCommand.prototype.handleCommand = function(message) {
  if (!message.author.id == this.parent.config.superUser) return;
  var words = message.content.split(/\s+/);
  if (words.length < 2) return;
  var subCommand = words[1].toLowerCase();
  if (subCommand == 'testnewmember') {
    this.testNewMember(message);
  } else if(subCommand == 'endapril') {
    this.endApril(message);
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

AdminCommand.prototype.endApril = function(message) {
  var guild = message.guild;
  var feedback = 'Nicknames removed:\n';
  guild.fetchMembers()
    .then(function(completeGuild) {
      completeGuild.members.forEach(function(member) {
        if (member.nickname == 'Cyborg' ) {
          change = member.setNickname('')
          change
            .then(function(m) {
              feedback += '<@'+ m.user.id + '>\n';
            })
            .catch(function(error) {
              console.log(error.message);
            });
        }
      });
      setTimeout(x => message.channel.send(feedback), 5000);
    })
    .catch(function(error) {
      console.log(error.message)
    });
};
