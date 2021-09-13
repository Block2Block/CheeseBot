const spamManager = {};

const messages = new Map();
const linkChecker = require('valid-url');
const {splitOn} = require("simple-git/src/lib/utils");
const Discord = require("discord.js");
const whitelisted = [];
const warned = new Map();
const muted = [];

spamManager.init = function (MySQLManager, logger) {
    MySQLManager.getWhitelist(logger, (whitelist) => {
        for (let word of whitelist) {
            whitelisted.push(word);
        }
    });
}


spamManager.processMessage = async function (msg, commandManager, logger) {
    if (msg.author.bot) {
        return;
    }
    let moderation = commandManager.getPermissions().get("admin");
    let botConstants = require('../utils/Constants').getBotConstants();
    if (moderation.roles != null) {
        logger.debug("Roles is not null");
        let z = moderation.roles.filter(value => msg.client.guilds.cache.get(botConstants.guildId).members.cache.get(msg.author.id).roles.cache.has(value));
        if (z.length >= 1) {
            //If they have the moderation permissions, ignore this user, they are trusted.
            return;
        }
    }
    let args = splitOn(msg.content, " ");
    let expression = /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
    let regex = new RegExp(expression);
    argChecker:
    for (let arg of args) {
        if (linkChecker.isUri(arg)) {
            let domain = arg.split("/")[2];
            for (let whitelist of whitelisted) {
                if (domain.endsWith(whitelist)) {
                    continue argChecker;
                }
            }
            msg.delete();
            return;
        } else if (arg.match(regex)) {
            let domain = arg.match(regex)[0].split("/")[0];
            for (let whitelist of whitelisted) {
                if (domain.endsWith(whitelist)) {
                    continue argChecker;
                }
            }
            msg.delete();
            return;
        }
    }

    if (messages.has(msg.author.id)) {
        if (muted.includes(msg.author.id)) {
            return;
        }
        logger.debug(messages.get(msg.author.id));
        let prev = messages.get(msg.author.id);
        prev.push({content: msg.content, timestamp: msg.createdTimestamp});
        setTimeout((id) => {
            let array = messages.get(id);
            array.shift();
            if (array.length > 0) {
                messages.set(id, array);
            } else {
                messages.delete(id);
            }

        }, 300000, msg.author.id)
        let countSame = 0;
        let countTenSeconds = 0;
        for (let x of prev) {
            //Firstly check if it was sent in the last 10 seconds.
            if (x.timestamp >= (new Date).getTime() - 10000) {
                //This was sent in the last 10 seconds, count it.
                countTenSeconds++;
            }

            let count = 0;
            //Now check how many other strings are the same.
            for (let y of prev) {
                if (y.timestamp === x.timestamp) {
                    continue;
                }
                if (y.content.toLowerCase() === x.content.toLowerCase()) {
                    count++;
                }
            }
            if (count + 1 > countSame) {
                countSame = count + 1;
            }
        }

        if (countSame >= 5 || countTenSeconds >= 10) {
            logger.debug(countSame + " " + countTenSeconds)
            if (warned.has(msg.author.id) && (countSame >= 7 || countTenSeconds>=10)) {
                clearTimeout(warned.get(msg.author.id));
                warned.delete(msg.author.id);
                let user = msg.author.id;
                let type = 1;
                let client = msg.client;
                let timestamp = (new Date).getTime();
                let expire = timestamp + (60000 * 60 * 12);
                let reason = "Spamming [Bot Auto-Mute]"
                let status = 1;
                let botConstants = require('../utils/Constants.js').getBotConstants();

                msg.reply("You have been muted for 12 hours for spamming.");
                muted.push(msg.author.id);
                setTimeout(()=>{
                    muted.shift();
                }, 30000)
                commandManager.getPunishmentManager().getMySQLManager().punish(user, type, timestamp, expire, "CheeseBot", reason, status, id => {

                    client.guilds.cache.get(botConstants.guildId).members.cache.get(user).roles.add(botConstants.mutedRole).catch((err) => {
                        client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.botLoggingChannel).send("An error occurred when trying to add a role. Error: " + err);
                    });


                    //Message the user to let them know they've been punished.
                    client.guilds.cache.get(botConstants.guildId).members.cache.get(user).createDM().then(dmchannel => {
                        dmchannel.send("You have been muted in The Cult of Cheese Discord for **12 hours**. Reason: **Spamming [Bot Auto-Mute]**").catch(err => {
                            logger.warn("Promise rejections: " + err)
                        });
                    }).catch((reason) => {
                        logger.debug("Create DM Promise Rejection: " + reason);
                    });


                    //Let the punisher know it succeeded
                    client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.moderationLoggingChannel).send({embeds: [new Discord.MessageEmbed()
                            .setAuthor(client.guilds.cache.get(botConstants.guildId).members.cache.get(user).user.tag, client.guilds.cache.get(botConstants.guildId).members.cache.get(user).user.displayAvatarURL())
                            .setDescription(client.guilds.cache.get(botConstants.guildId).members.cache.get(user).user.tag + " has been Muted.")
                            .addField("Punisher", "CheeseBot")
                            .addField("Length", "12 hours")
                            .addField("Reason", "Spamming [Bot Auto-Mute]")
                            .setTimestamp()
                            .setColor('#AA0000')]});
                }, logger);
            } else if (!warned.has(msg.author.id)) {
                logger.debug("warned");
                msg.reply("Please stop spamming or you will be muted!");
                warned.set(msg.author.id, setTimeout((id) => {
                        warned.delete(id);
                    }, 180000, msg.author.id));
            }
        }
    } else {
        messages.set(msg.author.id, [{content: msg.content, timestamp: msg.createdTimestamp}]);
        setTimeout((id) => {
            let array = messages.get(id);
            array.shift();
            if (array.length > 0) {
                messages.set(id, array);
            } else {
                messages.delete(id);
            }

        }, 1800000, msg.author.id)
    }

}

module.exports = spamManager;