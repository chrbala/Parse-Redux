# Parse-Redux
This is a drop-in replacement for Parse branched from Parse v1.6.9 that uses a Redux architecture, bringing better application state management to Parse users.

## Objects
The vanilla Parse library maintains object state in a mutable JS object. Parse-Redux makes that object immutable and exposes it through the Redux state.

It is not advised the data directly from the Redux state - it contains a number of keys that are used together to 'estimate' what a given object's properties are between the last fetched Server data and the local object cache. 

The Redux cache can be directly used to check for changes in object state - just not for calculating object attributes.

## Queries
Parse-Redux allows for Query caching and cache management. Queries are first created as normal:

```javascript
var query = new Parse.Query('Potato')
```

Parse-Redux uses JSON.stringify(query) as the default QUERY_ID, but this can be customized with the grouping parameter (string).

The following functions can be run on any Query with the standard Parse Query restraints.

### query.find.refresh([grouping])
Runs the query and caches it, replacing any exsting cache. Returns a Parse.Promise.

### query.find.init([grouping])
Runs the query if there is no cache, then caches the result. Returns a Parse.Promise, which is instantly resolved with the cached data, if there is a cached result (and creates no network request).

### query.find.append([grouping])
Appends more results to an existing query cache. Only supports sorting ascending/descending queries by 'createdAt' parameter. Creates a new cache if there is no existing cache. Returns a Parse.Promise.

### query.find.prepend([grouping])
Prepends more results to an existing query cache. Only supports sorting ascending/descending queries by 'createdAt' parameter. Creates a new cache if there is no existing cache. Returns a Parse.Promise.

*Note: prepend will hit the end of the available results, unless the query has a ``greaterThan`` or ``lessThan`` restraint between the first and last available `createdAt` dates, or if the query is descending and there are items that have been created since the query was first cached.*

### query.find.get([grouping])
Retrieves a cached query result, if it exists. Returns the object itself - not a promise. Returns undefined if there is no cache. Does not create network requests.

### query.find.getState([grouping])
Retrieves the cached query result with more context. Returns:

```javascript
{
	cache: []
	pending: boolean,
	appendEnd: boolean,
	prependEnd: boolean
}
```
cache: The same result returned by ``query.find.get()``  
pending: The query state  
appendEnd: Estimates if the query has hit the end of the available results in the forward direction.  
prependEnd: Estimates if the query has hit the end of the available results in the backward direction.

prependEnd is undefined if prepend() has not been run.

## Cloud Code
The name, data, and options parameters are the vanilla Parse parameters on the run function. Parse-Redux uses JSON.stringify(data) as the default FUNCTION_ID, but this can be customized with the grouping parameter (string).

### Parse.Cloud.run.refresh(name, [data], [grouping], [limit], [options])
Runs the function and caches it, replacing any exsting cache. Returns a Parse.Promise.

### Parse.Cloud.run.init(name, [data], [grouping], [limit], [options])
Runs the function if there is no cache, then caches the result. Returns a Parse.Promise, which is instantly resolved with the cached data, if there is a cached result (and creates no network request).

### Parse.Cloud.run.append(name, [data], [grouping], [limit], [options])
Appends more results to an existing function cache. Creates a new cache if there is no existing cache. Returns a Parse.Promise.

### Parse.Cloud.run.prepend(name, [data], [grouping], [limit], [options])
Prepends more results to an existing function cache. Creates a new cache if there is no existing cache. Returns a Parse.Promise.

### Parse.Cloud.run.get(name, [data], [grouping])
Retrieves a cached function result, if it exists. Returns the object itself - not a promise. Returns undefined if there is no cache. Does not create network requests.

### Parse.Cloud.run.getState(name, [data], [grouping])
Retrieves the cached function result with more context. Returns an identical object to the query getState function.

## Custom stores
This is an optional step that allows Parse-Redux integration into existing Redux stores, giving all the normal Redux functionality.

```javascript
import { createStore, combineReducers } from 'redux'
import Parse from 'parse-redux'

var reducer = combineReducers({
	Parse: Parse.getReducer()	// This reducer MUST be named Parse and be at the top level
})

var store = createStore(reducer)

Parse.setStore(store)
Parse.initialize(APPLICATION_ID, JAVASCRIPT_KEY)
```

## Accessing caches from the store
The caches can be accessed as follows: 

```javascript
var state = store.getState()
var objectState = state.Parse.Object[CLASS_NAME][OBJECT_ID]
var queryState = state.Parse.Query[CLASS_NAME][QUERY_ID]
var cloudState = state.Parse.Cloud[FUNCTION_NAME][FUNCTION_ID]
```
Direct access to these items should be fairly limited as the Parse-Redux library provides getters for easy access to the cache.

## Breaking changes from Parse
Parse-Redux is a complete drop-in solution that changes none of the preexisting Parse functionality, with one exception. In the vanilla Parse API, when a user logs out, the objects stay in Parse's cache - even those with ACL limitations. Parse-Redux clears all items from the cache when the user logs out.

## What Parse-Redux doesn't do (right now)
Parse-Redux is a young library. Some Parse-Redux to-do's are: 

* Pending state management for Objects: Queries and Cloud functions both have pending state available, but Objects don't have access to this for save() and fetch() functions.
* Error management in Redux state: Errors currently work exactly as the vanilla Parse errors - through promises.