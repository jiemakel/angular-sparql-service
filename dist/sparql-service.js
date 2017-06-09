(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("angular"));
	else if(typeof define === 'function' && define.amd)
		define(["angular"], factory);
	else if(typeof exports === 'object')
		exports["sparql-service"] = factory(require("angular"));
	else
		root["sparql-service"] = factory(root["angular"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(0);
var UniqueObjectTracker = (function () {
    function UniqueObjectTracker() {
        this.objectsById = {};
        this.assignmentsById = {};
    }
    return UniqueObjectTracker;
}());
exports.UniqueObjectTracker = UniqueObjectTracker;
var SparqlService = (function () {
    /* @ngInject */
    SparqlService.$inject = ["$http", "$q"];
    function SparqlService($http, $q) {
        this.$http = $http;
        this.$q = $q;
    }
    SparqlService.stringToSPARQLString = function (string) {
        return '"' + string
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
            .replace(/\t/g, '\\t')
            .replace(/\r/g, '\\r')
            .replace(/\f/g, '\\f')
            + '"';
    };
    SparqlService.bindingsToObject = function (bindings, ret, config, tracker) {
        if (ret === void 0) { ret = {}; }
        for (var bkey in bindings) {
            var okey = bkey;
            var obj = ret;
            var subObjectPrefixIndex = okey.indexOf('_');
            var lastSubObjectPrefixIndex = -1;
            var assignmentsById = void 0;
            if (tracker)
                assignmentsById = tracker.assignmentsById;
            while (subObjectPrefixIndex !== -1) {
                okey = bkey.substring(lastSubObjectPrefixIndex + 1, subObjectPrefixIndex);
                var sbkey = bkey.substring(0, subObjectPrefixIndex);
                if (config && config.bindingTypes && config.bindingTypes[sbkey] && config.bindingTypes[sbkey] === 'uniqueArray') {
                    if (!obj[okey])
                        obj[okey] = [];
                    if (!tracker.objectsById[sbkey])
                        tracker.objectsById[sbkey] = {};
                    var tmp = void 0;
                    if (!tracker.objectsById[sbkey][bindings[sbkey].value]) {
                        tmp = config.bindingConverters[sbkey](bindings[sbkey], bindings);
                        tracker.objectsById[sbkey][bindings[sbkey].value] = tmp;
                    }
                    else
                        tmp = tracker.objectsById[sbkey][bindings[sbkey].value];
                    if (!assignmentsById[sbkey])
                        assignmentsById[sbkey] = {};
                    if (!assignmentsById[sbkey][bindings[sbkey].value]) {
                        obj[sbkey].push(tmp);
                        assignmentsById[sbkey][bindings[sbkey].value] = {};
                    }
                    assignmentsById = assignmentsById[sbkey][bindings[sbkey].value];
                    obj = tmp;
                }
                else {
                    if (config && config.bindingTypes && config.bindingTypes[sbkey] && config.bindingTypes[sbkey] === 'single') {
                        if (!tracker.objectsById[sbkey])
                            tracker.objectsById[sbkey] = {};
                        if (!tracker.objectsById[sbkey][bindings[sbkey].value]) {
                            obj[okey] = config.bindingConverters[sbkey](bindings[sbkey], bindings);
                            tracker.objectsById[sbkey][bindings[sbkey].value] = obj[okey];
                        }
                    }
                    else if (!obj[okey])
                        obj[okey] = config.bindingConverters[sbkey](bindings[sbkey], bindings);
                    obj = obj[okey];
                }
                lastSubObjectPrefixIndex = subObjectPrefixIndex;
                subObjectPrefixIndex = bkey.indexOf('_', subObjectPrefixIndex + 1);
            }
            okey = bkey.substring(lastSubObjectPrefixIndex + 1);
            var val = void 0;
            if (tracker && config && config.bindingTypes && (config.bindingTypes[bkey] === 'single' || config.bindingTypes[bkey] === 'uniqueArray')) {
                if (!tracker.objectsById[bkey])
                    tracker.objectsById[bkey] = {};
                if (!tracker.objectsById[bkey][bindings[bkey].value]) {
                    if (config && config.bindingConverters && config.bindingConverters[bkey])
                        val = config.bindingConverters[bkey](bindings[bkey], bindings);
                    else
                        val = SparqlService.bindingToValue(bindings[bkey]);
                    tracker.objectsById[bkey][bindings[bkey].value] = val;
                }
                else
                    val = tracker.objectsById[bkey][bindings[bkey].value];
            }
            else if (config && config.bindingConverters && config.bindingConverters[bkey])
                val = config.bindingConverters[bkey](bindings[bkey], bindings);
            else if (!config || !config.bindingTypes || !config.bindingTypes[bkey] || (config.bindingTypes[bkey] !== 'hash' && config.bindingTypes[bkey] !== 'ignore'))
                val = SparqlService.bindingToValue(bindings[bkey]);
            if (config && config.bindingTypes && config.bindingTypes[bkey]) {
                switch (config.bindingTypes[bkey]) {
                    case 'ignore': break;
                    case 'single':
                        obj[okey] = val;
                        break;
                    case 'array':
                        if (!Array.isArray(obj[okey]))
                            obj[okey] = [];
                        obj[okey].push(val);
                        break;
                    case 'hash':
                        if (!obj[okey])
                            obj[okey] = {};
                        if (val)
                            obj[okey][bindings[bkey].value] = val;
                        else if (bindings[bkey].type === 'literal') {
                            var key2 = bindings[bkey].datatype;
                            if (!key2) {
                                key2 = bindings[bkey]['xml:lang'];
                                if (!key2)
                                    key2 = '';
                            }
                            obj[okey][key2] = bindings[bkey].value;
                        }
                        else
                            obj[okey][bindings[bkey].value] = bindings[bkey].value;
                        break;
                    default:
                        if (!obj[okey])
                            obj[okey] = [];
                        if (!assignmentsById[bkey])
                            assignmentsById[bkey] = {};
                        if (!assignmentsById[bkey][bindings[bkey].value]) {
                            assignmentsById[bkey][bindings[bkey].value] = val;
                            obj[okey].push(val);
                        }
                }
            }
            else if (Array.isArray(obj[okey]))
                obj[okey].push(val);
            else if (obj[okey] !== null && typeof (obj[okey]) === 'object' && bindings[bkey]) {
                if (bindings[bkey].type === 'literal') {
                    var key2 = bindings[bkey].datatype;
                    if (!key2) {
                        key2 = bindings[bkey]['xml:lang'];
                        if (!key2)
                            key2 = '';
                    }
                    if (config && config.bindingConverters && config.bindingConverters[bkey])
                        obj[okey][key2] = config.bindingConverters[bkey](bindings[bkey], bindings);
                    else
                        obj[okey][key2] = bindings[bkey].value;
                }
                else if (config && config.bindingConverters && config.bindingConverters[bkey])
                    obj[okey][bindings[bkey].value] = config.bindingConverters[bkey](bindings[bkey], bindings);
                else
                    obj[okey][bindings[bkey].value] = bindings[bkey].value;
            }
            else
                obj[okey] = val;
        }
        return ret;
    };
    SparqlService.bindingToValue = function (binding) {
        if (!binding)
            return undefined;
        if (binding.type === 'uri')
            return binding.value;
        else if (binding.type === 'bnode')
            return binding.value;
        else if (binding.datatype)
            switch (binding.datatype) {
                case 'http://www.w3.org/2001/XMLSchema#integer':
                case 'http://www.w3.org/2001/XMLSchema#decimal': return parseInt(binding.value, 10);
                case 'http://www.w3.org/2001/XMLSchema#float':
                case 'http://www.w3.org/2001/XMLSchema#double': return parseFloat(binding.value);
                case 'http://www.w3.org/2001/XMLSchema#boolean': return binding.value ? true : false;
                default:
            }
        return binding.value;
    };
    SparqlService.bindingToString = function (binding) {
        if (!binding)
            return 'UNDEF';
        else {
            var value = binding.value.replace(/\\/g, '\\\\').replace(/\t/g, '\\t').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/[\b]/g, '\\b').replace(/\f/g, '\\f').replace(/\"/g, '\\"').replace(/\'/g, '\\\'');
            if (binding.type === 'uri')
                return '<' + value + '>';
            else if (binding.type === 'bnode')
                return '_:' + value;
            else if (binding.datatype)
                switch (binding.datatype) {
                    case 'http://www.w3.org/2001/XMLSchema#integer':
                    case 'http://www.w3.org/2001/XMLSchema#decimal':
                    case 'http://www.w3.org/2001/XMLSchema#double':
                    case 'http://www.w3.org/2001/XMLSchema#boolean': return value;
                    case 'http://www.w3.org/2001/XMLSchema#string': return '"' + value + '"';
                    default: return '"' + value + '"^^<' + binding.datatype + '>';
                }
            else if (binding['xml:lang'])
                return '"' + value + '"@' + binding['xml:lang'];
            else
                return '"' + value + '"';
        }
    };
    SparqlService.prototype.check = function (endpoint, params) {
        var deferred = this.$q.defer();
        this.$http(angular.extend({
            method: 'GET',
            url: endpoint,
            params: { query: 'ASK {}' },
            headers: { 'Accept': 'application/sparql-results+json' }
        }, params)).then(function (response) { return deferred.resolve(response.data.boolean === true); }, function (response) { return deferred.resolve(false); });
        return deferred.promise;
    };
    SparqlService.prototype.checkUpdate = function (endpoint, params) {
        var deferred = this.$q.defer();
        this.$http(angular.extend({
            method: 'POST',
            url: endpoint,
            headers: { 'Content-Type': 'application/sparql-update' },
            data: 'INSERT DATA {}'
        }, params)).then(function (response) { return deferred.resolve(response.status === 204); }, function (response) { return deferred.resolve(false); });
        return deferred.promise;
    };
    SparqlService.prototype.checkRest = function (endpoint, params) {
        var deferred = this.$q.defer();
        this.$http(angular.extend({
            method: 'POST',
            url: endpoint + '?default',
            data: '',
            headers: { 'Content-Type': 'text/turtle' }
        }, params)).then(function (response) { return deferred.resolve(response.status === 204); }, function (response) { return deferred.resolve(false); });
        return deferred.promise;
    };
    SparqlService.prototype.get = function (endpoint, graphIRI, params) {
        return this.$http(angular.extend({
            method: 'GET',
            url: endpoint,
            params: graphIRI ? { graph: graphIRI } : { 'default': '' },
            headers: { 'Accept': 'text/turtle' }
        }, params));
    };
    SparqlService.prototype.post = function (endpoint, graph, graphIRI, params) {
        return this.$http(angular.extend({
            method: 'POST',
            url: endpoint,
            params: graphIRI ? { graph: graphIRI } : { 'default': '' },
            data: graph,
            headers: { 'Content-Type': 'text/turtle' }
        }, params));
    };
    SparqlService.prototype.put = function (endpoint, graph, graphIRI, params) {
        return this.$http(angular.extend({
            method: 'PUT',
            url: endpoint,
            params: graphIRI ? { graph: graphIRI } : { 'default': '' },
            data: graph,
            headers: { 'Content-Type': 'text/turtle' }
        }, params));
    };
    SparqlService.prototype.delete = function (endpoint, graphIRI, params) {
        return this.$http(angular.extend({
            method: 'DELETE',
            url: endpoint,
            params: graphIRI ? { graph: graphIRI } : { 'default': '' }
        }, params));
    };
    SparqlService.prototype.query = function (endpoint, query, params) {
        if (query.length <= 2048)
            return this.$http(angular.extend({
                method: 'GET',
                url: endpoint,
                params: { query: query },
                headers: { 'Accept': 'application/sparql-results+json' }
            }, params));
        else
            return this.$http(angular.extend({
                method: 'POST',
                url: endpoint,
                data: 'query=' + encodeURIComponent(query),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/sparql-results+json'
                }
            }, params));
    };
    SparqlService.prototype.construct = function (endpoint, query, params) {
        if (query.length <= 2048)
            return this.$http(angular.extend({
                method: 'GET',
                url: endpoint,
                params: { query: query },
                headers: { 'Accept': 'text/turtle' }
            }, params));
        else
            return this.$http(angular.extend({
                method: 'POST',
                url: endpoint,
                data: query,
                headers: {
                    'Content-Type': 'application/sparql-query',
                    'Accept': 'text/turtle'
                }
            }, params));
    };
    SparqlService.prototype.update = function (endpoint, query, params) {
        return this.$http(angular.extend({
            method: 'POST',
            url: endpoint,
            headers: { 'Content-Type': 'application/sparql-update' },
            data: query
        }, params));
    };
    return SparqlService;
}());
exports.SparqlService = SparqlService;
angular.module('fi.seco.sparql', []).service('sparqlService', SparqlService);


/***/ })
/******/ ]);
});
//# sourceMappingURL=sparql-service.js.map