/// <reference types="bluebird" />
import * as Promise from "bluebird";
export interface AweberConfig {
    consumerKey: string;
    consumerSecret: string;
    accessKey: string;
    accessSecret: string;
}
export interface Account {
    http_etag: string;
    lists_collection_link: string;
    self_link: string;
    resource_type_link: string;
    id: number;
    integrations_collection_link: string;
}
export interface List {
    total_unconfirmed_subscribers: number;
    total_subscribers_subscribed_yesterday: number;
    unique_list_id: string;
    http_etag: string;
    web_form_split_tests_collection_link: string;
    subscribers_collection_link: string;
    total_subscribers_subscribed_today: number;
    id: number;
    total_subscribed_subscribers: number;
    total_unsubscribed_subscribers: number;
    campaigns_collection_link: string;
    custom_fields_collection_link: string;
    self_link: string;
    total_subscribers: number;
    resource_type_link: string;
    web_forms_collection_link: string;
    name: string;
}
export interface Subscriber {
    subscription_url: string | null;
    postal_code: string | null;
    id: number;
    custom_fields: {
        [key: string]: any;
    };
    last_followup_sent_link: string | null;
    city: string | null;
    http_etag?: string;
    ad_tracking: string;
    dma_code: string | null;
    last_followup_message_number_sent: number;
    last_followup_sent_at: string | null;
    misc_notes: string;
    latitude: number;
    is_verified?: boolean;
    email: string;
    status: string;
    area_code: string | null;
    unsubscribed_at: string | null;
    self_link: string;
    unsubscribe_method: string | null;
    ip_address: string;
    name: string | null;
    subscription_method: string;
    resource_type_link: string;
    region: string | null;
    longitude: number;
    verified_at: string | null;
    subscribed_at: string | null;
    country: string;
    tags?: Array<string>;
}
export declare class Aweber {
    private readonly apiUrl;
    private readonly apiUrlVersion;
    private config;
    private client;
    private _debug;
    constructor(config: AweberConfig);
    debug(dbg: boolean): this;
    private oauthParams();
    getAccounts(): Promise<Array<Account>>;
    getLists(accountId: number): Promise<Array<List>>;
    addSubscriber(accountId: number, listId: number, data: any): Promise<boolean>;
    findSubscriberByEmail(accountId: number, listId: number, email: string): Promise<Subscriber>;
    updateSubscriber(accountId: number, listId: number, subscriberId: number, data: any): Promise<Subscriber>;
    private makeRequest(method, endpoint, params, url, patched_params?);
    getSignature(method: string, url: string, params: any, algo?: string): string;
    nonce(len: number): string;
}
