module.exports = {
    cmd: "pull",
    arguments: "pull",
    aliases: ["update","pullupdates","gitpull"],
    desc: "Pulls changes from git and restarts the bot if there were any changes.",
    category: "admin",
    permission: "admin",
    allowed_channels: null,
    joinable_role: null,
    run: async function(msg, args) {
        const Bot = require("../../Bot.js");
        const git = require("simple-git");

        const client = Bot.getClient();
        const botConstants = Bot.getBotConstants();

        await msg.reply("Pulling git changes and restarting bot.");
        client.guilds.get(botConstants.guildId).channels.get(botConstants.botLoggingChannel).send("Pulling changes...");
        git().pull('origin', 'master', {}, async (err, result) => {
            if (err) console.log(err);
            console.log(result);
            if (result.summary.changes === 0 && result.summary.insertions === 0 && result.summary.deletions === 0) {
                await client.guilds.get(botConstants.guildId).channels.get(botConstants.botLoggingChannel).send("The bot is up to date.");
            } else {
                await client.guilds.get(botConstants.guildId).channels.get(botConstants.botLoggingChannel).send("**Changes: **" + result.summary.changes + "\n" +
                    "**Insertions: **" + result.summary.insertions + "\n" +
                    "**Deletions: **" + result.summary.deletions);
                await client.guilds.get(botConstants.guildId).channels.get(botConstants.botLoggingChannel).send("Restarting...");
                process.exit(0);
            }
        });
    }
};