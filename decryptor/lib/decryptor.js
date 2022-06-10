'use strict';

var crypto = require('crypto');
const { Contract } = require('fabric-contract-api');

class Decryptor extends Contract {

    async decryptMessage(ctx, encryptedMessage){
        var method = 'AES-256-CBC';
        var secret = "My32charPasswordAndInitVectorStr"; //must be 32 char length
        var intervalThreshold = 60*60; // 1 hour
        return decryptWithTSValidation(encryptedMessage, method, secret, intervalThreshold);
    }

    async decrypt(encrypted, method, secret) {
        var iv = new Buffer(encrypted.substr(0, 24), 'base64').toString();
        var decryptor = crypto.createDecipheriv(method, secret, iv);
        return decryptor.update(encrypted.substr(24), 'base64', 'utf8') + decryptor.final('utf8');
    };

    async decryptWithTSValidation(encrypted, method, secret, intervalThreshold) {
        var decrypted = decrypt(encrypted, method, secret);
        var now = new Date();
        var year = parseInt(decrypted.substr(0,4)), month = parseInt(decrypted.substr(5,2)) - 1,
        day = parseInt(decrypted.substr(8,2)), hour = parseInt(decrypted.substr(11,2)), 
        minute = parseInt(decrypted.substr(14,2)), second = parseInt(decrypted.substr(17,2));
        var msgDate = new Date(Date.UTC(year, month, day, hour, minute, second))
        if (Math.round((now - msgDate) / 1000) <= intervalThreshold) {
            return decrypted.substr(19);
        }else{
            throw new Error('Encrypted message is too old or has been tampered with');
        }
    }
}

module.exports = Decryptor;
