angular.module('fi.seco.sparql', []);
var fi;
(function (fi) {
    var seco;
    (function (seco) {
        var sparql;
        (function (sparql) {
            'use strict';
            var SparqlService = (function () {
                function SparqlService($http, $q) {
                    this.$http = $http;
                    this.$q = $q;
                }/*<auto_generate>*/SparqlService.$inject = ['$http','$q']; SparqlService.$componentName = 'sparqlService'/*</auto_generate>*/
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
                SparqlService.bindingsToObject = function (bindings, ret, config) {
                    if (ret === void 0) { ret = {}; }
                    for (var bkey in bindings) {
                        var okey = bkey;
                        var obj = ret;
                        var val = void 0;
                        if (config && config.subObjectPrefixes && config.subObjectPrefixes[bkey]) {
                            if (!config.subObjectPrefixes[bkey][bindings[bkey].value]) {
                                if (config && config.bindingConverters && config.bindingConverters[bkey])
                                    val = config.bindingConverters[bkey](bindings[bkey], bindings);
                                else
                                    val = {};
                                config.subObjectPrefixes[bkey][bindings[bkey].value] = val;
                            }
                            else
                                val = config.subObjectPrefixes[bkey][bindings[bkey].value];
                        }
                        else {
                            if (config && config.subObjectPrefixes)
                                for (var sop in config.subObjectPrefixes)
                                    if (bkey.indexOf(sop) === 0) {
                                        if (!config.subObjectPrefixes[sop][bindings[sop].value]) {
                                            if (config && config.bindingConverters && config.bindingConverters[sop])
                                                obj = config.bindingConverters[sop](bindings[sop], bindings);
                                            else
                                                obj = {};
                                            config.subObjectPrefixes[sop][bindings[sop].value] = obj;
                                        }
                                        else
                                            obj = config.subObjectPrefixes[sop][bindings[sop].value];
                                        okey = bkey.substring(sop.length);
                                    }
                            if (config && config.bindingConverters && config.bindingConverters[bkey])
                                val = config.bindingConverters[bkey](bindings[bkey], bindings);
                            else if (!config || !config.bindingTypes || !config.bindingTypes[bkey] || (config.bindingTypes[bkey] !== 'hash' && config.bindingTypes[bkey] !== 'ignore'))
                                val = SparqlService.bindingToValue(bindings[bkey]);
                        }
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
                                    if (config.bindingTypes[bkey][bindings[bkey].value] !== '') {
                                        config.bindingTypes[bkey][bindings[bkey].value] = '';
                                        obj[okey].push(val);
                                    }
                            }
                        }
                        else if (Array.isArray(obj[okey]))
                            obj[okey].push(val);
                        else if (typeof (obj[okey]) === 'object' && bindings[bkey]) {
                            if (bindings[bkey].type === 'literal') {
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
            }());/*<auto_generate>*/angular.module('fi.seco.sparql').service('sparqlService',SparqlService);/*</auto_generate>*/
            sparql.SparqlService = SparqlService;
        })(sparql = seco.sparql || (seco.sparql = {}));
    })(seco = fi.seco || (fi.seco = {}));
})(fi || (fi = {}));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zcGFycWwtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQ3BDLElBQVUsRUFBRSxDQW9VWDtBQXBVRCxXQUFVLEVBQUU7SUFBQyxJQUFBLElBQUksQ0FvVWhCO0lBcFVZLFdBQUEsSUFBSTtRQUFDLElBQUEsTUFBTSxDQW9VdkI7UUFwVWlCLFdBQUEsTUFBTTtZQUN0QixZQUFZLENBQUE7WUE2Qlo7Z0JBa0hFLHVCQUFvQixLQUEyQixFQUFVLEVBQXFCO29CQUExRCxVQUFLLEdBQUwsS0FBSyxDQUFzQjtvQkFBVSxPQUFFLEdBQUYsRUFBRSxDQUFtQjtnQkFBRyxDQUFDO2dCQWpIcEUsa0NBQW9CLEdBQWxDLFVBQW1DLE1BQU07b0JBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsTUFBTTt5QkFDaEIsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUM7eUJBQ3RCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDO3lCQUNwQixPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQzt5QkFDckIsT0FBTyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7eUJBQ3JCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO3lCQUNyQixPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQzswQkFDcEIsR0FBRyxDQUFBO2dCQUNULENBQUM7Z0JBQ2EsOEJBQWdCLEdBQTlCLFVBQWtDLFFBQXdDLEVBQUUsR0FBWSxFQUFFLE1BQXVDO29CQUFyRCxvQkFBQSxFQUFBLFFBQVk7b0JBQ3RGLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUM7d0JBQzFCLElBQUksSUFBSSxHQUFXLElBQUksQ0FBQTt3QkFDdkIsSUFBSSxHQUFHLEdBQU8sR0FBRyxDQUFBO3dCQUNqQixJQUFJLEdBQUcsU0FBSyxDQUFBO3dC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LElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO3dDQUMzQyxJQUFJLElBQUksR0FBVyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFBO3dDQUMxQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7NENBQ1YsSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQTs0Q0FDakMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0RBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQTt3Q0FDdEIsQ0FBQzt3Q0FDRCxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQTtvQ0FDeEMsQ0FBQztvQ0FBQyxJQUFJO3dDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQTtvQ0FDN0QsS0FBSyxDQUFBO2dDQUNQO29DQUNFLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO3dDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7b0NBQzlCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7d0NBQzNELE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQTt3Q0FDcEQsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtvQ0FDckIsQ0FBQzs0QkFDTCxDQUFDO3dCQUNI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QUksS0FBSixPQUFJLFFBb1VoQjtBQUFELENBQUMsRUFwVVMsRUFBRSxLQUFGLEVBQUUsUUFvVVgiLCJmaWxlIjoic3BhcnFsLXNlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgnZmkuc2Vjby5zcGFycWwnLCBbXSlcbm5hbWVzcGFjZSBmaS5zZWNvLnNwYXJxbCB7XG4gICd1c2Ugc3RyaWN0J1xuXG4gIGV4cG9ydCBpbnRlcmZhY2UgSVNwYXJxbEJpbmRpbmcge1xuICAgIHR5cGU6ICd1cmknIHwgJ2Jub2RlJyB8ICdsaXRlcmFsJyxcbiAgICB2YWx1ZTogc3RyaW5nLFxuICAgICd4bWw6bGFuZyc/OiBzdHJpbmcsXG4gICAgZGF0YXR5cGU/OiBzdHJpbmdcbiAgfVxuXG4gIGV4cG9ydCBpbnRlcmZhY2UgSVNwYXJxbEJpbmRpbmdSZXN1bHQ8QmluZGluZ1R5cGUgZXh0ZW5kcyB7W2lkOiBzdHJpbmddOiBJU3BhcnFsQmluZGluZ30+IHtcbiAgICBoZWFkOiB7XG4gICAgICB2YXJzOiBzdHJpbmdbXSxcbiAgICAgIGxpbms/OiBzdHJpbmdbXVxuICAgIH0sXG4gICAgcmVzdWx0czoge1xuICAgICAgYmluZGluZ3M6IEJpbmRpbmdUeXBlW11cbiAgICB9XG4gIH1cblxuICBleHBvcnQgaW50ZXJmYWNlIElTcGFycWxBc2tSZXN1bHQge1xuICAgIGJvb2xlYW46IGJvb2xlYW5cbiAgfVxuXG4gIGV4cG9ydCBpbnRlcmZhY2UgSUJpbmRpbmdzVG9PYmplY3RDb25maWd1cmF0aW9uIHtcbiAgICBiaW5kaW5nVHlwZXM/OiB7W3Zhcm5hbWU6IHN0cmluZ106ICdpZ25vcmUnIHwgJ3NpbmdsZScgfCAnYXJyYXknIHwge1tpZDogc3RyaW5nXTogJyd9IHwgJ2hhc2gnfVxuICAgIGJpbmRpbmdDb252ZXJ0ZXJzPzoge1t2YXJuYW1lOiBzdHJpbmddOiAoYmluZGluZzogSVNwYXJxbEJpbmRpbmcsIGJpbmRpbmdzOiB7W2lkOiBzdHJpbmddOiBJU3BhcnFsQmluZGluZ30pID0+IGFueSB9XG4gICAgc3ViT2JqZWN0UHJlZml4ZXM/OiB7W3ByZWZpeDogc3RyaW5nXToge1tpZDogc3RyaW5nXToge319fVxuICB9XG5cbiAgZXhwb3J0IGNsYXNzIFNwYXJxbFNlcnZpY2Uge1xuICAgIHB1YmxpYyBzdGF0aWMgc3RyaW5nVG9TUEFSUUxTdHJpbmcoc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiAnXCInICsgc3RyaW5nXG4gICAgICAgIC5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpXG4gICAgICAgIC5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJylcbiAgICAgICAgLnJlcGxhY2UoL1xcbi9nLCAnXFxcXG4nKVxuICAgICAgICAucmVwbGFjZSgvXFx0L2csICdcXFxcdCcpXG4gICAgICAgIC5yZXBsYWNlKC9cXHIvZywgJ1xcXFxyJylcbiAgICAgICAgLnJlcGxhY2UoL1xcZi9nLCAnXFxcXGYnKVxuICAgICAgICArICdcIidcbiAgICB9XG4gICAgcHVibGljIHN0YXRpYyBiaW5kaW5nc1RvT2JqZWN0PFQ+KGJpbmRpbmdzOiB7W2lkOiBzdHJpbmddOiBJU3BhcnFsQmluZGluZ30sIHJldDoge30gPSB7fSwgY29uZmlnPzogSUJpbmRpbmdzVG9PYmplY3RDb25maWd1cmF0aW9uKTogVCB7XG4gICAgICBmb3IgKGxldCBia2V5IGluIGJpbmRpbmdzKSB7XG4gICAgICAgIGxldCBva2V5OiBzdHJpbmcgPSBia2V5XG4gICAgICAgIGxldCBvYmo6IHt9ID0gcmV0XG4gICAgICAgIGxldCB2YWw6IGFueVxuICAgICAgICBpZiAoY29uZmlnICYmIGNvbmZpZy5zdWJPYmplY3RQcmVmaXhlcyAmJiBjb25maWcuc3ViT2JqZWN0UHJlZml4ZXNbYmtleV0pIHtcbiAgICAgICAgICBpZiAoIWNvbmZpZy5zdWJPYmplY3RQcmVmaXhlc1tia2V5XVtiaW5kaW5nc1tia2V5XS52YWx1ZV0pIHtcbiAgICAgICAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmJpbmRpbmdDb252ZXJ0ZXJzICYmIGNvbmZpZy5iaW5kaW5nQ29udmVydGVyc1tia2V5XSlcbiAgICAgICAgICAgICAgdmFsID0gY29uZmlnLmJpbmRpbmdDb252ZXJ0ZXJzW2JrZXldKGJpbmRpbmdzW2JrZXldLCBiaW5kaW5ncylcbiAgICAgICAgICAgIGVsc2UgdmFsID0ge31cbiAgICAgICAgICAgIGNvbmZpZy5zdWJPYmplY3RQcmVmaXhlc1tia2V5XVtiaW5kaW5nc1tia2V5XS52YWx1ZV0gPSB2YWxcbiAgICAgICAgICB9IGVsc2UgdmFsID0gY29uZmlnLnN1Yk9iamVjdFByZWZpeGVzW2JrZXldW2JpbmRpbmdzW2JrZXldLnZhbHVlXVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLnN1Yk9iamVjdFByZWZpeGVzKVxuICAgICAgICAgICAgZm9yIChsZXQgc29wIGluIGNvbmZpZy5zdWJPYmplY3RQcmVmaXhlcylcbiAgICAgICAgICAgICAgaWYgKGJrZXkuaW5kZXhPZihzb3ApID09PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjb25maWcuc3ViT2JqZWN0UHJlZml4ZXNbc29wXVtiaW5kaW5nc1tzb3BdLnZhbHVlXSkge1xuICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcuYmluZGluZ0NvbnZlcnRlcnMgJiYgY29uZmlnLmJpbmRpbmdDb252ZXJ0ZXJzW3NvcF0pXG4gICAgICAgICAgICAgICAgICAgIG9iaiA9IGNvbmZpZy5iaW5kaW5nQ29udmVydGVyc1tzb3BdKGJpbmRpbmdzW3NvcF0sIGJpbmRpbmdzKVxuICAgICAgICAgICAgICAgICAgZWxzZSBvYmogPSB7fVxuICAgICAgICAgICAgICAgICAgY29uZmlnLnN1Yk9iamVjdFByZWZpeGVzW3NvcF1bYmluZGluZ3Nbc29wXS52YWx1ZV0gPSBvYmpcbiAgICAgICAgICAgICAgICB9IGVsc2Ugb2JqID0gY29uZmlnLnN1Yk9iamVjdFByZWZpeGVzW3NvcF1bYmluZGluZ3Nbc29wXS52YWx1ZV1cbiAgICAgICAgICAgICAgICBva2V5ID0gYmtleS5zdWJzdHJpbmcoc29wLmxlbmd0aClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmJpbmRpbmdDb252ZXJ0ZXJzICYmIGNvbmZpZy5iaW5kaW5nQ29udmVydGVyc1tia2V5XSlcbiAgICAgICAgICAgIHZhbCA9IGNvbmZpZy5iaW5kaW5nQ29udmVydGVyc1tia2V5XShiaW5kaW5nc1tia2V5XSwgYmluZGluZ3MpXG4gICAgICAgICAgZWxzZSBpZiAoIWNvbmZpZyB8fCAhY29uZmlnLmJpbmRpbmdUeXBlcyB8fCAhY29uZmlnLmJpbmRpbmdUeXBlc1tia2V5XSB8fCAoY29uZmlnLmJpbmRpbmdUeXBlc1tia2V5XSAhPT0gJ2hhc2gnICYmIGNvbmZpZy5iaW5kaW5nVHlwZXNbYmtleV0gIT09ICdpZ25vcmUnKSlcbiAgICAgICAgICAgIHZhbCA9IFNwYXJxbFNlcnZpY2UuYmluZGluZ1RvVmFsdWUoYmluZGluZ3NbYmtleV0pXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcuYmluZGluZ1R5cGVzICYmIGNvbmZpZy5iaW5kaW5nVHlwZXNbYmtleV0pIHtcbiAgICAgICAgICBzd2l0Y2ggKGNvbmZpZy5iaW5kaW5nVHlwZXNbYmtleV0pIHtcbiAgICAgICAgICAgIGNhc2UgJ2lnbm9yZSc6IGJyZWFrXG4gICAgICAgICAgICBjYXNlICdzaW5nbGUnOiBvYmpbb2tleV0gPSB2YWw7IGJyZWFrXG4gICAgICAgICAgICBjYXNlICdhcnJheSc6XG4gICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShvYmpbb2tleV0pKSBvYmpbb2tleV0gPSBbXVxuICAgICAgICAgICAgICBvYmpbb2tleV0ucHVzaCh2YWwpXG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBjYXNlICdoYXNoJzpcbiAgICAgICAgICAgICAgaWYgKCFvYmpbb2tleV0pIG9ialtva2V5XSA9IHt9XG4gICAgICAgICAgICAgIGlmICh2YWwpIG9ialtva2V5XVtiaW5kaW5nc1tia2V5XS52YWx1ZV0gPSB2YWxcbiAgICAgICAgICAgICAgZWxzZSBpZiAoYmluZGluZ3NbYmtleV0udHlwZSA9PT0gJ2xpdGVyYWwnKSB7XG4gICAgICAgICAgICAgICAgbGV0IGtleTI6IHN0cmluZyA9IGJpbmRpbmdzW2JrZXldLmRhdGF0eXBlXG4gICAgICAgICAgICAgICAgaWYgKCFrZXkyKSB7XG4gICAgICAgICAgICAgICAgICBrZXkyID0gYmluZGluZ3NbYmtleV1bJ3htbDpsYW5nJ11cbiAgICAgICAgICAgICAgICAgIGlmICgha2V5Mikga2V5MiA9ICcnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9ialtva2V5XVtrZXkyXSA9IGJpbmRpbmdzW2JrZXldLnZhbHVlXG4gICAgICAgICAgICAgIH0gZWxzZSBvYmpbb2tleV1bYmluZGluZ3NbYmtleV0udmFsdWVdID0gYmluZGluZ3NbYmtleV0udmFsdWVcbiAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGRlZmF1bHQ6IC8vIHVuaXF1ZUFycmF5XG4gICAgICAgICAgICAgIGlmICghb2JqW29rZXldKSBvYmpbb2tleV0gPSBbXVxuICAgICAgICAgICAgICBpZiAoY29uZmlnLmJpbmRpbmdUeXBlc1tia2V5XVtiaW5kaW5nc1tia2V5XS52YWx1ZV0gIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnLmJpbmRpbmdUeXBlc1tia2V5XVtiaW5kaW5nc1tia2V5XS52YWx1ZV0gPSAnJ1xuICAgICAgICAgICAgICAgIG9ialtva2V5XS5wdXNoKHZhbClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KG9ialtva2V5XSkpIG9ialtva2V5XS5wdXNoKHZhbClcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mKG9ialtva2V5XSkgPT09ICdvYmplY3QnICYmIGJpbmRpbmdzW2JrZXldKSB7XG4gICAgICAgICAgaWYgKGJpbmRpbmdzW2JrZXldLnR5cGUgPT09ICdsaXRlcmFsJykge1xuICAgICAgICAgICAgbGV0IGtleTI6IHN0cmluZyA9IGJpbmRpbmdzW2JrZXldLmRhdGF0eXBlXG4gICAgICAgICAgICBpZiAoIWtleTIpIHtcbiAgICAgICAgICAgICAga2V5MiA9IGJpbmRpbmdzW2JrZXldWyd4bWw6bGFuZyddXG4gICAgICAgICAgICAgIGlmICgha2V5Mikga2V5MiA9ICcnXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvYmpbb2tleV1ba2V5Ml0gPSBiaW5kaW5nc1tia2V5XS52YWx1ZVxuICAgICAgICAgIH0gZWxzZSBvYmpbb2tleV1bYmluZGluZ3NbYmtleV0udmFsdWVdID0gYmluZGluZ3NbYmtleV0udmFsdWVcbiAgICAgICAgfVxuICAgICAgICBlbHNlIG9ialtva2V5XSA9IHZhbFxuICAgICAgfVxuICAgICAgcmV0dXJuIDxUPnJldFxuICAgIH1cbiAgICBwdWJsaWMgc3RhdGljIGJpbmRpbmdUb1ZhbHVlKGJpbmRpbmc6IElTcGFycWxCaW5kaW5nKTogYW55IHtcbiAgICAgIGlmICghYmluZGluZykgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgaWYgKGJpbmRpbmcudHlwZSA9PT0gJ3VyaScpIHJldHVybiBiaW5kaW5nLnZhbHVlXG4gICAgICBlbHNlIGlmIChiaW5kaW5nLnR5cGUgPT09ICdibm9kZScpIHJldHVybiBiaW5kaW5nLnZhbHVlXG4gICAgICBlbHNlIGlmIChiaW5kaW5nLmRhdGF0eXBlKSBzd2l0Y2ggKGJpbmRpbmcuZGF0YXR5cGUpIHtcbiAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjaW50ZWdlcic6XG4gICAgICAgIGNhc2UgJ2h0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hI2RlY2ltYWwnOiByZXR1cm4gcGFyc2VJbnQoYmluZGluZy52YWx1ZSwgMTApXG4gICAgICAgIGNhc2UgJ2h0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hI2Zsb2F0JzpcbiAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjZG91YmxlJzogcmV0dXJuIHBhcnNlRmxvYXQoYmluZGluZy52YWx1ZSlcbiAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjYm9vbGVhbic6IHJldHVybiBiaW5kaW5nLnZhbHVlID8gdHJ1ZSA6IGZhbHNlXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICB9XG4gICAgICByZXR1cm4gYmluZGluZy52YWx1ZVxuICAgIH1cbiAgICBwdWJsaWMgc3RhdGljIGJpbmRpbmdUb1N0cmluZyhiaW5kaW5nOiBJU3BhcnFsQmluZGluZyk6IHN0cmluZyB7XG4gICAgICBpZiAoIWJpbmRpbmcpIHJldHVybiAnVU5ERUYnXG4gICAgICBlbHNlIHtcbiAgICAgICAgbGV0IHZhbHVlOiBzdHJpbmcgPSBiaW5kaW5nLnZhbHVlLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJykucmVwbGFjZSgvXFx0L2csICdcXFxcdCcpLnJlcGxhY2UoL1xcbi9nLCAnXFxcXG4nKS5yZXBsYWNlKC9cXHIvZywgJ1xcXFxyJykucmVwbGFjZSgvW1xcYl0vZywgJ1xcXFxiJykucmVwbGFjZSgvXFxmL2csICdcXFxcZicpLnJlcGxhY2UoL1xcXCIvZywgJ1xcXFxcIicpLnJlcGxhY2UoL1xcJy9nLCAnXFxcXFxcJycpXG4gICAgICAgIGlmIChiaW5kaW5nLnR5cGUgPT09ICd1cmknKSByZXR1cm4gJzwnICsgdmFsdWUgKyAnPidcbiAgICAgICAgZWxzZSBpZiAoYmluZGluZy50eXBlID09PSAnYm5vZGUnKSByZXR1cm4gJ186JyArIHZhbHVlXG4gICAgICAgIGVsc2UgaWYgKGJpbmRpbmcuZGF0YXR5cGUpIHN3aXRjaCAoYmluZGluZy5kYXRhdHlwZSkge1xuICAgICAgICAgIGNhc2UgJ2h0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hI2ludGVnZXInOlxuICAgICAgICAgIGNhc2UgJ2h0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hI2RlY2ltYWwnOlxuICAgICAgICAgIGNhc2UgJ2h0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hI2RvdWJsZSc6XG4gICAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjYm9vbGVhbic6IHJldHVybiB2YWx1ZVxuICAgICAgICAgIGNhc2UgJ2h0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hI3N0cmluZyc6IHJldHVybiAnXCInICsgdmFsdWUgKyAnXCInXG4gICAgICAgICAgZGVmYXVsdDogcmV0dXJuICdcIicgKyB2YWx1ZSArICdcIl5ePCcgKyBiaW5kaW5nLmRhdGF0eXBlICsgJz4nXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYmluZGluZ1sneG1sOmxhbmcnXSkgcmV0dXJuICdcIicgKyB2YWx1ZSArICdcIkAnICsgYmluZGluZ1sneG1sOmxhbmcnXVxuICAgICAgICBlbHNlIHJldHVybiAnXCInICsgdmFsdWUgKyAnXCInXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJGh0dHA6IGFuZ3VsYXIuSUh0dHBTZXJ2aWNlLCBwcml2YXRlICRxOiBhbmd1bGFyLklRU2VydmljZSkge31cbiAgICBwdWJsaWMgY2hlY2soZW5kcG9pbnQ6IHN0cmluZywgcGFyYW1zPzoge30pOiBhbmd1bGFyLklQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgIGxldCBkZWZlcnJlZDogYW5ndWxhci5JRGVmZXJyZWQ8YW55PiA9IHRoaXMuJHEuZGVmZXIoKVxuICAgICAgdGhpcy4kaHR0cChcbiAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgIHVybDogZW5kcG9pbnQsXG4gICAgICAgICAgICBwYXJhbXM6IHsgcXVlcnk6ICdBU0sge30nIH0sXG4gICAgICAgICAgICBoZWFkZXJzOiB7ICdBY2NlcHQnOiAnYXBwbGljYXRpb24vc3BhcnFsLXJlc3VsdHMranNvbicgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcGFyYW1zXG4gICAgICAgIClcbiAgICAgICkudGhlbihcbiAgICAgICAgKHJlc3BvbnNlOiBhbmd1bGFyLklIdHRwUHJvbWlzZUNhbGxiYWNrQXJnPElTcGFycWxBc2tSZXN1bHQ+KSA9PiBkZWZlcnJlZC5yZXNvbHZlKHJlc3BvbnNlLmRhdGEuYm9vbGVhbiA9PT0gdHJ1ZSlcbiAgICAgICwgKHJlc3BvbnNlOiBhbmd1bGFyLklIdHRwUHJvbWlzZUNhbGxiYWNrQXJnPHN0cmluZz4pID0+IGRlZmVycmVkLnJlc29sdmUoZmFsc2UpXG4gICAgICApXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG4gICAgcHVibGljIGNoZWNrVXBkYXRlKGVuZHBvaW50OiBzdHJpbmcsIHBhcmFtcz86IHt9KTogYW5ndWxhci5JUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICBsZXQgZGVmZXJyZWQ6IGFuZ3VsYXIuSURlZmVycmVkPGFueT4gPSB0aGlzLiRxLmRlZmVyKClcbiAgICAgIHRoaXMuJGh0dHAoXG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgdXJsOiBlbmRwb2ludCxcbiAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZScgOiAnYXBwbGljYXRpb24vc3BhcnFsLXVwZGF0ZScgfSxcbiAgICAgICAgICAgIGRhdGE6ICdJTlNFUlQgREFUQSB7fSdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHBhcmFtc1xuICAgICAgICApXG4gICAgICApLnRoZW4oXG4gICAgICAgIChyZXNwb25zZTogYW5ndWxhci5JSHR0cFByb21pc2VDYWxsYmFja0FyZzxzdHJpbmc+KSA9PiBkZWZlcnJlZC5yZXNvbHZlKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjA0KVxuICAgICAgLCAocmVzcG9uc2U6IGFuZ3VsYXIuSUh0dHBQcm9taXNlQ2FsbGJhY2tBcmc8c3RyaW5nPikgPT4gZGVmZXJyZWQucmVzb2x2ZShmYWxzZSlcbiAgICAgIClcbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cbiAgICBwdWJsaWMgY2hlY2tSZXN0KGVuZHBvaW50OiBzdHJpbmcsIHBhcmFtcz86IHt9KTogYW5ndWxhci5JUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICBsZXQgZGVmZXJyZWQ6IGFuZ3VsYXIuSURlZmVycmVkPGFueT4gPSB0aGlzLiRxLmRlZmVyKClcbiAgICAgIHRoaXMuJGh0dHAoXG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgdXJsIDogZW5kcG9pbnQgKyAnP2RlZmF1bHQnLFxuICAgICAgICAgICAgZGF0YSA6ICcnLFxuICAgICAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJyA6ICd0ZXh0L3R1cnRsZScgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcGFyYW1zXG4gICAgICAgIClcbiAgICAgICkudGhlbihcbiAgICAgICAgKHJlc3BvbnNlOiBhbmd1bGFyLklIdHRwUHJvbWlzZUNhbGxiYWNrQXJnPHN0cmluZz4pID0+IGRlZmVycmVkLnJlc29sdmUocmVzcG9uc2Uuc3RhdHVzID09PSAyMDQpXG4gICAgICAsIChyZXNwb25zZTogYW5ndWxhci5JSHR0cFByb21pc2VDYWxsYmFja0FyZzxzdHJpbmc+KSA9PiBkZWZlcnJlZC5yZXNvbHZlKGZhbHNlKVxuICAgICAgKVxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICAgIHB1YmxpYyBnZXQ8VD4oZW5kcG9pbnQ6IHN0cmluZywgZ3JhcGhJUkk/OiBzdHJpbmcsIHBhcmFtcz86IHt9KTogYW5ndWxhci5JSHR0cFByb21pc2U8VD4ge1xuICAgICAgcmV0dXJuIHRoaXMuJGh0dHAoXG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICB1cmwgOiBlbmRwb2ludCxcbiAgICAgICAgICAgIHBhcmFtczogZ3JhcGhJUkkgPyB7IGdyYXBoOiBncmFwaElSSSB9IDogeydkZWZhdWx0JzogJyd9LFxuICAgICAgICAgICAgaGVhZGVyczogeyAnQWNjZXB0JyA6ICd0ZXh0L3R1cnRsZScgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcGFyYW1zXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9XG4gICAgcHVibGljIHBvc3Q8VD4oZW5kcG9pbnQ6IHN0cmluZywgZ3JhcGg6IHN0cmluZywgZ3JhcGhJUkk/OiBzdHJpbmcsIHBhcmFtcz86IHt9KTogYW5ndWxhci5JSHR0cFByb21pc2U8VD4ge1xuICAgICAgcmV0dXJuIHRoaXMuJGh0dHAoXG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgdXJsIDogZW5kcG9pbnQsXG4gICAgICAgICAgICBwYXJhbXM6IGdyYXBoSVJJID8geyBncmFwaDogZ3JhcGhJUkkgfSA6IHsnZGVmYXVsdCc6ICcnfSxcbiAgICAgICAgICAgIGRhdGE6IGdyYXBoLFxuICAgICAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJyA6ICd0ZXh0L3R1cnRsZScgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcGFyYW1zXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9XG4gICAgcHVibGljIHB1dDxUPihlbmRwb2ludDogc3RyaW5nLCBncmFwaDogc3RyaW5nLCBncmFwaElSST86IHN0cmluZywgcGFyYW1zPzoge30pOiBhbmd1bGFyLklIdHRwUHJvbWlzZTxUPiB7XG4gICAgICByZXR1cm4gdGhpcy4kaHR0cChcbiAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyxcbiAgICAgICAgICAgIHVybCA6IGVuZHBvaW50LFxuICAgICAgICAgICAgcGFyYW1zOiBncmFwaElSSSA/IHsgZ3JhcGg6IGdyYXBoSVJJIH0gOiB7J2RlZmF1bHQnOiAnJ30sXG4gICAgICAgICAgICBkYXRhOiBncmFwaCxcbiAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZScgOiAndGV4dC90dXJ0bGUnIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHBhcmFtc1xuICAgICAgICApXG4gICAgICApXG4gICAgfVxuICAgIHB1YmxpYyBkZWxldGU8VD4oZW5kcG9pbnQ6IHN0cmluZywgZ3JhcGhJUkk6IHN0cmluZywgcGFyYW1zPzoge30pOiBhbmd1bGFyLklIdHRwUHJvbWlzZTxUPiB7XG4gICAgICByZXR1cm4gdGhpcy4kaHR0cChcbiAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgICAgIHVybDogZW5kcG9pbnQsXG4gICAgICAgICAgICBwYXJhbXM6IGdyYXBoSVJJID8geyBncmFwaDogZ3JhcGhJUkkgfSA6IHsnZGVmYXVsdCc6ICcnfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcGFyYW1zXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9XG4gICAgcHVibGljIHF1ZXJ5PFQgZXh0ZW5kcyB7W2lkOiBzdHJpbmddOiBJU3BhcnFsQmluZGluZ30+KGVuZHBvaW50OiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcsIHBhcmFtcz86IHt9KTogYW5ndWxhci5JSHR0cFByb21pc2U8SVNwYXJxbEJpbmRpbmdSZXN1bHQ8VD4+IHtcbiAgICAgIGlmIChxdWVyeS5sZW5ndGggPD0gMjA0OClcbiAgICAgICAgcmV0dXJuIHRoaXMuJGh0dHAoXG4gICAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgIHVybDogZW5kcG9pbnQsXG4gICAgICAgICAgICAgIHBhcmFtczogeyBxdWVyeTogcXVlcnkgfSxcbiAgICAgICAgICAgICAgaGVhZGVyczogeyAnQWNjZXB0JyA6ICdhcHBsaWNhdGlvbi9zcGFycWwtcmVzdWx0cytqc29uJyB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGFyYW1zXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiB0aGlzLiRodHRwKFxuICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgICAgdXJsOiBlbmRwb2ludCxcbiAgICAgICAgICAgICAgZGF0YTogJ3F1ZXJ5PScgKyBlbmNvZGVVUklDb21wb25lbnQocXVlcnkpLFxuICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdBY2NlcHQnIDogJ2FwcGxpY2F0aW9uL3NwYXJxbC1yZXN1bHRzK2pzb24nXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXJhbXNcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICB9XG4gICAgcHVibGljIGNvbnN0cnVjdDxUPihlbmRwb2ludDogc3RyaW5nLCBxdWVyeTogc3RyaW5nLCBwYXJhbXM/OiB7fSk6IGFuZ3VsYXIuSUh0dHBQcm9taXNlPFQ+IHtcbiAgICAgIGlmIChxdWVyeS5sZW5ndGggPD0gMjA0OClcbiAgICAgICAgcmV0dXJuIHRoaXMuJGh0dHAoXG4gICAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgIHVybCA6IGVuZHBvaW50LFxuICAgICAgICAgICAgICBwYXJhbXM6IHsgcXVlcnk6IHF1ZXJ5IH0sXG4gICAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0FjY2VwdCcgOiAndGV4dC90dXJ0bGUnIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXJhbXNcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIHRoaXMuJGh0dHAoXG4gICAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICB1cmw6IGVuZHBvaW50LFxuICAgICAgICAgICAgICBkYXRhOiBxdWVyeSxcbiAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vc3BhcnFsLXF1ZXJ5JyxcbiAgICAgICAgICAgICAgICAnQWNjZXB0JyA6ICd0ZXh0L3R1cnRsZSdcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhcmFtc1xuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgIH1cbiAgICBwdWJsaWMgdXBkYXRlPFQ+KGVuZHBvaW50OiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcsIHBhcmFtcz86IHt9KTogYW5ndWxhci5JSHR0cFByb21pc2U8VD4ge1xuICAgICAgcmV0dXJuIHRoaXMuJGh0dHAoXG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgdXJsOiBlbmRwb2ludCxcbiAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZScgOiAnYXBwbGljYXRpb24vc3BhcnFsLXVwZGF0ZScgfSxcbiAgICAgICAgICAgIGRhdGE6IHF1ZXJ5XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwYXJhbXNcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH1cbiAgfVxufVxuIl19
