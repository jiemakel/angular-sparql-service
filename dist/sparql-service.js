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
                SparqlService.bindingsToObject = function (result, reto, subObjectPrefixes) {
                    if (reto === void 0) { reto = {}; }
                    var _loop_1 = function (key) {
                        var ret = reto;
                        if (subObjectPrefixes) {
                            var changed_1;
                            do {
                                changed_1 = false;
                                subObjectPrefixes.forEach(function (sop) {
                                    if (key.indexOf(sop) === 0) {
                                        ret = ret[sop];
                                        key = key.substring(sop.length);
                                        changed_1 = true;
                                    }
                                });
                            } while (changed_1);
                        }
                        if (!ret[key])
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zcGFycWwtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQ3BDLElBQVUsRUFBRSxDQXNSWDtBQXRSRCxXQUFVLEVBQUU7SUFBQyxJQUFBLElBQUksQ0FzUmhCO0lBdFJZLFdBQUEsSUFBSTtRQUFDLElBQUEsTUFBTSxDQXNSdkI7UUF0UmlCLFdBQUEsTUFBTTtZQUN0QixZQUFZLENBQUE7WUF1Qlo7Z0JBMEVFLHVCQUFvQixLQUEyQixFQUFVLEVBQXFCO29CQUExRCxVQUFLLEdBQUwsS0FBSyxDQUFzQjtvQkFBVSxPQUFFLEdBQUYsRUFBRSxDQUFtQjtnQkFBRyxDQUFDO2dCQXpFcEUsa0NBQW9CLEdBQWxDLFVBQW1DLE1BQU07b0JBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsTUFBTTt5QkFDaEIsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUM7eUJBQ3RCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDO3lCQUNwQixPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQzt5QkFDckIsT0FBTyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7eUJBQ3JCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO3lCQUNyQixPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQzswQkFDcEIsR0FBRyxDQUFBO2dCQUNULENBQUM7Z0JBQ2EsOEJBQWdCLEdBQTlCLFVBQWtDLE1BQXNDLEVBQUUsSUFBYSxFQUFFLGlCQUE0QjtvQkFBM0MscUJBQUEsRUFBQSxTQUFhOzRDQUM1RSxHQUFHO3dCQUNWLElBQUksR0FBRyxHQUFPLElBQUksQ0FBQTt3QkFDbEIsRUFBRSxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDOzRCQUN0QixJQUFJLFNBQWdCLENBQUE7NEJBQ3BCLEdBQUcsQ0FBQztnQ0FDRixTQUFPLEdBQUcsS0FBSyxD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QkFDWCxPQUFPLEVBQUU7Z0NBQ1AsY0FBYyxFQUFFLDBCQUEwQjtnQ0FDMUMsUUFBUSxFQUFHLGFBQWE7NkJBQ3pCO3lCQUNGLEVBQ0QsTUFBTSxDQUNQLENBQ0YsQ0FBQTtnQkFDTCxDQUFDO2dCQUNNLDhCQUFNLEdBQWIsVUFBaUIsUUFBZ0IsRUFBRSxLQUFhLEVBQUUsTUFBVztvQkFDM0QsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQ2YsT0FBTyxDQUFDLE1BQU0sQ0FDWjt3QkFDRSxNQUFNLEVBQUUsTUFBTTt3QkFDZCxHQUFHLEVBQUUsUUFBUTt3QkFDYixPQUFPLEVBQUUsRUFBRSxjQUFjLEVBQUcsMkJBQTJCLEVBQUU7d0JBQ3pELElBQUksRUFBRSxLQUFLO3FCQUNaLEVBQ0QsTUFBTSxDQUNQLENBQ0YsQ0FBQTtnQkFDSCxDQUFDO2dCQUNILG9CQUFDO1lBQUQsQ0E3UEEsQUE2UEMsSUFBQTtZQTdQWSxvQkFBYSxnQkE2UHpCLENBQUE7UUFDSCxDQUFDLEVBdFJpQixNQUFNLEdBQU4sV0FBTSxLQUFOLFdBQU0sUUFzUnZCO0lBQUQsQ0FBQyxFQXRSWSxJQUFJLEdBQUosT0FBSSxLQUFKLE9BQUksUUFzUmhCO0FBQUQsQ0FBQyxFQXRSUyxFQUFFLEtBQUYsRUFBRSxRQXNSWCIsImZpbGUiOiJzcGFycWwtc2VydmljZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKCdmaS5zZWNvLnNwYXJxbCcsIFtdKVxubmFtZXNwYWNlIGZpLnNlY28uc3BhcnFsIHtcbiAgJ3VzZSBzdHJpY3QnXG5cbiAgZXhwb3J0IGludGVyZmFjZSBJU3BhcnFsQmluZGluZyB7XG4gICAgdHlwZTogJ3VyaScgfCAnYm5vZGUnIHwgJ2xpdGVyYWwnLFxuICAgIHZhbHVlOiBzdHJpbmcsXG4gICAgJ3htbDpsYW5nJz86IHN0cmluZyxcbiAgICBkYXRhdHlwZT86IHN0cmluZ1xuICB9XG5cbiAgZXhwb3J0IGludGVyZmFjZSBJU3BhcnFsQmluZGluZ1Jlc3VsdDxCaW5kaW5nVHlwZSBleHRlbmRzIHtbaWQ6IHN0cmluZ106IElTcGFycWxCaW5kaW5nfT4ge1xuICAgIGhlYWQ6IHtcbiAgICAgIHZhcnM6IHN0cmluZ1tdLFxuICAgICAgbGluaz86IHN0cmluZ1tdXG4gICAgfSxcbiAgICByZXN1bHRzOiB7XG4gICAgICBiaW5kaW5nczogQmluZGluZ1R5cGVbXVxuICAgIH1cbiAgfVxuXG4gIGV4cG9ydCBpbnRlcmZhY2UgSVNwYXJxbEFza1Jlc3VsdCB7XG4gICAgYm9vbGVhbjogYm9vbGVhblxuICB9XG5cbiAgZXhwb3J0IGNsYXNzIFNwYXJxbFNlcnZpY2Uge1xuICAgIHB1YmxpYyBzdGF0aWMgc3RyaW5nVG9TUEFSUUxTdHJpbmcoc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiAnXCInICsgc3RyaW5nXG4gICAgICAgIC5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpXG4gICAgICAgIC5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJylcbiAgICAgICAgLnJlcGxhY2UoL1xcbi9nLCAnXFxcXG4nKVxuICAgICAgICAucmVwbGFjZSgvXFx0L2csICdcXFxcdCcpXG4gICAgICAgIC5yZXBsYWNlKC9cXHIvZywgJ1xcXFxyJylcbiAgICAgICAgLnJlcGxhY2UoL1xcZi9nLCAnXFxcXGYnKVxuICAgICAgICArICdcIidcbiAgICB9XG4gICAgcHVibGljIHN0YXRpYyBiaW5kaW5nc1RvT2JqZWN0PFQ+KHJlc3VsdDoge1tpZDogc3RyaW5nXTogSVNwYXJxbEJpbmRpbmd9LCByZXRvOiB7fSA9IHt9LCBzdWJPYmplY3RQcmVmaXhlcz86IHN0cmluZ1tdKTogVCB7XG4gICAgICBmb3IgKGxldCBrZXkgaW4gcmVzdWx0KSB7XG4gICAgICAgIGxldCByZXQ6IHt9ID0gcmV0b1xuICAgICAgICBpZiAoc3ViT2JqZWN0UHJlZml4ZXMpIHtcbiAgICAgICAgICBsZXQgY2hhbmdlZDogYm9vbGVhblxuICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgIGNoYW5nZWQgPSBmYWxzZVxuICAgICAgICAgICAgc3ViT2JqZWN0UHJlZml4ZXMuZm9yRWFjaChzb3AgPT4ge1xuICAgICAgICAgICAgICBpZiAoa2V5LmluZGV4T2Yoc29wKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldCA9IHJldFtzb3BdwqBcbiAgICAgICAgICAgICAgICBrZXkgPSBrZXkuc3Vic3RyaW5nKHNvcC5sZW5ndGgpXG4gICAgICAgICAgICAgICAgY2hhbmdlZCA9IHRydWVcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9IHdoaWxlIChjaGFuZ2VkKVxuICAgICAgICB9XG4gICAgICAgIGlmICghcmV0W2tleV0pIHJldFtrZXldID0gU3BhcnFsU2VydmljZS5iaW5kaW5nVG9WYWx1ZShyZXN1bHRba2V5XSlcbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXRba2V5XSkpIHJldFtrZXldLnB1c2goU3BhcnFsU2VydmljZS5iaW5kaW5nVG9WYWx1ZShyZXN1bHRba2V5XSkpXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZihyZXRba2V5XSkgPT09ICdvYmplY3QnICYmIHJlc3VsdFtrZXldKSB7XG4gICAgICAgICAgaWYgKHJlc3VsdFtrZXldLnR5cGUgPT09ICdsaXRlcmFsJykge1xuICAgICAgICAgICAgbGV0IGtleTI6IHN0cmluZyA9IHJlc3VsdFtrZXldLmRhdGF0eXBlXG4gICAgICAgICAgICBpZiAoIWtleTIpIHtcbiAgICAgICAgICAgICAga2V5MiA9IHJlc3VsdFtrZXldWyd4bWw6bGFuZyddXG4gICAgICAgICAgICAgIGlmICgha2V5Mikga2V5MiA9ICcnXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXRba2V5XVtrZXkyXSA9IHJlc3VsdFtrZXldLnZhbHVlXG4gICAgICAgICAgfSBlbHNlIHJldFtrZXldW3Jlc3VsdFtrZXldLnZhbHVlXSA9IHJlc3VsdFtrZXldLnZhbHVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiA8VD5yZXRvXG4gICAgfVxuICAgIHB1YmxpYyBzdGF0aWMgYmluZGluZ1RvVmFsdWUoYmluZGluZzogSVNwYXJxbEJpbmRpbmcpOiBhbnkge1xuICAgICAgaWYgKCFiaW5kaW5nKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgICBpZiAoYmluZGluZy50eXBlID09PSAndXJpJykgcmV0dXJuIGJpbmRpbmcudmFsdWVcbiAgICAgIGVsc2UgaWYgKGJpbmRpbmcudHlwZSA9PT0gJ2Jub2RlJykgcmV0dXJuIGJpbmRpbmcudmFsdWVcbiAgICAgIGVsc2UgaWYgKGJpbmRpbmcuZGF0YXR5cGUpIHN3aXRjaCAoYmluZGluZy5kYXRhdHlwZSkge1xuICAgICAgICBjYXNlICdodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYSNpbnRlZ2VyJzpcbiAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjZGVjaW1hbCc6IHJldHVybiBwYXJzZUludChiaW5kaW5nLnZhbHVlLCAxMClcbiAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjZmxvYXQnOlxuICAgICAgICBjYXNlICdodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYSNkb3VibGUnOiByZXR1cm4gcGFyc2VGbG9hdChiaW5kaW5nLnZhbHVlKVxuICAgICAgICBjYXNlICdodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYSNib29sZWFuJzogcmV0dXJuIGJpbmRpbmcudmFsdWUgPyB0cnVlIDogZmFsc2VcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgIH1cbiAgICAgIHJldHVybiBiaW5kaW5nLnZhbHVlXG4gICAgfVxuICAgIHB1YmxpYyBzdGF0aWMgYmluZGluZ1RvU3RyaW5nKGJpbmRpbmc6IElTcGFycWxCaW5kaW5nKTogc3RyaW5nIHtcbiAgICAgIGlmICghYmluZGluZykgcmV0dXJuICdVTkRFRidcbiAgICAgIGVsc2Uge1xuICAgICAgICBsZXQgdmFsdWU6IHN0cmluZyA9IGJpbmRpbmcudmFsdWUucmVwbGFjZSgvXFxcXC9nLCAnXFxcXFxcXFwnKS5yZXBsYWNlKC9cXHQvZywgJ1xcXFx0JykucmVwbGFjZSgvXFxuL2csICdcXFxcbicpLnJlcGxhY2UoL1xcci9nLCAnXFxcXHInKS5yZXBsYWNlKC9bXFxiXS9nLCAnXFxcXGInKS5yZXBsYWNlKC9cXGYvZywgJ1xcXFxmJykucmVwbGFjZSgvXFxcIi9nLCAnXFxcXFwiJykucmVwbGFjZSgvXFwnL2csICdcXFxcXFwnJylcbiAgICAgICAgaWYgKGJpbmRpbmcudHlwZSA9PT0gJ3VyaScpIHJldHVybiAnPCcgKyB2YWx1ZSArICc+J1xuICAgICAgICBlbHNlIGlmIChiaW5kaW5nLnR5cGUgPT09ICdibm9kZScpIHJldHVybiAnXzonICsgdmFsdWVcbiAgICAgICAgZWxzZSBpZiAoYmluZGluZy5kYXRhdHlwZSkgc3dpdGNoIChiaW5kaW5nLmRhdGF0eXBlKSB7XG4gICAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjaW50ZWdlcic6XG4gICAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjZGVjaW1hbCc6XG4gICAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjZG91YmxlJzpcbiAgICAgICAgICBjYXNlICdodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYSNib29sZWFuJzogcmV0dXJuIHZhbHVlXG4gICAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjc3RyaW5nJzogcmV0dXJuICdcIicgKyB2YWx1ZSArICdcIidcbiAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gJ1wiJyArIHZhbHVlICsgJ1wiXl48JyArIGJpbmRpbmcuZGF0YXR5cGUgKyAnPidcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChiaW5kaW5nWyd4bWw6bGFuZyddKSByZXR1cm4gJ1wiJyArIHZhbHVlICsgJ1wiQCcgKyBiaW5kaW5nWyd4bWw6bGFuZyddXG4gICAgICAgIGVsc2UgcmV0dXJuICdcIicgKyB2YWx1ZSArICdcIidcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSAkaHR0cDogYW5ndWxhci5JSHR0cFNlcnZpY2UsIHByaXZhdGUgJHE6IGFuZ3VsYXIuSVFTZXJ2aWNlKSB7fVxuICAgIHB1YmxpYyBjaGVjayhlbmRwb2ludDogc3RyaW5nLCBwYXJhbXM/OiB7fSk6IGFuZ3VsYXIuSVByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgbGV0IGRlZmVycmVkOiBhbmd1bGFyLklEZWZlcnJlZDxhbnk+ID0gdGhpcy4kcS5kZWZlcigpXG4gICAgICB0aGlzLiRodHRwKFxuICAgICAgICBhbmd1bGFyLmV4dGVuZChcbiAgICAgICAgICB7XG4gICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgdXJsOiBlbmRwb2ludCxcbiAgICAgICAgICAgIHBhcmFtczogeyBxdWVyeTogJ0FTSyB7fScgfSxcbiAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9zcGFycWwtcmVzdWx0cytqc29uJyB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwYXJhbXNcbiAgICAgICAgKVxuICAgICAgKS50aGVuKFxuICAgICAgICAocmVzcG9uc2U6IGFuZ3VsYXIuSUh0dHBQcm9taXNlQ2FsbGJhY2tBcmc8SVNwYXJxbEFza1Jlc3VsdD4pID0+IGRlZmVycmVkLnJlc29sdmUocmVzcG9uc2UuZGF0YS5ib29sZWFuID09PSB0cnVlKVxuICAgICAgLCAocmVzcG9uc2U6IGFuZ3VsYXIuSUh0dHBQcm9taXNlQ2FsbGJhY2tBcmc8c3RyaW5nPikgPT4gZGVmZXJyZWQucmVzb2x2ZShmYWxzZSlcbiAgICAgIClcbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cbiAgICBwdWJsaWMgY2hlY2tVcGRhdGUoZW5kcG9pbnQ6IHN0cmluZywgcGFyYW1zPzoge30pOiBhbmd1bGFyLklQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgIGxldCBkZWZlcnJlZDogYW5ndWxhci5JRGVmZXJyZWQ8YW55PiA9IHRoaXMuJHEuZGVmZXIoKVxuICAgICAgdGhpcy4kaHR0cChcbiAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmw6IGVuZHBvaW50LFxuICAgICAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJyA6ICdhcHBsaWNhdGlvbi9zcGFycWwtdXBkYXRlJyB9LFxuICAgICAgICAgICAgZGF0YTogJ0lOU0VSVCBEQVRBIHt9J1xuICAgICAgICAgIH0sXG4gICAgICAgICAgcGFyYW1zXG4gICAgICAgIClcbiAgICAgICkudGhlbihcbiAgICAgICAgKHJlc3BvbnNlOiBhbmd1bGFyLklIdHRwUHJvbWlzZUNhbGxiYWNrQXJnPHN0cmluZz4pID0+IGRlZmVycmVkLnJlc29sdmUocmVzcG9uc2Uuc3RhdHVzID09PSAyMDQpXG4gICAgICAsIChyZXNwb25zZTogYW5ndWxhci5JSHR0cFByb21pc2VDYWxsYmFja0FyZzxzdHJpbmc+KSA9PiBkZWZlcnJlZC5yZXNvbHZlKGZhbHNlKVxuICAgICAgKVxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICAgIHB1YmxpYyBjaGVja1Jlc3QoZW5kcG9pbnQ6IHN0cmluZywgcGFyYW1zPzoge30pOiBhbmd1bGFyLklQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgIGxldCBkZWZlcnJlZDogYW5ndWxhci5JRGVmZXJyZWQ8YW55PiA9IHRoaXMuJHEuZGVmZXIoKVxuICAgICAgdGhpcy4kaHR0cChcbiAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmwgOiBlbmRwb2ludCArICc/ZGVmYXVsdCcsXG4gICAgICAgICAgICBkYXRhIDogJycsXG4gICAgICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnIDogJ3RleHQvdHVydGxlJyB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwYXJhbXNcbiAgICAgICAgKVxuICAgICAgKS50aGVuKFxuICAgICAgICAocmVzcG9uc2U6IGFuZ3VsYXIuSUh0dHBQcm9taXNlQ2FsbGJhY2tBcmc8c3RyaW5nPikgPT4gZGVmZXJyZWQucmVzb2x2ZShyZXNwb25zZS5zdGF0dXMgPT09IDIwNClcbiAgICAgICwgKHJlc3BvbnNlOiBhbmd1bGFyLklIdHRwUHJvbWlzZUNhbGxiYWNrQXJnPHN0cmluZz4pID0+IGRlZmVycmVkLnJlc29sdmUoZmFsc2UpXG4gICAgICApXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG4gICAgcHVibGljIGdldDxUPihlbmRwb2ludDogc3RyaW5nLCBncmFwaElSST86IHN0cmluZywgcGFyYW1zPzoge30pOiBhbmd1bGFyLklIdHRwUHJvbWlzZTxUPiB7XG4gICAgICByZXR1cm4gdGhpcy4kaHR0cChcbiAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgIHVybCA6IGVuZHBvaW50LFxuICAgICAgICAgICAgcGFyYW1zOiBncmFwaElSSSA/IHsgZ3JhcGg6IGdyYXBoSVJJIH0gOiB7J2RlZmF1bHQnOiAnJ30sXG4gICAgICAgICAgICBoZWFkZXJzOiB7ICdBY2NlcHQnIDogJ3RleHQvdHVydGxlJyB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwYXJhbXNcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH1cbiAgICBwdWJsaWMgcG9zdDxUPihlbmRwb2ludDogc3RyaW5nLCBncmFwaDogc3RyaW5nLCBncmFwaElSST86IHN0cmluZywgcGFyYW1zPzoge30pOiBhbmd1bGFyLklIdHRwUHJvbWlzZTxUPiB7XG4gICAgICByZXR1cm4gdGhpcy4kaHR0cChcbiAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmwgOiBlbmRwb2ludCxcbiAgICAgICAgICAgIHBhcmFtczogZ3JhcGhJUkkgPyB7IGdyYXBoOiBncmFwaElSSSB9IDogeydkZWZhdWx0JzogJyd9LFxuICAgICAgICAgICAgZGF0YTogZ3JhcGgsXG4gICAgICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnIDogJ3RleHQvdHVydGxlJyB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwYXJhbXNcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH1cbiAgICBwdWJsaWMgcHV0PFQ+KGVuZHBvaW50OiBzdHJpbmcsIGdyYXBoOiBzdHJpbmcsIGdyYXBoSVJJPzogc3RyaW5nLCBwYXJhbXM/OiB7fSk6IGFuZ3VsYXIuSUh0dHBQcm9taXNlPFQ+IHtcbiAgICAgIHJldHVybiB0aGlzLiRodHRwKFxuICAgICAgICBhbmd1bGFyLmV4dGVuZChcbiAgICAgICAgICB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQVVQnLFxuICAgICAgICAgICAgdXJsIDogZW5kcG9pbnQsXG4gICAgICAgICAgICBwYXJhbXM6IGdyYXBoSVJJID8geyBncmFwaDogZ3JhcGhJUkkgfSA6IHsnZGVmYXVsdCc6ICcnfSxcbiAgICAgICAgICAgIGRhdGE6IGdyYXBoLFxuICAgICAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJyA6ICd0ZXh0L3R1cnRsZScgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcGFyYW1zXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9XG4gICAgcHVibGljIGRlbGV0ZTxUPihlbmRwb2ludDogc3RyaW5nLCBncmFwaElSSTogc3RyaW5nLCBwYXJhbXM/OiB7fSk6IGFuZ3VsYXIuSUh0dHBQcm9taXNlPFQ+IHtcbiAgICAgIHJldHVybiB0aGlzLiRodHRwKFxuICAgICAgICBhbmd1bGFyLmV4dGVuZChcbiAgICAgICAgICB7XG4gICAgICAgICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgICAgICAgdXJsOiBlbmRwb2ludCxcbiAgICAgICAgICAgIHBhcmFtczogZ3JhcGhJUkkgPyB7IGdyYXBoOiBncmFwaElSSSB9IDogeydkZWZhdWx0JzogJyd9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwYXJhbXNcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH1cbiAgICBwdWJsaWMgcXVlcnk8VCBleHRlbmRzIHtbaWQ6IHN0cmluZ106IElTcGFycWxCaW5kaW5nfT4oZW5kcG9pbnQ6IHN0cmluZywgcXVlcnk6IHN0cmluZywgcGFyYW1zPzoge30pOiBhbmd1bGFyLklIdHRwUHJvbWlzZTxJU3BhcnFsQmluZGluZ1Jlc3VsdDxUPj4ge1xuICAgICAgaWYgKHF1ZXJ5Lmxlbmd0aCA8PSAyMDQ4KVxuICAgICAgICByZXR1cm4gdGhpcy4kaHR0cChcbiAgICAgICAgICBhbmd1bGFyLmV4dGVuZChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgdXJsOiBlbmRwb2ludCxcbiAgICAgICAgICAgICAgcGFyYW1zOiB7IHF1ZXJ5OiBxdWVyeSB9LFxuICAgICAgICAgICAgICBoZWFkZXJzOiB7ICdBY2NlcHQnIDogJ2FwcGxpY2F0aW9uL3NwYXJxbC1yZXN1bHRzK2pzb24nIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXJhbXNcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIHRoaXMuJGh0dHAoXG4gICAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICB1cmw6IGVuZHBvaW50LFxuICAgICAgICAgICAgICBkYXRhOiAncXVlcnk9JyArIGVuY29kZVVSSUNvbXBvbmVudChxdWVyeSksXG4gICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0FjY2VwdCcgOiAnYXBwbGljYXRpb24vc3BhcnFsLXJlc3VsdHMranNvbidcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhcmFtc1xuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgIH1cbiAgICBwdWJsaWMgY29uc3RydWN0PFQ+KGVuZHBvaW50OiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcsIHBhcmFtcz86IHt9KTogYW5ndWxhci5JSHR0cFByb21pc2U8VD4ge1xuICAgICAgaWYgKHF1ZXJ5Lmxlbmd0aCA8PSAyMDQ4KVxuICAgICAgICByZXR1cm4gdGhpcy4kaHR0cChcbiAgICAgICAgICBhbmd1bGFyLmV4dGVuZChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgdXJsIDogZW5kcG9pbnQsXG4gICAgICAgICAgICAgIHBhcmFtczogeyBxdWVyeTogcXVlcnkgfSxcbiAgICAgICAgICAgICAgaGVhZGVyczogeyAnQWNjZXB0JyA6ICd0ZXh0L3R1cnRsZScgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhcmFtc1xuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gdGhpcy4kaHR0cChcbiAgICAgICAgICBhbmd1bGFyLmV4dGVuZChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgIHVybDogZW5kcG9pbnQsXG4gICAgICAgICAgICAgIGRhdGE6IHF1ZXJ5LFxuICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9zcGFycWwtcXVlcnknLFxuICAgICAgICAgICAgICAgICdBY2NlcHQnIDogJ3RleHQvdHVydGxlJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGFyYW1zXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgfVxuICAgIHB1YmxpYyB1cGRhdGU8VD4oZW5kcG9pbnQ6IHN0cmluZywgcXVlcnk6IHN0cmluZywgcGFyYW1zPzoge30pOiBhbmd1bGFyLklIdHRwUHJvbWlzZTxUPiB7XG4gICAgICByZXR1cm4gdGhpcy4kaHR0cChcbiAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmw6IGVuZHBvaW50LFxuICAgICAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJyA6ICdhcHBsaWNhdGlvbi9zcGFycWwtdXBkYXRlJyB9LFxuICAgICAgICAgICAgZGF0YTogcXVlcnlcbiAgICAgICAgICB9LFxuICAgICAgICAgIHBhcmFtc1xuICAgICAgICApXG4gICAgICApXG4gICAgfVxuICB9XG59XG4iXX0=
