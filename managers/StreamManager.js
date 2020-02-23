const streammanager = {};

const Twitch = require('twitch').default;

const clientId = process.env.TWITCH_ID;
const clientSecret = process.env.TWITCH_SECRET;
const twitchClient = Twitch.withClientCredentials(clientId, clientSecret);

const WebHookListener = require('twitch-webhooks').default;

let listener;
let subscriptions = [];

let live = [];

streammanager.load = async function (client, logger) {
    logger.info("Loading Twitch Webhooks...");
    listener = await WebHookListener.create(twitchClient, {port: 8090});
    listener.listen();
    const botConstants = require("../utils/Constants.js").getBotConstants();
    for (let x of botConstants.twitchSubscriptions) {
        logger.info("Webhook for twitch ID " + x + " loaded.");
        subscriptions.push(await listener.subscribeToStreamChanges(x, async (stream) => {
            if (stream) {
                if (live.includes(x)) {
                    return;
                }
                let game = "";
                stream.getGame().then((twitchGame) => {
                    game = twitchGame.name;
                    client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.livestreamChannel).send("<@&" + botConstants.livestreamRole + "> " + stream.userDisplayName + " has just gone live with " + game + ": `" + stream.title + "`! Join at https://twitch.tv/" + stream.userDisplayName + " !");
                    live.push(x)
                });
            } else {
                if (live.includes(x)) {
                    live.splice(live.indexOf(x),1);
                }
            }
        }));
    }
    logger.info("Twitch Webhooks loaded successfully!")
};

streammanager.end = function() {
    for (let x of subscriptions) {
        x.stop();
    }
};

module.exports = streammanager;