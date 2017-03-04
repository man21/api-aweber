#  api-aweber
api-aweber
===========
[![Build Status](https://travis-ci.org/scippio/api-aweber.svg)](https://travis-ci.org/scippio/api-aweber)
[![Dependency Status](https://david-dm.org/scippio/api-aweber.svg)](https://david-dm.org/scippio/api-aweber)
[![devDependency Status](https://david-dm.org/scippio/api-aweber/dev-status.svg)](https://david-dm.org/scippio/api-aweber#info=devDependencies)
Quick Usage
-----
```!javascript
import { Aweber } from "api-aweber"
let aweber = new Aweber({
"consumerKey": "xxx",
"consumerSecret": "yyy",
"accessKey": "zzz",
"accessSecret": "qqq",
})
let accountId = 666555777
let listId = 12345678
let data = {
email: "test@example.com",
ip: "127.0.0.1",
ad_tracking: "my AD",
misc_notes: "Node API client"
}
aweber.addSubscriber(accountId,listId,data).then(ok => {
if(ok) console.log("Subscriber added!")
}).catch(err => {
console.log(err)
})
```
Docs
-----
This lib Doc: [Documentation](docs/index.md)
Aweber official API doc: [Aweber API](https://labs.aweber.com/getting_started/main)
# Index
* *[Globals](globals.md)*
* ["Aweber"](modules/_aweber_.md)
* ["index"](modules/_index_.md)
Generated using [TypeDoc](http://typedoc.io)