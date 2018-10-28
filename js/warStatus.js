//TODO:
//* Logic to update message in channel and create new one if none found


//Events:
//Homeworld assault start
//Assault fail
//assault success
//Defend event start
//Defend event success
//Defend event fail
//
//Region 0 is super earth

var Discord = require('discord.js');
var fs = require('fs')
var request = require('request-promise-native');
var config = require('../data/config.json');

const msInSecond = 1000;
const msInMinute = 1000 * 60;
const msInHour = 1000 * 60 * 60;
const msInDay = 1000 * 60 * 60 * 24;

const guildID = config.warStatusGuild;
const channelName = config.warStatusChannel;

var emojis = {};

if (config.debug) {
    emojis = { bugs: ':bug:', cyborgs: ':robot:', illuminate: ':squid:', superearth: ':earth_africa:', celeb: ':confetti_ball:' };
} else {
    //emojis = { bugs: ':bugs:', cyborgs: ':cyborgs:', illuminate: ':illuminate:', superearth: ':superearth:', celeb: ':helldivers:' };
    emojis = { bugs: '', cyborgs: '', illuminate: '', superearth: '', celeb: '' };
}

var warStatusMemory = {};

const factions = ['bugs', 'cyborgs', 'illuminate'];
const regions = {
    bugs: [
        {
            region: 'Wise Region',
            capital: 'NEW NEW YORK'
        },
        {
            region: 'Kruger System',
            capital: 'LIBERTY CITY'
        },
        {
            region: 'Ross System',
            capital: 'TIBERIA'
        },
        {
            region: 'Struve Region',
            capital: 'NORTHMAN\'S CREEK'
        },
        {
            region: 'Xi Tauri Region',
            capital: 'NEW HAVEN'
        },
        {
            region: 'Cancri System',
            capital: 'FREEDOM FORTRESS'
        },
        {
            region: 'Higgs Region',
            capital: 'MARTYR\'S BAY'
        },
        {
            region: 'Hawking Region',
            capital: 'SEGMA PRIME'
        },
        {
            region: 'Rigel System',
            capital: 'FREEDOM PEAK'
        },
        {
            region: 'Aurigae Region',
            capital: 'FINAL FRONTIER'
        },
        {
            region: 'Kepler System',
            capital: 'KEPLER PRIME'
        },
    ],
    cyborgs: [
        {
            region: 'Sirius Region',
            capital: 'STOCKHOLM CITY'
        },
        {
            region: 'Polaris Region',
            capital: 'THUNDER HEAD'
        },
        {
            region: 'Pictor Sector',
            capital: 'NEW MOSCOW'
        },
        {
            region: 'Sagan Region',
            capital: 'HIGHWIND'
        },
        {
            region: 'Horolium System',
            capital: 'PROVIDENCE'
        },
        {
            region: 'Gellert Region',
            capital: 'GELLERT CITY'
        },
        {
            region: 'Lacaille Region',
            capital: 'BAHIA DEMOCRACIA'
        },
        {
            region: 'Indi System',
            capital: 'WINTER HOLD'
        },
        {
            region: 'Ceti System',
            capital: 'DORAL CREEK'
        },
        {
            region: 'Cygni Region',
            capital: 'NEW BERLIN'
        },
        {
            region: 'Cyberstan Region',
            capital: 'CYBERSTAN'
        },
    ],
    illuminate: [
        {
            region: 'Centaury Region',
            capital: 'NEW HANOVER'
        },
        {
            region: 'Barnard Region',
            capital: 'IRON TOWER'
        },
        {
            region: 'Procyon Region',
            capital: 'WHITE LANDING'
        },
        {
            region: 'Castor System',
            capital: 'JUSTICE BAY'
        },
        {
            region: 'Orionis Region',
            capital: 'NEW ALEXANDRIA'
        },
        {
            region: 'Prometheus System',
            capital: 'RIBATISHITI'
        },
        {
            region: 'Cassiopaiae Region',
            capital: 'DAL RAGE'
        },
        {
            region: 'Ursa Region',
            capital: 'ULTIMA'
        },
        {
            region: 'Canes Region',
            capital: 'JIYU TOSHI'
        },
        {
            region: 'Arcturus Region',
            capital: 'HAWK NEST'
        },
        {
            region: 'Squ\'bai System',
            capital: 'SQU\'BAI SHRINE'
        },
    ]
};

function getStatus() {
    return request({
        method: 'POST',
        url: 'https://api.helldiversgame.com/1.0/',
        body: 'action=get_campaign_status',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        agentOptions: {
            ca: fs.readFileSync('ressources/certificate.pem')
        }
    }).then(response => JSON.parse(response));
}

function getSnapshots(season) {
    return request({
        method: 'POST',
        url: 'https://api.helldiversgame.com/1.0/',
        body: `action=get_snapshots&season=${season}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        agentOptions: {
            ca: fs.readFileSync('ressources/certificate.pem')
        }
    }).then(response => JSON.parse(response));
}

function processResponse(status, snapshots) {
    var result = { warfronts: { bugs: {}, cyborgs: {}, illuminate: {} } };
    result.warNumber = status.campaign_status.map(s => s.season).sort()[2];
    result.defendEvents = snapshots.defend_events;
    result.defendEvents.push(status.defend_event);
    result.defendEvents = result.defendEvents.filter(event => event.season == result.warNumber);
    result.attackEvents = snapshots.attack_events.concat(status.attack_events)
                                                 .filter(event => event.season == result.warNumber);

    result.campaignStart = snapshots.snapshots[0].time * msInSecond;
    result.deaths = 0;
    result.accidentals = 0;
    result.kills = 0;
    result.planets = 0;
    for (let i = 0; i < 3; i++) {
        if (status.campaign_status[i].season == result.warNumber) {
            result.deaths += status.statistics[i].deaths;
            result.accidentals += status.statistics[i].accidentals;
            result.kills += status.statistics[i].kills;
            result.planets += status.statistics[i].completed_planets;
        }
    }

    for (let i = 0; i < 3; i++) {
        var warfront = result.warfronts[factions[i]];
        if (status.campaign_status[i].status === 'active') {
            warfront.status = 'active';
            warfront.divers = status.statistics[i].players;
            warfront.points = status.campaign_status[i].points;
            warfront.pointsMax = status.campaign_status[i].points_max;

            if (warfront.points == 0) {
                //Super Earth defense
                var SUPEREARTH = result.defendEvents.filter(de => de.enemy == i && de.status === 'active' && de.region == warfront.region)[0];
                warfront.region = 0;
                warfront.progress = Math.floor(SUPEREARTH.points / SUPEREARTH.points_max * 100);
                warfront.timeLimit = SUPEREARTH.end_time * msInSecond;
            } else if (warfront.points == warfront.pointsMax) {
                //Homeworld assault
                var homeworld = status.attack_events[i];
                warfront.region = 11;
                warfront.progress = Math.floor(homeworld.points / homeworld.points_max * 100);
                warfront.timeLimit = homeworld.end_time * msInSecond;
            } else {
                //Regular warfront
                warfront.region = Math.ceil(warfront.points / warfront.pointsMax * 10);
                var pointsPerRegion = warfront.pointsMax / 10;
                warfront.progress = Math.floor((warfront.points % pointsPerRegion) / pointsPerRegion * 100);

                var capital = result.defendEvents.filter(de => de.enemy == i && de.status === 'active' && de.region == warfront.region)[0];
                if (typeof capital !== 'undefined') {
                    warfront.capitalDefense = true
                    warfront.timeLimit = capital.end_time * msInSecond;
                    warfront.capitalProgress = Math.floor(capital.points / capital.points_max * 100);
                } else {
                    warfront.capitalDefense = false;
                }
            }
        } else if (status.campaign_status[i].status === 'defeated') {
            warfront.status = 'defeated';

        } else if (status.campaign_status[i].status === 'hidden') {
            warfront.status = 'hidden';
        }
    }

    //TODO: create alerts

    return result;
}

function calcTimeLeft(timestamp) {
    var now = Date.now();
    var end = new Date(timestamp);
    var delta = end - now;
    var hours = Math.floor(delta / msInHour).toString();
    var minutes = Math.floor((delta - hours * msInHour) / msInMinute).toString();
    if (hours.length == 1) hours = '0' + hours;
    if (minutes.length == 1) minutes = '0' + minutes;
    return `${hours}:${minutes}`
}

function calcCampaignDuration(timestamp) {
    var now = Date.now();
    var start = new Date(timestamp);
    var delta = now - start;
    var days = Math.floor(delta / msInDay);
    if (days == 1) {
        return days + ' day';
    } else {
        return days + ' days';
    }
}


function makeStatusEmbed(campaign) {
    var statFields = [];
    for (const faction of factions) {
        var warfront = campaign.warfronts[faction]
        if (warfront.status == 'hidden') {
            continue;
        } else if (warfront.status == 'defeated') {
            statFields.push({
                name: `**${faction.toUpperCase()}** ${emojis[faction]}`,
                value: `Status: ***Defeated*** ${emojis.celeb}`,
                inline: true
            });
        } else if (warfront.status == 'active') {
            var lines = []
            if (warfront.region == 0) {
                lines.push(`Status: ***SUPER EARTH DEFENSE!!!*** ${emojis.superearth}`);
                lines.push(`Region: **OUR HOME!!!**`);
                lines.push(`Progress: *${warfront.progress}%*`);
                lines.push(`Time left: *${calcTimeLeft(warfront.timeLimit)}*`);
                lines.push(`Active Helldivers: *${warfront.divers}*`);
            } else if (warfront.region == 11) {
                lines.push(`Status: ***Homeworld Assault!***`);
                lines.push(`Region: *${regions[faction][warfront.region - 1].region}* **(${warfront.region}/11)**`);
                lines.push(`Progress: *${warfront.progress}%*`);
                lines.push(`Time left: *${calcTimeLeft(warfront.timeLimit)}*`);
                lines.push(`Active Helldivers: *${warfront.divers}*`);
            } else {
                if (warfront.capitalDefense) {
                    lines.push(`Status: ***Region capital is under attack!***`);
                    lines.push(`Region: *${regions[faction][warfront.region - 1].region}* **(${warfront.region}/11)**`);
                    lines.push(`Capital liberation: *${warfront.capitalProgress}%*`);
                    lines.push(`Time left: *${calcTimeLeft(warfront.timeLimit)}*`);
                    lines.push(`Region progress: *${warfront.progress}%*`);
                    lines.push(`Active Helldivers: *${warfront.divers}*`);

                } else {
                    lines.push(`Status: *Liberating region*`);
                    lines.push(`Region: *${regions[faction][warfront.region - 1].region}* **(${warfront.region}/11)**`);
                    lines.push(`Progress: *${warfront.progress}%*`);
                    lines.push(`Active Helldivers: *${warfront.divers}*`);
                }
            }

            statFields.push({
                name: `**${faction.toUpperCase()}** ${emojis[faction]}`,
                value: lines.join('\n'),
                inline: true
            });
        }

    }

    statFields.push({
        name: `**Campaign Statistics**`,
        value: [
            `War Duration: *${calcCampaignDuration(campaign.campaignStart)}*`,
            `Fallen Helldivers: *${campaign.deaths}*`,
            `Unfortunate accidents: *${campaign.accidentals}*`,
            `Enemies killed: *${campaign.kills}*`,
            `Planets liberated: *${campaign.planets}*`
        ].join('\n'),
    });

    return new Discord.RichEmbed({
        color: 0xffff00,
        title: 'Galactic Campaign Status',
        description: 'This is the live feed of our war efforts. Be informed, spread democracy!',
        fields: statFields
    });
}

function saveStatus() {
    try {
        fs.writeFileSync('data/warStatus.json', JSON.stringify(warStatusMemory, null, 2));
    } catch (e) {
        console.log(e);
    }
}

function loadStatus() {
    if (typeof warStatusMemory.messageID !== 'undefined') return;
    try {
        warStatusMemory = JSON.parse(fs.readFileSync('data/warStatus.json'));
    } catch (e) {
        console.log('Error loading war status file');
    }
}

function makeWarWonEmbed(lastFaction) {

}

function makeEventFailEmbed(faction, region) {

}

function makeEventSuccessEmbed(faction, region) {

}

//only defend events
function makeEventSpawnEmbed(faction, region) {

}

function makeRegionAdvanceEmbed(faction, newRegion, ateEvent) {

}

function updateRegionIDs(campaign) {
    for (let i = 0; i < 3; i++) {
        warStatusMemory.lastRegionIDs[factions[i]] = campaign.warfronts[factions[i]].region;
    }
}

function postEvents(campaign, msgs) {
    //Only events in the current season are considered
    //For every event add an embed
    var postEmbeds = [];
    var deletedMessages = [];
    var sentMessages = [];

    if (typeof warStatusMemory.lastDefendEventIDs === 'undefined') {
        warStatusMemory.lastDefendEventIDs = {bugs: -1, cyborgs: -1, illuminate: -1};
        updateRegionIDs(campaign);
    }

    //Region increase
    //Triggered when region number has increased from last time
    for (let i = 0; i < 3; i++) {
        if (warStatusMemory.lastRegionIDs[factions[i]] < campaign.warfronts[factions[i]].region) {
            var yesEvent = false;
            if (warStatusMemory.lastDefendEventIDs[factions[i]] > 0) {
                yesEvent = true;
                warStatusMemory.lastDefendEventIDs[factions[i]] = -1;
            }
            postEmbeds.push(makeRegionAdvanceEmbed(factions[i]), campaign.warfronts[factions[i]].region, yesEvent)
        }
    }

    //Capital and homeworld failures: RLE, chain, set id to event currently active in region
    //Super Earth failure: RLE, no chain, no changes to IDs
    //Triggered when event in region switches from active to failure(save and compare event with id)
    for (let i = 0; i < 3; i++) {
        var lastID = warStatusMemory.lastDefendEventIDs[factions[i]];
        var region = campaign.warfronts[factions[i]].region;
        var candidate = campaign.defendEvents.filter(event => event.id == lastID)[0];

        //Detect new defend events
        if (warStatusMemory.lastDefendEventIDs[factions[i]] < 0) {
            

        //Detect failed defend events
        } else if (typeof candidate !== 'undefined' && candidate.status === 'fail') {
            postEmbeds.push(makeEventFailEmbed(factions[i], region));
            if (region == 0) {
                warStatusMemory.lastDefendEventIDs = {bugs: -1, cyborgs: -1, illuminate: -1};
            } else {
                warStatusMemory.lastDefendEventIDs[factions[i]] = campaign.defendEvents.filter(event => event.status == 'active' && event.enemie == i)[0];
            }
        //Detect successfull defend events
        } else if (typeof candidate !== 'undefined' && candidate.status === 'success') {
            postEmbeds.push(makeEventSuccessEmbed(factions[i], region));
            warStatusMemory.lastDefendEventIDs[factions[i]] = campaign.defendEvents.filter(event => event.status == 'active' && event.enemie == i)[0];
        }
    }

    //ALL successes: RSE, no chain, no changes to IDs
    //Triggered when event in region switches from active to success(save and compare event with id)
    //

    //All event spawn: ESE, no chain, save id
    //Triggered when event is active and not last known in reagion

    //Message creation:
    //calculate sum
    //delete old messages
    //post new messages
    //return promise that combines all messages actions
    updateRegionIDs(campaign);
}

function updateCampaign() {
    var guild = this.guilds.get(guildID);
    var channel = guild.channels.filter(c => c.name === channelName).first()

    var status = {};
    var snapshots = {};
    var campaign = {};
    var embed = {};
    var messages = {};
    var message = {};
    var nuke = false;

    loadStatus();

    getStatus()
    .then(res => {
        var warNumber = res.campaign_status.map(s => s.season).sort()[2];
        status = res;
        return getSnapshots(warNumber);
    })
    .then(res => {
        snapshots = res;
        campaign = processResponse(status, snapshots);
        embed = makeStatusEmbed(campaign);
        return channel.fetchMessages();
    })
    .then(msgs => {
        messages = msgs;
        if (typeof warStatusMemory.messageID !== 'undefined' && messages.exists('id', warStatusMemory.messageID)) {
            message = messages.get(warStatusMemory.messageID).edit(makeStatusEmbed(campaign))
        } else {
            messages.forEach(m => {
                m.delete()
            });
            nuke = true;
            message = channel.send(makeStatusEmbed(campaign));
        }
        return message;
    })
    .then(msg => {
        warStatusMemory.messageID = msg.id;
        //TODO: Post events
        console.log('Successful update!')
        saveStatus();
    });
}

module.exports = updateCampaign;