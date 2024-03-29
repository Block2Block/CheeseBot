const commandManager = {};
const Bot = require("../utils/Constants.js");
const fs = require("fs");

//loading internal libraries.
const PunishmentManager = require("./PunishmentManager.js");
const ConnectionManager = require("./ConnectionManager.js");
const RoleManager = require("./RoleManager.js");
let SpamManager;


const botConstants = Bot.getBotConstants();

const commands = new Map();
const aliases = new Map();
const categories = new Map();
const permissions = new Map();
const helpStrings = new Map();
const ranks = [];

commandManager.load = function (logger, spamManager) {
    SpamManager = spamManager;
    //Load all of the permissions, categories, commands and aliases.
    //Starting off with permissions.
    let files = fs.readdirSync('./permissions/', {withFileTypes: true});
    for (let x of files) {
        let permission = require("../permissions/" + x.name.toString());
        permissions.set(permission.node, permission);
        logger.info("Loaded permission " + x.name);
    }

    //Now categories and commands.
    files = fs.readdirSync('./categories/', {withFileTypes: true});
    for (let x of files) {
        let category = require("../categories/" + x.name.toString());

        //Checking to make sure that the permission exists for the visibility.
        for (let y of category.permission_visibility) {
            if (!permissions.has(y)) {
                logger.info("Cannot find permission of " + y + ".")
            }
        }

        //Starting build of help strings.
        let helpString = "\n**__" + category.help_header + "__**\n";

        //Because each category has its own folder, I will now need to load in all of the commands and aliases for that category.
        let commandFiles = fs.readdirSync('./commands/' + category.node + '/', {withFileTypes: true});
        for (let z of commandFiles) {
            let command = require("../commands/" + category.node + "/" + z.name.toString());

            //Because I already know the category exists, I just need to check its permission
            if (!permissions.has(command.permission)) {
                logger.info("Could not find permission of " + command.permission)
            }

            commands.set(command.cmd, command);

            //Now to add each alias.
            for (let a of command.aliases) {
                aliases.set(a, command.cmd);
            }

            //Appending command to help string.
            helpString += "**" + botConstants.commandPrefix + command.arguments + "** - " + command.desc + "\n";

            logger.info("Loaded command " + z.name);
        }

        categories.set(category.node, category);
        helpStrings.set(category.node , helpString);
        logger.info("Loaded category " + x.name);
    }

    logger.info("Successfully loaded in commands.");
};



commandManager.onCommand = async function (msg, client, logger) {
    //Extracts the arguments of the command.
    let args = msg.content.split(" ");

    //Extracting the command from the arguments.
    let command = args.shift().replace("!", "");
    command = command.toLowerCase();

    //If it is an alias, get the command it is an alias for. If it is the help command, just output the help. If it does not exist, return;
    if (aliases.has(command)) {
        command = aliases.get(command);
    } else if (command === "help") {
        if (args.length === 1) {
            //This is the help info command, give command info.
            command = args.shift().replace("!", "");
            let commandInfo;
            if (aliases.has(command)) {
                commandInfo = commands.get(aliases.get(command));
            } else if (commands.has(command)) {
               commandInfo = commands.get(command);
            } else {
                await msg.reply("That command does not exist, please try another command.");
                return;
            }

            let permission = permissions.get(commandInfo.permission);
            let allowedChannels = commandInfo.allowed_channels;

            if (permission.roles != null) {
                logger.debug("Roles is not null");
                let z = permission.roles.filter(value => client.guilds.cache.get(botConstants.guildId).members.cache.get(msg.author.id).roles.cache.has(value.toString()));
                if (z.length < 1) {
                    if (permission.roles.length === 1) {
                        if (permission.roles[0].localeCompare("-1") === 0) {
                            if (client.guilds.cache.get(botConstants.guildId).members.cache.get(msg.author.id).roles.cache.size !== 1) {
                                await msg.reply("You do not have permission to view this command");
                                return;
                            }
                        } else {
                            await msg.reply("You do not have permission to view this command");
                            return;
                        }
                    } else {
                        await msg.reply("You do not have permission to view this command");
                        return;
                    }
                }
            } else if (client.guilds.cache.get(botConstants.guildId).members.cache.get(msg.author.id).roles.cache.size === 1) {
                //User is unverified, ignore the command.
                return;
            }

            //List of allowed channels
            let z = "";
            if (allowedChannels != null || allowedChannels) {
                for (let y of allowedChannels) {
                    z += "<#" + y + ">, ";
                }
                z = z.substr(0, z.length - 2);
            } else {
                z = "All Channels";
            }

            await msg.reply("Command information for " + command + ":\n" +
                "**Name:** `!" + commandInfo.cmd + "`\n" +
                "**Arguments:** `!" + commandInfo.arguments + "`\n" +
                "**Aliases:** `" + ((commandInfo.aliases.length > 0)?"!":"") + commandInfo.aliases.join(", !") + "`\n" +
                "**Description:** `" + commandInfo.desc + "`\n" +
                "**Allowed channels:** " + z + "\n" +
                "**Allowed in DM:** `" + ((commandInfo.allow_in_dm)?"Yes":"No") + "`\n" +
                "**Is joinable role:** `" + ((commandInfo.joinable_role == null)?"No":"Yes") + "`");

            return;
        } else {
            msg.author.createDM().then(dmchannel => {
                //Build string of commands.
                let help = "Bot Commands are only available to use in #bot-commands, with music commands only being usable in #music-commands.\n\n" +
                    "Available commands:";

                for (let x of categories.values()) {
                    if (help.split("").length + helpStrings.get(x.node).split("").length >= 2000) {
                        dmchannel.send(help).catch((err) => {
                            logger.log("Promise Rejection: " + err.stack + " line " + err.lineNumber);
                            msg.reply("You must enable PM's in order to use this command.")
                        });
                        help = "";
                    }
                    let catPermissions = x.permission_visibility;
                    for (let y of catPermissions) {
                        let permission = permissions.get(y);
                        if (permission.roles == null && client.guilds.cache.get(botConstants.guildId).members.cache.get(msg.author.id).roles.cache.size > 0) {
                            help += helpStrings.get(x.node);
                            break;
                        }
                        let z = permission.roles.filter(value => client.guilds.cache.get(botConstants.guildId).members.cache.get(msg.author.id).roles.cache.has(value.toString()));
                        if (z.length >= 1) {
                            help += helpStrings.get(x.node);
                            break;
                        }
                    }
                }

                if (help.split("").length >= 1920) {
                    dmchannel.send(help).catch((err) => {
                        logger.log("Promise Rejection: " + err.stack + " line " + err.lineNumber);
                        msg.reply("You must enable PM's in order to use this command.")
                    });
                    help = "";
                }
                help += "**__NOTE:__** Commands you do not have permission to use are not visible to you.";
                dmchannel.send(help).then(() => {
                    msg.react("✅");
                }).catch((err) => {
                    logger.log("Promise Rejection: " + err.stack + " line " + err.lineNumber);
                    msg.reply("You must enable PM's in order to use this command.")
                });

            }).catch((err) => {
                logger.info("Promise Rejection: " + err.stack + " line " + err.lineNumber);
                msg.reply("You must enable PM's in order to use this command.")
            });
        }
        return;
    } else if (!commands.has(command)) {
        await msg.reply("That command is not recognised. Please use !help for more info.");
        return;
    }

    let commandInfo = commands.get(command);
    let permission = permissions.get(commandInfo.permission);
    let allowedChannels = commandInfo.allowed_channels;

    if (allowedChannels != null) {
        if (msg.guild == null && !commandInfo.allow_in_dm) {
            //Not allowed in a DM, but was received in a DM. Ignore.
            msg.channel.send("This command cannot be executed in a DM. Please use the correct channel.");
            return;
        } else if (msg.guild != null) {
            if (!allowedChannels.includes(msg.channel.id)) {
                //If not in an allowed channel, ignore the command;
                return;
            }
        }
    }

    if (msg.guild == null) {
        if (!client.guilds.cache.get(botConstants.guildId).members.cache.has(msg.author.id)) {
            msg.channel.send("You are not a part of The Cult of Cheese Discord. You must be a part of the Discord in order to use this bot. Please join here: http://discord.gg/vmT6wY7/");
            return;
        } else {
            if (!commandInfo.allow_in_dm) {
                msg.channel.send("This command cannot be executed in a DM. Please use the correct channel.");
            }
        }
    } else {

    }


    if (permission.roles != null) {
        logger.debug("Roles is not null");
        let z = permission.roles.filter(value => client.guilds.cache.get(botConstants.guildId).members.cache.get(msg.author.id).roles.cache.has(value.toString()));
        if (z.length < 1) {
            if (permission.roles.length === 1) {
                if (permission.roles[0].localeCompare("-1") === 0) {
                    if (client.guilds.cache.get(botConstants.guildId).members.cache.get(msg.author.id).roles.cache.size !== 1) {
                        await msg.reply("You do not have permission to execute this command");
                        return;
                    }
                } else {
                    await msg.reply("You do not have permission to execute this command");
                    return;
                }
            } else {
                await msg.reply("You do not have permission to execute this command");
                return;
            }
        }
    } else if (client.guilds.cache.get(botConstants.guildId).members.cache.get(msg.author.id).roles.cache.size === 1) {
        //User is unverified, ignore the command.
        return;
    }


    if (commandInfo.joinable_role == null) {
        //Run the command,
        logger.info(msg.author.tag + " has executed command !" + commandInfo.cmd + " " + args.join(" "));
        commandInfo.run(msg, args, ConnectionManager, PunishmentManager, RoleManager, logger, SpamManager);
    } else {
        //This is a joinable role command. Execute role command.
        if (msg.member.roles.cache.has(commandInfo.joinable_role)) {
            //leave the role
            await msg.member.roles.remove(commandInfo.joinable_role).catch((err) => {
                client.guilds.get(botConstants.guildId).channels.get(botConstants.botLoggingChannel).send("An error occurred when trying to remove a role. Error: " + err);
            });
            await msg.reply("You have been removed from the role '" + client.guilds.cache.get(botConstants.guildId).roles.cache.get(commandInfo.joinable_role).name + "'.");
            let x = Array.from(msg.member.roles.cache.keys()).filter(value => ranks.includes(value));
            if (x.size < 1) {
                msg.member.roles.remove(botConstants.gameRole).catch((err) => {
                    client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.botLoggingChannel).send("An error occurred when trying to remove a role. Error: " + err);
                });
            }
        } else {
            //join the role
            msg.member.roles.add(commandInfo.joinable_role).catch((err) => {
                client.guilds.get(botConstants.guildId).channels.get(botConstants.botLoggingChannel).send("An error occurred when trying to add a role. Error: " + err);
            });
            if (!msg.member.roles.cache.has(botConstants.gameRole)) {
                msg.member.roles.add(botConstants.gameRole).catch((err) => {
                    client.guilds.cache.get(botConstants.guildId).channels.cache.get(botConstants.botLoggingChannel).send("An error occurred when trying to add a role. Error: " + err);
                });
            }
            await msg.reply("You have been added to the role '" + client.guilds.cache.get(botConstants.guildId).roles.cache.get(commandInfo.joinable_role).name + "'.");
        }
    }


};

commandManager.getPunishmentManager = function () {
    return PunishmentManager;
};
commandManager.getConnectionManager = function () {
    return ConnectionManager;
};
commandManager.getRoleManager = function () {
    return RoleManager;
};
commandManager.getPermissions = function () {
    return permissions;
}

module.exports = commandManager;