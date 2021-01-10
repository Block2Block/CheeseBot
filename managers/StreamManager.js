const streammanager = {};

const Twitch = require('twitch').ApiClient;

const { ApiClient } = require('twitch');
const { ClientCredentialsAuthProvider } = require('twitch-auth');
const { WebHookListener, SimpleAdapter } = require('twitch-webhooks');

const clientId = process.env.TWITCH_ID;
const clientSecret = process.env.TWITCH_SECRET;
const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
const twitchClient = new ApiClient({ authProvider });

let listener;
let subscriptions = [];

let live = [];
let cooldown = [];

streammanager.load = async function (client, logger) {
    logger.info("Loading Twitch Webhooks...");
    listener = new WebHookListener(twitchClient, new SimpleAdapter({hostName: process.env.TWITCH_CALLBACK_URL ,listenerPort: 8090}));
    await listener.listen();
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
                    if (cooldown.includes(x)) {
                        //Add to live but don't push notification.
                        live.push(x);
                        return;
                    }
                    client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.livestreamChannel).send("<@&" + botConstants.livestreamRole + "> " + stream.userDisplayName + " has just gone live with " + game + ": `" + stream.title + "`! Join at https://twitch.tv/" + stream.userDisplayName + " !");
                    live.push(x);
                    cooldown.push(x);
                    setTimeout(() => {
                        cooldown.shift();
                    }, 86400000);
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