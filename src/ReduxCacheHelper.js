import * as Store from './ReduxStore';

export default function({Actions, namespace}) {
	var Executed = {};

	function refresh(cb, options) {
		Store.dispatch(Actions.setPending(options));

		var { limit } = options;

		var done = cb().then(function(result) {
			Store.dispatch(Actions.saveResult({...options, result}));
			if (limit)
				Store.dispatch(Actions.estimateEndOfResults({...options, operation: 'appendResult', length: result.length}));
			
			return Parse.Promise.as(result);
		}).fail(function(err) {
			Store.dispatch(Actions.unsetPending(options));

			return Parse.Promise.error(err);
		});

		Executed = setItemState(Executed, options, done);

		return done;
	}

	function init(cb, options) {
		var State = Store.getState().Parse[namespace];
		var { cache, pending } = getItemState(State, options);

		if (pending)
			return getItemState(Executed, options);

		if (cache)
			return Parse.Promise.as(cache);

		return refresh(...arguments);
	}

	// returns cached result if it has already been saved
	// queries if no result exists
	function get(options) {
		var State = Store.getState().Parse[namespace];
		var state = getItemState(State, options);

		return state.cache;
	}

	function _operateOnArray(cb, options, operation) {
		Store.dispatch(Actions.setPending(options));

		var { limit } = options;

		return cb().then(function(result) {
			Store.dispatch(Actions[operation]({...options, result}));
			Store.dispatch(Actions.estimateEndOfResults({...options, operation, length: result.length}));

			return Parse.Promise.as(result);
		}).fail(function(err) {
			Store.dispatch(Actions.unsetPending(options));

			return Parse.Promise.error(err);
		});
	}

	function append() {
		return _operateOnArray(...arguments, 'appendResult');
	}

	function prepend() {
		return _operateOnArray(...arguments, 'prependResult');
	}

	return {
		refresh,
		init,
		get,
		append,
		prepend
	}
}

export function getItemState(object, {name, data, grouping}) {
	var next = object[name];
  if (!next)
  	return {};

  if (grouping)
  	next = next[grouping];
  else
  	next = next[JSON.stringify(data)];

  return next || {};
}

export function setItemState(object, {name, data, grouping}, value) {
	var object = {...object};
	var next = object[name];

	if (next)
		next = {...next};
  else
  	next = {};

  object[name] = next;

  var key;
  if (grouping)
  	key = grouping;
  else
  	key = JSON.stringify(data);
  	
	next[key] = value;

  return object;
}