//Loading external libraries.
const MySQLManager = require("../utils/MySQLManager");
const Discord = require("discord.js");
const Bot = require("../utils/Constants.js");

//Getting bot variables
const botConstants = Bot.getBotConstants();

//Initialising module export.
const punishmentManager = {};

//Creating cache object.
let cache = new Map();


/*
    Explanation:

    Type 1 = Mute.js.
    Type 2 = Ban.

    Status 1 = Active.
    Status 2 = Expired.
    Status 3 = Removed.
 */
punishmentManager.punish = async function (msg, args, type, client, logger) {

    //If there aren't enough args, say so.
    if (args.length < 3) {
        return msg.reply("Invalid arguments. Correct arguments: **!" + ((type === 1) ?"mute":"ban") + " [user] [length] [reason]**");
    }

    //Initialising all variables required for the punishment.
    let re = /<@![0-9]{17,18}>/;
    let user, punisher, reason, timestamp, expire;
    let status = 1;

    //Working out who to punish.
    if (re.test(args[0])) {
        user = args[0].replace("<@!", "").replace(">", "");
    } else {
        re = /[0-9]{17,18}/;
        if (re.test(args[0])) {
            user = args[0];
        } else {
            await msg.reply("You must mention a user/id in order to punish.");
            return;
        }

    }

    //If the user already has an active punishment, warn that they cannot punish again.
    if (client.guilds.cache.get(botConstants.guildId).members.cache.get(user).roles.cache.has(botConstants.mutedRole) && type === 1) {
        await msg.reply("That user is already muted.");
        return;
    }

    //Punisher is the person who sent the message. Gets the tag in-case that they leave the discord for whatever reason in the future.
    punisher = msg.author.tag;

    //Fetches the reason from the remaining arguments.
    reason = "";
    for (let i = 2; i < args.length; i++) {
        reason += (args[i] + " ");
    }
    reason = reason.trim();


    //Gets current time as the timestamp applied.
    timestamp = (new Date()).getTime();

    //Figuring out what time it should expire.
    switch (args[1]) {
        case "1":
            expire = timestamp + (60000 * 60 * 12);
            break;
        case "2":
            expire = timestamp + (60000 * 60 * 48);
            break;
        case "3":
            expire = -1;
            break;
    }

    //All of the info we need has been retrieved, apply the punishment.
    await MySQLManager.punish(user, type, timestamp, expire, punisher, reason, status, id => {
        client.guilds.cache.get(botConstants.guildId).members.cache.get(user).roles.add(botConstants.mutedRole).catch((err) => {
            client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.botLoggingChannel).send("An error occurred when trying to add a role. Error: " + err);
        });

        let timer = null;

        //Create a timeout object to remove the punishment when it ends.
        if (type === 1) {
            if (expire !== -1) {
                timer = setTimeout(async () => {
                    if (client.guilds.cache.get(botConstants.guildId).members.cache.keyArray().includes(user)) {
                        if (client.guilds.cache.get(botConstants.guildId).members.cache.get(user).roles.cache.keyArray().includes(botConstants.mutedRole)) {
                            client.guilds.cache.get(botConstants.guildId).members.cache.get(user).remove(botConstants.mutedRole).catch((err) => {
                                client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.botLoggingChannel).send("An error occurred when trying to remove a role. Error: " + err);
                            });
                            client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.moderationLoggingChannel).send(new Discord.MessageEmbed()
                                .setAuthor(client.guilds.cache.get(botConstants.guildId).members.cache.get(user).user.tag, client.guilds.cache.get(botConstants.guildId).members.cache.get(user).user.displayAvatarURL())
                                .setDescription(client.guilds.cache.get(botConstants.guildId).members.cache.get(user).user.tag + " has been unmuted.")
                                .addField("Reason", "Expired")
                                .setTimestamp()
                                .setColor('#00AA00'));
                        }
                    }

                    await MySQLManager.expire(user, id);

                }, expire - timestamp);
            }

            //Creates the punishment object.
            let punishment = {
                id: id,
                user: user,
                type: type,
                timestamp: timestamp,
                expire: expire,
                punisher: punisher,
                reason: reason,
                timer: timer,
                status: 1,
                removal_reason: null,
                remover: null
            };

            //Adds it to the hashmap.
            cache.set(user, punishment);
        }

        //Working out the english syntax of the time.
        let time = ((expire - timestamp) / 60000 / 60);
        let suffix = "hours";
        if (time >= 24) {
            time = (time / 24);
            suffix = "days";
        }

        //Message the user to let them know they've been punished.
        client.guilds.cache.get(botConstants.guildId).members.cache.get(user).createDM().then(dmchannel => {
            dmchannel.send("You have been " + ((type === 1)?"muted":"banned") + " in The Cult of Cheese Discord for **" + ((expire === -1) ? "Permanent" : time + " " + suffix) + "**. Reason: **" + reason + "**");
        }).catch((reason) => {
            logger.debug("Create DM Promise Rejection: " + reason);
        });


        //Let the punisher know it succeeded
        msg.reply("You have " + ((type === 1)?"muted":"banned") + " " + client.guilds.cache.get(botConstants.guildId).members.cache.get(user).user.tag + " for " + ((expire === -1) ? "Permanent" : time + " " + suffix) + ".");
        client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.moderationLoggingChannel).send(new Discord.MessageEmbed()
            .setAuthor(client.guilds.cache.get(botConstants.guildId).members.cache.get(user).user.tag, client.guilds.cache.get(botConstants.guildId).members.cache.get(user).user.displayAvatarURL)
            .setDescription(client.guilds.cache.get(botConstants.guildId).members.cache.get(user).user.tag + " has been " + ((type === 1)?"muted":"banned") + ".")
            .addField("Punisher", msg.author.tag)
            .addField("Length", ((expire === -1) ? "Permanent" : time + " " + suffix))
            .addField("Reason", reason)
            .setTimestamp()
            .setColor('#AA0000'));

        if (type === 2) {
            //Kick them from the discord.
            client.guilds.cache.get(botConstants.guildId).members.cache.get(user).kick("Banned by moderator. Reason: " + reason);

            //If they have an active mute, remove it from the cache - chances are it will expire by the time they rejoin anyway.
            if (cache.get(user) !== undefined) {
                cache.delete(user);
            }
        }
    }, logger);
};

punishmentManager.unpunish = async function(msg, args, type, client, logger) {
    //Setting required variables.
    let re = /<@![0-9]{17,18}>/;
    let user;
    let punish_id = -1;

    //Getting the user to unpunish.
    if (re.test(args[1])) {
        user = args[1].replace("<@!", "").replace(">", "");
    } else {
        re = /[0-9]{17,18}/;
        if (re.test(args[1])) {
            user = args[1];
        } else {
            await msg.reply("You must mention a user/id in order to unpunish.");
            return;
        }

    }

    //Getting the reason.
    let reason = "";
    for (let i = 2; i < args.length; i++) {
        reason += (args[i] + " ");
    }
    reason = reason.trim();

    //if it is a mute, it will be in the cache.
    if (cache.get(user) !== undefined) {
        clearTimeout(cache.get(user).timer);
        cache.delete(user);
    }

    if (type === 1) {
        if (client.guilds.cache.get(botConstants.guildId).members.cache.keyArray().includes(user)) {
            if (client.guilds.cache.get(botConstants.guildId).members.cache.get(user).roles.cache.has(botConstants.mutedRole)) {
                client.guilds.cache.get(botConstants.guildId).members.cache.get(user).remove(botConstants.mutedRole).catch((err) => {
                    client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.botLoggingChannel).send("An error occurred when trying to remove a role. Error: " + err);
                    msg.reply("Something went wrong.");
                });
            }
        }
    }

    await msg.reply("Punishment removed.");
    await MySQLManager.removePunishment(user, type, reason, msg.author, logger);
    client.guilds.cache.get("105235654727704576").channels.cache.get("434005566801707009").send(new Discord.MessageEmbed()
        .setAuthor(client.guilds.cache.get("105235654727704576").members.cache.get(user).user.tag, client.guilds.cache.get("105235654727704576").members.cache.get(user).user.displayAvatarURL)
        .setDescription(client.guilds.cache.get("105235654727704576").members.cache.get(user).user.tag + " has been un" + ((type === 1)?"muted":"banned") + ".")
        .addField("Remover", msg.author.tag)
        .addField("Reason", reason)
        .setTimestamp()
        .setColor('#00AA00'));
};

punishmentManager.history = async function (msg, logger) {
    let client = msg.client;

    //Initialise required variables.
    let args = msg.content.split(" ");
    let re = /<@![0-9]{17,18}>/;
    let user;

    //Get the user we want the history of.
    if (re.test(args[1])) {
        user = args[1].replace("<@!", "").replace(">", "");
    } else {
        re = /[0-9]{17,18}/;
        if (re.test(args[1])) {
            user = args[1];
        } else {
            await msg.reply("You must mention a user/id in order to unmute.");
            return;
        }

    }

    //Get the punishments from the database.
    //I do not store bans locally as it saves on some resources.
    await MySQLManager.getPunishments(user, (userPunishments) => {
        //Create a new rich embed.
        let richEmbed = new Discord.MessageEmbed();
        richEmbed.setTitle(((client.users.cache.get(user).tag !== undefined)?client.users.cache.get(user).tag:user) + "'s Punishment History")
            .setColor('#2980B9')
            .setFooter("Discord ID: " + user);

        //If they have a punishment history, go through and format all punishments. Otherwise, say there is no history.
        if (userPunishments.length !== 0) {
            //For every punishment...
            for (let punishment of userPunishments) {
                //Calculate how long ago the punishment was issued.
                let time = (((new Date).getTime() - punishment.timestamp) / 60000);
                let suffix = "minutes";
                if (time >= 60) {
                    time = (time / 60);
                    suffix = "hours";
                    if (time >= 24) {
                        time = (time / 24);
                        suffix = "days";
                    }
                }

                //Calculate how long the punishment was.
                time = Math.round(time);
                let time2 = ((punishment.expire - punishment.timestamp) / 60000 / 60);
                let suffix2 = "hours";
                if (time2 >= 24) {
                    time2 = (time2 / 24);
                    suffix2 = "days";
                }

                //Format the field.
                let x = "**Punisher:** " + punishment.punisher + "\n" +
                    "**Type:** " + ((punishment.type === 2) ? "Ban" : "Mute") + "\n" +
                    "**When:** " + time + " " + suffix + " ago\n" +
                    "**Length:** " + ((punishment.expire === -1) ? "Permanent" : time2 + " " + suffix2) + "\n" +
                    "**Reason:** " + punishment.reason + "";

                //if the punishment is not active, add the removal reason.
                if (punishment.status !== 1) {
                    if (punishment.status === 2) {
                        x += "\n**Removed By:** CheeseBot\n**Removal Reason:** Expired";
                    } else {
                        x += "\n**Removed By:** " + punishment.remover + "\n**Removal Reason:** " + punishment.removal_reason;
                    }
                }

                //Add the field to the rich embed.
                richEmbed.addField("Punishment #" + punishment.id + ((punishment.status === 1)?" **[ACTIVE]**":""), x);
            }
        } else {
            //Say there is not punishments in the database.
            richEmbed.setDescription("No punishment history found.");
        }

        //Send the rich embed.
        msg.channel.send(richEmbed);
    }, logger);

};


punishmentManager.expire = async function (user, punishment_id, logger) {
    //Set it as expired in the database.
    await MySQLManager.expire(punishment_id, logger);

    //Remove it from cache (will remove the mute if it is set.
    if (cache.get(user) !== undefined) {
        cache.delete(user);
    }
};

punishmentManager.addToCache = async function (punishment) {
    //Add the punishment to the cache.
    cache.set(punishment.user, punishment);
};

punishmentManager.removePunishment = async function (user) {
    if (cache.has(user)) {
        cache.delete(user);
    }
};

punishmentManager.getPunish = async function (user, callback, logger) {
    await MySQLManager.getPunishments(user, (punishments) => {
        callback(punishments);
    }, logger);
};

punishmentManager.getMySQLManager = function() {
    return MySQLManager;
}

module.exports = punishmentManager;