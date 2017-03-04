"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
const Crypto = require("crypto");
const Restify = require("restify");
const Qs = require("querystring");
class Aweber {
    constructor(config) {
        this.apiUrl = "https://api.aweber.com";
        this.apiUrlVersion = "/1.0";
        this._debug = false;
        this.config = config;
    }
    debug(dbg) {
        this._debug = dbg;
        return this;
    }
    oauthParams() {
    }
    getAccounts() {
        let endpoint = `accounts`;
        let params = {
            oauth_consumer_key: this.config.consumerKey,
            oauth_nonce: this.nonce(32),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: (new Date()).getTime(),
            oauth_version: '1.0',
            oauth_token: this.config.accessKey
        };
        params.oauth_signature = this.getSignature('GET', `${this.apiUrl}${endpoint}`, params);
        return this.makeRequest('GET', endpoint, params, this.apiUrl).then(response => {
            return response.obj.entries;
        });
    }
    getLists(accountId) {
        let endpoint = `accounts/${accountId}/lists`;
        let params = {
            oauth_consumer_key: this.config.consumerKey,
            oauth_nonce: this.nonce(32),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: (new Date()).getTime(),
            oauth_version: '1.0',
            oauth_token: this.config.accessKey
        };
        params.oauth_signature = this.getSignature('GET', `${this.apiUrl}${endpoint}`, params);
        return this.makeRequest('GET', endpoint, params, this.apiUrl).then(response => {
            return response.obj.entries;
        });
    }
    addSubscriber(accountId, listId, data) {
        let endpoint = `accounts/${accountId}/lists/${listId}/subscribers`;
        let params = {
            oauth_consumer_key: this.config.consumerKey,
            oauth_nonce: this.nonce(32),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: (new Date()).getTime(),
            oauth_version: '1.0',
            "ws.op": "create"
        };
        Object.keys(data).forEach((key) => {
            params[key] = data[key];
        });
        params.oauth_token = this.config.accessKey;
        params.oauth_signature = this.getSignature('POST', `${this.apiUrl}${this.apiUrlVersion}/${endpoint}`, params);
        return this.makeRequest('POST', endpoint, params, this.apiUrl).then(response => {
            return (response.res.statusCode === 201);
        });
    }
    findSubscriberByEmail(accountId, listId, email) {
        let endpoint = `accounts/${accountId}`;
        let params = {
            email: email,
            oauth_consumer_key: this.config.consumerKey,
            oauth_nonce: this.nonce(32),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: (new Date()).getTime(),
            oauth_version: '1.0',
            "ws.op": "findSubscribers",
            oauth_token: this.config.accessKey
        };
        params.oauth_signature = this.getSignature('GET', `${this.apiUrl}${this.apiUrlVersion}/${endpoint}`, params);
        return this.makeRequest('GET', endpoint, params, this.apiUrl).then(response => {
            if (response.obj.entries && response.obj.entries.length === 1) {
                return response.obj.entries[0];
            }
            else
                throw new Error(response.obj);
        });
    }
    updateSubscriber(accountId, listId, subscriberId, data) {
        let endpoint = `accounts/${accountId}/lists/${listId}/subscribers/${subscriberId}`;
        let params = {
            oauth_consumer_key: this.config.consumerKey,
            oauth_nonce: this.nonce(32),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: (new Date()).getTime(),
            oauth_version: '1.0'
        };
        params.oauth_token = this.config.accessKey;
        params.oauth_signature = this.getSignature('PATCH', `${this.apiUrl}${this.apiUrlVersion}/${endpoint}`, params);
        return this.makeRequest('PATCH', endpoint, params, this.apiUrl, data).then(response => {
            return response.obj;
        });
    }
    makeRequest(method, endpoint, params, url, patched_params) {
        let client = Restify.createJsonClient({
            url: url,
            requestTimeout: 5000,
            retry: false
        });
        return new Promise((resolve, reject) => {
            if (method === "GET") {
                if (this._debug)
                    console.log(`curl '${this.apiUrl}${this.apiUrlVersion}/${endpoint}?${Qs.stringify(params)}'`);
                client.get(`${this.apiUrl}${this.apiUrlVersion}/${endpoint}?${Qs.stringify(params)}`, (err, req, res, obj) => {
                    if (this._debug)
                        console.log(obj);
                    if (err) {
                        if (this._debug)
                            console.error(err);
                        return reject(obj);
                    }
                    resolve({
                        res: res,
                        obj: obj
                    });
                });
            }
            if (method === "POST") {
                if (this._debug)
                    console.log(`curl -X POST -H 'Content-Type: application/json' -d '${JSON.stringify(params)}' '${this.apiUrl}${this.apiUrlVersion}/${endpoint}?${Qs.stringify(params)}'`);
                client.post(`${this.apiUrlVersion}/${endpoint}?${Qs.stringify(params)}`, params, (err, req, res, obj) => {
                    if (this._debug)
                        console.log(obj);
                    if (err) {
                        if (this._debug)
                            console.error(err);
                        return reject(obj);
                    }
                    resolve({
                        res: res,
                        obj: obj
                    });
                });
            }
            if (method === "PATCH") {
                if (this._debug)
                    console.log(`curl -X PATCH -H 'Content-Type: application/json' -d '${JSON.stringify(patched_params)}' '${this.apiUrl}${this.apiUrlVersion}/${endpoint}?${Qs.stringify(params)}'`);
                client.patch(`${this.apiUrlVersion}/${endpoint}?${Qs.stringify(params)}`, patched_params, (err, req, res, obj) => {
                    if (this._debug)
                        console.log(obj);
                    if (err) {
                        if (this._debug)
                            console.error(err);
                        return reject(obj);
                    }
                    resolve({
                        res: res,
                        obj: obj
                    });
                });
            }
        });
    }
    getSignature(method, url, params, algo = "base64") {
        let encodedParams;
        let paramString;
        let sorted;
        let e = encodeURIComponent;
        sorted = Object.keys(params).sort();
        encodedParams = [];
        sorted.map((s) => {
            return encodedParams.push([s, '=', e(params[s])].join(''));
        });
        paramString = e(encodedParams.join('&'));
        let data = [method, e(url), paramString].join('&');
        let key = [e(this.config.consumerSecret), e(this.config.accessSecret)].join('&');
        return Crypto.createHmac('sha1', key).update(data).digest(algo);
    }
    nonce(len) {
        let val;
        let s = "";
        while (s.length < len) {
            val = Math.floor(Math.random() * 2);
            if (val === 0) {
                s += String(Math.floor(Math.random() * 10));
            }
            else {
                s += String.fromCharCode(97 + Math.floor(Math.random() * 26));
            }
        }
        return s;
    }
}
exports.Aweber = Aweber;
