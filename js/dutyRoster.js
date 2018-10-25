var config = require('../data/config.json');

dutyRoster = function() {
    const guildID = config.dutyRosterGuild;
    const gameName = config.dutyRosterGame;
    const roleName = config.dutyRosterRole;

    guild = this.guilds.get(guildID);
    roleID = guild.roles.filter(r => r.name === roleName).first().id;
    guild.fetchMembers()
    .then(function () {
        var shiftStarters = guild.members.filter(m => mustAddRole(m, gameName, roleID));
        shiftStarters.forEach(member => {
            try {
                member.addRole(roleID)
            } catch (error) {
                
            }
            
        });
    })
    .then(function() {
        var shiftEnders = guild.members.filter(m => mustRemoveRole(m, gameName, roleID));
        shiftEnders.forEach(member => {
            try {
                member.removeRole(roleID)
            } catch (error) {
                
            }
            
        });
    })
};

mustAddRole = function (member, game, roleID) {
    var playsGame = false;
    var hasRole = member.roles.exists(r => r.id == roleID);
    try {
        playsGame = member.presence.game.name === game;
    } catch (error) {
    }

    return playsGame && !hasRole;
};

mustRemoveRole = function(member, game, roleID) {
    var playsGame = false;
    var hasRole = member.roles.exists(r => r.id == roleID);
    try {
        playsGame = member.presence.game.name === game;
    } catch (error) {
    }
    return !playsGame && hasRole;
}

module.exports = dutyRoster;