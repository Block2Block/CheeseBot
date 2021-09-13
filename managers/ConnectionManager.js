const connectionManager = {};

//Loading external libraries.
const YTDL = require("ytdl-core");
const YTPL = require("ytpl");
const YTSR = require("ytsr");
const FS = require("fs");

const {
    AudioPlayerStatus,
    StreamType,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel, VoiceConnectionState,VoiceConnectionStatus,entersState, getVoiceConnection,NoSubscriberBehavior
} = require('@discordjs/voice');
const { join } = require('path');

//Loading internal libraries.
const Bot = require("../utils/Constants.js");


//Loading bot variables.
const botConstants = Bot.getBotConstants();

let audioPlayer;
let audioResource;

//Playback settings
let volume = 10;
let repeat = false;

//Initialising the queue.
let queue = [];

connectionManager.joinChannel = async function (channel, msg, client, callback) {
    let connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });
    connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
        try {
            await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
            ]);
            // Seems to be reconnecting to a new channel - ignore disconnect
        } catch (error) {
            // Seems to be a real disconnect which SHOULDN'T be recovered from
            try {
                connection.destroy();
            } catch (ignored) {}

        }
    });
    callback(true)
};

connectionManager.leave = function () {
    let connection = getVoiceConnection(botConstants.guildId);
    if (connection) {
        connection.disconnect();
        connection.destroy();

    }
};

connectionManager.playCommand = async function (URL, msg, logger, isShuffle) {
    let client = msg.client;
    //If it is detected as a value YouTube Playlist URL, create an array with the URLS of each song onto it, then add that to the queue.
    YTPL.getPlaylistID(URL).then(async function (id) {
        if (id !== undefined && id !== null) {
            YTPL(URL, {limit: Infinity}).then(async function (playlist) {
                //If the bot is not already in the channel, force it to join.
                let connection = getVoiceConnection(botConstants.guildId);
                if (!connection) {
                    await connectionManager.joinChannel(client.guilds.cache.get(botConstants.guildId).members.cache.get(msg.author.id).voice.channel, msg, client, (success) => {
                    });
                }

                //For each song in the playlist.
                for (let i = 0; i < playlist.items.length; i++) {
                    let s = playlist.items[i];
                    const song = {
                        title: s.title,
                        id: s.id,
                        url: s.shortUrl,
                    };
                    queue.push(song);
                }

                //If lengths are the same, then the queue was empty before we started, so start playing the songs.
                if (queue.length === playlist.items.length) {
                    if (isShuffle) {
                        logger.info("The queue was shuffled");
                        queue = shuffle(queue);
                    }
                    await play(queue[0], client, logger);
                    await msg.reply("Playlist " + playlist.title + " now playing with " + playlist.items.length + " total songs in the queue.");
                } else {
                    await msg.reply("Playlist " + playlist.title + " added to the queue with " + playlist.items.length + " songs added to the list.");
                }
            }).catch(err => {
                if (err) {
                    msg.reply("An error occurred: " + err);
                }
            });
            return;
        } else {
            if (await YTDL.validateURL(URL)) {
                //If the bot is not already in the channel, force it to join.
                let connection = getVoiceConnection(botConstants.guildId);
                if (!connection) {
                    await connectionManager.joinChannel(client.guilds.cache.get(botConstants.guildId).members.cache.get(msg.author.id).voice.channel, msg, client, (success) => {

                    });
                }

                //Get the song info and put it into an object.
                await YTDL.getInfo(URL).then(songInfo => {
                    const song = {
                        title: songInfo.videoDetails.title,
                        id: songInfo.videoDetails.videoId,
                        url: songInfo.videoDetails.video_url,
                    };

                    //Add it to the queue.
                    queue.push(song);
                    msg.reply("Song " + song.title + " added to the queue.");

                    //If it is the only song in the queue, play it.
                    if (queue.length === 1) {
                        play(song, client, logger);
                    }
                }).catch((err) => {
                    logger.error(err);
                });
            } else {
                //It is not a valid YouTube URL, search YouTube for it instead.
                let search = (msg.content.split(" "));
                search.shift();
                search = search.join(" ");
                if (validURL(search)) {
                    msg.reply("That is not a valid YouTube URL or search query.");
                    return;
                }
                msg.reply("Searching for `" + search + "`...");
                YTSR(search, {limit: 1}).then((searchResults) => {
                    //Execute this function again with the URL of the first item found with the search term.
                    connectionManager.playCommand(searchResults.items[0].url, msg, logger, isShuffle);
                    logger.info(searchResults.items[0].url);
                    msg.reply("Result found, playing " + searchResults.items[0].title + ".");
                }).catch(err => {
                    if (err) {
                        msg.reply("Something went wrong when trying to search that term. Please try again.");
                    }
                });
            }
        }
    }).catch(async function () {
        if (YTDL.validateURL(URL)) {
            //If the bot is not already in the channel, force it to join.
            let connection = getVoiceConnection(botConstants.guildId);
            if (!connection) {
                connectionManager.joinChannel(client.guilds.cache.get(botConstants.guildId).members.cache.get(msg.author.id).voice.channel, msg, client, (success) => {
                });
            }

            //Get the song info and put it into an object.
            await YTDL.getInfo(URL).then(songInfo => {
                const song = {
                    title: songInfo.videoDetails.title,
                    id: songInfo.videoDetails.videoId,
                    url: songInfo.videoDetails.video_url,
                };

                //Add it to the queue.
                queue.push(song);
                msg.reply("Song " + song.title + " added to the queue.");

                //If it is the only song in the queue, play it.
                if (queue.length === 1) {
                    play(song, client, logger);
                }
            }).catch((err) => {
                logger.error(err);
            });
        } else {
            //It is not a valid YouTube URL, search YouTube for it instead.
            let search = (msg.content.split(" "));
            search.shift();
            search = search.join(" ");
            if (validURL(search)) {
                msg.reply("That is not a valid YouTube URL or search query.");
                return;
            }
            msg.reply("Searching for `" + search + "`...");
            YTSR(search, {limit: 1}).then((searchResults) => {
                //Execute this function again with the URL of the first item found with the search term.
                connectionManager.playCommand(searchResults.items[0].url, msg, logger, isShuffle);
                msg.reply("Result found, playing " + searchResults.items[0].title + ".");
            }).catch(err => {
                if (err) {
                    logger.error(err);
                    msg.reply("Something went wrong when trying to search that term. Please try again.");
                }
            });
        }
    })
};

async function play(song, client, logger) {

    //If there are no more songs in the playlist or the connection has ended, state playback has ended.
    let connection = getVoiceConnection(botConstants.guildId);
    if (!song || !connection) {
        await client.user.setActivity("on the Cult of Cheese", {type: "PLAYING"});
        queue = [];
        audioResource = undefined;
        audioPlayer.stop();
        return;
    }

    //If the music cache doesn't exist, create the folder so it doesnt break.
    if (!FS.existsSync("musiccache")) {
        FS.mkdir("musiccache", (err) => {
            if (err) {
                logger.error("There has been an error creating the music cache folder. Please create it yourself.");
            } else {
                logger.info("Successfully created music cache folder.");
            }
        })
    }

    //If the current song doesn't already exist in the cache, download it.
    if (!FS.existsSync("musiccache/" + song.id + ".m4a")) {
        logger.info("Downloading song " + song.title + " (ID: " + song.id + ") for the first time.");
        try {
            await client.guilds.cache.get(botConstants.guildId).members.cache.get(client.user.id).setNickname("[DOWNLOADING] CheeseBot");
            let dl = YTDL(song.url, {quality: "highestaudio", filter: "audioonly"});
            dl.pipe(FS.createWriteStream("musiccache/" + song.id + ".m4a"));
            dl.on('end', () => {
                logger.info("Done.");
                client.guilds.cache.get(botConstants.guildId).members.cache.get(client.user.id).setNickname("CheeseBot");
                play(song, client, logger);
            });
            dl.on('error', (err) => {
                logger.error("An error occurred while trying to download a song. Skipping song. Error: ", err);
                client.guilds.cache.get(botConstants.guildId).members.cache.get(client.user.id).setNickname("CheeseBot");
                queue.shift();
                play(queue[0], client, logger);
            })
        } catch (err) {
            logger.error("An error occurred while trying to download a song. Skipping song. Error: ", err);
            queue.shift();
            play(queue[0], client, logger);
            return;
        }
        return;
    }

    //If the next song exists, and is not already in cache, download it in preparation for playing next.
    if (queue.length > 1) {
        try {
            if (!FS.existsSync("musiccache/" + queue[1].id + ".m4a")) {
                logger.info("Downloading the next song, " + queue[1].title + " (ID: " + queue[1].id + "), for the first time.");
                let dl = YTDL(queue[1].url, {quality: "highestaudio", filter: "audioonly"});
                dl.pipe(FS.createWriteStream("musiccache/" + queue[1].id + ".m4a"));
                dl.on('end', () => {
                    logger.info("The next song has been downloaded and is ready to play.");
                });
                dl.on('error', (err) => {
                    logger.error("An error occurred while trying to download a song. Skipping song. Error: ", err);
                    let current = queue.shift();
                    queue.shift();
                    queue.unshift(current);
                })
            }
        } catch (err) {
            logger.error("An error occurred while trying to download a song. Skipping song. Error: ", err);
            let current = queue.shift();
            queue.shift();
            queue.unshift(current);
            return;
        }
    }

    if (!audioPlayer) {
        audioPlayer = createAudioPlayer({behaviors: {
                noSubscriber: NoSubscriberBehavior.Play,
            }})
            .on(AudioPlayerStatus.Idle, () => {
            //When it ends, if there are no more song in the playlist, end the playback.
            if (queue.length === 0) {
                play(false, client, logger);
                return;
            }

            //If on repeat, add the song to the end of the playlist.
            if (repeat) {
                queue.push(queue.shift());
            } else {
                queue.shift();
            }

            //Play the next song.
            play(queue[0], client, logger);
        })
            //If theres an error, log the error.
            .on('error', error => {
                logger.error(error);
            });
        connection.subscribe(audioPlayer);
    }


    audioResource = createAudioResource(join(__dirname, "../musiccache/" + song.id + ".m4a"), { inlineVolume: true });
    audioResource.volume.setVolume(volume / 10);
    audioPlayer.play(audioResource);
    logger.info("Playing " + song.title + " now.");
    client.user.setActivity("🎶 " + song.title + " 🎶", {type: "PLAYING"});
}

connectionManager.skip = function (msg, logger) {
    let client = msg.client;

    //Making sure the user is in the same voice channel as the bot.
    if (!client.guilds.cache.get(botConstants.guildId).members.cache.get(msg.author.id).voice.channel) {
        return msg.reply("You must be in the same channel as the bot in order to use music commands.")
    } else if (client.voice.adapters.size > 1) {
        let connection = getVoiceConnection(botConstants.guildId);
        if (connection) {
            if (connection.joinConfig.channelId !== client.guilds.cache.get(botConstants.guildId).members.cache.get(msg.author.id).voice.channel.id) {
                return msg.reply("You must be in the same channel as the bot in order to use music commands.");
            }
        } else {
            return msg.reply("You must be in the same channel as the bot in order to use music commands.");
        }
    }
    if (queue.length === 0) return msg.reply('There is no song that I could skip!');
    msg.reply("Song skipped.");

    if (queue.length === 0) {
        play(false, client, logger);
        return;
    }

    //If on repeat, add the song to the end of the playlist.
    if (repeat) {
        queue.push(queue.shift());
    } else {
        queue.shift();
    }

    //Play the next song.
    play(queue[0], client, logger);
    //Ends the dispatcher, which will automatically move onto the next song.

};

connectionManager.stop = async function (msg) {
    if (queue.length > 0) {
        queue = [];
        audioPlayer.stop();
        audioResource = undefined;
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
    if (queue.length > 0 && audioResource != null) {
            //Logarithmic volume means that doubling value means doubling volume.
            audioResource.volume.setVolumeLogarithmic(vl / 10);
            msg.reply("You have set the volume to " + vl + ".");
            volume = vl;
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
        audioPlayer.pause();
        msg.reply("Playback has been paused.");
    } else {
        msg.reply("There is nothing currently playing.");
    }
};

connectionManager.resume = function (msg) {
    if (queue.length > 0) {
        audioPlayer.unpause();
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

connectionManager.shuffle = function (msg, logger) {
    msg.reply("The queue has been shuffled.");
    let currentSong = queue.shift();
    queue = shuffle(queue);
    queue.unshift(currentSong);

    //If the next song exists, and is not already in cache, download it in preparation for playing next.
    if (queue.length > 1) {
        try {
            if (!FS.existsSync("musiccache/" + queue[1].id + ".m4a")) {
                logger.info("Downloading the next song, " + queue[1].title + " (ID: " + queue[1].id + "), for the first time.");
                let dl = YTDL(queue[1].url, {quality: "highestaudio", filter: "audioonly"});
                dl.pipe(FS.createWriteStream("musiccache/" + queue[1].id + ".m4a"));
                dl.on('end', () => {
                    logger.info("The next song has been downloaded and is ready to play.");
                });
                dl.on('error', (err) => {
                    logger.error("An error occurred while trying to download a song. Skipping song. Error: ", err);
                    let current = queue.shift();
                    queue.shift();
                    queue.unshift(current);
                })
            }
        } catch (err) {
            logger.error("An error occurred while trying to download a song. Skipping song. Error: ", err);
            let current = queue.shift();
            queue.shift();
            queue.unshift(current);
            return;
        }
    }
};

connectionManager.nextSong = function (msg) {
    if (queue) {
        if (queue.length >= 2) {
            msg.reply("The next song is: " + queue[1].title)
        } else {
            if (repeat) {
                msg.reply("The next song is: " + queue[0].title)
            } else {
                msg.reply("The queue is empty.");
            }
        }
    } else {
        msg.reply("There isn't anything playing.");
    }
};

connectionManager.queueInfo = function (msg) {
    if (queue) {
        if (queue.length > 1) {
            let i = ((queue.length < 11)?queue.length - 1:10);
            let reply = "There are currently " + queue.length + " songs in the queue. The next " + i + " songs are:\n";
            for (let counter = 1;counter <= i;counter++) {
                reply += (counter) +  ") `" + queue[counter].title + ((counter !== i)?"`\n":"`")
            }
            msg.reply(reply);
        } else {
            if (queue.length === 1) {
                if (repeat) {
                    let reply = "There is currently 1 song in the queue. The next song is:\n" +
                        "1) `" + queue[0].title + "`";
                    msg.reply(reply);
                } else {
                    msg.reply("The queue is empty.");
                }
            } else {
                msg.reply("The queue is empty.");
            }
        }
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

function validURL(str) {
    const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}


module.exports = connectionManager;