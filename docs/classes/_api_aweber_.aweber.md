# Class Aweber
## Index
### Constructors
* [constructor](_api_aweber_.aweber.md#constructor)
### Methods
* [addSubscriber](_api_aweber_.aweber.md#addsubscriber)
* [debug](_api_aweber_.aweber.md#debug)
* [deleteSubscriber](_api_aweber_.aweber.md#deletesubscriber)
* [findSubscriberByEmail](_api_aweber_.aweber.md#findsubscriberbyemail)
* [getAccounts](_api_aweber_.aweber.md#getaccounts)
* [getLists](_api_aweber_.aweber.md#getlists)
* [updateSubscriber](_api_aweber_.aweber.md#updatesubscriber)
## Constructors
### new Aweber(config: [AweberConfig](../interfaces/_api_aweber_.aweberconfig.md)): [Aweber](_api_aweber_.aweber.md)
* Defined in api/Aweber.ts:83
#### Parameters
| Name | Type | Description |
| ---- | ---- | ---- |
| config | [AweberConfig](../interfaces/_api_aweber_.aweberconfig.md)|  |
#### Returns: [Aweber](_api_aweber_.aweber.md)
## Methods
### addSubscriber(accountId: number, listId: number, data: any): Promise
* Defined in api/Aweber.ts:130
#### Parameters
| Name | Type | Description |
| ---- | ---- | ---- |
| accountId | number|  |
| listId | number|  |
| data | any|  |
#### Returns: Promise
### debug(dbg: boolean)
* Defined in api/Aweber.ts:89
#### Parameters
| Name | Type | Description |
| ---- | ---- | ---- |
| dbg | boolean|  |
### deleteSubscriber(accountId: number, listId: number, subscriberId: number): Promise
* Defined in api/Aweber.ts:190
#### Parameters
| Name | Type | Description |
| ---- | ---- | ---- |
| accountId | number|  |
| listId | number|  |
| subscriberId | number|  |
#### Returns: Promise
### findSubscriberByEmail(accountId: number, email: string): Promise
* Defined in api/Aweber.ts:153
#### Parameters
| Name | Type | Description |
| ---- | ---- | ---- |
| accountId | number|  |
| email | string|  |
#### Returns: Promise
### getAccounts(): Promise
* Defined in api/Aweber.ts:98
#### Returns: Promise
### getLists(accountId: number): Promise
* Defined in api/Aweber.ts:114
#### Parameters
| Name | Type | Description |
| ---- | ---- | ---- |
| accountId | number|  |
#### Returns: Promise
### updateSubscriber(accountId: number, listId: number, subscriberId: number, data: any): Promise
* Defined in api/Aweber.ts:174
#### Parameters
| Name | Type | Description |
| ---- | ---- | ---- |
| accountId | number|  |
| listId | number|  |
| subscriberId | number|  |
| data | any|  |
#### Returns: Promise
Generated using [TypeDoc](http://typedoc.io)