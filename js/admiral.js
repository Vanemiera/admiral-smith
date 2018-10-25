var Discord = require('discord.js');

var PlatformCommand = require('./platformCommand.js');
var ServerGreeter = require('./serverGreeter.js');
var AdminCommand = require('./adminCommand.js');
var LFGCommand = require('./lfgCommand.js');
var MuteCommand = require('./muteCommand.js');
var dutyRoster = require('./dutyRoster.js');
var warStatus = require('./warStatus.js');

function Admiral(config) {
  this.config = config;
  this.bot = new Discord.Client();
  var self = this;

  this.platCom = new PlatformCommand(this);
  this.srvGrtr = new ServerGreeter(this);
  this.adminCom = new AdminCommand(this);
  this.lfgCom = new LFGCommand(this);
  this.muteCom = new MuteCommand(this);
  this.bot.setInterval(dutyRoster.bind(this.bot), 1000 * 60);
  this.bot.setInterval(warStatus.bind(this.bot), 1000 * 60);

  this.bot.on('ready', function() {
    console.log('Admiral ready!');
    dutyRoster.bind(self.bot)();
    warStatus.bind(self.bot)();
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
  return this.bot.destroy();
};

Admiral.prototype.handleMessage = function(message) {
  if (message.author.id == this.bot.user.id) {
    return;
  } else if (!message.guild) {
    message.channel.send('No private messages, please. :wink:');
    return;
  }

  try {
    if (message.content.startsWith('!platform')) {
      this.platCom.handleCommand(message);
    } else if (message.content.startsWith('!admin')) {
      this.adminCom.handleCommand(message);
    } else if (message.content.startsWith('!lfg')) {
      this.lfgCom.handleCommand(message);
    } else if (message.content.startsWith('!mute')) {
      this.muteCom.handleCommand(message);
    }
  } catch (error) {
    console.log(error.message)
  }
  
};
