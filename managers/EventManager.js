const eventmanager = {};

//Loading internal libraries.
const Bot = require("../utils/Constants.js");
const Discord = require("discord.js");

//Bot variables.
const botConstants = Bot.getBotConstants();

eventmanager.ready = function(client, CommandManager, SpamManager, logger) {
    let MySQLManager = CommandManager.getPunishmentManager().getMySQLManager();
    MySQLManager.connect(logger);
    let Punishments = CommandManager.getPunishmentManager();
    logger.info("Bot Client Connected.");

    client.user.setStatus("online");
    client.user.setActivity("on The Cult of Cheese", {type: "PLAYING"});
    client.guilds.cache.get(botConstants.guildId).members.cache.get(client.user.id).setNickname("CheeseBot");

    //Get all of the *active* punishments from the database.
    MySQLManager.getPunishOnLoad((punishments) => {
        logger.info("Loading punishments...");
        for (let punishment of punishments) {
            if (!client.guilds.cache.get(botConstants.guildId).members.cache.has(punishment.user)) {
                continue;
            }
            if ((punishment.expire === -1) && punishment.status === 1) {
                if (punishment.type === 1) {
                    if (client.guilds.cache.get(botConstants.guildId).members.cache.has(punishment.user)) {
                        if (!client.guilds.cache.get(botConstants.guildId).members.cache.get(punishment.user).roles.cache.has(botConstants.mutedRole)) {
                            client.guilds.cache.get(botConstants.guildId).members.cache.get(punishment.user).createDM().then(dmchannel => {
                                dmchannel.send("You are muted in The Cult of Cheese Discord. Expires: **Permanent**. Reason: **" + punishment.reason + "**");
                            }).catch((reason) => {
                                logger.warn("Login Promise Rejection: " + reason);
                            });

                            client.guilds.cache.get(botConstants.guildId).members.cache.get(punishment.user).roles.add(botConstants.mutedRole).catch((err) => {
                                client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.botLoggingChannel).send("An error occurred when trying to add a role. Error: " + err);
                            });
                        }
                    }
                }
            } else if (punishment.expire !== -1 && punishment.status === 1) {
                if (punishment.expire > ((new Date).getTime())) {
                    //Apply Punishment, still valid.
                    let time = ((punishment.expire - ((new Date).getTime())) / 60000);
                    let suffix = "minutes";
                    if (time >= 60) {
                        time = (time / 60);
                        suffix = "hours";
                        if (time >= 24) {
                            time = (time / 24);
                            suffix = "days";
                        }
                    }
                    time = Math.round(time);
                    if (punishment.type === 1) {
                        if (client.guilds.cache.get(botConstants.guildId).members.cache.has(punishment.user)) {
                            if (!client.guilds.cache.get(botConstants.guildId).members.cache.get(punishment.user).roles.cache.has(botConstants.mutedRole)) {
                                client.guilds.cache.get(botConstants.guildId).members.cache.get(punishment.user).createDM().then(dmchannel => {
                                    dmchannel.send("You are muted in The Cult of Cheese Discord. Expires: **" + time + " " + suffix + "**. Reason: **" + punishment.reason + "**");
                                }).catch((reason) => {
                                    logger.warn("Login Promise Rejection: " + reason);
                                });

                                client.guilds.cache.get(botConstants.guildId).members.cache.get(punishment.user).roles.add(botConstants.mutedRole).catch((err) => {
                                    client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.botLoggingChannel).send("An error occurred when trying to add a role. Error: " + err);
                                });
                            }
                        }
                    }
                } else {
                    //Remove punishment, it has expired.
                    Punishments.expire(punishment.user, punishment.id);
                    if (punishment.type === 1) {
                        client.guilds.cache.get(botConstants.guildId).members.cache.get(punishment.user).roles.remove(botConstants.mutedRole).catch((err) => {
                            client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.botLoggingChannel).send("An error occurred when trying to remove a role. Error: " + err);
                        });
                    } else if (punishment.type === 2) {
                        client.guilds.cache.get(botConstants.guildId).bans.remove(punishment.user, "Punishment expired.").then(r => {

                        });

                    }
                    client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.botLoggingChannel).send({embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(client.guilds.cache.get(botConstants.guildId).members.cache.get(punishment.user).user.tag, client.guilds.cache.get(botConstants.guildId).members.cache.get(punishment.user).user.displayAvatarURL())
                                .setDescription(client.guilds.cache.get(botConstants.guildId).members.cache.get(punishment.user).user.tag + " has been unpunished.")
                                .addField("Reason", "Expired")
                                .setTimestamp()
                                .setColor('#00AA00')
                        ]});
                }
            }
        }
        logger.info("Punishments Successfully Loaded.");
        Punishments.init(client, logger);
        SpamManager.init(Punishments.getMySQLManager(), logger);
        client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.botLoggingChannel).send("Bot successfully loaded.");
        logger.info("The bot has been successfully loaded.")
    }, logger);
};

eventmanager.join = function(member, client, CommandManager, logger) {
    let Punishments = CommandManager.getPunishmentManager();
    Punishments.getPunish(member.id, (punishments) => {
        //If they have punishments, see if any of them are active.
        if (punishments.length !== 0) {
            //FOr all punishments they have in their history.
            for (let punishment of punishments) {
                if ((punishment.expire === -1) && punishment.status === 1) {
                    if (punishment.type === 2) {
                        member.createDM().then(dmchannel => {
                            dmchannel.send("You are banned from The Cult of Cheese Discord. Expires: **Permanent**. Reason: **" + punishment.reason + "**");
                        }).catch((reason) => {
                            logger.warn("Login Promise Rejection: " + reason);
                        });
                        member.ban("Banned by a moderator. Reason: " + punishment.reason).then((member) => {
                        });
                        return;
                    } else if (punishment.type === 1) {
                        member.createDM().then(dmchannel => {
                            dmchannel.send("You are muted in The Cult of Cheese Discord. Expires: **Permanent**. Reason: **" + punishment.reason + "**");
                        }).catch((reason) => {
                            logger.warn("Login Promise Rejection: " + reason);
                        });

                        member.roles.add(botConstants.mutedRole).catch((err) => {
                            client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.botLoggingChannel).send("An error occurred when trying to add a role. Error: " + err);
                        });
                    }
                } else if (punishment.expire !== -1 && punishment.status === 1) {
                    if (parseInt(punishment.expire) > ((new Date).getTime())) {
                        //Apply Punishment, still valid.
                        let time = ((punishment.expire - ((new Date).getTime())) / 60000);
                        let suffix = "minutes";
                        if (time >= 60) {
                            time = (time / 60);
                            suffix = "hours";
                            if (time >= 24) {
                                time = (time / 24);
                                suffix = "days";
                            }
                        }
                        time = Math.round(time);

                        if (punishment.type === 2) {
                            member.createDM().then(dmchannel => {

                                dmchannel.send("You are banned from The Cult of Cheese Discord. Expires: **" + time + " " + suffix + "**. Reason: **" + punishment.reason + "**");
                            }).catch((reason) => {
                                logger.warn("Login Promise Rejection: " + reason);
                            });
                            member.ban("Banned by a moderator. Reason: " + punishment.reason).then((member) => {
                            });
                            return;
                        } else if (punishment.type === 1) {
                            member.createDM().then(dmchannel => {
                                dmchannel.send("You are muted in The Cult of Cheese Discord. Expires: **" + time + " " + suffix + "**. Reason: **" + punishment.reason + "**");
                            }).catch((reason) => {
                                logger.warn("Login Promise Rejection: " + reason);
                            });

                            member.roles.add(botConstants.mutedRole).catch((err) => {
                                client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.botLoggingChannel).send("An error occurred when trying to add a role. Error: " + err);
                            });
                        }
                    } else {
                        //Remove punishment, it has expired.
                        Punishments.expire(punishment.user, punishment.id);
                        client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.moderationLoggingChannel).send({embeds: [new Discord.MessageEmbed()
                                .setAuthor(member.user.tag, member.user.displayAvatarURL())
                                .setDescription(member.user.tag + " has been unpunished.")
                                .addField("Reason", "Expired")
                                .setTimestamp()
                                .setColor('#00AA00')]});
                    }
                }
            }
        }

        //Now that punishment stuff is out of the way, proceed with the normal join stuff.
        let channel = member.guild.channels.cache.get(botConstants.serverLoggingChannel);
        channel.send({embeds: [new Discord.MessageEmbed()
                .setTitle("User Join")
                .setThumbnail(member.user.displayAvatarURL())
                .setDescription("<@" + member.user + "> has joined the server.")
                .setTimestamp()
                .setColor('#00AA00')]});

        //Welcome message.
        member.createDM().then(dmchannel => {
            dmchannel.send({embeds: [
                    new Discord.MessageEmbed()
                        .setAuthor("The Cult of Cheese", "https://cdn.discordapp.com/icons/105235654727704576/a_61af5bec8e032bc50c9e32508b7cb63f.png")
                        .setTitle("Welcome!")
                        .setDescription("Welcome to the Cult of Cheese! We hope you enjoy your time here! Please read <#432279936490012672> fully before you get started. After you've done that and followed the instructions, you can do !help in <#439114503171604480> to get started!\n" +
                            "\n" +
                            "🧀 EMBRACE THE POWER OF THE CHEESE 🧀")
                        .setColor('#FFAB00')
                ]}).catch((err) => {
                logger.warn("Login Promise Rejection: " + err);
            });
        }).catch((reason) => {
            logger.warn("Login Promise Rejection: " + reason);
        });
    });
};


module.exports = eventmanager;