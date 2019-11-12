const commandmanager = {};
const Discord = require("discord.js");
const MySQLManager = require("./mysqlmanager.js");
const ConnectionManager = require("./connectionmanager");

commandmanager.onCommand = async function(msg, client) {
    if (msg.guild == null) {
        if (!client.guilds.get("105235654727704576").members.keyArray().includes(msg.author.id)) {
            msg.channel.send("You are not a part of The Cult of Cheese Discord. You must be a part of the Discord in order to use this bot. Please join here: http://discord.gg/vmT6wY7/");
            return;
        } else {
            msg.channel.send("You cannot send messages via PM to this bot. Please use #bot-commands.")
        }
    } else {
        if (msg.channel.id === "439114503171604480") {

        } else if (msg.channel.id === "629807458864463883") {

        } else if (msg.channel.id === "439114294307717131") {
            if (msg.content.startsWith("!join")) {
                if (msg.member.voiceChannel) {
                    if (msg.member.roles.keyArray().includes("629034598113738773")||msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")) {
                        ConnectionManager.joinChannel(client, msg.member.voiceChannel, msg);
                    } else {
                        msg.reply("You do not have permission to perform this command.").then(message => {
                            setTimeout(async () => {
                                message.delete();
                            }, 5000)
                        });
                    }
                } else {
                    msg.reply("You must be in a voice channel first.");
                }

            } else if (msg.content.startsWith("!leave")) {
                ConnectionManager.inChannel().then(inChannel => {
                    if (inChannel) {
                        ConnectionManager.leave();
                        msg.reply("The bot has now left the channel.").then(message => {
                            setTimeout(async () => {
                                message.delete();
                            }, 5000)
                        });
                        msg.delete();
                    } else {
                        msg.reply("I must be in a channel in order to leave it.").then(message => {
                            setTimeout(async () => {
                                message.delete();
                            }, 5000)
                        });
                        msg.delete();
                    }
                });

            } else if (msg.content.startsWith("!play")) {
                if (msg.content.split(" ").length === 2) {
                    if (msg.member.roles.keyArray().includes("629034598113738773")||msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")) {
                        const args = msg.content.split(" ");
                        await ConnectionManager.playCommand(args[1], msg, client);
                    } else {
                        await msg.reply("You do not have permission to perform this command.").then(message => {
                            setTimeout(async () => {
                                message.delete();
                            }, 5000)
                        });
                    }
                } else {
                    await msg.reply("Invalid Arguments. Correct Arguments **!play [youtube URL]**");
                    msg.delete();
                }
            } else if (msg.content.startsWith("!skip")) {
                if (msg.member.roles.keyArray().includes("629034598113738773")||msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")) {
                    await ConnectionManager.skip(msg, client);
                } else {
                    await msg.reply("You do not have permission to perform this command.").then(message => {
                        setTimeout(async () => {
                            message.delete();
                        }, 5000)
                    });
                }
            }
        }
    }


};

module.exports = commandmanager;