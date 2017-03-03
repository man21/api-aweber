import * as Promise from "bluebird"
import * as Crypto from "crypto"
import * as Restify from "restify"
import * as Qs from "querystring"

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

    private oauthParams(): any {

    }

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
        params.oauth_signature = this.getSignature('GET',`${this.apiUrl}${endpoint}`,params)
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
        params.oauth_signature = this.getSignature('GET',`${this.apiUrl}${endpoint}`,params)
        return this.makeRequest('GET', endpoint, params, this.apiUrl).then(response => {
            return response.obj.entries
        })
    }

    addSubscriber(accountId: number, listId: number, data: any): Promise<boolean> {
        let endpoint = `accounts/${accountId}/lists/${listId}/subscribers`
        let params: any = {
            oauth_consumer_key: this.config.consumerKey,
            oauth_nonce: this.nonce(32),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: (new Date()).getTime(),
            oauth_version: '1.0',
            "ws.op": "create"
        }

        Object.keys(data).forEach((key) => {
            params[key] = data[key]
        })

        params.oauth_token = this.config.accessKey
        params.oauth_signature = this.getSignature('POST',`${this.apiUrl}${this.apiUrlVersion}/${endpoint}`,params)
        return this.makeRequest('POST', endpoint, params, this.apiUrl).then(response => {
            return (response.res.statusCode === 201)
        })
    }

    findSubscriberByEmail(accountId: number, listId: number, email: string): Promise<Subscriber> {
        let endpoint = `accounts/${accountId}/lists/${listId}/subscribers`
        let params: any = {
            oauth_consumer_key: this.config.consumerKey,
            oauth_nonce: this.nonce(32),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: (new Date()).getTime(),
            oauth_version: '1.0',
            oauth_token: this.config.accessKey,
            email: email
        }
        params.oauth_signature = this.getSignature('GET',`${this.apiUrl}${this.apiUrlVersion}/${endpoint}`,params)
        return this.makeRequest('GET', endpoint, params, this.apiUrl).then(response => {
            return response.obj.entries[0]
        })
    }

    updateSubscriber(accountId: number, listId: number, subscriberId: number, data: any): Promise<Subscriber> {
        let endpoint = `accounts/${accountId}/lists/${listId}/subscribers/${subscriberId}`
        let params: any = {
            oauth_consumer_key: this.config.consumerKey,
            oauth_nonce: this.nonce(32),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: (new Date()).getTime(),
            oauth_version: '1.0'
        }

        params.oauth_token = this.config.accessKey
        params.oauth_signature = this.getSignature('PATCH',`${this.apiUrl}${endpoint}`,params)
        return this.makeRequest('PATCH', endpoint, params, this.apiUrl, data).then(response => {
            return response.obj
        })
    }

    private makeRequest(method: Method, endpoint: string, params: any, url: string, patched_params?: any): Promise<any> {

        let client = Restify.createJsonClient({
            //url: "https://api.aweber.com", //`${urlObj.protocol}://${urlObj.host}`,
            url: url,
            requestTimeout: 5000,
            retry: false
        })

        return new Promise((resolve,reject) => {
            if(method === "GET"){
                if(this._debug) console.log(`curl '${this.apiUrl}${this.apiUrlVersion}/${endpoint}?${Qs.stringify(params)}'`)
                client.get(`${this.apiUrl}${this.apiUrlVersion}/${endpoint}?${Qs.stringify(params)}`,(err,req,res,obj) => {
                    if(this._debug) console.log(obj)
                    if(err){
                        if(this._debug) console.error(err)
                        return reject(obj)
                    }
                    resolve({
                        res: res,
                        obj: obj
                    })
                })
            }
            if(method === "POST"){
                if(this._debug) console.log(`curl -X POST -H 'Content-Type: application/json' -d '${JSON.stringify(params)}' '${this.apiUrl}${this.apiUrlVersion}/${endpoint}?${Qs.stringify(params)}'`)
                //client.post(`/1.0/${endpoint}`,params,(err,req,res,obj) => {
                client.post(`/1.0/${endpoint}?${Qs.stringify(params)}`,params,(err,req,res,obj) => {
                    if(this._debug) console.log(obj)
                    if(err){
                        if(this._debug) console.error(err)
                        return reject(obj)
                    }
                    resolve({
                        res: res,
                        obj: obj
                    })
                })
            }
            if(method === "PATCH"){
                if(this._debug) console.log(`curl -X PATCH -H 'Content-Type: application/json' -d '${JSON.stringify(patched_params)}' '${this.apiUrl}${endpoint}?${Qs.stringify(params)}'`)
                //client.post(`/1.0/${endpoint}`,params,(err,req,res,obj) => {
                client.patch(`/1.0/${endpoint}?${Qs.stringify(params)}`,patched_params,(err,req,res,obj) => {
                    if(this._debug) console.log(obj)
                    if(err){
                        if(this._debug) console.error(err)
                        return reject(obj)
                    }
                    resolve({
                        res: res,
                        obj: obj
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


    getSignature(method: string, url: string, params: any, algo: string = "base64"): string {
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

    nonce(len: number): string {
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
