const constants = {};
//Bot variables.
const botConstants = {
    guildId: "105235654727704576",
    botLoggingChannel: "429972539905671168",
    moderationLoggingChannel: "434005566801707009",
    serverLoggingChannel: "429970564552065024",
    livestreamChannel: "441327080014086166",
    livestreamRole: "631607746298380297",
    mutedRole: "429970242916319244",
    memberRole: "664631743499993098",
    agreeChannel: "684894179112779828",
    gameRole: "664626926127677440",
    nowPlayingChannel: "643571367715012638",
    commandPrefix: "!",
    twitchSubscriptions: ["53100459","41451481","62033506","138310205"]
};

//Putting these here as this class does not use any initialising code (so the bot client doesnt get loaded like 5 times. (And to prevent circular dependencies).
constants.getBotConstants = function () {
    return botConstants;
};

module.exports = constants;