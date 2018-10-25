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

const msInSecond = 1000;
const msInMinute = 1000 * 60;
const msInHour =   1000 * 60 * 60;
const msInDay =    1000 * 60 * 60 * 24;

const guildID = '303276667307163648';
const channelName = 'test';
const messageID = '504808591509684244';

var emojis = {bugs: ':bugs:', cyborgs:':cyborgs:', illuminate:':illuminate:', superearth:':superearth:', celeb:':helldivers:'}
//Overwrite with test emojis
emojis = {bugs: ':bug:', cyborgs:':robot:', illuminate:':squid:', superearth: ':earth_africa:', celeb:':confetti_ball:'}

const fs = require('fs')
const request = require('request-promise-native');

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
            region: 'Higgs Region ',
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

function updateCampaign() {
    var guild = this.guilds.get(guildID);
    var channel = guild.channels.filter(c => c.name === channelName).first()

    var status = {};
    var snapshots = {};

    var campaign = processResponse(
        JSON.parse(fs.readFileSync('data/get_campaign_status.json')),
        JSON.parse(fs.readFileSync('data/get_snapshots.json'))
    );


    if (typeof messageID !== 'undefined') {
        channel.fetchMessage(messageID)
        .then(message => message.edit(makeStatusEmbed(campaign)));
    } else {
        channel.send(makeStatusEmbed(campaign));
    }
    
}

function processResponse(status, snapshots) {
    var result = { warfronts: { bugs: {}, cyborgs: {}, illuminate: {}}};
    var defendEvents = snapshots.defend_events.filter(event => event.event_id !== status.defend_event.event_id);
    defendEvents.push(status.defend_event);

    result.campaignStart = snapshots.snapshots[0].time * msInSecond;
    result.deaths = 0;
    result.accidentals = 0;
    result.kills = 0;
    result.planets = 0;
    for (let i = 0; i < 3; i++) {
        if (status.campaign_status[i].status == 'active') {
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
                var SUPEREARTH = defendEvents.filter(de => de.enemy == i && de.status === 'active' && de.region == warfront.region)[0];
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
                warfront.progress = Math.floor((warfront.points % pointsPerRegion) / pointsPerRegion * 100 );

                var capital = defendEvents.filter(de => de.enemy == i && de.status === 'active' && de.region == warfront.region)[0];
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
    var minutes = Math.floor((delta - hours*msInHour ) / msInMinute).toString();
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
                lines.push(`Region: *${regions[faction][warfront.region-1].region}* **(${warfront.region}}/11)**`);
                lines.push(`Progress: *${warfront.progress}%*`);
                lines.push(`Time left: *${calcTimeLeft(warfront.timeLimit)}*`);
                lines.push(`Active Helldivers: *${warfront.divers}*`);
            } else {
                if (warfront.capitalDefense) {
                    lines.push(`Status: ***Region capital is under attack!***`);
                    lines.push(`Region: *${regions[faction][warfront.region-1].region}* **(${warfront.region}}/11)**`);
                    lines.push(`Capital liberation: *${warfront.capitalProgress}%*`);
                    lines.push(`Time left: *${calcTimeLeft(warfront.timeLimit)}*`);
                    lines.push(`Region progress: *${warfront.progress}%*`);
                    lines.push(`Active Helldivers: *${warfront.divers}*`);

                } else {
                    lines.push(`Status: *Liberating region*`);
                    lines.push(`Region: *${regions[faction][warfront.region-1].region}* **(${warfront.region}}/11)**`);
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


module.exports = updateCampaign;