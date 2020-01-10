const index  = {};
const Discord = require("discord.js");
const Punishments = require("./punishments.js");
const token = 'NjQxMDQxNjYzMzQyNDExNzk2.XcCnoQ.EcvG7W9FE9TYoGFduk0GYyysbwM';
const CommandManager = require("./commandmanager.js");
const ConnectionManager = require("./connectionmanager");
const MySQLManagaer = require("./mysqlmanager.js");

const client = new Discord.Client();

client.login(token);

client.on('ready', () => {
    console.log("The discord bot has been successfully loaded.");
    client.guilds.get("105235654727704576").channels.get("429972539905671168").send("The bot has successfully been restarted due to a crash or file changes. ");
    client.user.setStatus("online");
    client.user.setActivity("on The Cult of Cheese", {type: "PLAYING",});
    MySQLManagaer.getPunishOnLoad((punishments) => {
        console.log("Loading punishments...");
        for (let punishment in punishments) {
            console.log("1");
            if (!client.guilds.get("105235654727704576").members.keyArray().includes(punishment.discord_id)) {
                continue;
            }
            if ((punishment.expire === -1) && punishment.status === 1) {
                if (punishment.type === 2) {
                    if (client.guilds.get("105235654727704576").members.keyArray().includes(punishment.discord_id)) {
                        client.guilds.get("105235654727704576").members.get(punishment.discord_id).createDM().then(dmchannel => {
                            dmchannel.send("You are banned from The Cult of Cheese Discord. Expires: **Permanent**. Reason: **" + punishment.reason + "**");
                        }).catch((reason) => {
                            console.log("Login Promise Rejection: " + reason);
                        });
                        client.guilds.get("105235654727704576").members.get(punishment.discord_id).kick("Joined when banned.").then((member) => {
                        });
                        return;
                    }
                } else if (punishment.type === 1) {
                    if (client.guilds.get("105235654727704576").members.keyArray().includes(punishment.discord_id)) {
                        if (!client.guilds.get("105235654727704576").members.get(punishment.discord_id).roles.keyArray().includes("429970242916319244")) {
                            client.guilds.get("105235654727704576").members.get(punishment.discord_id).createDM().then(dmchannel => {
                                dmchannel.send("You are muted in The Cult of Cheese Discord. Expires: **Permanent**. Reason: **" + punishment.reason + "**");
                            }).catch((reason) => {
                                console.log("Login Promise Rejection: " + reason);
                            });

                            client.guilds.get("105235654727704576").members.get(punishment.discord_id).addRole("429970242916319244").catch((err) => {
                                client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to add a role. Error: " + err);
                            });
                        }
                    }
                    Punishments.addPunishment(punishment);
                }
            } else if (punishment.expire !== -1 && punishment.status === 1) {
                if (punishment.expire > ((new Date).getTime())) {
                    //Apply Punishment, still valid.
                    if (punishment.type === 2) {
                        if (client.guilds.get("105235654727704576").members.keyArray().includes(punishment.discord_id)) {
                            client.guilds.get("105235654727704576").members.get(punishment.discord_id).createDM().then(dmchannel => {
                                let time = ((punishment.expire - punishment.timestamp) / 60000 / 60);
                                let suffix = "hours";
                                if (time >= 24) {
                                    time = (time / 24);
                                    suffix = "days";
                                }
                                dmchannel.send("You are banned from The Cult of Cheese Discord. Expires: **" + time + " " + suffix + "**. Reason: **" + punishment.reason + "**");
                            }).catch((reason) => {
                                console.log("Login Promise Rejection: " + reason);
                            });
                            client.guilds.get("105235654727704576").members.get(punishment.discord_id).kick("Joined when banned.").then((member) => {

                            });
                        }
                        return;
                    } else if (punishment.type === 1) {
                        if (client.guilds.get("105235654727704576").members.keyArray().includes(punishment.discord_id)) {
                            if (!client.guilds.get("105235654727704576").members.get(punishment.discord_id).roles.keyArray().includes("429970242916319244")) {
                                client.guilds.get("105235654727704576").members.get(punishment.discord_id).createDM().then(dmchannel => {
                                    let time = ((punishment.expire - punishment.timestamp) /60000/60);
                                    let suffix = "hours";
                                    if (time >= 24) {
                                        time = (time / 24);
                                        suffix = "days";
                                    }
                                    dmchannel.send("You are muted in The Cult of Cheese Discord. Expires: **" + time + " " + suffix + "**. Reason: **" + punishment.reason + "**");
                                }).catch((reason) => {
                                    console.log("Login Promise Rejection: " + reason);
                                });

                                client.guilds.get("105235654727704576").members.get(punishment.discord_id).addRole("429970242916319244").catch((err) => {
                                    client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to add a role. Error: " + err);
                                });
                            }
                        }
                        punishment.timer = setTimeout(async () => {
                            if (client.guilds.get("105235654727704576").members.keyArray().includes(user)) {
                                if (client.guilds.get("105235654727704576").members.get(punishment.discord_id).roles.keyArray().includes("429970242916319244")) {
                                    client.guilds.get("105235654727704576").members.get(punishment.discord_id).removeRole("429970242916319244").catch((err) => {
                                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                                    });
                                }
                            }}, punishment.expire - punishment.timestamp);
                        Punishments.addPunishment(punishment);
                    }
                } else {
                    //Remove punishment, it has expired.
                    Punishments.expire(punishment.user, punishment.id);
                    client.guilds.get("105235654727704576").channels.get("434005566801707009").send(new Discord.RichEmbed()
                        .setAuthor(msg.member.tag, msg.member.displayAvatarURL)
                        .setDescription(client.guilds.get("105235654727704576").members.get(punishment.discord_id).tag + " has been unpunished.")
                        .addField("Reason", "Expired")
                        .setTimestamp()
                        .setColor('#00AA00'));
                }
            }
        }
        console.log("Punishments Successfully Loaded.");
    });
});

client.on('guildMemberAdd', (member) => {
    Punishments.getPunish(member, (punishments) => {
        if (punishments.length !== 0) {
            for (let punishment in punishments) {
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

                        member.addRole("429970242916319244").catch((err) => {
                            client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to add a role. Error: " + err);
                        });
                        Punishments.addPunishment(punishment);
                    }
                } else if (punishment.expire !== -1 && punishment.status === 1) {
                    if (punishment.expire > ((new Date).getTime())) {
                        //Apply Punishment, still valid.
                        if (punishment.type === 2) {
                            member.createDM().then(dmchannel => {
                                let time = ((punishment.expire - punishment.timestamp) /60000/60);
                                let suffix = "hours";
                                if (time >= 24) {
                                    time = (time / 24);
                                    suffix = "days";
                                }
                                dmchannel.send("You are banned from The Cult of Cheese Discord. Expires: **" + time + " " + suffix + "**. Reason: **" + punishment.reason + "**");
                            }).catch((reason) => {
                                console.log("Login Promise Rejection: " + reason);
                            });
                            member.kick("Joined when banned.").then((member) => {

                            });
                            return;
                        } else if (punishment.type === 1) {
                            member.createDM().then(dmchannel => {
                                let time = ((punishment.expire - punishment.timestamp) /60000/60);
                                let suffix = "hours";
                                if (time >= 24) {
                                    time = (time / 24);
                                    suffix = "days";
                                }
                                dmchannel.send("You are muted in The Cult of Cheese Discord. Expires: **" + time + " " + suffix + "**. Reason: **" + punishment.reason + "**");
                            }).catch((reason) => {
                                console.log("Login Promise Rejection: " + reason);
                            });

                            member.addRole("429970242916319244").catch((err) => {
                                client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to add a role. Error: " + err);
                            });
                            punishment.timer = setTimeout(async () => {
                                if (client.guilds.get("105235654727704576").members.keyArray().includes(user)) {
                                    if (client.guilds.get("105235654727704576").members.get(user).roles.keyArray().includes("429970242916319244")) {
                                        client.guilds.get("105235654727704576").members.get(user).removeRole("429970242916319244").catch((err) => {
                                            client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                                        });
                                    }
                                }}, punishment.expire - punishment.timestamp);
                            Punishments.addPunishment(punishment);
                        }
                    } else {
                        //Remove punishment, it has expired.
                        Punishments.expire(punishment.user, punishment.id);
                        client.guilds.get("105235654727704576").channels.get("434005566801707009").send(new Discord.RichEmbed()
                            .setAuthor(msg.member.tag, msg.member.displayAvatarURL)
                            .setDescription(client.guilds.get("105235654727704576").members.get(punishment.discord_id).tag + " has been unpunished.")
                            .addField("Reason", "Expired")
                            .setTimestamp()
                            .setColor('#00AA00'));
                    }
                }
            }
        }
        let channel = member.guild.channels.get("429970564552065024");
        channel.send(new Discord.RichEmbed()
            .setTitle("User Join")
            .setThumbnail(member.user.displayAvatarURL)
            .setDescription(member.user + " has joined the server.")
            .setTimestamp()
            .setColor('#00AA00'));
        member.createDM().then(dmchannel => {
            dmchannel.send(new Discord.RichEmbed()
                .setAuthor("Block2Block","https://images-ext-2.discordapp.net/external/_qMCj5_iGSM4MIVfSm5qD3pLLXlUNGCObv_GRVPblpk/%3Fsize%3D2048/https/cdn.discordapp.com/avatars/105235320714326016/456d3e040de0ec913b23aa309c5083e3.png")
                .setTitle("Welcome!")
                .setDescription("Welcome to the Cult of Cheese! We hope you enjoy your time here! Please read #read-me in order to get started.\n" +
                    "\n" +
                    "🧀 EMBRACE THE POWER OF THE CHEESE 🧀")
                .setColor('#FFAB00'));
        }).catch((reason) => {
            console.log("Login Promise Rejection: " + reason);
        });

        member.addRole("664631743499993098").catch((err) => {
            client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
        });
    });
});

client.on('guildMemberRemove', (member) => {
        client.guilds.get("105235654727704576").channels.get("429970564552065024").send(new Discord.RichEmbed()
            .setTitle("User Leave")
            .setThumbnail(member.user.displayAvatarURL)
            .setDescription(member.user + " has left the server.")
            .setTimestamp()
            .setColor('#AA0000'));

        Punishments.removePunishment(member);
    }
);

client.on('guildMemberUpdate', (oldMember, newMember) => {
    if (oldMember.displayName !== newMember.displayName) {
        client.guilds.get("105235654727704576").channels.get("429970564552065024").send(new Discord.RichEmbed()
            .setAuthor(newMember.user.tag, newMember.user.displayAvatarURL)
            .setDescription(newMember + " has changed their nickname.")
            .addField("Old Name", oldMember.displayName)
            .addField("New Name", newMember.displayName)
            .setTimestamp()
            .setColor('#2980B9'));
    } else if (oldMember.roles.size !== newMember.roles.size) {
        if (oldMember.roles.size > newMember.roles.size) {
            let role;
            let roles = oldMember.roles.keyArray();
            for (let i = 0;i < roles.length;i++) {
                if (!newMember.roles.keyArray().includes(roles[i])) {
                    role = roles[i];
                    break;
                }
            }
            client.guilds.get("105235654727704576").channels.get("429970564552065024").send(new Discord.RichEmbed()
                .setAuthor(newMember.user.tag, newMember.user.displayAvatarURL)
                .setTitle("Role Removed")
                .setDescription(newMember.user + " was removed from the `" + oldMember.roles.get(role).name + "` role.")
                .setColor('#2980B9'));
        } else {
            let role;
            let roles = newMember.roles.keyArray();
            for (let i = 0;i < roles.length;i++) {
                if (!oldMember.roles.keyArray().includes(roles[i])) {
                    role = roles[i];
                    break;
                }
            }
            client.guilds.get("105235654727704576").channels.get("429970564552065024").send(new Discord.RichEmbed()
                .setAuthor(newMember.user.tag, newMember.user.displayAvatarURL)
                .setTitle("Role Added")
                .setDescription(newMember.user + " was given the `" + newMember.roles.get(role).name + "` role.")
                .setColor('#2980B9'));
        }
    }
});

client.on('userUpdate', (oldUser, newUser) => {
    if (oldUser.username !== newUser.username) {
        client.guilds.get("105235654727704576").channels.get("429970564552065024").send(new Discord.RichEmbed()
            .setAuthor(newUser.tag, newUser.displayAvatarURL)
            .setDescription(newUser + " has changed their username.")
            .addField("Old Name", oldUser.username)
            .addField("New Name", newUser.username)
            .setTimestamp()
            .setColor('#2980B9'));
    }
});

client.on('guildBanAdd', (guild, user) => {
    client.guilds.get("105235654727704576").channels.get("434005566801707009").send(new Discord.RichEmbed()
        .setAuthor(user.tag, user.displayAvatarURL)
        .setTitle("Manual Ban")
        .setDescription(user + " was manually banned by an admin.")
        .setColor('#AA0000'));
});

client.on('messageDelete', (message) => {
    if (message.guild != null) {
        if (message.content.startsWith("!")||message.author.bot) {
            return;
        }
        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("A message by " + message.author + " was deleted in " + message.channel + ".\n" +
            "**Message**: `" + message.content + "`");
    }
});

client.on('messageUpdate', (oldMessage, newMessage) => {
    if (newMessage.guild != null) {
        if (oldMessage.author.bot || oldMessage.content === newMessage.content) {
            return;
        }
        client.guilds.get("105235654727704576").channels.get("429970564552065024").send(newMessage.author + " edited a message in " + newMessage.channel + ".\n" +
            "**Old**: `" + oldMessage.content + "`\n" +
            "**New**: `" + newMessage.content + "`");
    }
});

client.on('message', (msg) => {
    if (msg.content.startsWith("!")) {
        CommandManager.onCommand(msg, client);
    }
});

module.exports = index;