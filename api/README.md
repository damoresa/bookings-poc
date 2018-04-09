## Hotels Booking POC API

_REST_ API for the hotels booking _POC_.  
This API publishes an _OpenAPI 2.0_ specification which ends up 
generating requests to the _Ethereum_ _Smart Contract_ using 
_Web3Js_ and transforms the received data according to the 
provided specification.

You can find the _OpenAPI 2.0_ specification file within this 
repository under the name _api.yaml_.

#### Project structure

* _controllers_: _ExpressJS_ controllers, they do nothing other 
than extracting parameters from input requests, invoking services 
and transforming output data to fit the specification.
* _services_: _NodeJS_ functions which use _Web3Js_ to access 
the hotels booking _Smart Contract_ and extract data or trigger 
transactions.

#### Use cases

The following use cases are implemented:

* Search hotels.
* Search rooms on a given booking time range.
* Search room details.
* Generate a booking on the selected time range.