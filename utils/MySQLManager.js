//Loading external libraries.
const mysql = require('mysql');

//Initialising module export.
const mySQLManager = {};

//Creating client.
let MySQLClient = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    charset : 'utf8mb4'
});


mySQLManager.connect = function(logger) {
    MySQLClient.on('acquire', function (connection) {
        logger.info('MySQL Connection Pool: Connection %d acquired', connection.threadId);
    });

    MySQLClient.on('release', function (connection) {
        logger.info('MySQL Connection Pool: Connection %d released', connection.threadId);
    });

    MySQLClient.query("CREATE TABLE IF NOT EXISTS `punishments` ( `id` INT NOT NULL AUTO_INCREMENT , `discord_id` TEXT NOT NULL , `punisher` TEXT NOT NULL , `type` INT NOT NULL , `reason` TEXT NOT NULL , `timestamp` BIGINT NOT NULL , `expire` BIGINT NOT NULL , `status` INT NOT NULL , `removal_reason` TEXT NULL DEFAULT NULL , `remover` TEXT NULL DEFAULT NULL , PRIMARY KEY (`id`)) ENGINE = MyISAM;", function (err, result) {
        if (err) {
            logger.error(err);
        }
    });
    MySQLClient.query("CREATE TABLE IF NOT EXISTS `roles` (`role_id` text CHARACTER SET latin1 NOT NULL, `reaction_emoji` text COLLATE utf8mb4_unicode_ci NOT NULL,`description` text CHARACTER SET latin1 NOT NULL,`type` enum('GAME','NOTIF') CHARACTER SET latin1 NOT NULL) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;", function (err, result) {
        if (err) {
            logger.error(err);
        }
    })
    MySQLClient.query("CREATE TABLE IF NOT EXISTS `messages` (`message_id` text NOT NULL,`channel_id` text NOT NULL,`type` enum('GAME','NOTIF') NOT NULL) ENGINE=MyISAM DEFAULT CHARSET=latin1;", function (err, result) {
        if (err) {
            logger.error(err);
        }
    })
    MySQLClient.query("CREATE TABLE IF NOT EXISTS `whitelisted_links` ( `domain` TEXT NOT NULL ) ENGINE = InnoDB;", function (err, result) {
        if (err) {
            logger.error(err);
        }
    })
};

mySQLManager.getPunishOnLoad = async function (callback, logger) {
    MySQLClient.query("SELECT *  FROM punishments WHERE status = 1", function (err, result) {
        if (err) {
            logger.error(err);
        }
        let punishments = [];
        for (let x of result) {
            let punishment = {
                id: x.id,
                user: x.discord_id,
                type: parseInt(x.type),
                timestamp: parseInt(x.timestamp),
                expire: parseInt(x.expire),
                punisher: x.punisher,
                reason: x.reason,
                timer: null,
                status: parseInt(x.status),
                removal_reason: x.removal_reason,
            };
            punishments.push(punishment);
        }
        callback(punishments);
    })
};

mySQLManager.getExpiredPunishments = async function (callback, logger) {
    MySQLClient.query("SELECT *  FROM punishments WHERE status = 1 AND expire <= " + (new Date).getTime(), function (err, result) {
        if (err) {
            logger.error(err);
        }
        let punishments = [];
        for (let x of result) {
            let punishment = {
                id: x.id,
                user: x.discord_id,
                type: parseInt(x.type),
                timestamp: parseInt(x.timestamp),
                expire: parseInt(x.expire),
                punisher: x.punisher,
                reason: x.reason,
                timer: null,
                status: parseInt(x.status),
                removal_reason: x.removal_reason,
            };
            punishments.push(punishment);
        }
        callback(punishments);
    })
};

mySQLManager.getPunishments = async function (user, callback, logger) {
    MySQLClient.query("SELECT * FROM punishments WHERE discord_id = '" + user + "'", function (err, result) {
        if (err) {
            logger.error(err)
        }
        let punishments = [];
        //For each record, create a punishment object.
        for (let x of result) {
            let punishment = {
                id: x.id,
                user: x.discord_id,
                type: parseInt(x.type),
                timestamp: parseInt(x.timestamp),
                expire: parseInt(x.expire),
                punisher: x.punisher,
                reason: x.reason,
                timer: null,
                status: parseInt(x.status),
                removal_reason: x.removal_reason,
                remover: x.remover
            };
            punishments.push(punishment);
        }

        callback(punishments);
    });
};

mySQLManager.punish = async function (user, type, timestamp, expire, punisher, reason, status, callback, logger) {
    let sql = "INSERT INTO `punishments`(discord_id,punisher,type,reason,timestamp,expire,status) VALUES (?,?,?,?,?,?,1)"
    let inserts = [user, punisher, type, reason, timestamp, expire]
    sql = mysql.format(sql, inserts)
    MySQLClient.query(sql, function (err) {
        if (err) {
            logger.error(err)
        }
        MySQLClient.query("SELECT id FROM `punishments` WHERE (timestamp = '" + timestamp + "') AND (discord_id = '" + user + "')", function (err, result) {
            if (err) {
                logger.error(err)
            }
            callback(result[0].id);
        })
    })
};

mySQLManager.expire = async function (punishment_id, logger) {
    MySQLClient.query("UPDATE punishments SET status = 2, removal_reason = 'Expired' WHERE id = " + punishment_id, function (err) {
        if (err) {
            logger.error(err)
        }
    });
};

mySQLManager.removePunishment = async function (user, type, reason, remover, logger) {
    let sql = "UPDATE punishments SET status = 3, removal_reason = ?,remover=? WHERE discord_id = ? AND type = ?";
    let inserts = [reason, remover.tag, user, type]
    sql = mysql.format(sql, inserts);
    MySQLClient.query(sql, function (err) {
        if (err) {
            logger.error(err)
        }
    });
    return true;
};

mySQLManager.getMessages = async function (logger, callback) {
    MySQLClient.query("SELECT * FROM messages", function (err, result) {
        if (err) {
            logger.error(err)
        }
        let messages = []
        for (let x of result) {
            messages.push({
                message_id: x.message_id,
                channel_id: x.channel_id,
                type: x.type
            })
        }
        callback(messages);
    });
}

mySQLManager.getRoles = async function (logger, callback) {
    MySQLClient.query("SELECT * FROM roles", function (err, result) {
        if (err) {
            logger.error(err)
        }
        let messages = []
        for (let x of result) {
            messages.push({
                role_id: x.role_id,
                reaction_emoji: x.reaction_emoji,
                description: x.description,
                type: x.type
            })
        }
        callback(messages);
    });
}

mySQLManager.getWhitelist = async function (logger, callback) {
    MySQLClient.query("SELECT * FROM whitelisted_links", function (err, result) {
        if (err) {
            logger.error(err)
        }
        let links = []
        for (let x of result) {
            links.push(x.domain)
        }
        callback(links);
    });
}

mySQLManager.addToWhitelist = async function (domain, logger) {
    let sql = "INSERT INTO whitelisted_links(domain) VALUES(?)";
    let inserts = [domain];
    sql = mysql.format(sql, inserts)
    MySQLClient.query(sql, function (err) {
        if (err) {
            logger.error(err)
        }
    });
}

mySQLManager.removeFromWhitelist = async function (domain, logger) {
    let sql = "DELETE FROM whitelisted_links WHERE domain = ?";
    let inserts = [domain];
    sql = mysql.format(sql, inserts)
    MySQLClient.query(sql, function (err) {
        if (err) {
            logger.error(err)
        }
    });
}

mySQLManager.addMessage = async function (message_id, channel_id, type, logger) {
    let sql = "INSERT INTO messages(message_id, channel_id, type) VALUES(?,?,?)";
    let inserts = [message_id, channel_id, type];
    sql = mysql.format(sql, inserts)
    MySQLClient.query(sql, function (err) {
        if (err) {
            logger.error(err)
        }
    });
}

mySQLManager.updateMessage = async function (message_id, channel_id, type, logger) {
    let sql = "UPDATE messages SET message_id = ?, channel_id = ? WHERE type = ?";
    let inserts = [message_id, channel_id, type];
    sql = mysql.format(sql, inserts)
    MySQLClient.query(sql, function (err) {
        if (err) {
            logger.error(err)
        }
    });
}

mySQLManager.addRole = async function (role_id, emoji, description, type, logger) {
    let sql = "INSERT INTO roles(role_id, reaction_emoji, description, type) VALUES(?,?,?,?)"
    let inserts = [role_id, emoji, description, type];
    sql = mysql.format(sql, inserts)
    MySQLClient.query(sql, function (err) {
        if (err) {
            logger.error(err)
        }
    });
}

mySQLManager.updateRoleDescription = async function (role_id, description, logger) {
    let sql = "UPDATE roles SET description = ? WHERE role_id = ?";
    let inserts = [description, role_id];
    sql = mysql.format(sql, inserts)
    MySQLClient.query(sql, function (err) {
        if (err) {
            logger.error(err)
        }
    });
}

mySQLManager.removeRole = async function (role_id, logger) {
    MySQLClient.query("DELETE FROM roles WHERE role_id = '" + role_id + "'", function (err) {
        if (err) {
            logger.error(err)
        }
    });
}



module.exports = mySQLManager;