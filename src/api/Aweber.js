"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
const Crypto = require("crypto");
const Restify = require("restify");
const Qs = require("qs");
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
    // TODO: oauth params here
    // private oauthParams(): any {
    // }
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
        params.oauth_signature = this.getSignature('GET', `${this.apiUrl}${this.apiUrlVersion}/${endpoint}`, params);
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
        params.oauth_signature = this.getSignature('GET', `${this.apiUrl}${this.apiUrlVersion}/${endpoint}`, params);
        return this.makeRequest('GET', endpoint, params, this.apiUrl).then(response => {
            return response.obj.entries;
        });
    }
    addSubscriber(accountId, listId, data) {
        let endpoint = `accounts/${accountId}/lists/${listId}/subscribers`;
        let params = {
            "ws.op": "create",
            oauth_consumer_key: this.config.consumerKey,
            oauth_nonce: this.nonce(32),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: (new Date()).getTime(),
            oauth_version: '1.0'
        };
        Object.keys(data).forEach((key) => {
            if (key === "name" && (data[key].indexOf("*") >= 0 || data[key].indexOf("'") >= 0 || data[key].indexOf("!") >= 0))
                throw new Error("Name field contains bad character!");
            else if (key === "email" && (data[key].indexOf("*") >= 0 || data[key].indexOf("'") >= 0 || data[key].indexOf("!") >= 0))
                throw new Error("Email field contains bad character!");
            else if (key === "custom_fields")
                params[key] = JSON.stringify(data[key]);
            else
                params[key] = data[key];
        });
        params.oauth_token = this.config.accessKey;
        params.oauth_signature = this.getSignature('POST', `${this.apiUrl}${this.apiUrlVersion}/${endpoint}`, params);
        return this.makeRequest('POST', `${endpoint}`, params, this.apiUrl).then(response => {
            return (response.res.statusCode === 201);
        });
    }
    findSubscriberByEmail(accountId, email) {
        let endpoint = `accounts/${accountId}`; //`/lists/${listId}/subscribers`
        let params = {
            "ws.op": "findSubscribers",
            email: email,
            oauth_consumer_key: this.config.consumerKey,
            oauth_nonce: this.nonce(32),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: (new Date()).getTime(),
            oauth_version: '1.0',
            oauth_token: this.config.accessKey
        };
        params.oauth_signature = this.getSignature('GET', `${this.apiUrl}${this.apiUrlVersion}/${endpoint}`, params);
        return this.makeRequest('GET', endpoint, params, this.apiUrl).then(response => {
            if (response.obj.entries) {
                if (response.obj.entries.length === 1)
                    return response.obj.entries[0];
                return null;
            }
        });
    }
    updateSubscriber(accountId, listId, subscriberId, data) {
        let endpoint = `accounts/${accountId}/lists/${listId}/subscribers/${subscriberId}`;
        let params = {
            oauth_consumer_key: this.config.consumerKey,
            oauth_nonce: this.nonce(32),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: (new Date()).getTime(),
            oauth_version: '1.0',
            oauth_token: this.config.accessKey
        };
        params.oauth_signature = this.getSignature('PATCH', `${this.apiUrl}${this.apiUrlVersion}/${endpoint}`, params);
        return this.makeRequest('PATCH', endpoint, params, this.apiUrl, data).then(response => {
            if (response.res.statusCode === 209)
                return response.obj;
        });
    }
    deleteSubscriber(accountId, listId, subscriberId) {
        let endpoint = `accounts/${accountId}/lists/${listId}/subscribers/${subscriberId}`;
        let params = {
            oauth_consumer_key: this.config.consumerKey,
            oauth_nonce: this.nonce(32),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: (new Date()).getTime(),
            oauth_version: '1.0',
            "ws.op": "archive",
            oauth_token: this.config.accessKey
        };
        params.oauth_signature = this.getSignature('DELETE', `${this.apiUrl}${this.apiUrlVersion}/${endpoint}`, params);
        return this.makeRequest('DELETE', endpoint, params, this.apiUrl).then(response => {
            return (response.res.statusCode === 200);
        });
    }
    makeRequest(method, endpoint, params, url, patched_params) {
        let client;
        if (method === "PATCH") {
            client = Restify.createJsonClient({
                url: url,
                requestTimeout: 20000,
                retry: false
            });
        }
        else {
            client = Restify.createStringClient({
                url: url,
                requestTimeout: 20000,
                retry: false
            });
        }
        return new Promise((resolve, reject) => {
            if (method === "GET") {
                /* istanbul ignore if  */
                if (this._debug)
                    console.log(`curl '${this.apiUrl}${this.apiUrlVersion}/${endpoint}?${Qs.stringify(params)}'`);
                client.get(`${this.apiUrl}${this.apiUrlVersion}/${endpoint}?${Qs.stringify(params)}`, (err, req, res, obj) => {
                    /* istanbul ignore if  */
                    if (this._debug)
                        console.log(obj);
                    if (err) {
                        /* istanbul ignore if  */
                        if (this._debug)
                            console.error(err);
                        return reject({
                            res: res,
                            obj: JSON.parse(obj)
                        });
                    }
                    resolve({
                        res: res,
                        obj: JSON.parse(obj)
                    });
                });
            }
            if (method === "POST") {
                /* istanbul ignore if  */
                if (this._debug)
                    console.log(`curl -X POST -d '${Qs.stringify(params)}' '${this.apiUrl}${this.apiUrlVersion}/${endpoint}'`);
                client.post(`${this.apiUrlVersion}/${endpoint}`, params, (err, req, res, obj) => {
                    if (obj !== "" && obj !== null)
                        obj = JSON.parse(obj);
                    /* istanbul ignore if  */
                    if (this._debug)
                        console.log(obj);
                    if (err) {
                        /* istanbul ignore if  */
                        if (this._debug)
                            console.error(err);
                        return reject({
                            res: res,
                            obj: obj
                        });
                    }
                    resolve({
                        res: res,
                        obj: obj
                    });
                });
            }
            if (method === "PATCH") {
                /* istanbul ignore if  */
                if (this._debug)
                    console.log(`curl -X PATCH -H 'Content-Type: application/json' -d '${JSON.stringify(patched_params)}' '${this.apiUrl}${this.apiUrlVersion}/${endpoint}?${Qs.stringify(params)}'`);
                client.patch(`${this.apiUrlVersion}/${endpoint}?${Qs.stringify(params)}`, patched_params, (err, req, res, obj) => {
                    /* istanbul ignore if  */
                    if (this._debug)
                        console.log(obj);
                    if (err) {
                        /* istanbul ignore if  */
                        if (this._debug)
                            console.error(err);
                        return reject({
                            res: res,
                            obj: obj
                        });
                    }
                    resolve({
                        res: res,
                        obj: obj
                    });
                });
            }
            if (method === "DELETE") {
                /* istanbul ignore if  */
                if (this._debug)
                    console.log(`curl -X DELETE '${this.apiUrl}${this.apiUrlVersion}/${endpoint}?${Qs.stringify(params)}'`);
                client.del(`${this.apiUrl}${this.apiUrlVersion}/${endpoint}?${Qs.stringify(params)}`, (err, req, res) => {
                    /* istanbul ignore if  */
                    if (this._debug)
                        console.log(res);
                    if (err) {
                        /* istanbul ignore if  */
                        if (this._debug)
                            console.error(err);
                        return reject({
                            res: res
                        });
                    }
                    resolve({
                        res: res
                    });
                });
            }
        });
    }
    // accessToken(oauthToken: string, oauthVerifier: string, tokenSecret: string): Promise<any> {
    //     let url = 'https://auth.aweber.com/1.0/oauth/access_token'
    //     let params: any = {
    //       oauth_consumer_key: "Akz2mgI7lqqIbm2PrN1gtxMt",
    //       oauth_nonce: this.nonce(32),
    //       oauth_signature_method: 'HMAC-SHA1',
    //       oauth_timestamp: (new Date()).getTime(),
    //       oauth_version: '1.0'
    //     }
    //
    //     params.oauth_token = oauthToken
    //     params.oauth_verifier = oauthVerifier
    //     params.oauth_signature = this.getSignature('POST', url, params, tokenSecret)
    //
    //     let client = Restify.createJsonClient({
    //         url: url, //`${urlObj.protocol}://${urlObj.host}`,
    //         requestTimeout: 5000,
    //         retry: false
    //     })
    //
    //     return new Promise((resolve,reject) => {
    //         client.post('/1.0/oauth/access_token',params,(err,req,res,obj) => {
    //             console.log(obj)
    //             resolve(obj)
    //         })
    //     })
    //     //putOrPost('post', url, params, callback)
    // }
    getSignature(method, url, params, algo = "base64") {
        // let data: any
        // let e: any
        let encodedParams;
        // let hash: string
        // let key: string
        let paramString;
        let sorted; //{[key: string]: string}
        // let text: string
        // if(token_secret == null){
        //     token_secret = ""
        // }
        // if(algo == undefined){
        //     algo = "base64"
        // }
        let e = encodeURIComponent;
        sorted = Object.keys(params).sort();
        encodedParams = [];
        sorted.map((s) => {
            return encodedParams.push([s, '=', e(params[s])].join(''));
        });
        paramString = e(encodedParams.join('&'));
        let data = [method, e(url), paramString].join('&');
        let key = [e(this.config.consumerSecret), e(this.config.accessSecret)].join('&');
        // text = data
        // key = key
        return Crypto.createHmac('sha1', key).update(data).digest(algo);
        // return hash
    }
    nonce(len) {
        // let s: string
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
