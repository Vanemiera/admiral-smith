var fs = require('fs');
var Discord = require('discord.js');

var PlatformCommand = require('./platformCommand.js');
var ServerGreeter = require('./serverGreeter.js');
var AdminCommand = require('./adminCommand.js');
var LFGCommand = require('./lfgCommand.js');

function Admiral(config) {
  this.config = config;
  this.bot = new Discord.Client();

  this.platCom = new PlatformCommand(this);
  this.srvGrtr = new ServerGreeter(this);
  this.adminCom = new AdminCommand(this);
  this.lfgCom = new LFGCommand(this);

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

//TODO: handle messages from private channels too
Admiral.prototype.handleMessage = function(message) {
  if (!message.guild) return;

  if (message.content.startsWith('!platform')) {
    this.platCom.handleCommand(message);
  } else if (message.content.startsWith('!admin')) {
    this.adminCom.handleCommand(message);
  } else if (message.content.startsWith('!lfg')) {
    this.lfgCom.handleCommand(message);
  }
};
