angular.module('fi.seco.sparql', []);
var fi;
(function (fi) {
    var seco;
    (function (seco) {
        var sparql;
        (function (sparql) {
            'use strict';
            var BindingsToObjectConfiguration = (function () {
                function BindingsToObjectConfiguration() {
                }
                return BindingsToObjectConfiguration;
            }());
            sparql.BindingsToObjectConfiguration = BindingsToObjectConfiguration;
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
                SparqlService.bindingsToObject = function (result, reto, config) {
                    if (reto === void 0) { reto = {}; }
                    var _loop_1 = function (key) {
                        var ret = reto;
                        if (config && config.subObjectPrefixes) {
                            var changed_1;
                            do {
                                changed_1 = false;
                                config.subObjectPrefixes.forEach(function (sop) {
                                    if (key.indexOf(sop) === 0) {
                                        ret = ret[sop];
                                        key = key.substring(sop.length);
                                        changed_1 = true;
                                    }
                                });
                            } while (changed_1);
                        }
                        if (config && config.propertyTypeMap[key]) {
                            switch (config.propertyTypeMap[key]) {
                                case 'native':
                                    ret[key] = SparqlService.bindingToValue(result[key]);
                                    break;
                                case 'node':
                                    ret[key] = result[key];
                                    break;
                                case 'array':
                                    if (!Array.isArray(ret[key]))
                                        ret[key] = [];
                                    ret[key].push(SparqlService.bindingToValue(result[key]));
                                    break;
                                case 'object':
                                    if (!ret[key])
                                        ret[key] = {};
                                    if (result[key].type === 'literal') {
                                        var key2 = result[key].datatype;
                                        if (!key2) {
                                            key2 = result[key]['xml:lang'];
                                            if (!key2)
                                                key2 = '';
                                        }
                                        ret[key][key2] = result[key].value;
                                    }
                                    else
                                        ret[key][result[key].value] = result[key].value;
                                    break;
                                case 'ignore': break;
                                default: throw 'Shouldn\'t happen';
                            }
                        }
                        else if (!ret[key])
                            ret[key] = SparqlService.bindingToValue(result[key]);
                        else if (Array.isArray(ret[key]))
                            ret[key].push(SparqlService.bindingToValue(result[key]));
                        else if (typeof (ret[key]) === 'object' && result[key]) {
                            if (result[key].type === 'literal') {
                                var key2 = result[key].datatype;
                                if (!key2) {
                                    key2 = result[key]['xml:lang'];
                                    if (!key2)
                                        key2 = '';
                                }
                                ret[key][key2] = result[key].value;
                            }
                            else
                                ret[key][result[key].value] = result[key].value;
                        }
                    };
                    for (var key in result) {
                        _loop_1(key);
                    }
                    return reto;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zcGFycWwtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQ3BDLElBQVUsRUFBRSxDQWlUWDtBQWpURCxXQUFVLEVBQUU7SUFBQyxJQUFBLElBQUksQ0FpVGhCO0lBalRZLFdBQUEsSUFBSTtRQUFDLElBQUEsTUFBTSxDQWlUdkI7UUFqVGlCLFdBQUEsTUFBTTtZQUN0QixZQUFZLENBQUE7WUF1Qlo7Z0JBQUE7Z0JBR0EsQ0FBQztnQkFBRCxvQ0FBQztZQUFELENBSEEsQUFHQyxJQUFBO1lBSFksb0NBQTZCLGdDQUd6QyxDQUFBO1lBRUQ7Z0JBZ0dFLHVCQUFvQixLQUEyQixFQUFVLEVBQXFCO29CQUExRCxVQUFLLEdBQUwsS0FBSyxDQUFzQjtvQkFBVSxPQUFFLEdBQUYsRUFBRSxDQUFtQjtnQkFBRyxDQUFDO2dCQS9GcEUsa0NBQW9CLEdBQWxDLFVBQW1DLE1BQU07b0JBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsTUFBTTt5QkFDaEIsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUM7eUJBQ3RCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDO3lCQUNwQixPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQzt5QkFDckIsT0FBTyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7eUJBQ3JCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO3lCQUNyQixPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQzswQkFDcEIsR0FBRyxDQUFBO2dCQUNULENBQUM7Z0JBQ2EsOEJBQWdCLEdBQTlCLFVBQWtDLE1BQXNDLEVBQUUsSUFBYSxFQUFFLE1BQXNDO29CQUFyRCxxQkFBQSxFQUFBLFNBQWE7NENBQzVFLEdBQUc7d0JBQ1YsSUFBSSxHQUFHLEdBQU8sSUFBSSxDQUFBO3dCQUNsQixFQUFFLENBQUMsQ0FBQyxNQUFNLElB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Q0FBQztnQkFDSCxvQkFBQztZQUFELENBblJBLEFBbVJDLElBQUE7WUFuUlksb0JBQWEsZ0JBbVJ6QixDQUFBO1FBQ0gsQ0FBQyxFQWpUaUIsTUFBTSxHQUFOLFdBQU0sS0FBTixXQUFNLFFBaVR2QjtJQUFELENBQUMsRUFqVFksSUFBSSxHQUFKLE9BQUksS0FBSixPQUFJLFFBaVRoQjtBQUFELENBQUMsRUFqVFMsRUFBRSxLQUFGLEVBQUUsUUFpVFgiLCJmaWxlIjoic3BhcnFsLXNlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgnZmkuc2Vjby5zcGFycWwnLCBbXSlcbm5hbWVzcGFjZSBmaS5zZWNvLnNwYXJxbCB7XG4gICd1c2Ugc3RyaWN0J1xuXG4gIGV4cG9ydCBpbnRlcmZhY2UgSVNwYXJxbEJpbmRpbmcge1xuICAgIHR5cGU6ICd1cmknIHwgJ2Jub2RlJyB8ICdsaXRlcmFsJyxcbiAgICB2YWx1ZTogc3RyaW5nLFxuICAgICd4bWw6bGFuZyc/OiBzdHJpbmcsXG4gICAgZGF0YXR5cGU/OiBzdHJpbmdcbiAgfVxuXG4gIGV4cG9ydCBpbnRlcmZhY2UgSVNwYXJxbEJpbmRpbmdSZXN1bHQ8QmluZGluZ1R5cGUgZXh0ZW5kcyB7W2lkOiBzdHJpbmddOiBJU3BhcnFsQmluZGluZ30+IHtcbiAgICBoZWFkOiB7XG4gICAgICB2YXJzOiBzdHJpbmdbXSxcbiAgICAgIGxpbms/OiBzdHJpbmdbXVxuICAgIH0sXG4gICAgcmVzdWx0czoge1xuICAgICAgYmluZGluZ3M6IEJpbmRpbmdUeXBlW11cbiAgICB9XG4gIH1cblxuICBleHBvcnQgaW50ZXJmYWNlIElTcGFycWxBc2tSZXN1bHQge1xuICAgIGJvb2xlYW46IGJvb2xlYW5cbiAgfVxuXG4gIGV4cG9ydCBjbGFzcyBCaW5kaW5nc1RvT2JqZWN0Q29uZmlndXJhdGlvbiB7XG4gICAgcHVibGljIHN1Yk9iamVjdFByZWZpeGVzPzogc3RyaW5nW11cbiAgICBwdWJsaWMgcHJvcGVydHlUeXBlTWFwPzoge1twcm9wZXJ0eTogc3RyaW5nXTogJ2lnbm9yZScgfCAnbmF0aXZlJyB8ICdhcnJheScgfCAnb2JqZWN0JyB8ICdub2RlJ31cbiAgfVxuXG4gIGV4cG9ydCBjbGFzcyBTcGFycWxTZXJ2aWNlIHtcbiAgICBwdWJsaWMgc3RhdGljIHN0cmluZ1RvU1BBUlFMU3RyaW5nKHN0cmluZyk6IHN0cmluZyB7XG4gICAgICByZXR1cm4gJ1wiJyArIHN0cmluZ1xuICAgICAgICAucmVwbGFjZSgvXFxcXC9nLCAnXFxcXFxcXFwnKVxuICAgICAgICAucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpXG4gICAgICAgIC5yZXBsYWNlKC9cXG4vZywgJ1xcXFxuJylcbiAgICAgICAgLnJlcGxhY2UoL1xcdC9nLCAnXFxcXHQnKVxuICAgICAgICAucmVwbGFjZSgvXFxyL2csICdcXFxccicpXG4gICAgICAgIC5yZXBsYWNlKC9cXGYvZywgJ1xcXFxmJylcbiAgICAgICAgKyAnXCInXG4gICAgfVxuICAgIHB1YmxpYyBzdGF0aWMgYmluZGluZ3NUb09iamVjdDxUPihyZXN1bHQ6IHtbaWQ6IHN0cmluZ106IElTcGFycWxCaW5kaW5nfSwgcmV0bzoge30gPSB7fSwgY29uZmlnPzogQmluZGluZ3NUb09iamVjdENvbmZpZ3VyYXRpb24pOiBUIHtcbiAgICAgIGZvciAobGV0IGtleSBpbiByZXN1bHQpIHtcbiAgICAgICAgbGV0IHJldDoge30gPSByZXRvXG4gICAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLnN1Yk9iamVjdFByZWZpeGVzKSB7XG4gICAgICAgICAgbGV0IGNoYW5nZWQ6IGJvb2xlYW5cbiAgICAgICAgICBkbyB7XG4gICAgICAgICAgICBjaGFuZ2VkID0gZmFsc2VcbiAgICAgICAgICAgIGNvbmZpZy5zdWJPYmplY3RQcmVmaXhlcy5mb3JFYWNoKHNvcCA9PiB7XG4gICAgICAgICAgICAgIGlmIChrZXkuaW5kZXhPZihzb3ApID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0ID0gcmV0W3NvcF3CoFxuICAgICAgICAgICAgICAgIGtleSA9IGtleS5zdWJzdHJpbmcoc29wLmxlbmd0aClcbiAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0gd2hpbGUgKGNoYW5nZWQpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcucHJvcGVydHlUeXBlTWFwW2tleV0pIHtcbiAgICAgICAgICBzd2l0Y2ggKGNvbmZpZy5wcm9wZXJ0eVR5cGVNYXBba2V5XSkge1xuICAgICAgICAgICAgY2FzZSAnbmF0aXZlJzogcmV0W2tleV0gPSBTcGFycWxTZXJ2aWNlLmJpbmRpbmdUb1ZhbHVlKHJlc3VsdFtrZXldKTsgYnJlYWtcbiAgICAgICAgICAgIGNhc2UgJ25vZGUnOiByZXRba2V5XSA9IHJlc3VsdFtrZXldOyBicmVha1xuICAgICAgICAgICAgY2FzZSAnYXJyYXknOlxuICAgICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocmV0W2tleV0pKSByZXRba2V5XSA9IFtdXG4gICAgICAgICAgICAgIHJldFtrZXldLnB1c2goU3BhcnFsU2VydmljZS5iaW5kaW5nVG9WYWx1ZShyZXN1bHRba2V5XSkpXG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICAgICAgICBpZiAoIXJldFtrZXldKSByZXRba2V5XSA9IHt9XG4gICAgICAgICAgICAgIGlmIChyZXN1bHRba2V5XS50eXBlID09PSAnbGl0ZXJhbCcpIHtcbiAgICAgICAgICAgICAgICBsZXQga2V5Mjogc3RyaW5nID0gcmVzdWx0W2tleV0uZGF0YXR5cGVcbiAgICAgICAgICAgICAgICBpZiAoIWtleTIpIHtcbiAgICAgICAgICAgICAgICAgIGtleTIgPSByZXN1bHRba2V5XVsneG1sOmxhbmcnXVxuICAgICAgICAgICAgICAgICAgaWYgKCFrZXkyKSBrZXkyID0gJydcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0W2tleV1ba2V5Ml0gPSByZXN1bHRba2V5XS52YWx1ZVxuICAgICAgICAgICAgICB9IGVsc2UgcmV0W2tleV1bcmVzdWx0W2tleV0udmFsdWVdID0gcmVzdWx0W2tleV0udmFsdWVcbiAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGNhc2UgJ2lnbm9yZSc6IGJyZWFrXG4gICAgICAgICAgICBkZWZhdWx0OiB0aHJvdyAnU2hvdWxkblxcJ3QgaGFwcGVuJ1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghcmV0W2tleV0pIHJldFtrZXldID0gU3BhcnFsU2VydmljZS5iaW5kaW5nVG9WYWx1ZShyZXN1bHRba2V5XSlcbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXRba2V5XSkpIHJldFtrZXldLnB1c2goU3BhcnFsU2VydmljZS5iaW5kaW5nVG9WYWx1ZShyZXN1bHRba2V5XSkpXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZihyZXRba2V5XSkgPT09ICdvYmplY3QnICYmIHJlc3VsdFtrZXldKSB7XG4gICAgICAgICAgaWYgKHJlc3VsdFtrZXldLnR5cGUgPT09ICdsaXRlcmFsJykge1xuICAgICAgICAgICAgbGV0IGtleTI6IHN0cmluZyA9IHJlc3VsdFtrZXldLmRhdGF0eXBlXG4gICAgICAgICAgICBpZiAoIWtleTIpIHtcbiAgICAgICAgICAgICAga2V5MiA9IHJlc3VsdFtrZXldWyd4bWw6bGFuZyddXG4gICAgICAgICAgICAgIGlmICgha2V5Mikga2V5MiA9ICcnXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXRba2V5XVtrZXkyXSA9IHJlc3VsdFtrZXldLnZhbHVlXG4gICAgICAgICAgfSBlbHNlIHJldFtrZXldW3Jlc3VsdFtrZXldLnZhbHVlXSA9IHJlc3VsdFtrZXldLnZhbHVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiA8VD5yZXRvXG4gICAgfVxuICAgIHB1YmxpYyBzdGF0aWMgYmluZGluZ1RvVmFsdWUoYmluZGluZzogSVNwYXJxbEJpbmRpbmcpOiBhbnkge1xuICAgICAgaWYgKCFiaW5kaW5nKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgICBpZiAoYmluZGluZy50eXBlID09PSAndXJpJykgcmV0dXJuIGJpbmRpbmcudmFsdWVcbiAgICAgIGVsc2UgaWYgKGJpbmRpbmcudHlwZSA9PT0gJ2Jub2RlJykgcmV0dXJuIGJpbmRpbmcudmFsdWVcbiAgICAgIGVsc2UgaWYgKGJpbmRpbmcuZGF0YXR5cGUpIHN3aXRjaCAoYmluZGluZy5kYXRhdHlwZSkge1xuICAgICAgICBjYXNlICdodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYSNpbnRlZ2VyJzpcbiAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjZGVjaW1hbCc6IHJldHVybiBwYXJzZUludChiaW5kaW5nLnZhbHVlLCAxMClcbiAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjZmxvYXQnOlxuICAgICAgICBjYXNlICdodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYSNkb3VibGUnOiByZXR1cm4gcGFyc2VGbG9hdChiaW5kaW5nLnZhbHVlKVxuICAgICAgICBjYXNlICdodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYSNib29sZWFuJzogcmV0dXJuIGJpbmRpbmcudmFsdWUgPyB0cnVlIDogZmFsc2VcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgIH1cbiAgICAgIHJldHVybiBiaW5kaW5nLnZhbHVlXG4gICAgfVxuICAgIHB1YmxpYyBzdGF0aWMgYmluZGluZ1RvU3RyaW5nKGJpbmRpbmc6IElTcGFycWxCaW5kaW5nKTogc3RyaW5nIHtcbiAgICAgIGlmICghYmluZGluZykgcmV0dXJuICdVTkRFRidcbiAgICAgIGVsc2Uge1xuICAgICAgICBsZXQgdmFsdWU6IHN0cmluZyA9IGJpbmRpbmcudmFsdWUucmVwbGFjZSgvXFxcXC9nLCAnXFxcXFxcXFwnKS5yZXBsYWNlKC9cXHQvZywgJ1xcXFx0JykucmVwbGFjZSgvXFxuL2csICdcXFxcbicpLnJlcGxhY2UoL1xcci9nLCAnXFxcXHInKS5yZXBsYWNlKC9bXFxiXS9nLCAnXFxcXGInKS5yZXBsYWNlKC9cXGYvZywgJ1xcXFxmJykucmVwbGFjZSgvXFxcIi9nLCAnXFxcXFwiJykucmVwbGFjZSgvXFwnL2csICdcXFxcXFwnJylcbiAgICAgICAgaWYgKGJpbmRpbmcudHlwZSA9PT0gJ3VyaScpIHJldHVybiAnPCcgKyB2YWx1ZSArICc+J1xuICAgICAgICBlbHNlIGlmIChiaW5kaW5nLnR5cGUgPT09ICdibm9kZScpIHJldHVybiAnXzonICsgdmFsdWVcbiAgICAgICAgZWxzZSBpZiAoYmluZGluZy5kYXRhdHlwZSkgc3dpdGNoIChiaW5kaW5nLmRhdGF0eXBlKSB7XG4gICAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjaW50ZWdlcic6XG4gICAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjZGVjaW1hbCc6XG4gICAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjZG91YmxlJzpcbiAgICAgICAgICBjYXNlICdodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYSNib29sZWFuJzogcmV0dXJuIHZhbHVlXG4gICAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjc3RyaW5nJzogcmV0dXJuICdcIicgKyB2YWx1ZSArICdcIidcbiAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gJ1wiJyArIHZhbHVlICsgJ1wiXl48JyArIGJpbmRpbmcuZGF0YXR5cGUgKyAnPidcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChiaW5kaW5nWyd4bWw6bGFuZyddKSByZXR1cm4gJ1wiJyArIHZhbHVlICsgJ1wiQCcgKyBiaW5kaW5nWyd4bWw6bGFuZyddXG4gICAgICAgIGVsc2UgcmV0dXJuICdcIicgKyB2YWx1ZSArICdcIidcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSAkaHR0cDogYW5ndWxhci5JSHR0cFNlcnZpY2UsIHByaXZhdGUgJHE6IGFuZ3VsYXIuSVFTZXJ2aWNlKSB7fVxuICAgIHB1YmxpYyBjaGVjayhlbmRwb2ludDogc3RyaW5nLCBwYXJhbXM/OiB7fSk6IGFuZ3VsYXIuSVByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgbGV0IGRlZmVycmVkOiBhbmd1bGFyLklEZWZlcnJlZDxhbnk+ID0gdGhpcy4kcS5kZWZlcigpXG4gICAgICB0aGlzLiRodHRwKFxuICAgICAgICBhbmd1bGFyLmV4dGVuZChcbiAgICAgICAgICB7XG4gICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgdXJsOiBlbmRwb2ludCxcbiAgICAgICAgICAgIHBhcmFtczogeyBxdWVyeTogJ0FTSyB7fScgfSxcbiAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9zcGFycWwtcmVzdWx0cytqc29uJyB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwYXJhbXNcbiAgICAgICAgKVxuICAgICAgKS50aGVuKFxuICAgICAgICAocmVzcG9uc2U6IGFuZ3VsYXIuSUh0dHBQcm9taXNlQ2FsbGJhY2tBcmc8SVNwYXJxbEFza1Jlc3VsdD4pID0+IGRlZmVycmVkLnJlc29sdmUocmVzcG9uc2UuZGF0YS5ib29sZWFuID09PSB0cnVlKVxuICAgICAgLCAocmVzcG9uc2U6IGFuZ3VsYXIuSUh0dHBQcm9taXNlQ2FsbGJhY2tBcmc8c3RyaW5nPikgPT4gZGVmZXJyZWQucmVzb2x2ZShmYWxzZSlcbiAgICAgIClcbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cbiAgICBwdWJsaWMgY2hlY2tVcGRhdGUoZW5kcG9pbnQ6IHN0cmluZywgcGFyYW1zPzoge30pOiBhbmd1bGFyLklQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgIGxldCBkZWZlcnJlZDogYW5ndWxhci5JRGVmZXJyZWQ8YW55PiA9IHRoaXMuJHEuZGVmZXIoKVxuICAgICAgdGhpcy4kaHR0cChcbiAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmw6IGVuZHBvaW50LFxuICAgICAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJyA6ICdhcHBsaWNhdGlvbi9zcGFycWwtdXBkYXRlJyB9LFxuICAgICAgICAgICAgZGF0YTogJ0lOU0VSVCBEQVRBIHt9J1xuICAgICAgICAgIH0sXG4gICAgICAgICAgcGFyYW1zXG4gICAgICAgIClcbiAgICAgICkudGhlbihcbiAgICAgICAgKHJlc3BvbnNlOiBhbmd1bGFyLklIdHRwUHJvbWlzZUNhbGxiYWNrQXJnPHN0cmluZz4pID0+IGRlZmVycmVkLnJlc29sdmUocmVzcG9uc2Uuc3RhdHVzID09PSAyMDQpXG4gICAgICAsIChyZXNwb25zZTogYW5ndWxhci5JSHR0cFByb21pc2VDYWxsYmFja0FyZzxzdHJpbmc+KSA9PiBkZWZlcnJlZC5yZXNvbHZlKGZhbHNlKVxuICAgICAgKVxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICAgIHB1YmxpYyBjaGVja1Jlc3QoZW5kcG9pbnQ6IHN0cmluZywgcGFyYW1zPzoge30pOiBhbmd1bGFyLklQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgIGxldCBkZWZlcnJlZDogYW5ndWxhci5JRGVmZXJyZWQ8YW55PiA9IHRoaXMuJHEuZGVmZXIoKVxuICAgICAgdGhpcy4kaHR0cChcbiAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmwgOiBlbmRwb2ludCArICc/ZGVmYXVsdCcsXG4gICAgICAgICAgICBkYXRhIDogJycsXG4gICAgICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnIDogJ3RleHQvdHVydGxlJyB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwYXJhbXNcbiAgICAgICAgKVxuICAgICAgKS50aGVuKFxuICAgICAgICAocmVzcG9uc2U6IGFuZ3VsYXIuSUh0dHBQcm9taXNlQ2FsbGJhY2tBcmc8c3RyaW5nPikgPT4gZGVmZXJyZWQucmVzb2x2ZShyZXNwb25zZS5zdGF0dXMgPT09IDIwNClcbiAgICAgICwgKHJlc3BvbnNlOiBhbmd1bGFyLklIdHRwUHJvbWlzZUNhbGxiYWNrQXJnPHN0cmluZz4pID0+IGRlZmVycmVkLnJlc29sdmUoZmFsc2UpXG4gICAgICApXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG4gICAgcHVibGljIGdldDxUPihlbmRwb2ludDogc3RyaW5nLCBncmFwaElSST86IHN0cmluZywgcGFyYW1zPzoge30pOiBhbmd1bGFyLklIdHRwUHJvbWlzZTxUPiB7XG4gICAgICByZXR1cm4gdGhpcy4kaHR0cChcbiAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgIHVybCA6IGVuZHBvaW50LFxuICAgICAgICAgICAgcGFyYW1zOiBncmFwaElSSSA/IHsgZ3JhcGg6IGdyYXBoSVJJIH0gOiB7J2RlZmF1bHQnOiAnJ30sXG4gICAgICAgICAgICBoZWFkZXJzOiB7ICdBY2NlcHQnIDogJ3RleHQvdHVydGxlJyB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwYXJhbXNcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH1cbiAgICBwdWJsaWMgcG9zdDxUPihlbmRwb2ludDogc3RyaW5nLCBncmFwaDogc3RyaW5nLCBncmFwaElSST86IHN0cmluZywgcGFyYW1zPzoge30pOiBhbmd1bGFyLklIdHRwUHJvbWlzZTxUPiB7XG4gICAgICByZXR1cm4gdGhpcy4kaHR0cChcbiAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmwgOiBlbmRwb2ludCxcbiAgICAgICAgICAgIHBhcmFtczogZ3JhcGhJUkkgPyB7IGdyYXBoOiBncmFwaElSSSB9IDogeydkZWZhdWx0JzogJyd9LFxuICAgICAgICAgICAgZGF0YTogZ3JhcGgsXG4gICAgICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnIDogJ3RleHQvdHVydGxlJyB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwYXJhbXNcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH1cbiAgICBwdWJsaWMgcHV0PFQ+KGVuZHBvaW50OiBzdHJpbmcsIGdyYXBoOiBzdHJpbmcsIGdyYXBoSVJJPzogc3RyaW5nLCBwYXJhbXM/OiB7fSk6IGFuZ3VsYXIuSUh0dHBQcm9taXNlPFQ+IHtcbiAgICAgIHJldHVybiB0aGlzLiRodHRwKFxuICAgICAgICBhbmd1bGFyLmV4dGVuZChcbiAgICAgICAgICB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQVVQnLFxuICAgICAgICAgICAgdXJsIDogZW5kcG9pbnQsXG4gICAgICAgICAgICBwYXJhbXM6IGdyYXBoSVJJID8geyBncmFwaDogZ3JhcGhJUkkgfSA6IHsnZGVmYXVsdCc6ICcnfSxcbiAgICAgICAgICAgIGRhdGE6IGdyYXBoLFxuICAgICAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJyA6ICd0ZXh0L3R1cnRsZScgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcGFyYW1zXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9XG4gICAgcHVibGljIGRlbGV0ZTxUPihlbmRwb2ludDogc3RyaW5nLCBncmFwaElSSTogc3RyaW5nLCBwYXJhbXM/OiB7fSk6IGFuZ3VsYXIuSUh0dHBQcm9taXNlPFQ+IHtcbiAgICAgIHJldHVybiB0aGlzLiRodHRwKFxuICAgICAgICBhbmd1bGFyLmV4dGVuZChcbiAgICAgICAgICB7XG4gICAgICAgICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgICAgICAgdXJsOiBlbmRwb2ludCxcbiAgICAgICAgICAgIHBhcmFtczogZ3JhcGhJUkkgPyB7IGdyYXBoOiBncmFwaElSSSB9IDogeydkZWZhdWx0JzogJyd9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwYXJhbXNcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH1cbiAgICBwdWJsaWMgcXVlcnk8VCBleHRlbmRzIHtbaWQ6IHN0cmluZ106IElTcGFycWxCaW5kaW5nfT4oZW5kcG9pbnQ6IHN0cmluZywgcXVlcnk6IHN0cmluZywgcGFyYW1zPzoge30pOiBhbmd1bGFyLklIdHRwUHJvbWlzZTxJU3BhcnFsQmluZGluZ1Jlc3VsdDxUPj4ge1xuICAgICAgaWYgKHF1ZXJ5Lmxlbmd0aCA8PSAyMDQ4KVxuICAgICAgICByZXR1cm4gdGhpcy4kaHR0cChcbiAgICAgICAgICBhbmd1bGFyLmV4dGVuZChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgdXJsOiBlbmRwb2ludCxcbiAgICAgICAgICAgICAgcGFyYW1zOiB7IHF1ZXJ5OiBxdWVyeSB9LFxuICAgICAgICAgICAgICBoZWFkZXJzOiB7ICdBY2NlcHQnIDogJ2FwcGxpY2F0aW9uL3NwYXJxbC1yZXN1bHRzK2pzb24nIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXJhbXNcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIHRoaXMuJGh0dHAoXG4gICAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICB1cmw6IGVuZHBvaW50LFxuICAgICAgICAgICAgICBkYXRhOiAncXVlcnk9JyArIGVuY29kZVVSSUNvbXBvbmVudChxdWVyeSksXG4gICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0FjY2VwdCcgOiAnYXBwbGljYXRpb24vc3BhcnFsLXJlc3VsdHMranNvbidcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhcmFtc1xuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgIH1cbiAgICBwdWJsaWMgY29uc3RydWN0PFQ+KGVuZHBvaW50OiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcsIHBhcmFtcz86IHt9KTogYW5ndWxhci5JSHR0cFByb21pc2U8VD4ge1xuICAgICAgaWYgKHF1ZXJ5Lmxlbmd0aCA8PSAyMDQ4KVxuICAgICAgICByZXR1cm4gdGhpcy4kaHR0cChcbiAgICAgICAgICBhbmd1bGFyLmV4dGVuZChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgdXJsIDogZW5kcG9pbnQsXG4gICAgICAgICAgICAgIHBhcmFtczogeyBxdWVyeTogcXVlcnkgfSxcbiAgICAgICAgICAgICAgaGVhZGVyczogeyAnQWNjZXB0JyA6ICd0ZXh0L3R1cnRsZScgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhcmFtc1xuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gdGhpcy4kaHR0cChcbiAgICAgICAgICBhbmd1bGFyLmV4dGVuZChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgIHVybDogZW5kcG9pbnQsXG4gICAgICAgICAgICAgIGRhdGE6IHF1ZXJ5LFxuICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9zcGFycWwtcXVlcnknLFxuICAgICAgICAgICAgICAgICdBY2NlcHQnIDogJ3RleHQvdHVydGxlJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGFyYW1zXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgfVxuICAgIHB1YmxpYyB1cGRhdGU8VD4oZW5kcG9pbnQ6IHN0cmluZywgcXVlcnk6IHN0cmluZywgcGFyYW1zPzoge30pOiBhbmd1bGFyLklIdHRwUHJvbWlzZTxUPiB7XG4gICAgICByZXR1cm4gdGhpcy4kaHR0cChcbiAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmw6IGVuZHBvaW50LFxuICAgICAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJyA6ICdhcHBsaWNhdGlvbi9zcGFycWwtdXBkYXRlJyB9LFxuICAgICAgICAgICAgZGF0YTogcXVlcnlcbiAgICAgICAgICB9LFxuICAgICAgICAgIHBhcmFtc1xuICAgICAgICApXG4gICAgICApXG4gICAgfVxuICB9XG59XG4iXX0=
