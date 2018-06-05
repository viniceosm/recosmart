
const windows1252 = require('windows-1252');
const https = require('https');

module.exports = class MyReqs {
    constructor(options, callback) {
        Object.assign(this, {options, callback});
    }
    
    req() {
        let self = this;
        let req = https.request(self.options, (res) => {
            res.setEncoding('binary');
            // res.setEncoding('utf8');

            let encodedData;

            res.on('data', d => encodedData += d);
            res.on('end', () => {
                /*encodedData = windows1252.encode(encodedData, {
                    'mode': 'html'
                });*/
                self.callback(undefined, encodedData);
            });
        });

        req.on('error', (e) => {
            self.callback(new Error(e.message));
        });
        req.end();
    }
};