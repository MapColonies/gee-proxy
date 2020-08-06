'use strict';

const Client = require('./ssh_client');
const config = require('config');
const logger = require('../logger-config');

class SshExecCommand {

    static async executeCommand(command) {
        if (!command || command === '') {
            throw new Error('can\'t execute an empty script');
        }
        logger.log('info', '`execute script: %j', command, {});

        const port = config.get('ssh.port');
        const user = config.get('ssh.user');
        const host = config.get('ssh.host');
        const password = config.get('ssh.password');
        const ssh = new Client({
            user: user,
            host: host,
            password: password,
            port: port
            // key: myKeyFileOrBuffer,
        });

        const res = await ssh.exec(command);
        return res;
    }
}

module.exports = SshExecCommand;
