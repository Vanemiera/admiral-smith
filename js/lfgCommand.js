var LFGCommand = function(parent) {
  this.parent = parent;
};

module.exports = LFGCommand;

const USAGE = 'Usage: !lfg [ join | leave ]'

LFGCommand.prototype.handleCommand = function(message) {
  var role = 'LFG'
  var roleID = false;
  var words = message.content.split(' ');
  if (words.length != 2) {
    message.channel.send(USAGE);
    return;
  }
  var subCom = words[1].toLowerCase()

  if (subCom == 'join') {
    var addRole = true;
  } else if (subCom == 'leave') {
    var addRole = false;
  } else {
    message.channel.send(USAGE);
    return;
  }

  for (var [key, value] of message.guild.roles) {
    if (value.name == role) {
      roleID = key;
      break;
    }
  }

  if (!roleID) return;

  message.guild.fetchMember(message.author)
  .then(function(member) {
    if (addRole) {
      member.addRole(roleID);
      message.channel.send('LFG role added! You can now be notified with the LFG tag.')
    } else {
      member.removeRole(roleID);
      message.channel.send('LFG role removed! You will no longer receive notifications for the LFG tag.')
    }
  })
  .catch(function(e) {
    console.log(e);
  });
};
