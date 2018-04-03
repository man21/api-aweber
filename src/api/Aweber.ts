import * as Promise from "bluebird"
import * as Crypto from "crypto"
import * as Restify from "restify"
import * as Qs from "qs"

export interface AweberConfig {
    consumerKey: string
    consumerSecret: string
    accessKey: string
    accessSecret: string
}

export interface Account {
    http_etag: string
    lists_collection_link: string
    self_link: string
    resource_type_link: string
    id: number
    integrations_collection_link: string
}

export interface List {
    total_unconfirmed_subscribers: number
    total_subscribers_subscribed_yesterday: number
    unique_list_id: string
    http_etag: string
    web_form_split_tests_collection_link: string
    subscribers_collection_link: string
    total_subscribers_subscribed_today: number
    id: number
    total_subscribed_subscribers: number
    total_unsubscribed_subscribers: number
    campaigns_collection_link: string
    custom_fields_collection_link: string
    self_link: string
    total_subscribers: number
    resource_type_link: string
    web_forms_collection_link: string
    name: string
}

export interface Subscriber {
    subscription_url: string | null
    postal_code: string | null
    id: number
    custom_fields: {[key: string]: any}
    last_followup_sent_link: string | null
    city: string | null
    http_etag?: string
    ad_tracking: string
    dma_code: string | null
    last_followup_message_number_sent: number
    last_followup_sent_at: string | null
    misc_notes: string
    latitude: number
    is_verified?: boolean
    email: string
    status: string
    area_code: string | null
    unsubscribed_at: string | null
    self_link: string
    unsubscribe_method: string | null
    ip_address: string
    name: string | null,
    subscription_method: string
    resource_type_link: string
    region: string | null
    longitude: number
    verified_at: string | null
    subscribed_at: string | null
    country: string
    tags?: Array<string>
}

type Method = "GET" | "POST" | "DELETE" | "PATCH" | "PUT"

export class Aweber {

    private readonly apiUrl: string = "https://api.aweber.com"
    private readonly apiUrlVersion: string = "/1.0"
    private config: AweberConfig
    private client: Restify.Client
    private _debug: boolean = false

    constructor(config: AweberConfig){
        this.config = config
    }

    debug(dbg: boolean): this {
        this._debug = dbg
        return this
    }

    // TODO: oauth params here
    // private oauthParams(): any {
    // }

    getAccounts(): Promise<Array<Account>> {
        let endpoint = `accounts`
        let params: any = {
            oauth_consumer_key: this.config.consumerKey,
            oauth_nonce: this.nonce(32),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: (new Date()).getTime(),
            oauth_version: '1.0',
            oauth_token: this.config.accessKey
        }
        params.oauth_signature = this.getSignature('GET',`${this.apiUrl}${this.apiUrlVersion}/${endpoint}`,params)
        return this.makeRequest('GET', endpoint, params, this.apiUrl).then(response => {
            return response.obj.entries
        })
    }

    getLists(accountId: number): Promise<Array<List>> {
        let endpoint = `accounts/${accountId}/lists`
        let params: any = {
            oauth_consumer_key: this.config.consumerKey,
            oauth_nonce: this.nonce(32),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: (new Date()).getTime(),
            oauth_version: '1.0',
            oauth_token: this.config.accessKey
        }
        params.oauth_signature = this.getSignature('GET',`${this.apiUrl}${this.apiUrlVersion}/${endpoint}`,params)
        return this.makeRequest('GET', endpoint, params, this.apiUrl).then(response => {
            return response.obj.entries
        })
    }

    addSubscriber(accountId: number, listId: number, data: any): Promise<boolean> {
        let endpoint = `accounts/${accountId}/lists/${listId}/subscribers`
        let params: any = {
            "ws.op": "create",
            oauth_consumer_key: this.config.consumerKey,
            oauth_nonce: this.nonce(32),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: (new Date()).getTime(),
            oauth_version: '1.0'
        }

        Object.keys(data).forEach((key) => {
            if(key === "name" && (data[key].indexOf("*") >= 0 || data[key].indexOf("'") >= 0 || data[key].indexOf("!") >= 0)) throw new Error("Name field contains bad character!")
            else if(key === "email" && (data[key].indexOf("*") >= 0 || data[key].indexOf("'") >= 0 || data[key].indexOf("!") >= 0)) throw new Error("Email field contains bad character!")
            else if(key === "custom_fields") params[key] = JSON.stringify(data[key])
            else params[key] = data[key]
        })

        params.oauth_token = this.config.accessKey
        params.oauth_signature = this.getSignature('POST',`${this.apiUrl}${this.apiUrlVersion}/${endpoint}`,params)
        return this.makeRequest('POST', `${endpoint}`, params, this.apiUrl).then(response => {
            return (response.res.statusCode === 201)
        })
    }

    findSubscriberByEmail(accountId: number, email: string): Promise<Subscriber | null> {
        let endpoint = `accounts/${accountId}` //`/lists/${listId}/subscribers`
        let params: any = {
            "ws.op": "findSubscribers",
            email: email,
            oauth_consumer_key: this.config.consumerKey,
            oauth_nonce: this.nonce(32),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: (new Date()).getTime(),
            oauth_version: '1.0',
            oauth_token: this.config.accessKey
        }
        params.oauth_signature = this.getSignature('GET',`${this.apiUrl}${this.apiUrlVersion}/${endpoint}`,params)
        return this.makeRequest('GET', endpoint, params, this.apiUrl).then(response => {
            if(response.obj.entries){
                if(response.obj.entries.length === 1) return response.obj.entries[0]
                return null
            }
        })
    }

    updateSubscriber(accountId: number, listId: number, subscriberId: number, data: any): Promise<Subscriber> {
        let endpoint = `accounts/${accountId}/lists/${listId}/subscribers/${subscriberId}`
        let params: any = {
            oauth_consumer_key: this.config.consumerKey,
            oauth_nonce: this.nonce(32),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: (new Date()).getTime(),
            oauth_version: '1.0',
            oauth_token: this.config.accessKey
        }
        params.oauth_signature = this.getSignature('PATCH',`${this.apiUrl}${this.apiUrlVersion}/${endpoint}`,params)
        return this.makeRequest('PATCH', endpoint, params, this.apiUrl, data).then(response => {
            if(response.res.statusCode === 209) return response.obj
        })
    }

    deleteSubscriber(accountId: number, listId: number, subscriberId: number): Promise<boolean> {
        let endpoint = `accounts/${accountId}/lists/${listId}/subscribers/${subscriberId}`
        let params: any = {
            oauth_consumer_key: this.config.consumerKey,
            oauth_nonce: this.nonce(32),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: (new Date()).getTime(),
            oauth_version: '1.0',
            "ws.op": "archive",
            oauth_token: this.config.accessKey
        }
        params.oauth_signature = this.getSignature('DELETE',`${this.apiUrl}${this.apiUrlVersion}/${endpoint}`,params)
        return this.makeRequest('DELETE', endpoint, params, this.apiUrl).then(response => {
            return (response.res.statusCode === 200)
        })
    }

    private makeRequest(method: Method, endpoint: string, params: any, url: string, patched_params?: any): Promise<any> {
        let client: Restify.Client
        if(method === "PATCH"){
            client = Restify.createJsonClient({
                url: url,
                requestTimeout: 20000,
                retry: false
            })
        } else {
            client = Restify.createStringClient({
                url: url,
                requestTimeout: 20000,
                retry: false
            })
        }

        return new Promise((resolve,reject) => {
            if(method === "GET"){
                /* istanbul ignore if  */
                if(this._debug) console.log(`curl '${this.apiUrl}${this.apiUrlVersion}/${endpoint}?${Qs.stringify(params)}'`)
                client.get(`${this.apiUrl}${this.apiUrlVersion}/${endpoint}?${Qs.stringify(params)}`,(err,req,res,obj) => {
                    /* istanbul ignore if  */
                    if(this._debug) console.log(obj)
                    if(err){
                        /* istanbul ignore if  */
                        if(this._debug) console.error(err)
                        return reject({
                            res: res,
                            obj: JSON.parse(obj)
                        })
                    }
                    resolve({
                        res: res,
                        obj: JSON.parse(obj)
                    })
                })
            }
            if(method === "POST"){
                /* istanbul ignore if  */
                if(this._debug) console.log(`curl -X POST -d '${Qs.stringify(params)}' '${this.apiUrl}${this.apiUrlVersion}/${endpoint}'`)
                client.post(`${this.apiUrlVersion}/${endpoint}`,params,(err,req,res,obj) => {
                    if(obj !== "" && obj !== null) obj = JSON.parse(obj)
                    /* istanbul ignore if  */
                    if(this._debug) console.log(obj)
                    if(err){
                        /* istanbul ignore if  */
                        if(this._debug) console.error(err)
                        return reject({
                            res: res,
                            obj: obj
                        })
                    }
                    resolve({
                        res: res,
                        obj: obj
                    })
                })
            }
            if(method === "PATCH"){
                /* istanbul ignore if  */
                if(this._debug) console.log(`curl -X PATCH -H 'Content-Type: application/json' -d '${JSON.stringify(patched_params)}' '${this.apiUrl}${this.apiUrlVersion}/${endpoint}?${Qs.stringify(params)}'`)
                client.patch(`${this.apiUrlVersion}/${endpoint}?${Qs.stringify(params)}`,patched_params,(err,req,res,obj) => {
                    /* istanbul ignore if  */
                    if(this._debug) console.log(obj)
                    if(err){
                        /* istanbul ignore if  */
                        if(this._debug) console.error(err)
                        return reject({
                            res: res,
                            obj: obj
                        })
                    }
                    resolve({
                        res: res,
                        obj: obj
                    })
                })
            }
            if(method === "DELETE"){
                /* istanbul ignore if  */
                if(this._debug) console.log(`curl -X DELETE '${this.apiUrl}${this.apiUrlVersion}/${endpoint}?${Qs.stringify(params)}'`)
                client.del(`${this.apiUrl}${this.apiUrlVersion}/${endpoint}?${Qs.stringify(params)}`,(err,req,res) => {
                    /* istanbul ignore if  */
                    if(this._debug) console.log(res)
                    if(err){
                        /* istanbul ignore if  */
                        if(this._debug) console.error(err)
                        return reject({
                            res: res
                        })
                    }
                    resolve({
                        res: res
                    })
                })
            }
        })
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


    private getSignature(method: string, url: string, params: any, algo: string = "base64"): string {
        // let data: any
        // let e: any
        let encodedParams: any
        // let hash: string
        // let key: string
        let paramString: string
        let sorted: Array<string> //{[key: string]: string}
        // let text: string

        // if(token_secret == null){
        //     token_secret = ""
        // }
        // if(algo == undefined){
        //     algo = "base64"
        // }
        let e = encodeURIComponent
        sorted = Object.keys(params).sort()
        encodedParams = []
        sorted.map((s) => {
            return encodedParams.push([s, '=', e(params[s])].join(''))
        });
        paramString = e(encodedParams.join('&'))
        let data = [method, e(url), paramString].join('&')
        let key = [e(this.config.consumerSecret), e(this.config.accessSecret)].join('&')
        // text = data
        // key = key
        return Crypto.createHmac('sha1', key).update(data).digest(<Crypto.HexBase64Latin1Encoding>algo)
        // return hash
    }

    private nonce(len: number): string {
        // let s: string
        let val: number
        let s: string = ""
        while(s.length < len){
            val = Math.floor(Math.random() * 2)
            if (val === 0) {
                s += String(Math.floor(Math.random() * 10))
            } else {
                s += String.fromCharCode(97 + Math.floor(Math.random() * 26))
            }
        }
        return s
    }
}
