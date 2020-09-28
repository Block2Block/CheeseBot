const roleManager = {};

let messages = new Map();
let roles = new Map();
let roleIds = [];

roleManager.init = async function (client, MySQLManager, logger) {

    let botConstants = require("../utils/Constants.js").getBotConstants();
    await MySQLManager.getRoles(logger, (rls) => {
        for (let x of rls) {
            roles.set(x.reaction_emoji, x);
            roleIds.push(x.role_id);
        }
    })

    await MySQLManager.getMessages(logger, (msgs) => {
        for (let x of msgs) {
            messages.set(x.message_id, x);
            client.guilds.cache.get(botConstants.guildId).channels.cache.get(x.channel_id).messages.fetch(x.message_id, true);
        }
    })
}

roleManager.addRole = async function (msg, args, MySQLManager, logger) {
    let BotConstants = require("../utils/Constants.js");
    let client = msg.client;
    if (args.length >= 4) {
        let emoji, role, type, description;
        let re = /^<@&[0-9]{17,18}>$/;
        if (re.test(args[0])) {
            role = args[0].replace("<@&", "").replace(">", "");
        } else {
            msg.reply("That is not a valid role.");
            return;
        }

        re = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])$/;
        if (re.test(args[1])) {
            emoji = args[1];
        } else {
            re = /^<:[a-zA-Z0-9_]+:[0-9]{17,18}>$/;
            if (re.test(args[1])) {
                emoji = args[1].replace(">", "");
                emoji = emoji.split(":")[2];
                if (client.guilds.cache.get(BotConstants.getBotConstants().guildId).emojis.cache.get(emoji) === null || client.guilds.cache.get(BotConstants.getBotConstants().guildId).emojis.cache.get(emoji) === undefined) {
                    msg.reply("That is not a valid emoji. It must be a non-animated custom emoji from this Discord or a built-in emoji.");
                    return;
                }
            } else {
                msg.reply("That is not a valid emoji. It must be a non-animated custom emoji from this Discord or a built-in emoji.");
                return;
            }
        }

        if (args[2].toUpperCase() === "NOTIF" || args[2].toUpperCase() === "GAME") {
            type = args[2].toUpperCase();
        } else {
            msg.reply("That is not a valid type. Valid types: **NOTIF**, **GAME**");
            return;
        }

        if (roles.has(emoji)) {
            msg.reply("That emoji is already being used for a role. Please either remove the old role and create this one or choose another emoji.");
            return;
        }

        for (let x of roles.values()) {
            if (x.role_id === role) {
                msg.reply("That role is already registered. To change the emoji, delete it and recreate it.");
                return;
            }
        }

        description = "";
        for (let i = 3; i < args.length; i++) {
            description += (args[i] + " ");
        }
        description = description.trim();

        roles.set(emoji, {
            role_id: role,
            reaction_emoji: emoji,
            description: description,
            type: type
        })

        //Check if the message needs reposting.
        for (let x of messages.values()) {
            if (x.type === type) {
                //Repost message.
                client.guilds.cache.get(BotConstants.getBotConstants().guildId).channels.cache.get(x.channel_id).messages.fetch(x.message_id).then((message) => {
                    let Discord = require("discord.js");
                    let embed = new Discord.MessageEmbed();
                    embed.setTitle("Join " + ((type === "NOTIF")?"Notification":"Game") + " roles!");
                    embed.setDescription("Want to " + ((type === "NOTIF")?"get notified when we go live, or want to know when we do bot updates?":"play some games with some pretty cool people?") + " React to this message to add yourself to some of our roles and take part in all the fun!");
                    for (let z of roles.values()) {
                        if (z.type === type) {
                            embed.addField(client.guilds.cache.get(BotConstants.getBotConstants().guildId).roles.cache.get(z.role_id).name, "React with " + ((client.guilds.cache.get(BotConstants.getBotConstants().guildId).emojis.cache.get(z.reaction_emoji) !== undefined)?"<:" + client.guilds.cache.get(BotConstants.getBotConstants().guildId).emojis.cache.get(z.reaction_emoji).identifier + ">":z.reaction_emoji) + " to join the `" + client.guilds.cache.get(BotConstants.getBotConstants().guildId).roles.cache.get(z.role_id).name + "` role.\n\n" + z.description);
                        }
                    }
                    message.edit(embed);
                    message.react(emoji)

                })
                break;
            }
        }
        msg.reply("Role added.");
        await MySQLManager.addRole(role, emoji, description, type, logger);
    } else {
        msg.reply("Invalid syntax. Correct syntax: **!addrole [tagged role] [reaction emoji] [type] [description]**");
        return;
    }
}

roleManager.removeRole = async function (msg, args, MySQLManager, logger) {
    let BotConstants = require("../utils/Constants.js");
    let client = msg.client;
    if (args.length === 1) {
        let role;
        let re = /^<@&[0-9]{17,18}>$/;
        if (re.test(args[0])) {
            role = args[0].replace("<@&", "").replace(">", "");
        } else {
            msg.reply("That is not a valid role.");
            return;
        }

        for (let y of roles.values()) {
            if (y.role_id === role) {
                roles.delete(y.reaction_emoji);
                for (let x of messages.values()) {
                    if (x.type === y.type) {
                        //Repost message.
                        client.guilds.cache.get(BotConstants.getBotConstants().guildId).channels.cache.get(x.channel_id).messages.fetch(x.message_id).then((message) => {
                            let Discord = require("discord.js");
                            let embed = new Discord.MessageEmbed();
                            embed.setTitle("Join " + ((y.type === "NOTIF")?"Notification":"Game") + " roles!");
                            embed.setDescription("Want to " + ((y.type === "NOTIF")?"get notified when we go live, or want to know when we do bot updates?":"play some games with some pretty cool people?") + " React to this message to add yourself to some of our roles and take part in all the fun!");
                            for (let z of roles.values()) {
                                if (z.type === y.type) {
                                    embed.addField(client.guilds.cache.get(BotConstants.getBotConstants().guildId).roles.cache.get(z.role_id).name, "React with " + ((client.guilds.cache.get(BotConstants.getBotConstants().guildId).emojis.cache.get(z.reaction_emoji) !== undefined)?"<:" + client.guilds.cache.get(BotConstants.getBotConstants().guildId).emojis.cache.get(z.reaction_emoji).identifier + ">":z.reaction_emoji) + " to join the `" + client.guilds.cache.get(BotConstants.getBotConstants().guildId).roles.cache.get(z.role_id).name + "` role.\n\n" + z.description);
                                }
                            }
                            message.edit(embed);
                            message.reactions.cache.get(y.reaction_emoji).remove();

                        })
                        break;
                    }
                }
                msg.reply("Role removed");
                await MySQLManager.removeRole(y.role_id, logger);
                return;
            }
        }

        msg.reply("That role is not added to the bot.");
    } else {
        msg.reply("Invalid syntax. Correct Syntax: **!removerole [tagged role]**");
    }
}

roleManager.editDescription = async function (msg, args, MySQLManager, logger) {
    let BotConstants = require("../utils/Constants.js");
    let client = msg.client;
    if (args.length >= 2) {
        let role;
        let re = /^<@&[0-9]{17,18}>$/;
        if (re.test(args[0])) {
            role = args[0].replace("<@&", "").replace(">", "");
        } else {
            msg.reply("That is not a valid role.");
            return;
        }

        for (let y of roles.values()) {
            if (y.role_id === role) {
                let description = "";
                for (let i = 1; i < args.length; i++) {
                    description += (args[i] + " ");
                }
                description = description.trim();
                y.description = description;
                for (let x of messages.values()) {
                    if (x.type === y.type) {
                        //Repost message.
                        client.guilds.cache.get(BotConstants.getBotConstants().guildId).channels.cache.get(x.channel_id).messages.fetch(x.message_id).then((message) => {
                            let Discord = require("discord.js");
                            let embed = new Discord.MessageEmbed();
                            embed.setTitle("Join " + ((x.type === "NOTIF")?"Notification":"Game") + " roles!");
                            embed.setDescription("Want to " + ((x.type === "NOTIF")?"get notified when we go live, or want to know when we do bot updates?":"play some games with some pretty cool people?") + " React to this message to add yourself to some of our roles and take part in all the fun!");
                            for (let z of roles.values()) {
                                if (z.type === x.type) {
                                    embed.addField(client.guilds.cache.get(BotConstants.getBotConstants().guildId).roles.cache.get(z.role_id).name, "React with " + ((client.guilds.cache.get(BotConstants.getBotConstants().guildId).emojis.cache.get(z.reaction_emoji) !== undefined)?"<:" + client.guilds.cache.get(BotConstants.getBotConstants().guildId).emojis.cache.get(z.reaction_emoji).identifier + ">":z.reaction_emoji) + " to join the `" + client.guilds.cache.get(BotConstants.getBotConstants().guildId).roles.cache.get(z.role_id).name + "` role.\n\n" + z.description);
                                }
                            }
                            message.edit(embed);

                        })
                        break;
                    }
                }
                msg.reply("Description edited.");
                await MySQLManager.updateRoleDescription(y.role_id, description, logger);
                return;
            }
        }

        msg.reply("That role is not added to the bot.");
    } else {
        msg.reply("Invalid syntax. Correct Syntax: **!editdescription [tagged role] [new description]**");
    }
}

roleManager.postMessage = async function (msg, args, MySQLManager, logger) {
    let BotConstants = require("../utils/Constants.js");
    let client = msg.client;
    if (args.length >= 2) {
        let channel,type;
        let re = /^<#[0-9]{17,18}>$/;
        if (re.test(args[0])) {
            channel = args[0].replace("<#", "").replace(">", "");
        } else {
            msg.reply("That is not a valid channel.");
            return;
        }


        if (args[1].toUpperCase() === "NOTIF" || args[1].toUpperCase() === "GAME") {
            type = args[1].toUpperCase();
        } else {
            msg.reply("That is not a valid type. Valid types: **NOTIF**, **GAME**");
            return;
        }


        for (let x of messages.values()) {
            if (x.type === type) {
                logger.info("found old message, deleting.");
                //Repost message.
                client.guilds.cache.get(BotConstants.getBotConstants().guildId).channels.cache.get(x.channel_id).messages.fetch(x.message_id).then((message) => {
                    message.delete();
                    let Discord = require("discord.js");
                    let embed = new Discord.MessageEmbed();
                    embed.setTitle("Join " + ((x.type === "NOTIF") ? "Notification" : "Game") + " roles!");
                    embed.setDescription("Want to " + ((x.type === "NOTIF") ? "get notified when we go live, or want to know when we do bot updates?" : "play some games with some pretty cool people?") + " React to this message to add yourself to some of our roles and take part in all the fun!");
                    for (let z of roles.values()) {
                        if (z.type === x.type) {
                            embed.addField(client.guilds.cache.get(BotConstants.getBotConstants().guildId).roles.cache.get(z.role_id).name, "React with " + ((client.guilds.cache.get(BotConstants.getBotConstants().guildId).emojis.cache.get(z.reaction_emoji) !== undefined)?"<:" + client.guilds.cache.get(BotConstants.getBotConstants().guildId).emojis.cache.get(z.reaction_emoji).identifier + ">":z.reaction_emoji) + " to join the `" + client.guilds.cache.get(BotConstants.getBotConstants().guildId).roles.cache.get(z.role_id).name + "` role.\n\n" + z.description);
                        }
                    }
                    client.guilds.cache.get(BotConstants.getBotConstants().guildId).channels.cache.get(channel).send(embed).then((message2) => {
                        MySQLManager.updateMessage(message2.id, message2.channel.id, type, logger);
                        messages.delete(x.message_id);
                        messages.set(message2.id, {
                            message_id: message2.id,
                            channel_id: message2.channel.id,
                            type: type
                        })
                        for (let z of roles.values()) {
                            if (z.type === x.type) {
                                message2.react(z.reaction_emoji);
                            }
                        }
                    });

                })
                msg.reply("Message posted!");
                return;
            }
        }

        let Discord = require("discord.js");
        let embed = new Discord.MessageEmbed();
        embed.setTitle("Join " + ((type === "NOTIF") ? "Notification" : "Game") + " roles!");
        embed.setDescription("Want to " + ((type === "NOTIF") ? "get notified when we go live, or want to know when we do bot updates?" : "play some games with some pretty cool people?") + " React to this message to add yourself to some of our roles and take part in all the fun!");
        for (let z of roles.values()) {
            if (z.type === type) {
                embed.addField(client.guilds.cache.get(BotConstants.getBotConstants().guildId).roles.cache.get(z.role_id).name, "React with " + ((client.guilds.cache.get(BotConstants.getBotConstants().guildId).emojis.cache.get(z.reaction_emoji) !== undefined)?"<:" + client.guilds.cache.get(BotConstants.getBotConstants().guildId).emojis.cache.get(z.reaction_emoji).identifier + ">":z.reaction_emoji) + " to join the `" + client.guilds.cache.get(BotConstants.getBotConstants().guildId).roles.cache.get(z.role_id).name + "` role.\n\n" + z.description);
            }
        }
        client.guilds.cache.get(BotConstants.getBotConstants().guildId).channels.cache.get(channel).send(embed).then((message) => {
            messages.set(message.id, {
                message_id: message.id,
                channel_id: message.channel.id,
                type: type
            })
            MySQLManager.addMessage(message.id, message.channel.id, type, logger);
            for (let z of roles.values()) {
                if (z.type === type) {
                    message.react(client.guilds.cache.get(BotConstants.getBotConstants().guildId).emojis.cache.get(z.reaction_emoji));
                }
            }
        })
        msg.reply("Message posted!");
        return;
    } else {
        msg.reply("Invalid syntax. Correct Syntax: **!postmessage [tagged channel] [type]**");
    }
}

roleManager.reactionAdded = async function (reaction, user) {
    let client = reaction.client;
    let botConstants = require("../utils/Constants.js").getBotConstants();
    if (messages.has(reaction.message.id.toString())) {
        let role;
        if (roles.has(reaction.emoji.id + "")) {
            role = roles.get(reaction.emoji.id + "")
        } else if (roles.has(reaction.emoji.toString())) {
            role = roles.get(reaction.emoji.toString())
        } else {
            await reaction.users.remove(user);
            return;
        }

        if (!reaction.message.guild.members.cache.get(user.id).roles.cache.keyArray().includes(role.role_id)) {
            reaction.message.guild.members.cache.get(user.id).roles.add(role.role_id).catch((err) => {
                client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.botLoggingChannel).send("An error occurred when trying to add a role. Error: " + err);
            }).then(() => {
                let x = reaction.message.guild.members.cache.get(user.id).roles.cache.keyArray().filter(value => roleIds.includes(value));
                if (x >= 1) {
                    reaction.message.guild.members.cache.get(user.id).roles.add(botConstants.gameRole).catch((err) => {
                        client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.botLoggingChannel).send("An error occurred when trying to add a role. Error: " + err);
                    });
                }
            });
        } else {
            let x = reaction.message.guild.members.cache.get(user.id).roles.cache.keyArray().filter(value => roleIds.includes(value));
            if (x >= 1) {
                reaction.message.guild.members.cache.get(user.id).roles.add(botConstants.gameRole).catch((err) => {
                    client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.botLoggingChannel).send("An error occurred when trying to add a role. Error: " + err);
                });
            }
        }
        //do nothing if they already have the role.
    }
}

roleManager.reactionRemoved = async function (reaction, user) {
    let client = reaction.client;
    let botConstants = require("../utils/Constants.js").getBotConstants();
    if (messages.has(reaction.message.id.toString())) {
        let role;
        if (roles.has(reaction.emoji.id + "")) {
            role = roles.get(reaction.emoji.id + "")
        } else if (roles.has(reaction.emoji.toString())) {
            role = roles.get(reaction.emoji.toString())
        } else {
            return;
        }

        if (reaction.message.guild.members.cache.get(user.id).roles.cache.keyArray().includes(role.role_id)) {
            reaction.message.guild.members.cache.get(user.id).roles.remove(role.role_id).catch((err) => {
                client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.botLoggingChannel).send("An error occurred when trying to remove a role. Error: " + err);
            }).then(() => {
                let x = reaction.message.guild.members.cache.get(user.id).roles.cache.keyArray().filter(value => roleIds.includes(value));
                if (x <= 0) {
                    reaction.message.guild.members.cache.get(user.id).roles.remove(botConstants.gameRole).catch((err) => {
                        client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.botLoggingChannel).send("An error occurred when trying to remove a role. Error: " + err);
                    });
                }
            });
        } else {
            let x = reaction.message.guild.members.cache.get(user.id).roles.cache.keyArray().filter(value => roleIds.includes(value));
            if (x <= 0) {
                reaction.message.guild.members.cache.get(user.id).roles.remove(botConstants.gameRole).catch((err) => {
                    client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.botLoggingChannel).send("An error occurred when trying to remove a role. Error: " + err);
                });
            }
        }


    }
}


module.exports = roleManager;