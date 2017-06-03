var LFGCommand = function(parent) {
  this.parent = parent;
};

module.exports = LFGCommand;

LFGCommand.prototype.handleCommand = function(message) {
  var role = "LFG"
  var roleID = false;
  var words = message.content.split(' ');
  if (words.length < 2) return;
  var subCom = words[1].toLowerCase()

  if (subCom == "join") {
    var addRole = true;
  } else if (subCom == "leave") {
    var addRole = false;
  } else {
    //TODO: give feedback about invalid command;
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
    } else {
      member.removeRole(roleID);
    }
  })
  .catch(function(e) {
    console.log(e);
  });
};
