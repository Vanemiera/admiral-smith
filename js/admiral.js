var fs = require('fs');
var Discord = require('discord.js');

function Admiral(config) {
  this.config = config;
  this.bot = new Discord.Client();

  this.bot.on('ready', function() {
    console.log('Admiral ready!');
  });

  this.bot.on('disconnect', function() {
    console.log('Admiral disconnected!');
  });

  this.bot.on('error', function(error) {
    console.log('Error:', error.message);
  });

  this.bot.on('message', this.handleMessage.bind(this));
}

module.exports = Admiral;

Admiral.prototype.login = function() {
  this.bot.login(this.config.token);
};

Admiral.prototype.logout = function() {
  this.bot.destroy()
};

Admiral.prototype.handleMessage = function(message) {
  console.log('Message:', message.content);
  console.log('Author:', message.author.username, message.author.id);
  if (message.guild) console.log('Guild:', message.guild.name, message.guild.id);
  console.log('Channel type:', message.channel.constructor.name);

  var lcContent = message.content.toLowerCase();
  if (message.channel.constructor.name=='TextChannel' && message.channel.name=='my-platform') {
    if (lcContent=='pc') {
      setRole(message.author, message.guild, 'PC');
    } else if (lcContent=='psn') {
      setRole(message.author, message.guild, 'PSN');
    } else if (lcContent=='pc+psn') {
      setRole(message.author, message.guild, 'PC + PSN');
    }
  }
};

var setRole = function(user, guild, role) {
  var allRoles = ['PC', 'PSN', 'PC + PSN'];
  var otherRoles = allRoles.filter(function(r) {return r!=role;});
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
