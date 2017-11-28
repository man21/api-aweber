import { Aweber } from "./api/Aweber"

let config = require("./tests/config.json")

let aweber = new Aweber({
    consumerKey: config.consumerKey,
    consumerSecret: config.consumerSecret,
    accessKey: config.accessKey,
    accessSecret: config.accessSecret
})

aweber.debug(true).addSubscriber(config.accountId,config.listId,{
    "email": "whatever@example.com",
    "name": "this is really bad **",
    "ip": "100.100.100.100",
    "ad_tracking": "whatever",
    "misc_notes": "test",
    "custom_fields": {}
})
