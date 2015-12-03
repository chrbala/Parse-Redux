var lib = {
	toUnderscore(str){
		return str.replace(/([A-Z])/g, function($1){return "_"+$1}).toUpperCase();
	}
}

export function generateActions(actions, namespace) {
	var out = {};
	namespace = namespace ? namespace + '/' : '';

	actions.forEach(function(m) {
		if (typeof m == 'string') {
			out[m] = function(payload) {
				return {
					type: namespace + lib.toUnderscore(m),
					payload
				}
			}
		}	else
		 out[m.name] = function(payload) {
		 	var action = m.action(payload);
		 	action.type = namespace + action.type;

		 	return action;
		}
	});

	return out;
}

export const ObjectActions = generateActions([
	'initializeState',
	'removeState',
	'setServerData',
	'setPendingOp',
	'clearPendingOps',
	'pushPendingState',
	'popPendingState',
	'mergeFirstPendingState',
	'commitServerChanges',
	'_clearAllState',
	'_setExisted',
], 'Parse/Object');

var _functionActions = [
	'setPending',
	'unsetPending',
	'saveResult',
	{name: 'appendResult', action: function(payload) {
		var type = 'OPERATE_ON_ARRAY';
		payload.operation = 'push';

		return {type, payload};
	}},
	{name: 'prependResult', action: function(payload) {
		var type = 'OPERATE_ON_ARRAY';
		payload.operation = 'unshift';

		return {type, payload};
	}}
];

export const FunctionActions = generateActions(_functionActions, 'Parse/Cloud');
export const QueryActions = generateActions(_functionActions, 'Parse/Query');

export const UserActions = generateActions([
	'set'
], 'Parse/User');