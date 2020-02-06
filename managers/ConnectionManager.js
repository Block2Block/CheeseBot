const connectionManager = {};

//Loading external libraries.
const Discord = require("discord.js");
const YTDL = require("ytdl-core");
const YTPL = require("ytpl");
const YTSR = require("ytsr");
const FS = require("fs");

//Loading internal libraries.
const Bot = require("../utils/Constants.js");


//Loading bot variables.
const botConstants = Bot.getBotConstants();

//Connection variables.
let connection = null;
let dispatcher = null;

//Playback settings
let volume = 10;
let repeat = false;

//Initialising the queue.
let queue = [];

connectionManager.joinChannel = async function (channel, msg, client, callback) {
    await channel.join().then(voiceConnection => {
            connection = voiceConnection;
            callback(true);
        }
    ).catch((error) => {
        client.guilds.get(botConstants.guildId).channels.get(botConstants.botLoggingChannel).send("An error has occurred when trying to join a voice channel. Error: " + error);
        callback(false);
    });
};

connectionManager.inChannel = function () {
    return new Promise(function (resolve, reject) {
        resolve(connection != null);
    });
};

connectionManager.leave = function () {
    if (connection != null) {
        connection.disconnect();
    }
    connection = null;
    queue = [];
    if (dispatcher != null) {
        dispatcher.end();
    }
};

connectionManager.playCommand = async function (URL, msg) {
    let client = msg.client;
    //If it is detected as a value YouTube Playlist URL, create an array with the URLS of each song onto it, then add that to the queue.
    if (await YTPL.validateURL(URL)) {
        YTPL(URL, {limit: 0}, async function (err, playlist) {
            //If the bot is not already in the channel, force it to join.
            if (connection == null || !connection) {
                await connectionManager.joinChannel(msg.member.voice.channel, msg, client, (success) => {

                });
            }

            //If there was an error, let the user know.
            if (err) {
                await msg.reply("An error occurred: " + err);
                return;
            }

            //For each song in the playlist.
            for (let i = 0; i < playlist.items.length; i++) {
                let s = playlist.items[i];
                const song = {
                    title: s.title,
                    id: s.id,
                    url: s.url_simple,
                };
                queue.push(song);
            }

            //If lengths are the same, then the queue was empty before we started, so start playing the songs.
            if (queue.length === playlist.items.length) {
                await play(queue[0], client);
                await msg.reply("Playlist " + playlist.title + " now playing with " + playlist.items.length + " total songs in the queue.");
            } else {
                await msg.reply("Playlist " + playlist.title + " added to the queue with " + playlist.items.length + " songs added to the list.");
            }
        });

        //If it was detected as a valid YouTube Video URL.
    } else if (await YTDL.validateURL(URL)) {
        //If the bot is not already in the channel, force it to join.
        if (connection == null || !connection) {
            await connectionManager.joinChannel(msg.member.voice.channel, msg, client, (success) => {

            });
        }

        //Get the song info and put it into an object.
        const songInfo = await YTDL.getInfo(URL).catch((err) => {
            console.log(err);
        });
        const song = {
            title: songInfo.title,
            id: songInfo.video_id,
            url: songInfo.video_url,
        };

        //Add it to the queue.
        queue.push(song);
        await msg.reply("Song " + song.title + " added to the queue.");

        //If it is the only song in the queue, play it.
        if (queue.length === 1) {
            play(song, client);
        }
    } else {
        //It is not a valid YouTube URL, search YouTube for it instead.
        let search = msg.content.replace("!play ", "");
        await msg.reply("Searching for `" + search + "`...");
        YTSR(search, {limit: 1}, (err, searchResults) => {
            if (err) {
                msg.reply("Something went wrong when trying to search that term. Please try again.");
                return;
            }

            //Execute this function again with the URL of the first item found with the search term.
            connectionManager.playCommand(searchResults.items[0].link, msg);
            msg.reply("Result found, playing " + searchResults.items[0].title + ".");
        });
    }
};

async function play(song, client) {

    //If there are no more songs in the playlist or the connection has ended, state playback has ended.
    if (!song || connection == null) {
        client.guilds.get("105235654727704576").channels.get("643571367715012638").send("Playback ended.");
        await client.user.setActivity("on the Cult of Cheese", {type: "PLAYING"});
        queue = [];
        return;
    }

    //If the current song doesn't already exist in the cache, download it.
    if (!FS.existsSync("musiccache/" + song.id + ".m4a")) {
        console.debug("Downloading song " + song.id + " for the first time.");
        try {
            let dl = YTDL(song.url, {quality: "highestaudio", filter: "audioonly"});
            dl.pipe(FS.createWriteStream("musiccache/" + song.id + ".m4a"));
            dl.on('end', () => {
                console.log("Done.");
                play(song, client);
            });
            dl.on('error', (err) => {
                console.log("An error occurred while trying to download a song. Skipping song. Error: " + err);
                queue.shift();
                play(queue[0], client);
            })
        } catch (err) {
            console.log("An error occurred while trying to download a song. Skipping song. Error: " + err);
            queue.shift();
            play(queue[0], client);
            return;
        }
        return;
    }

    //If the next song exists, and is not already in cache, download it in preparation for playing next.
    if (queue.length > 1) {
        try {
            if (!FS.existsSync("musiccache/" + queue[1].id + ".m4a")) {
                console.log("Downloading the next song " + queue[1].id + " for the first time.");
                let dl = YTDL(queue[1].url, {quality: "highestaudio", filter: "audioonly"});
                dl.pipe(FS.createWriteStream("musiccache/" + queue[1].id + ".m4a"));
                dl.on('end', () => {
                    console.log("The next song has been downloaded and is ready to play.");
                });
                dl.on('error', (err) => {
                    console.log("An error occurred while trying to download a song. Skipping song. Error: " + err);
                    let current = queue.shift();
                    queue.shift();
                    queue.unshift(current);
                })
            }
        } catch (err) {
            console.log("An error occurred while trying to download a song. Skipping song. Error: " + err);
            let current = queue.shift();
            queue.shift();
            queue.unshift(current);
            return;
        }
    }

    //Create the dispatcher and play the song.
    dispatcher = connection.play("./musiccache/" + song.id + ".m4a")
        .on('start', () => {
            console.debug("Playing " + song.title + " now.");
            client.guilds.get(botConstants.guildId).channels.get(botConstants.nowPlayingChannel).send(new Discord.MessageEmbed().setTitle("Now Playing").setThumbnail("https://i.ytimg.com/vi/" + song.id + "/hqdefault.jpg").setDescription(song.title).setColor('#00AA00'));
            client.user.setActivity("🎶 " + song.title + " 🎶", {type: "PLAYING"});
        })
        .on('finish', () => {
            //When it ends, if there are no more song in the playlist, end the playback.
            if (queue.length === 0) {
                play(false, client);
                return;
            }

            //If on repeat, add the song to the end of the playlist.
            if (repeat) {
                queue.push(queue.shift());
            } else {
                queue.shift();
            }

            //Play the next song.
            play(queue[0], client);
        })
        //If theres an error, log the error.
        .on('error', error => {
            console.error(error);
        });
    dispatcher.setVolumeLogarithmic(volume / 10);
    dispatcher.setBitrate(128);
}

connectionManager.skip = function (msg) {
    let client = msg.client;

    //Making sure the user is in the same voice channel as the bot.
    if (!msg.member.voice.channel) {
        return msg.reply("You must be in the same channel as the bot in order to use music commands.")
    } else if (client.voice.connections.size > 1) {
        if (msg.member.voice.channel.id !== client.voice.connections.first().id) {
            return msg.reply("You must be in the same channel as the bot in order to use music commands.");
        }
    }
    if (queue.length === 0) return msg.reply('There is no song that I could skip!');
    msg.reply("Song skipped.");

    //Ends the dispatcher, which will automatically move onto the next song.
    dispatcher.end();
};

connectionManager.stop = async function (msg) {
    if (queue.length > 0) {
        queue = [];
        dispatcher.end();
        await msg.reply("Playback has stopped and the queue has been cleared.");
    } else {
        await msg.reply("You cannot stop playback as there is nothing playing.");
    }
};

connectionManager.nowPlaying = function (msg) {
    if (queue.length > 0) {
        msg.reply("Now Playing: `" + queue[0].title + "`");
    } else {
        msg.reply("There is nothing currently playing.");
    }

};

connectionManager.volume = function (msg, vl) {
    if (queue.length > 0 && dispatcher != null) {
        if (!dispatcher.destroyed) {
            //Logarithmic volume means that doubling value means doubling volume.
            dispatcher.setVolumeLogarithmic(vl / 10);
            msg.reply("You have set the volume to " + vl + ".");
            volume = vl;
        } else {
            volume = vl;
            msg.reply("You have set the volume to " + vl + ".")
        }
    } else {
        volume = vl;
        msg.reply("You have set the volume to " + vl + ".")
    }
};

connectionManager.clearQueue = function (msg) {
    if (queue.length > 1) {
        let currentSong = queue[0];
        queue = [];
        queue.push(currentSong);
        msg.reply("The queue has been cleared.");
    } else {
        msg.reply("The queue is already empty.")
    }
};

connectionManager.pause = function (msg) {
    if (queue.length > 0) {
        dispatcher.pause();
        msg.reply("Playback has been paused.");
    } else {
        msg.reply("There is nothing currently playing.");
    }
};

connectionManager.resume = function (msg) {
    if (queue.length > 0) {
        dispatcher.resume();
        msg.reply("Playback has been resumed.");
    } else {
        msg.reply("There is nothing currently playing.");
    }
};

connectionManager.repeat = function (msg) {
    if (repeat) {
        msg.reply("Repeat mode has been disabled.");
        repeat = false;
    } else {
        msg.reply("Repeat mode has been enabled.");
        repeat = true;
    }
};

connectionManager.shuffle = function (msg) {
    msg.reply("The queue has been shuffled.");
    let currentSong = queue.shift();
    queue = shuffle(queue);
    queue.unshift(currentSong);
};

connectionManager.nextSong = function (msg) {
    if (queue) {
        if (queue.length >= 2) {
            msg.reply("The next song is: " + queue[1].title)
        } else {
            if (repeat) {
                msg.reply("The next song is: " + queue[0].title)
            }
        }
    } else {
        msg.reply("There isn't anything playing.");
    }
};

connectionManager.queueInfo = function (msg) {
    if (queue) {
        let i = ((queue.length < 10)?queue.length:10) - 1;
        let reply = "There are currently " + queue.length + " songs in the queue. The next " + (i + 1) + " songs are:\n";
        for (let counter = 0;counter <= i;counter++) {
            reply += (counter + 1) +  ") `" + queue[counter].title + ((counter !== i)?"`\n":"`")
        }
        msg.reply(reply);
    } else {
        msg.reply("The queue is empty.");
    }
};

function shuffle(a) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}


module.exports = connectionManager;