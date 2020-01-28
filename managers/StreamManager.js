const streammanager = {};

const Twitch = require('twitch').default;

const clientId = process.env.TWITCH_ID;
const clientSecret = process.env.TWITCH_SECRET;
const twitchClient = Twitch.withClientCredentials(clientId, clientSecret);

const WebHookListener = require('twitch-webhooks').default;

let listener;
let subscriptions = [];

streammanager.load = async function (client) {
    listener = await WebHookListener.create(twitchClient, {port: 8090});
    listener.listen();
    subscriptions.push(await listener.subscribeToStreamChanges('53100459', async (stream) => {
        if (stream) {
            let game = "";
            stream.getGame().then((twitchGame) => {
                game = twitchGame.name;
                client.guilds.get('105235654727704576').channels.get('441327080014086166').send("<@&631607746298380297> " + stream.userDisplayName + " has just gone live with " + game + ": `" + stream.title + "`! Join at https://twitch.tv/" + stream.userDisplayName + "/!");
            });
        }
    }));
    subscriptions.push(await listener.subscribeToStreamChanges('41451481', async (stream) => {
        if (stream) {
            let game = "";
            stream.getGame().then((twitchGame) => {
                game = twitchGame.name;
                client.guilds.get('105235654727704576').channels.get('441327080014086166').send("<@&631607746298380297> " + stream.userDisplayName + " has just gone live with " + game + ": `" + stream.title + "`! Join at https://twitch.tv/" + stream.userDisplayName + "/!");
            });
        }
    }));
    subscriptions.push(await listener.subscribeToStreamChanges('62033506', async (stream) => {
        if (stream) {
            let game = "";
            stream.getGame().then((twitchGame) => {
                game = twitchGame.name;
                client.guilds.get('105235654727704576').channels.get('441327080014086166').send("<@&631607746298380297> " + stream.userDisplayName + " has just gone live with " + game + ": `" + stream.title + "`! Join at https://twitch.tv/" + stream.userDisplayName + "/!");
            });
        }
    }));
};

streammanager.end = function() {
    for (let x of subscriptions) {
        x.stop();
    }
};

module.exports = streammanager;