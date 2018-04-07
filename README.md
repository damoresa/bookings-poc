## Hotels Booking POC

_POC_ that features a room booking system.  
A _REST_ API is provided that queries the _Smart Contract_ and 
generates the allowed transactions.

#### Use cases

At this point in time, the _POC_ is limited to booking 
creations over the pre-allocated hotels and rooms.
It is also restricted to a single user, since _addresses_ 
are not handled on the basic version.

On the future, it may support:

[ ] Multi-user booking support (using _addresses_)
[ ] Hotel management
[ ] Room management

#### Technologies

* _Ethereum_ private blockchain network.
* _Solidity_ as the _Smart Contract_ implementation language.
* _Web3Js_ connectors.
* _ExpressJS_ REST API.

#### Util scripts

All the provided scripts are implemented using _NodeJS_.

* __compile.js__: Script that compiles the _Smart Contract_.
* __deploy.js__: Script that compiles and then deploys the 
_Smart Contract_ on the private _Ethereum_ blockchain network.
* __execute.js__: Script that initializes preconfigured data 
on the deployed _Smart Contract_ and then queries it.
    * __NOTE__: This script uses a lot of scripts from the 
    _scripts_ folder which abstract the _Web3Js_ API.