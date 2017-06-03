var PlatformCommand = function(parent) {
  this.parent = parent;
};

module.exports = PlatformCommand;

PlatformCommand.prototype.handleCommand = function(message) {
  var words = message.content.split(' ');
  if (words.length < 2) return;
  var role = words[1].toLowerCase();
  if (role=='pc') {
    setRole(message.author, message.guild, 'PC');
  } else if (role=='psn') {
    setRole(message.author, message.guild, 'PSN');
  } else if (role=='pc+psn') {
    setRole(message.author, message.guild, 'PC + PSN');
  }
};

var setRole = function(user, guild, role) {
  var roles = ['PC', 'PSN', 'PC + PSN'];
  var otherRoles = roles.filter(function(r) {return r!=role;});
  var roleName = '';

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
    console.log("Changed role of " + member.user.username + " to " + role);
  })
  .catch(function(e) {
    console.log(e);
  });
};
