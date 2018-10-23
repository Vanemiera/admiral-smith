//TODO:
//* Translate data into own format
//* Logic to update message in channel and create new one if none found


//Events:
//Homeworld assault start
//Assault fail
//assault success
//Defend event start
//Defend event success
//Defend event fail
//


const fs = require('fs')
const request = require('request-promise-native');

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
    //load last status(last known events and their status)
    //get status
    //determine current season
    //get snapshot of current season
    //if new events are there, post them to the log
    //update embed with war stats
    //save status
}


module.exports = updateCampaign;