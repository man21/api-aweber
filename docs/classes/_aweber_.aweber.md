# Class Aweber
## Index
### Constructors
* [constructor](_aweber_.aweber.md#constructor)
### Methods
* [addSubscriber](_aweber_.aweber.md#addsubscriber)
* [debug](_aweber_.aweber.md#debug)
* [findSubscriberByEmail](_aweber_.aweber.md#findsubscriberbyemail)
* [getAccounts](_aweber_.aweber.md#getaccounts)
* [getLists](_aweber_.aweber.md#getlists)
* [updateSubscriber](_aweber_.aweber.md#updatesubscriber)
## Constructors
### new Aweber(config: [AweberConfig](../interfaces/_aweber_.aweberconfig.md)): [Aweber](_aweber_.aweber.md)
* Defined in [Aweber.ts:83](https://github.com/scippio/api-aweber/blob/4a43372/src/Aweber.ts#L83)
#### Parameters
| Name | Type | Description |
| ---- | ---- | ---- |
| config | [AweberConfig](../interfaces/_aweber_.aweberconfig.md)|  |
#### Returns: [Aweber](_aweber_.aweber.md)
## Methods
### addSubscriber(accountId: number, listId: number, data: any): Promise
* Defined in [Aweber.ts:130](https://github.com/scippio/api-aweber/blob/4a43372/src/Aweber.ts#L130)
#### Parameters
| Name | Type | Description |
| ---- | ---- | ---- |
| accountId | number|  |
| listId | number|  |
| data | any|  |
#### Returns: Promise
### debug(dbg: boolean)
* Defined in [Aweber.ts:89](https://github.com/scippio/api-aweber/blob/4a43372/src/Aweber.ts#L89)
#### Parameters
| Name | Type | Description |
| ---- | ---- | ---- |
| dbg | boolean|  |
### findSubscriberByEmail(accountId: number, listId: number, email: string): Promise
* Defined in [Aweber.ts:152](https://github.com/scippio/api-aweber/blob/4a43372/src/Aweber.ts#L152)
#### Parameters
| Name | Type | Description |
| ---- | ---- | ---- |
| accountId | number|  |
| listId | number|  |
| email | string|  |
#### Returns: Promise
### getAccounts(): Promise
* Defined in [Aweber.ts:98](https://github.com/scippio/api-aweber/blob/4a43372/src/Aweber.ts#L98)
#### Returns: Promise
### getLists(accountId: number): Promise
* Defined in [Aweber.ts:114](https://github.com/scippio/api-aweber/blob/4a43372/src/Aweber.ts#L114)
#### Parameters
| Name | Type | Description |
| ---- | ---- | ---- |
| accountId | number|  |
#### Returns: Promise
### updateSubscriber(accountId: number, listId: number, subscriberId: number, data: any): Promise
* Defined in [Aweber.ts:172](https://github.com/scippio/api-aweber/blob/4a43372/src/Aweber.ts#L172)
#### Parameters
| Name | Type | Description |
| ---- | ---- | ---- |
| accountId | number|  |
| listId | number|  |
| subscriberId | number|  |
| data | any|  |
#### Returns: Promise
Generated using [TypeDoc](http://typedoc.io)