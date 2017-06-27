var PlatformCommand = function(parent) {
  this.parent = parent;
};

module.exports = PlatformCommand;

const USAGE = 'Usage: !platform [ pc | psn | pc+psn ]'

PlatformCommand.prototype.handleCommand = function(message) {
  var words = message.content.split(' ');
  if (words.length != 2) {
    message.channel.send(USAGE);
    return;
  }
  var role = words[1].toLowerCase();
  if (role=='pc') {
    setRole(message, 'PC');
  } else if (role=='psn') {
    setRole(message, 'PSN');
  } else if (role=='pc+psn') {
    setRole(message, 'PC + PSN');
  } else {
    message.channel.send(USAGE);
  }
};

var setRole = function(message, role) {
  var roles = ['PC', 'PSN', 'PC + PSN'];
  var otherRoles = roles.filter(function(r) {return r!=role;});
  var roleName = '';
  var user = message.author;
  var guild = message.guild;

  guild.fetchMember(user)
  .then(function(member) {
    for (var roleID of guild.roles.keys()) {
      roleName = guild.roles.get(roleID).name;
      if (roleName==role) {
        member.addRole(roleID);
      } else if (otherRoles.includes(roleName)) {
        member.removeRole(roleID);
      }
    }
    console.log('Changed role of ' + member.user.username + ' to ' + role);
    message.channel.send('Role set!')
  })
  .catch(function(e) {
    console.log(e);
  });
};
