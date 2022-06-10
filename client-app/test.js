
var crypto = require('crypto');

function decryptMessage(message){
    var method = 'AES-256-CBC';
    var secret = "My32charPasswordAndInitVectorStr"; //must be 32 char length
    var intervalThreshold = 60*60; // 1 hour
    return decryptWithTSValidation(message, method, secret, intervalThreshold);
}

function decrypt(encrypted, method, secret) {
    var iv = new Buffer(encrypted.substr(0, 24), 'base64').toString();
    var decryptor = crypto.createDecipheriv(method, secret, iv);
    return decryptor.update(encrypted.substr(24), 'base64', 'utf8') + decryptor.final('utf8');
};

function decryptWithTSValidation(encrypted, method, secret, intervalThreshold) {
    var decrypted = decrypt(encrypted, method, secret);
    var now = new Date();
    var year = parseInt(decrypted.substr(0,4)), month = parseInt(decrypted.substr(5,2)) - 1,
    day = parseInt(decrypted.substr(8,2)), hour = parseInt(decrypted.substr(11,2)), 
    minute = parseInt(decrypted.substr(14,2)), second = parseInt(decrypted.substr(17,2));
    var msgDate = new Date(Date.UTC(year, month, day, hour, minute, second))
    if (Math.round((now - msgDate) / 1000) <= intervalThreshold) {
        return decrypted.substr(19);
    }
}


var wrongMsg = "TXkzMmNoYXJQYXNzd29yZA==6Y\/\/CZrjC5\/tDW\/\/wug8GWTg3+F2ug0yACeAqYCY\/rQfF5hHYmsRdRLsGgb+jFJw";
var correctMsg = "TXkzMmNoYXJQYXNzd29yZA==6Y\/\/CZrjC5\/tDW\/\/wug8GSXF4wKSa9QcGx\/0gUHlIPk=";

console.log('wrong msg:');
var wr = decryptMessage(wrongMsg);
console.log(wr);
console.log('correct msg:');
var cr = decryptMessage(correctMsg);
console.log(cr);

