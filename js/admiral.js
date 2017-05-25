var fs = require('fs');
var Discord = require('discord.js');

var RoleCommand = require('./roleCommand.js');
var ServerGreeter = require('./serverGreeter.js');
var AdminCommand = require('./adminCommand.js');

function Admiral(config) {
  this.config = config;
  this.bot = new Discord.Client();

  this.roleCom = new RoleCommand(this);
  this.srvGrtr = new ServerGreeter(this);
  this.adminCom = new AdminCommand(this);

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

  this.bot.on('guildMemberAdd', this.srvGrtr.handleNewMember);
}

module.exports = Admiral;

Admiral.prototype.login = function() {
  this.bot.login(this.config.token);
};

Admiral.prototype.logout = function() {
  this.bot.destroy()
};

Admiral.prototype.handleMessage = function(message) {
  if (!message.guild) return;

  if (message.content.startsWith('!role')) {
    this.roleCom.handleCommand(message);
  } else if (message.content.startsWith('!admin')) {
    this.adminCom.handleCommand(message);
  }
};
