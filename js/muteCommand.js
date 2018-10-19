var fs = require('fs');

var MILLISECONDS_PER_HOUR = 1000 * 60 * 60;
var USAGE = 'Usage: !mute @member hours';
var MUTE_ROLE = 'Muted';
var MODROLES = ['Moderator', 'Administrator']

var MuteCommand = function (parent) {
  this.parent = parent;
  var self = this;
  this.load();

  var service = function () {
    var now = new Date();
    for (var i in self.mutes) {
      var mutee = self.mutes[i];
      if (now.valueOf() > mutee.timeout) {
        try {
          var guild = self.parent.bot.guilds.get(mutee.guildID);
          var channel = guild.channels.get(mutee.channelID);
          guild.fetchMember(mutee.memberID)
            .then(function (member) {
              var role = guild.roles.filter(r => r.name === MUTE_ROLE).first();

              member.removeRole(role)
                .then(function () {
                  member.addRoles(mutee.ownedRoles.map(r => r.id))
                })
                .then(function () {
                  channel.send('Member <@' + mutee.memberID + '> muted by <@' + mutee.modID + '> can now talk again.');
                })
                .catch(function (e) {
                  console.log(e);
                });
              self.mutes.splice(i, 1);
              self.save();
              console.log('Removed ' + mutee.memberName + ' from the list');
            })
            .catch(function (e) {
              console.log(e);
            });
        } catch (error) {
          console.log(error)
        }
      }
    }
  };
  setInterval(service, 1000 * 60);
};

module.exports = MuteCommand;

MuteCommand.prototype.handleCommand = function (message) {
  var guildMod = message.guild.member(message.author.id);
  if (guildMod.roles.filter(r => MODROLES.includes(r.name)).size == 0) {
    console.log('Invalid mute request by ' + message.author.username);
    return;
  }

  var roleID = false;
  var mutee = { memberID: 0, timeout: 0, memberName: '', guildID: 0, guildName: '', modID: 0, modName: '', channelID: 0, channelName: '', ownedRoles: [] };
  var now = new Date();
  var memberID = '';
  var hours = 0;
  var modChannel = message.channel;
  console.log(message.content)

  var words = message.content.split(/\s+/);
  if (words.length != 3) {
    message.channel.send(USAGE);
    return;
  }
  try {
    memberID = words[1].substr(2, 18);
    hours = parseFloat(words[2])
  } catch (e) {
    message.channel.send(USAGE);
    return
  }

  message.guild.fetchMember(memberID)
    .then(function (member) {

      mutee.memberID = memberID;
      mutee.memberName = member.user.username;
      mutee.modID = message.author.id;
      mutee.modName = message.author.username;
      mutee.timeout = now.valueOf() + hours * MILLISECONDS_PER_HOUR;
      mutee.channelID = message.channel.id;
      mutee.channelName = message.channel.name;
      mutee.guildID = message.channel.guild.id;
      mutee.guildName = message.channel.guild.name;
      mutee.ownedRoles = member.roles
        .map(x => ({ id: x.id, name: x.name }))
        .filter(r => !["@everyone", MUTE_ROLE].includes(r.name));
      this.mutes.push(mutee);

      this.save();

      for (var [key, value] of message.guild.roles) {
        if (value.name === MUTE_ROLE) {
          roleID = key;
          break;
        }
      }

      if (!roleID) return;

      member.addRole(roleID)
        .then(function () {
          member.removeRoles(mutee.ownedRoles.map(r => r.id));
        })
        .then(function () {
          modChannel.send('Member <@' + memberID + '> muted by ' + message.author + ' for ' + hours + ' hour(s).');
        })
        .catch(function (e) {
          console.log(e);
        });

    }.bind(this))
    .catch(function (e) {
      console.log(e);
    });
};

MuteCommand.prototype.muteMember = function (member) {

};

MuteCommand.prototype.save = function () {
  try {
    fs.writeFileSync('mutes.json', JSON.stringify(this.mutes, null, 2));
  } catch (e) {
    console.log(e);
  }
};

MuteCommand.prototype.load = function () {
  try {
    this.mutes = JSON.parse(fs.readFileSync('mutes.json'));
  } catch (e) {
    this.mutes = [];
  }
};
