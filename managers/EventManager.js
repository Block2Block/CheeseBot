const eventmanager = {};

//Loading internal libraries.
let MySQLManager;
const Punishments = require("./PunishmentManager.js");

//Bot variables.
const botConstants = {
    guildId: "105235654727704576",
    botLoggingChannel: "429972539905671168",
    moderationLoggingChannel: "434005566801707009",
    serverLoggingChannel: "429970564552065024",
    mutedRole: "429970242916319244",
    memberRole: "664631743499993098",
    gameRole: "664626926127677440",
    nowPlayingChannel: "643571367715012638",
    commandPrefix: "!"
};
let botClient;

eventmanager.ready = function(client) {
    botClient = client;

    MySQLManager = require("../utils/MySQLManager.js");
    console.log("Bot Client Connected.");

    client.user.setStatus("online");
    client.user.setActivity("on The Cult of Cheese", {type: "PLAYING"});

    //Get all of the *active* punishments from the database.
    MySQLManager.getPunishOnLoad((punishments) => {
        console.log("Loading punishments...");
        for (let punishment of punishments) {
            if (!client.guilds.get(botConstants.guildId).members.keyArray().includes(punishment.user)) {
                continue;
            }
            if ((punishment.expire === -1) && punishment.status === 1) {
                if (punishment.type === 2) {
                    if (client.guilds.get(botConstants.guildId).members.keyArray().includes(punishment.user)) {
                        client.guilds.get(botConstants.guildId).members.get(punishment.user).createDM().then(dmchannel => {
                            dmchannel.send("You are banned from The Cult of Cheese Discord. Expires: **Permanent**. Reason: **" + punishment.reason + "**");
                        }).catch((reason) => {
                            console.log("Login Promise Rejection: " + reason);
                        });
                        client.guilds.get(botConstants.guildId).members.get(punishment.user).kick("Joined when banned.").then((member) => {
                        });
                        return;
                    }
                } else if (punishment.type === 1) {
                    if (client.guilds.get(botConstants.guildId).members.keyArray().includes(punishment.user)) {
                        if (!client.guilds.get(botConstants.guildId).members.get(punishment.user).roles.keyArray().includes(botConstants.mutedRole)) {
                            client.guilds.get(botConstants.guildId).members.get(punishment.user).createDM().then(dmchannel => {
                                dmchannel.send("You are muted in The Cult of Cheese Discord. Expires: **Permanent**. Reason: **" + punishment.reason + "**");
                            }).catch((reason) => {
                                console.log("Login Promise Rejection: " + reason);
                            });

                            client.guilds.get(botConstants.guildId).members.get(punishment.user).addRole(botConstants.mutedRole).catch((err) => {
                                client.guilds.get(botConstants.guildId).channels.get(botConstants.botLoggingChannel).send("An error occurred when trying to add a role. Error: " + err);
                            });
                        }
                    }
                    Punishments.addToCache(punishment);
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
                    if (punishment.type === 2) {
                        if (client.guilds.get(botConstants.guildId).members.keyArray().includes(punishment.user)) {
                            client.guilds.get(botConstants.guildId).members.get(punishment.user).createDM().then(dmchannel => {
                                dmchannel.send("You are banned from The Cult of Cheese Discord. Expires: **" + time + " " + suffix + "**. Reason: **" + punishment.reason + "**");
                            }).catch((reason) => {
                                console.log("Login Promise Rejection: " + reason);
                            });
                            client.guilds.get(botConstants.guildId).members.get(punishment.user).kick("Joined when banned.").then((member) => {

                            });
                        }
                        return;
                    } else if (punishment.type === 1) {
                        if (client.guilds.get(botConstants.guildId).members.keyArray().includes(punishment.user)) {
                            if (!client.guilds.get(botConstants.guildId).members.get(punishment.user).roles.keyArray().includes(botConstants.mutedRole)) {
                                client.guilds.get(botConstants.guildId).members.get(punishment.user).createDM().then(dmchannel => {
                                    dmchannel.send("You are muted in The Cult of Cheese Discord. Expires: **" + time + " " + suffix + "**. Reason: **" + punishment.reason + "**");
                                }).catch((reason) => {
                                    console.log("Login Promise Rejection: " + reason);
                                });

                                client.guilds.get(botConstants.guildId).members.get(punishment.user).addRole(botConstants.mutedRole).catch((err) => {
                                    client.guilds.get(botConstants.guildId).channels.get(botConstants.botLoggingChannel).send("An error occurred when trying to add a role. Error: " + err);
                                });
                            }
                        }
                        punishment.timer = setTimeout(async () => {
                            if (client.guilds.get(botConstants.guildId).members.keyArray().includes(punishment.user)) {
                                if (client.guilds.get(botConstants.guildId).members.get(punishment.user).roles.keyArray().includes(botConstants.mutedRole)) {
                                    client.guilds.get(botConstants.guildId).members.get(punishment.user).removeRole(botConstants.mutedRole).catch((err) => {
                                        client.guilds.get(botConstants.guildId).channels.get(botConstants.botLoggingChannel).send("An error occurred when trying to remove a role. Error: " + err);
                                    });
                                }
                            }

                            await MySQLManager.expire(punishment.user, id);
                        }, punishment.expire - punishment.timestamp);
                        Punishments.addToCache(punishment);
                    }
                } else {
                    //Remove punishment, it has expired.
                    Punishments.expire(punishment.user, punishment.id);
                    client.guilds.get(botConstants.guildId).channels.get("434005566801707009").send(new Discord.RichEmbed()
                        .setAuthor(client.guilds.get(botConstants.guildId).members.get(punishment.user).user.tag, client.guilds.get(botConstants.guildId).members.get(punishment.user).user.displayAvatarURL)
                        .setDescription(client.guilds.get(botConstants.guildId).members.get(punishment.user).user.tag + " has been unpunished.")
                        .addField("Reason", "Expired")
                        .setTimestamp()
                        .setColor('#00AA00'));
                }
            }
        }
        console.info("Punishments Successfully Loaded.");
        client.guilds.get(botConstants.guildId).channels.get(botConstants.botLoggingChannel).send("Bot successfully loaded.");
        console.info("The bot has been successfully loaded.")
    });
};

eventmanager.join = function(member) {
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
                            console.log("Login Promise Rejection: " + reason);
                        });
                        member.kick("Joined when banned.").then((member) => {
                        });
                        return;
                    } else if (punishment.type === 1) {
                        member.createDM().then(dmchannel => {
                            dmchannel.send("You are muted in The Cult of Cheese Discord. Expires: **Permanent**. Reason: **" + punishment.reason + "**");
                        }).catch((reason) => {
                            console.log("Login Promise Rejection: " + reason);
                        });

                        member.addRole(botConstants.mutedRole).catch((err) => {
                            botClient.guilds.get(botConstants.guildId).channels.get("429970564552065024").send("An error occurred when trying to add a role. Error: " + err);
                        });
                        Punishments.addToCache(punishment);
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
                                console.log("Login Promise Rejection: " + reason);
                            });
                            member.kick("Joined when banned.").then((member) => {

                            });
                            return;
                        } else if (punishment.type === 1) {
                            member.createDM().then(dmchannel => {
                                dmchannel.send("You are muted in The Cult of Cheese Discord. Expires: **" + time + " " + suffix + "**. Reason: **" + punishment.reason + "**");
                            }).catch((reason) => {
                                console.log("Login Promise Rejection: " + reason);
                            });

                            member.addRole(botConstants.mutedRole).catch((err) => {
                                botClient.guilds.get(botConstants.guildId).channels.get("429970564552065024").send("An error occurred when trying to add a role. Error: " + err);
                            });
                            punishment.timer = setTimeout(async () => {
                                if (botClient.guilds.get(botConstants.guildId).members.keyArray().includes(user)) {
                                    if (botClient.guilds.get(botConstants.guildId).members.get(user).roles.keyArray().includes(botConstants.mutedRole)) {
                                        botClient.guilds.get(botConstants.guildId).members.get(user).removeRole(botConstants.mutedRole).catch((err) => {
                                            botClient.guilds.get(botConstants.guildId).channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                                        });
                                    }
                                }
                            }, punishment.expire - punishment.timestamp);
                            Punishments.addToCache(punishment);
                        }
                    } else {
                        //Remove punishment, it has expired.
                        Punishments.expire(punishment.user, punishment.id);
                        botClient.guilds.get(botConstants.guildId).channels.get("434005566801707009").send(new Discord.RichEmbed()
                            .setAuthor(member.user.tag, member.user.displayAvatarURL)
                            .setDescription(member.user.tag + " has been unpunished.")
                            .addField("Reason", "Expired")
                            .setTimestamp()
                            .setColor('#00AA00'));
                    }
                }
            }
        }

        //Now that punishment stuff is out of the way, proceed with the normal join stuff.
        let channel = member.guild.channels.get(botConstants.serverLoggingChannel);
        channel.send(new Discord.RichEmbed()
            .setTitle("User Join")
            .setThumbnail(member.user.displayAvatarURL)
            .setDescription(member.user + " has joined the server.")
            .setTimestamp()
            .setColor('#00AA00'));

        //Welcome message.
        member.createDM().then(dmchannel => {
            dmchannel.send(new Discord.RichEmbed()
                .setAuthor("The Cult of Cheese", "https://cdn.discordapp.com/icons/105235654727704576/a_6ac123436074fea65da6264340302245.png")
                .setTitle("Welcome!")
                .setDescription("Welcome to the Cult of Cheese! We hope you enjoy your time here! Please read #rules carefully, as interacting in any capacity in this Discord Server is taken as confirmation that you are going to abide by and agree with our rules. After you've done that, you can do !help in #bot-utils to get started!\n" +
                    "\n" +
                    "🧀 EMBRACE THE POWER OF THE CHEESE 🧀")
                .setColor('#FFAB00'));
        }).catch((reason) => {
            console.log("Login Promise Rejection: " + reason);
        });

        member.addRole("664631743499993098").catch((err) => {
            botClient.guilds.get(botConstants.guildId).channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
        });
    });
};


//Putting these here as this class does not use any initialising code (so the bot client doesnt get loaded like 5 times. (And to prevent circular dependencies).
eventmanager.getBotConstants = function () {
    return botConstants;
};

eventmanager.getClient = function () {
    return botClient;
};


module.exports = eventmanager;