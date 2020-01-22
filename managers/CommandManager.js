const commandManager = {};
const Bot = require("../utils/Constants.js");
const fs = require("fs");

//loading internal libraries.
const PunishmentManager = require("./PunishmentManager.js");
const ConnectionManager = require("./ConnectionManager.js");

const botConstants = Bot.getBotConstants();

const commands = new Map();
const aliases = new Map();
const categories = new Map();
const permissions = new Map();
const helpStrings = new Map();
const ranks = [];

//Load all of the permissions, categories, commands and aliases.
//Starting off with permissions.
let files = fs.readdirSync('./permissions/', {withFileTypes: true});
for (let x of files) {
    let permission = require("../permissions/" + x.name.toString());
    permissions.set(permission.node, permission);
    console.log("Loaded permission " + x.name);
}

//Now categories and commands.
files = fs.readdirSync('./categories/', {withFileTypes: true});
for (let x of files) {
    let category = require("../categories/" + x.name.toString());

    //Checking to make sure that the permission exists for the visibility.
    for (let y of category.permission_visibility) {
        if (!permissions.has(y)) {
            console.log("Cannot find permission of " + y + ".")
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
            console.log("Could not find permission of " + command.permission)
        }

        commands.set(command.cmd, command);

        //Now to add each alias.
        for (let a of command.aliases) {
            aliases.set(a, command.cmd);
        }

        //Appending command to help string.
        helpString += "**" + botConstants.commandPrefix + command.arguments + "** - " + command.desc + "\n";

        console.log("Loaded command " + z.name);
    }

    categories.set(category.node, category);
    helpStrings.set(category.node , helpString);
    console.log("Loaded category " + x.name);
}

console.log("Successfully loaded in commands.");



commandManager.onCommand = async function (msg, client) {
    if (msg.guild == null) {
        if (!client.guilds.get(botConstants.guildId).members.keyArray().includes(msg.author.id)) {
            msg.channel.send("You are not a part of The Cult of Cheese Discord. You must be a part of the Discord in order to use this bot. Please join here: http://discord.gg/vmT6wY7/");
            return;
        } else {
            msg.channel.send("You cannot send messages via PM to this bot. Please use #bot-commands.")
        }
    } else {
        //Extracts the arguments of the command.
        let args = msg.content.split(" ");

        //Extracting the command from the arguments.
        let command = args.shift().replace("!","");
        command = command.toLowerCase();

        //If it is an alias, get the command it is an alias for. If it is the help command, just output the help. If it does not exist, return;
        if (aliases.has(command)) {
            command =  aliases.get(command);
        } else if (command === "help") {
            msg.member.createDM().then(dmchannel => {
                //Build string of commands.
                let help = "Bot Commands are only available to use in #bot-commands, with music utils only being usable in #music-commands.\n\n" +
                    "Available commands:";

                for (let x of categories.values()) {
                    let catPermissions = x.permission_visibility;
                    for (let y of catPermissions) {
                        let permission = permissions.get(y);
                        if (permission.roles == null) {
                            help += helpStrings.get(x.node);
                            break;
                        }
                        let x = msg.member.roles.filter(value => permission.roles.includes(value));
                        if (x.size >= 1) {
                            help += helpStrings.get(x.node);
                            break;
                        }
                    }
                }
                help += "**__NOTE:__** Commands you do not have permission to use are not visible to you.";
                dmchannel.send(help).then(() => {
                    msg.react("✅");
                }).catch((err) => {
                    console.log("Promise Rejection: " + err.stack + " line " + err.lineNumber);
                    msg.reply("You must enable PM's in order to use this command.")
                });

            }).catch((err) => {
                console.log("Promise Rejection: " + err.stack + " line " + err.lineNumber);
                msg.reply("You must enable PM's in order to use this command.")
            });
            return;
        } else if (!commands.has(command)) {
            await msg.reply("That command is not recognised. Please use !help for more info.");
            return;
        }

        let commandInfo = commands.get(command);
        let permission = permissions.get(commandInfo.permission);
        let allowedChannels = commandInfo.allowed_channels;

        if (allowedChannels != null) {
            if (!allowedChannels.includes(msg.channel.id)) {
                //If not in an allowed channel, ignore the command;
                return;
            }
        }

        let x = msg.member.roles.keyArray().filter(value => permission.roles.includes(value));
        if (x.size < 1) {
            await msg.reply("You do not have permission to perform that command.");
            return;
        }

        if (commandInfo.joinable_role == null) {
            //Run the command,
            commandInfo.run(msg, args, ConnectionManager, PunishmentManager);
        } else {
            //This is a joinable role command. Execute role command.
            if (msg.member.roles.keyArray().includes(commandInfo.joinable_role)) {
                //leave the role
                await msg.member.removeRole(commandInfo.joinable_role).catch((err) => {
                    client.guilds.get(botConstants.guildId).channels.get(botConstants.botLoggingChannel).send("An error occurred when trying to remove a role. Error: " + err);
                });
                await msg.reply("You have been removed from the role '" + client.guilds.get(botConstants.guildId).roles.get(commandInfo.joinable_role).name + "'.");
                x = msg.member.roles.keyArray().filter(value => ranks.includes(value));
                if (x.size < 1) {
                    msg.member.removeRole(botConstants.gameRole).catch((err) => {
                        client.guilds.get(botConstants.guildId).channels.get(botConstants.botLoggingChannel).send("An error occurred when trying to remove a role. Error: " + err);
                    });
                }
            } else {
                //join the role
                msg.member.addRole(commandInfo.joinable_role).catch((err) => {
                    client.guilds.get(botConstants.guildId).channels.get(botConstants.botLoggingChannel).send("An error occurred when trying to add a role. Error: " + err);
                });
                if (!msg.member.roles.keyArray().includes(botConstants.gameRole)) {
                    msg.member.addRole(botConstants.gameRole).catch((err) => {
                        client.guilds.get(botConstants.guildId).channels.get(botConstants.botLoggingChannel).send("An error occurred when trying to add a role. Error: " + err);
                    });
                }
                await msg.reply("You have been added to the role 'Jackbox'.");
            }
        }

    }


};

commandManager.getPunishmentManager = function () {
    return PunishmentManager;
};
commandManager.getConnectionManager = function () {
    return PunishmentManager;
};

module.exports = commandManager;