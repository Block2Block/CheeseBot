const git = require('simple-git');
const nodemon = require('nodemon');

git().pull('origin', 'master', {}, start);

function start(err, result) {
    if (err) console.log(err);
    console.log(result);

    nodemon({
        script: 'bot.js',
        ext: 'js json'
    });

    nodemon.on('start', function () {
        console.log('Bot Process Started.');
    }).on('quit', function () {
        console.log('Bot Process Quit');
        process.exit();
    }).on('restart', function (files) {
        console.log('Bot restarted due to: ', files);
        git().pull('origin', 'develop');
    });
}



