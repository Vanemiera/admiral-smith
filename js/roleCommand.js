var RoleCommand = function(parent) {
  this.parent = parent;
};

module.exports = RoleCommand;

RoleCommand.prototype.handleCommand = function(message) {
  var role = message.content.split(' ')[1].toLowerCase();
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
  })
  .catch(function(e) {
    console.log(e);
  });
};
