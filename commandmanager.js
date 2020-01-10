const commandmanager = {};
const Discord = require("discord.js");
const MySQLManager = require("./mysqlmanager.js");
const ConnectionManager = require("./connectionmanager");
const PunishmentManager = require("./punishments");
const bot = require("./bot.js");
const git = require('simple-git');
const ranks = ["631519513606619157","637034819234037762","631518599365787659","642130508549193728","659746742727737365","664134936185274368","664135506115690496","631607746298380297","631607804205072394"];

commandmanager.onCommand = async function(msg, client) {
    if (msg.guild == null) {
        if (!client.guilds.get("105235654727704576").members.keyArray().includes(msg.author.id)) {
            msg.channel.send("You are not a part of The Cult of Cheese Discord. You must be a part of the Discord in order to use this bot. Please join here: http://discord.gg/vmT6wY7/");
            return;
        } else {
            msg.channel.send("You cannot send messages via PM to this bot. Please use #bot-commands.")
        }
    } else {
        if (msg.content.startsWith("!mute")) {
            if (msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")||msg.member.roles.keyArray().includes("665237632082640906")) {
                await PunishmentManager.mute(msg, client);
            } else {
                await msg.reply("You do not have permission to perform this command.");
            }
            return;
        } else if (msg.content.startsWith("!ban")) {
            if (msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")||msg.member.roles.keyArray().includes("665237632082640906")) {
                await PunishmentManager.ban(msg, client);
            } else {
                await msg.reply("You do not have permission to perform this command.");
            }
            return;
        } else if (msg.content.startsWith("!unban")) {
            if (msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")||msg.member.roles.keyArray().includes("665237632082640906")) {
                await PunishmentManager.unban(msg, client);
            } else {
                await msg.reply("You do not have permission to perform this command.");
            }
            return;
        } else if (msg.content.startsWith("!unmute")) {
            if (msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")||msg.member.roles.keyArray().includes("665237632082640906")) {
                await PunishmentManager.unmute(msg, client);
            } else {
                await msg.reply("You do not have permission to perform this command.");
            }
            return;
        } else if (msg.content.startsWith("!history")) {
            if (msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")||msg.member.roles.keyArray().includes("665237632082640906")) {
                await PunishmentManager.history(msg, client);
            } else {
                await msg.reply("You do not have permission to perform this command.");
            }
            return;
        }
        if (msg.channel.id === "439114503171604480") {
            if (msg.content.startsWith("!jackbox")) {
                if (msg.member.roles.keyArray().includes("631519513606619157")) {
                    await msg.member.removeRole("631519513606619157").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    await msg.reply("You have been removed from the role 'Jackbox'.");
                    for (let x in ranks) {
                        if (msg.member.roles.keyArray().includes(x)) {
                            return;
                        }
                    }
                    msg.member.removeRole("664626926127677440").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                } else {
                    msg.member.addRole("631519513606619157").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    if (!msg.member.roles.keyArray().includes("664626926127677440")) {
                        msg.member.addRole("664626926127677440").catch((err) => {
                            client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                        });
                    }
                    await msg.reply("You have been added to the role 'Jackbox'.");
                }
            } else if (msg.content.startsWith("!overwatch")) {
                if (msg.member.roles.keyArray().includes("637034819234037762")) {
                    await msg.member.removeRole("637034819234037762").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    await msg.reply("You have been removed from the role 'Overwatch'.");
                    for (let x in ranks) {
                        if (msg.member.roles.keyArray().includes(x)) {
                            return;
                        }
                    }
                    msg.member.removeRole("664626926127677440").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                } else {
                    msg.member.addRole("637034819234037762").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    if (!msg.member.roles.keyArray().includes("664626926127677440")) {
                        msg.member.addRole("664626926127677440").catch((err) => {
                            client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                        });
                    }
                    await msg.reply("You have been added to the role 'Overwatch'.");
                }
            } else if (msg.content.startsWith("!uno")) {
                if (msg.member.roles.keyArray().includes("631518599365787659")) {
                    await msg.member.removeRole("631518599365787659").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    await msg.reply("You have been removed from the role 'UNO'.");
                    for (let x in ranks) {
                        if (msg.member.roles.keyArray().includes(x)) {
                            return;
                        }
                    }
                    msg.member.removeRole("664626926127677440").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                } else {
                    msg.member.addRole("631518599365787659").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    if (!msg.member.roles.keyArray().includes("664626926127677440")) {
                        msg.member.addRole("664626926127677440").catch((err) => {
                            client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                        });
                    }
                    await msg.reply("You have been added to the role 'UNO'.");
                }
            } else if (msg.content.startsWith("!stardewvalley")) {
                if (msg.member.roles.keyArray().includes("642130508549193728")) {
                    await msg.member.removeRole("642130508549193728").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    await msg.reply("You have been removed from the role 'Stardew Valley'.");
                    for (let x in ranks) {
                        if (msg.member.roles.keyArray().includes(x)) {
                            return;
                        }
                    }
                    msg.member.removeRole("664626926127677440").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                } else {
                    msg.member.addRole("642130508549193728").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    if (!msg.member.roles.keyArray().includes("664626926127677440")) {
                        msg.member.addRole("664626926127677440").catch((err) => {
                            client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                        });
                    }
                    await msg.reply("You have been added to the role 'Stardew Valley'.");
                }
            } else if (msg.content.startsWith("!gameoflife")) {
                if (msg.member.roles.keyArray().includes("659746742727737365")) {
                    await msg.member.removeRole("659746742727737365").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    await msg.reply("You have been removed from the role 'THE GAME OF LIFE'.");
                    for (let x in ranks) {
                        if (msg.member.roles.keyArray().includes(x)) {
                            return;
                        }
                    }
                    msg.member.removeRole("664626926127677440").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                } else {
                    msg.member.addRole("659746742727737365").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    if (!msg.member.roles.keyArray().includes("664626926127677440")) {
                        msg.member.addRole("664626926127677440").catch((err) => {
                            client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                        });
                    }
                    await msg.reply("You have been added to the role 'THE GAME OF LIFE'.");
                }
            } else if (msg.content.startsWith("!cah")) {
                if (msg.member.roles.keyArray().includes("664134936185274368")) {
                    await msg.member.removeRole("664134936185274368").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    await msg.reply("You have been removed from the role 'Cards Against Humanity'.");
                    for (let x in ranks) {
                        if (msg.member.roles.keyArray().includes(x)) {
                            return;
                        }
                    }
                    msg.member.removeRole("664626926127677440").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                } else {
                    msg.member.addRole("664134936185274368").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    if (!msg.member.roles.keyArray().includes("664626926127677440")) {
                        msg.member.addRole("664626926127677440").catch((err) => {
                            client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                        });
                    }
                    await msg.reply("You have been added to the role 'Cards Against Humanity'.");
                }
            } else if (msg.content.startsWith("!clue")) {
                if (msg.member.roles.keyArray().includes("664135506115690496")) {
                    await msg.member.removeRole("664135506115690496").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    await msg.reply("You have been removed from the role 'Clue/Cluedo'.");
                    for (let x in ranks) {
                        if (msg.member.roles.keyArray().includes(x)) {
                            return;
                        }
                    }
                    msg.member.removeRole("664626926127677440").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                } else {
                    msg.member.addRole("664135506115690496").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    if (!msg.member.roles.keyArray().includes("664626926127677440")) {
                        msg.member.addRole("664626926127677440").catch((err) => {
                            client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                        });
                    }
                    await msg.reply("You have been added to the role 'Clue/Cluedo'.");
                }
            } else if (msg.content.startsWith("!livestreamannouncements")) {
                if (msg.member.roles.keyArray().includes("631607746298380297")) {
                    await msg.member.removeRole("631607746298380297").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    await msg.reply("You have been removed from the role 'Livestream Announcements'.");
                    for (let x in ranks) {
                        if (msg.member.roles.keyArray().includes(x)) {
                            return;
                        }
                    }
                    msg.member.removeRole("664626926127677440").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                } else {
                    msg.member.addRole("631607746298380297").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    if (!msg.member.roles.keyArray().includes("664626926127677440")) {
                        msg.member.addRole("664626926127677440").catch((err) => {
                            client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                        });
                    }
                    await msg.reply("You have been added to the role 'Livestream Announcements'.");
                }
            } else if (msg.content.startsWith("!eventannouncments")) {
                if (msg.member.roles.keyArray().includes("631607804205072394")) {
                    await msg.member.removeRole("631607804205072394").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    await msg.reply("You have been removed from the role 'Event Announcements'.");
                    for (let x in ranks) {
                        if (msg.member.roles.keyArray().includes(x)) {
                            return;
                        }
                    }
                    msg.member.removeRole("664626926127677440").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                } else {
                    msg.member.addRole("631607804205072394").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    if (!msg.member.roles.keyArray().includes("664626926127677440")) {
                        msg.member.addRole("664626926127677440").catch((err) => {
                            client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                        });
                    }
                    await msg.reply("You have been added to the role 'Event Announcements'.");
                }
            }
        } else if (msg.channel.id === "629807458864463883") {
            if (msg.content.startsWith("!join")) {
                if (msg.member.voiceChannel) {
                    if (msg.member.roles.keyArray().includes("629034598113738773")||msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")||msg.member.roles.keyArray().includes("665237632082640906")) {
                        await ConnectionManager.joinChannel(client, msg.member.voiceChannel, msg);
                    } else {
                        await msg.reply("You do not have permission to perform this command.");
                    }
                } else {
                    await msg.reply("You must be in a voice channel first.");
                }

            } else if (msg.content.startsWith("!leave")) {
                ConnectionManager.inChannel().then(inChannel => {
                    if (inChannel) {
                        ConnectionManager.leave();
                        msg.reply("The bot has now left the channel.");
                    } else {
                        msg.reply("I must be in a channel in order to leave it.");
                    }
                });

            } else if (msg.content.startsWith("!play")) {
                if (msg.content.split(" ").length === 2) {
                    if (msg.member.roles.keyArray().includes("629034598113738773")||msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")||msg.member.roles.keyArray().includes("665237632082640906")) {
                        const args = msg.content.split(" ");
                        await ConnectionManager.playCommand(args[1], msg, client);
                    } else {
                        await msg.reply("You do not have permission to perform this command.");
                    }
                } else {
                    await msg.reply("Invalid Arguments. Correct Arguments **!play [youtube URL]**");
                }
            } else if (msg.content.startsWith("!skip")) {
                if (msg.member.roles.keyArray().includes("629034598113738773")||msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")||msg.member.roles.keyArray().includes("665237632082640906")) {
                    await ConnectionManager.skip(msg, client);
                } else {
                    await msg.reply("You do not have permission to perform this command.");
                }
            } else if (msg.content.startsWith("!volume")) {
                if (msg.member.roles.keyArray().includes("629034598113738773")||msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")||msg.member.roles.keyArray().includes("665237632082640906")) {
                    const args = msg.content.split(" ");
                    if (args.length === 2) {
                        let volume;
                        try {
                            volume = parseInt(args[1]);
                        } catch(err) {
                            await msg.reply("Invalid Arguments. Correct Arguments **!volume [1-10]**");
                            return;
                        }

                        if (volume > 10 || volume < 1 || args[1].includes(".")) {
                            await msg.reply("Invalid Arguments. Correct Arguments **!volume [1-10]**");
                            return;
                        }

                        ConnectionManager.volume(msg, volume);
                    } else {
                        await msg.reply("Invalid Arguments. Correct Arguments **!volume [1-10]**");
                    }
                } else {
                    await msg.reply("You do not have permission to perform this command.");
                }
            } else if (msg.content.startsWith("!nowplaying")) {
                ConnectionManager.nowPlaying(msg);
            } else if (msg.content.startsWith("!pause")) {
                if (msg.member.roles.keyArray().includes("629034598113738773")||msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")||msg.member.roles.keyArray().includes("665237632082640906")) {
                    ConnectionManager.pause(msg);
                } else {
                    await msg.reply("You do not have permission to perform this command.");
                }
            } else if (msg.content.startsWith("!resume")) {
                if (msg.member.roles.keyArray().includes("629034598113738773")||msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")||msg.member.roles.keyArray().includes("665237632082640906")) {
                    ConnectionManager.resume(msg);
                } else {
                    await msg.reply("You do not have permission to perform this command.");
                }
            } else if (msg.content.startsWith("!clearqueue")) {
                if (msg.member.roles.keyArray().includes("629034598113738773")||msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")||msg.member.roles.keyArray().includes("665237632082640906")) {
                    ConnectionManager.clearQueue(msg);
                } else {
                    await msg.reply("You do not have permission to perform this command.");
                }
            } else if (msg.content.startsWith("!repeat")) {
                if (msg.member.roles.keyArray().includes("629034598113738773")||msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")||msg.member.roles.keyArray().includes("665237632082640906")) {
                    ConnectionManager.repeat(msg);
                } else {
                    await msg.reply("You do not have permission to perform this command.");
                }
            } else if (msg.content.startsWith("!shuffle")) {
                if (msg.member.roles.keyArray().includes("629034598113738773")||msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")||msg.member.roles.keyArray().includes("665237632082640906")) {
                    ConnectionManager.shuffle(msg);
                } else {
                    await msg.reply("You do not have permission to perform this command.");
                }
            } else if (msg.content.startsWith("!stop")) {
                if (msg.member.roles.keyArray().includes("629034598113738773")||msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")||msg.member.roles.keyArray().includes("665237632082640906")) {
                    ConnectionManager.stop(msg);
                } else {
                    await msg.reply("You do not have permission to perform this command.");
                }
            }
        } else if (msg.channel.id === "439114294307717131") {
            if (msg.content.startsWith("!join")) {
                if (msg.member.voiceChannel) {
                    if (msg.member.roles.keyArray().includes("629034598113738773")||msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")||msg.member.roles.keyArray().includes("665237632082640906")) {
                        await ConnectionManager.joinChannel(client, msg.member.voiceChannel, msg);
                    } else {
                        await msg.reply("You do not have permission to perform this command.");
                    }
                } else {
                    await msg.reply("You must be in a voice channel first.");
                }

            } else if (msg.content.startsWith("!leave")) {
                ConnectionManager.inChannel().then(inChannel => {
                    if (inChannel) {
                        ConnectionManager.leave();
                        msg.reply("The bot has now left the channel.");
                    } else {
                        msg.reply("I must be in a channel in order to leave it.");
                    }
                });

            } else if (msg.content.startsWith("!play")) {
                if (msg.content.split(" ").length === 2) {
                    if (msg.member.roles.keyArray().includes("629034598113738773")||msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")||msg.member.roles.keyArray().includes("665237632082640906")) {
                        const args = msg.content.split(" ");
                        await ConnectionManager.playCommand(args[1], msg, client);
                    } else {
                        await msg.reply("You do not have permission to perform this command.");
                    }
                } else {
                    await msg.reply("Invalid Arguments. Correct Arguments **!play [youtube URL]**");
                }
            } else if (msg.content.startsWith("!skip")) {
                if (msg.member.roles.keyArray().includes("629034598113738773")||msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")||msg.member.roles.keyArray().includes("665237632082640906")) {
                    await ConnectionManager.skip(msg, client);
                } else {
                    await msg.reply("You do not have permission to perform this command.");
                }
            } else if (msg.content.startsWith("!volume")) {
                if (msg.member.roles.keyArray().includes("629034598113738773")||msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")||msg.member.roles.keyArray().includes("665237632082640906")) {
                    const args = msg.content.split(" ");
                    if (args.length === 2) {
                        let volume;
                        try {
                            volume = parseInt(args[1]);
                        } catch(err) {
                            await msg.reply("Invalid Arguments. Correct Arguments **!volume [1-10]**");
                            return;
                        }

                        if (volume > 10 || volume < 1 || args[1].includes(".")) {
                            await msg.reply("Invalid Arguments. Correct Arguments **!volume [1-10]**");
                            return;
                        }

                        ConnectionManager.volume(msg, volume);
                    } else {
                        await msg.reply("Invalid Arguments. Correct Arguments **!volume [1-10]**");
                    }
                } else {
                    await msg.reply("You do not have permission to perform this command.");
                }
            } else if (msg.content.startsWith("!nowplaying")) {
                ConnectionManager.nowPlaying(msg);
            } else if (msg.content.startsWith("!pause")) {
                if (msg.member.roles.keyArray().includes("629034598113738773")||msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")||msg.member.roles.keyArray().includes("665237632082640906")) {
                    ConnectionManager.pause(msg);
                } else {
                    await msg.reply("You do not have permission to perform this command.");
                }
            } else if (msg.content.startsWith("!resume")) {
                if (msg.member.roles.keyArray().includes("629034598113738773")||msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")||msg.member.roles.keyArray().includes("665237632082640906")) {
                    ConnectionManager.resume(msg);
                } else {
                    await msg.reply("You do not have permission to perform this command.");
                }
            } else if (msg.content.startsWith("!clearqueue")) {
                if (msg.member.roles.keyArray().includes("629034598113738773")||msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")||msg.member.roles.keyArray().includes("665237632082640906")) {
                    ConnectionManager.clearQueue(msg);
                } else {
                    await msg.reply("You do not have permission to perform this command.");
                }
            } else if (msg.content.startsWith("!repeat")) {
                if (msg.member.roles.keyArray().includes("629034598113738773")||msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")||msg.member.roles.keyArray().includes("665237632082640906")) {
                    ConnectionManager.repeat(msg);
                } else {
                    await msg.reply("You do not have permission to perform this command.");
                }
            } else if (msg.content.startsWith("!shuffle")) {
                if (msg.member.roles.keyArray().includes("629034598113738773")||msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")||msg.member.roles.keyArray().includes("665237632082640906")) {
                    ConnectionManager.shuffle(msg);
                } else {
                    await msg.reply("You do not have permission to perform this command.");
                }
            } else if (msg.content.startsWith("!stop")) {
                if (msg.member.roles.keyArray().includes("629034598113738773")||msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")||msg.member.roles.keyArray().includes("665237632082640906")) {
                    ConnectionManager.stop(msg);
                } else {
                    await msg.reply("You do not have permission to perform this command.");
                }
            } else if (msg.content.startsWith("!jackbox")) {
                if (msg.member.roles.keyArray().includes("631519513606619157")) {
                    await msg.member.removeRole("631519513606619157").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    await msg.reply("You have been removed from the role 'Jackbox'.");
                    for (let x in ranks) {
                        if (msg.member.roles.keyArray().includes(x)) {
                            return;
                        }
                    }
                    msg.member.removeRole("664626926127677440").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                } else {
                    msg.member.addRole("631519513606619157").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    if (!msg.member.roles.keyArray().includes("664626926127677440")) {
                        msg.member.addRole("664626926127677440").catch((err) => {
                            client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                        });
                    }
                    await msg.reply("You have been added to the role 'Jackbox'.");
                }
            } else if (msg.content.startsWith("!overwatch")) {
                if (msg.member.roles.keyArray().includes("637034819234037762")) {
                    await msg.member.removeRole("637034819234037762").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    await msg.reply("You have been removed from the role 'Overwatch'.");
                    for (let x in ranks) {
                        if (msg.member.roles.keyArray().includes(x)) {
                            return;
                        }
                    }
                    msg.member.removeRole("664626926127677440").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                } else {
                    msg.member.addRole("637034819234037762").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    if (!msg.member.roles.keyArray().includes("664626926127677440")) {
                        msg.member.addRole("664626926127677440").catch((err) => {
                            client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                        });
                    }
                    await msg.reply("You have been added to the role 'Overwatch'.");
                }
            } else if (msg.content.startsWith("!uno")) {
                if (msg.member.roles.keyArray().includes("631518599365787659")) {
                    await msg.member.removeRole("631518599365787659").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    await msg.reply("You have been removed from the role 'UNO'.");
                    for (let x in ranks) {
                        if (msg.member.roles.keyArray().includes(x)) {
                            return;
                        }
                    }
                    msg.member.removeRole("664626926127677440").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                } else {
                    msg.member.addRole("631518599365787659").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    if (!msg.member.roles.keyArray().includes("664626926127677440")) {
                        msg.member.addRole("664626926127677440").catch((err) => {
                            client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                        });
                    }
                    await msg.reply("You have been added to the role 'UNO'.");
                }
            } else if (msg.content.startsWith("!stardewvalley")) {
                if (msg.member.roles.keyArray().includes("642130508549193728")) {
                    await msg.member.removeRole("642130508549193728").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    await msg.reply("You have been removed from the role 'Stardew Valley'.");
                    for (let x in ranks) {
                        if (msg.member.roles.keyArray().includes(x)) {
                            return;
                        }
                    }
                    msg.member.removeRole("664626926127677440").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                } else {
                    msg.member.addRole("642130508549193728").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    if (!msg.member.roles.keyArray().includes("664626926127677440")) {
                        msg.member.addRole("664626926127677440").catch((err) => {
                            client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                        });
                    }
                    await msg.reply("You have been added to the role 'Stardew Valley'.");
                }
            } else if (msg.content.startsWith("!gameoflife")) {
                if (msg.member.roles.keyArray().includes("659746742727737365")) {
                    await msg.member.removeRole("659746742727737365").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    await msg.reply("You have been removed from the role 'THE GAME OF LIFE'.");
                    for (let x in ranks) {
                        if (msg.member.roles.keyArray().includes(x)) {
                            return;
                        }
                    }
                    msg.member.removeRole("664626926127677440").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                } else {
                    msg.member.addRole("659746742727737365").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    if (!msg.member.roles.keyArray().includes("664626926127677440")) {
                        msg.member.addRole("664626926127677440").catch((err) => {
                            client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                        });
                    }
                    await msg.reply("You have been added to the role 'THE GAME OF LIFE'.");
                }
            } else if (msg.content.startsWith("!cah")) {
                if (msg.member.roles.keyArray().includes("664134936185274368")) {
                    await msg.member.removeRole("664134936185274368").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    await msg.reply("You have been removed from the role 'Cards Against Humanity'.");
                    for (let x in ranks) {
                        if (msg.member.roles.keyArray().includes(x)) {
                            return;
                        }
                    }
                    msg.member.removeRole("664626926127677440").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                } else {
                    msg.member.addRole("664134936185274368").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    if (!msg.member.roles.keyArray().includes("664626926127677440")) {
                        msg.member.addRole("664626926127677440").catch((err) => {
                            client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                        });
                    }
                    await msg.reply("You have been added to the role 'Cards Against Humanity'.");
                }
            } else if (msg.content.startsWith("!clue")) {
                if (msg.member.roles.keyArray().includes("664135506115690496")) {
                    await msg.member.removeRole("664135506115690496").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    await msg.reply("You have been removed from the role 'Clue/Cluedo'.");
                    for (let x in ranks) {
                        if (msg.member.roles.keyArray().includes(x)) {
                            return;
                        }
                    }
                    msg.member.removeRole("664626926127677440").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                } else {
                    msg.member.addRole("664135506115690496").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    if (!msg.member.roles.keyArray().includes("664626926127677440")) {
                        msg.member.addRole("664626926127677440").catch((err) => {
                            client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                        });
                    }
                    await msg.reply("You have been added to the role 'Clue/Cluedo'.");
                }
            } else if (msg.content.startsWith("!livestreamannouncements")) {
                if (msg.member.roles.keyArray().includes("631607746298380297")) {
                    await msg.member.removeRole("631607746298380297").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    await msg.reply("You have been removed from the role 'Livestream Announcements'.");
                    for (let x in ranks) {
                        if (msg.member.roles.keyArray().includes(x)) {
                            return;
                        }
                    }
                    msg.member.removeRole("664626926127677440").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                } else {
                    msg.member.addRole("631607746298380297").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    if (!msg.member.roles.keyArray().includes("664626926127677440")) {
                        msg.member.addRole("664626926127677440").catch((err) => {
                            client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                        });
                    }
                    await msg.reply("You have been added to the role 'Livestream Announcements'.");
                }
            } else if (msg.content.startsWith("!eventannouncments")) {
                if (msg.member.roles.keyArray().includes("631607804205072394")) {
                    await msg.member.removeRole("631607804205072394").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    await msg.reply("You have been removed from the role 'Event Announcements'.");
                    for (let x in ranks) {
                        if (msg.member.roles.keyArray().includes(x)) {
                            return;
                        }
                    }
                    msg.member.removeRole("664626926127677440").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                } else {
                    msg.member.addRole("631607804205072394").catch((err) => {
                        client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                    });
                    if (!msg.member.roles.keyArray().includes("664626926127677440")) {
                        msg.member.addRole("664626926127677440").catch((err) => {
                            client.guilds.get("105235654727704576").channels.get("429970564552065024").send("An error occurred when trying to remove a role. Error: " + err);
                        });
                    }
                    await msg.reply("You have been added to the role 'Event Announcements'.");
                }
            } if (msg.content.startsWith("!pull")) {
                if (msg.member.roles.keyArray().includes("207084647962771457")||msg.member.roles.keyArray().includes("207083210667065344")) {
                    msg.reply("Pulling git changes and restarting bot.");
                    client.guilds.get("105235654727704576").channels.get("429972539905671168").send("Pulling changes...");
                    git().pull('origin', 'develop', {},(err, result) => {
                        if (err) console.log(err);
                        console.log(result);
                        client.guilds.get("105235654727704576").channels.get("429972539905671168").send("**Changes: **" + result.summary.changes + "\n" +
                            "**Insertions: **" + result.summary.insertions + "\n" +
                            "**Deletions: **"+ result.summary.deletions);
                        client.guilds.get("105235654727704576").channels.get("429972539905671168").send("The bot will restart automatically if there were any changes.");
                    });
                } else {
                    await msg.reply("You do not have permission to perform this command.");
                }
                return;
            }
        }
    }


};

module.exports = commandmanager;