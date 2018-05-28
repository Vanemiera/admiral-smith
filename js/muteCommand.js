var fs = require('fs');

var MILLISECONDS_PER_HOUR = 1000 * 60 * 60;
var USAGE = 'Usage: !mute @member hours';
var MUTE_ROLE = 'Muted';

var MuteCommand = function(parent) {
  this.parent = parent;
  var self = this;
  this.load();

  var service = function(){
    var now = new Date();
    console.log('Service ' + now.toString());
    for (var key in self.mutes) {
      if (now.getTime() > self.mutes[key]) {
        delete self.mutes[key];
        self.save();
        console.log('Removed ' + key + ' from the list');
      }
    }
  };
  service();
  setInterval(service, 1000*60);
};

module.exports = MuteCommand;

MuteCommand.prototype.handleCommand = function(message) {
  //TODO: add role to member and save time of end
  //TODO: Save mute list
  //TODO: make sure only mods and admins can issue command
  var roleID = false;
  var mutee = {memberID: 0, timeout: 0};
  var now = new Date();
  mutee.timeout = now + 0 * MILLISECONDS_PER_HOUR;
  console.log(now.getTime());
  this.mutes[Object.keys(this.mutes).length] = new Date().getTime();

  this.save();
  message.channel.send(USAGE);

  for (var [key, value] of message.guild.roles) {
    if (value.name == MUTE_ROLE) {
      roleID = key;
      break;
    }
  }

  if (!roleID) return;

  message.guild.fetchMember(message.author)
    .then(function(member) {
      if (addRole) {
        member.addRole(roleID);
        message.channel.send('LFG role added! You can now be notified with the LFG tag.');
      } else {
        member.removeRole(roleID);
        message.channel.send('LFG role removed! You will no longer receive notifications for the LFG tag.');
      }
    })
    .catch(function(e) {
      console.log(e);
    });
};

MuteCommand.prototype.save = function() {
  try {
    fs.writeFileSync('mutes.json', JSON.stringify(this.mutes, null, 2));
  } catch (e) {
    console.log(e);
  }
};

MuteCommand.prototype.load = function() {
  try {
    this.mutes = JSON.parse(fs.readFileSync('mutes.json'));
  } catch (e) {
    this.mutes = [];
  }
};
