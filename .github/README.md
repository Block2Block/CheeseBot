# CheeseBot
This  is the official Cult of Cheese Discord Bot GitHub Repository. This is used to host the source code for the bot.


## About the Discord Server
The Cult of Cheese is a Discord server owned by Block2Block, Bunni and SimplyBrandon. As the name suggests, we are a Cheese themed Discord. Join [here](https://discord.gg/).

## How to host the bot
The bot is currently setup for use in our Discord, but adapting it for use in other servers is super easy. Heres the step by step:
 1) Use `git clone https://github.com/Block2Block/CheeseBot` in a folder of your choice.
 2) Go into the CheeseBot Folder.
 3) If you would like to move its location, do so now. If you make changes in this folder, you will not be able to easily pull updates from GitHub.
 4) In the folder the bot is now in, create a file called `.env`.
 5) In this `.env` file, enter the following values:
     * `BOT_TOKEN`: This is the bots token, located in your Developer Dashboard, in your application in the 'Bot' tab.
     * `MYSQL_HOST`: This is the host the MySQL is located on (e.g. block2block.me).
     * `MYSQL_USER`: The username the bot should use to login with.
     * `MYSQL_PASSWORD`: The password the bot should use to login with.
     * `MYSQL_DATABASE`: The name of the database the bot should use.
     * `TWITCH_ID`: This is the client ID of the Twitch Application, found in your Developer dashboard.
     * `TWITCH_SECRET`: The client secret needed to use the Twitch API.
 6) Go into the `utils` folder and open the `Constants.js` file.
 7) Modify the values with the specified ids (e.g. for guildId, copy your guild ID). If you do not know how to do this, please refer to [this](https://support.discordapp.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-) article.
 8) If you have game roles, modify the values in all of the commands in `/commands/game/`, or delete and add commands as wanted.
 9) Modify the permission roles in all of the files in `/permissions/`. Copy the ID's into the `roles` section
 10) Make any modifications you wish to make.
 11) Forward port **8090** TCP/UDP for Twitch API Callbacks to be received from.
 12) Ensure you have Node.js installed. Find a download link [here](https://nodejs.org/en/). Also ensure you have FFMPEG installed (if you wish for music bot functionality). It can be downloaded [here](https://www.ffmpeg.org/download.html)
 13) Open a Node.js console window.
 14) Use the `cd` command to navigate to the directory of the bot files.
 15) Do `npm install`. If you are using Windows, you must first do `npm install --global --production windows-build-tools`.
 16) Once all of the dependencies are installed, do `node Bot.js`. This will start the bot.
 
## Contributing
If you want to contribute to the bot, whether that is in the form of a pull request, bug report or feature suggestion, you are more than welcome. Please read [this guide](CONTRIBUTING.md) on how to contribute effectively. All contributions must follow the [code  of conduct](CODE_OF_CONDUCT.md).

## FAQ
>**Q:** How do I get the bot to run forever, after a crash or force restart?

**A:** In order to do that, there are a number of methods you could choose. The method I recommend (if you are not using a hosting providor) is to install pm2 using npm. Execute `npm install -g pm2` to install this, then run `pm2 start Bot.js`.

For a web interface, then do `pm2 plus`. This will launch a browser window, follow the instructions it gives you.

>**Q:** I don't want to use the MySQL and Punishment Features. How do I stop the bot from using them?

**A:** Unfortunately, there is no quick way of doing this. As the bot was built for the sole purpose of serving out specific needs, the MySQL and Punishment systems are deeply integrated into the features.

If you want to disable this, you will need to delete section of code/delete the following files:
 * `/utils/MySQLManager.js` - Delete this file completely.
 * `/managers/PunishmentManager.js` - Delete this file completely.
 * `/commands/moderation/*.js` - Delete every file in this directory.
 * `/permissions/Moderation.js` - Delete this file completely.
 * `/categories/Moderation.js` - Delete this file completely.
 * `/managers/EventManager.js` - Sieve through the file and remove anything related to the MySQL or Punishments (be careful, some of the normal code is within a callback from a MySQL function).
 * `/managers/CommandManager.js` - Replace the line `const PunishmentManager = require("./PunishmentManager.js");` with `const PunishmentManager = null;`
 
 
>**Q:** How do I create a new command/category/permission node?

**A:** This is super simple! All you need to do is create a new `.js` file in specified directory. I recommend copying and pasting one of the already existing ones, as they must be in a set format. Change all of the options, put any code you want to run for commands in the `run` option. The `cmd` option for commands is what the command will actually be, and MUST be in all lower case or it wont get recognised by the Command engine.

For Categories and Permissions, there is a property called `node`. This property is used by the Command engine to load in parts of the code:
 * For categories, **you must create a folder the same name as the node in the `/commands/` directory, regardless of whether it has commands in it yet or not.** Any commands for this category should be put in here.
 * For permissions, this is the value you put into the `permission_visibilty` in categories and the `permission` property in commands.

>**Q:** There is a long pause before the bot plays any music, how come?

**A:** This is due to the way music is downloaded and played. The bot will firstly download a hard copy of the YouTube audio clip, and once that download is finished, will then start playing the song. This will only occur on the first instance of the bot playing a song. The bot keeps the song for future use.

If you are listening to playlists or have queued more than 1 song, the bot will attempt to download the next song while current song is playing, so as to circumvent this long pause. This does not work if the queue was shuffled or a second song was added to the queue while a single song is in the queue being played.

Eventually the bot will have downloaded a large enough cache to the point where you won't need to wait for a ridiculous amount of time before listening to a song. Obviously you will still encounter pauses (unless you listen to the same playlist all the time that doesn't get updated ever).

>**Q:** How do I change/remove the welcome message?

**A:** Change the code in the `join` function in the `/managers/EventManager.js` file.

>**Q:** The bot is not able to download the songs and is throwing errors. Help!

**A:** Unfortunately, due the the nature of YouTube updates, this often breaks youtube-dl, the library that is used to download the songs. In the case that this should happen, I should normally be able to update the bot relatively quickly. If this takes too long, simply do `npm install ytdl-core@latest`, which should install the latest version of the JavaScript wrapper for youtube-dl.

>**Q:** I do not wish for Twitch integration, how do I remove it?

**A:** This is relatively simple. All you have to do is remove lines 17 -> 41 of the `managers/StreamManager.js` file so that the `load` function is empty. This will stop the Stream manager from loading anything for the Twitch API.

>**Q:** Help! The bot stopped working after I updated it from GitHub!

**A:** If I have updated dependencies in a specific update, it can sometimes mean that you need to re-install the dependencies to bring them up to date. In order to do this, just run `npm install` again and it will update all dependencies for you.

>**Q:** My question isn't listed here!

**A:** Join the Cult of Cheese Discord (linked above) and tag me (@Block2Block#0001). I will be much more responsive on there.