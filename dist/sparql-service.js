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
                        if (subObjectPrefixes)
                            subObjectPrefixes.forEach(function (sop) { if (key.indexOf(sop) === 0)
                                ret = ret[sop]; });
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zcGFycWwtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQ3BDLElBQVUsRUFBRSxDQTBRWDtBQTFRRCxXQUFVLEVBQUU7SUFBQyxJQUFBLElBQUksQ0EwUWhCO0lBMVFZLFdBQUEsSUFBSTtRQUFDLElBQUEsTUFBTSxDQTBRdkI7UUExUWlCLFdBQUEsTUFBTTtZQUN0QixZQUFZLENBQUE7WUF1Qlo7Z0JBOERFLHVCQUFvQixLQUEyQixFQUFVLEVBQXFCO29CQUExRCxVQUFLLEdBQUwsS0FBSyxDQUFzQjtvQkFBVSxPQUFFLEdBQUYsRUFBRSxDQUFtQjtnQkFBRyxDQUFDO2dCQTdEcEUsa0NBQW9CLEdBQWxDLFVBQW1DLE1BQU07b0JBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsTUFBTTt5QkFDaEIsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUM7eUJBQ3RCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDO3lCQUNwQixPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQzt5QkFDckIsT0FBTyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7eUJBQ3JCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO3lCQUNyQixPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQzswQkFDcEIsR0FBRyxDQUFBO2dCQUNULENBQUM7Z0JBQ2EsOEJBQWdCLEdBQTlCLFVBQWtDLE1BQXNDLEVBQUUsSUFBYSxFQUFFLGlCQUE0QjtvQkFBM0MscUJBQUEsRUFBQSxTQUFhOzRDQUM1RSxHQUFHO3dCQUNWLElBQUksR0FBRyxHQUFPLElBQUksQ0FBQTt3QkFDbEIsRUFBRSxDQUFDLENBQUMsaUJBQWlCLENBQUM7NEJBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLFVBQUEsR0FBRyxJQUFNLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFP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RSxNQUFNO3dCQUNkLEdBQUcsRUFBRSxRQUFRO3dCQUNiLE9BQU8sRUFBRSxFQUFFLGNBQWMsRUFBRywyQkFBMkIsRUFBRTt3QkFDekQsSUFBSSxFQUFFLEtBQUs7cUJBQ1osRUFDRCxNQUFNLENBQ1AsQ0FDRixDQUFBO2dCQUNILENBQUM7Z0JBQ0gsb0JBQUM7WUFBRCxDQWpQQSxBQWlQQyxJQUFBO1lBalBZLG9CQUFhLGdCQWlQekIsQ0FBQTtRQUNILENBQUMsRUExUWlCLE1BQU0sR0FBTixXQUFNLEtBQU4sV0FBTSxRQTBRdkI7SUFBRCxDQUFDLEVBMVFZLElBQUksR0FBSixPQUFJLEtBQUosT0FBSSxRQTBRaEI7QUFBRCxDQUFDLEVBMVFTLEVBQUUsS0FBRixFQUFFLFFBMFFYIiwiZmlsZSI6InNwYXJxbC1zZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ2ZpLnNlY28uc3BhcnFsJywgW10pXG5uYW1lc3BhY2UgZmkuc2Vjby5zcGFycWwge1xuICAndXNlIHN0cmljdCdcblxuICBleHBvcnQgaW50ZXJmYWNlIElTcGFycWxCaW5kaW5nIHtcbiAgICB0eXBlOiAndXJpJyB8ICdibm9kZScgfCAnbGl0ZXJhbCcsXG4gICAgdmFsdWU6IHN0cmluZyxcbiAgICAneG1sOmxhbmcnPzogc3RyaW5nLFxuICAgIGRhdGF0eXBlPzogc3RyaW5nXG4gIH1cblxuICBleHBvcnQgaW50ZXJmYWNlIElTcGFycWxCaW5kaW5nUmVzdWx0PEJpbmRpbmdUeXBlIGV4dGVuZHMge1tpZDogc3RyaW5nXTogSVNwYXJxbEJpbmRpbmd9PiB7XG4gICAgaGVhZDoge1xuICAgICAgdmFyczogc3RyaW5nW10sXG4gICAgICBsaW5rPzogc3RyaW5nW11cbiAgICB9LFxuICAgIHJlc3VsdHM6IHtcbiAgICAgIGJpbmRpbmdzOiBCaW5kaW5nVHlwZVtdXG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGludGVyZmFjZSBJU3BhcnFsQXNrUmVzdWx0IHtcbiAgICBib29sZWFuOiBib29sZWFuXG4gIH1cblxuICBleHBvcnQgY2xhc3MgU3BhcnFsU2VydmljZSB7XG4gICAgcHVibGljIHN0YXRpYyBzdHJpbmdUb1NQQVJRTFN0cmluZyhzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuICdcIicgKyBzdHJpbmdcbiAgICAgICAgLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJylcbiAgICAgICAgLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKVxuICAgICAgICAucmVwbGFjZSgvXFxuL2csICdcXFxcbicpXG4gICAgICAgIC5yZXBsYWNlKC9cXHQvZywgJ1xcXFx0JylcbiAgICAgICAgLnJlcGxhY2UoL1xcci9nLCAnXFxcXHInKVxuICAgICAgICAucmVwbGFjZSgvXFxmL2csICdcXFxcZicpXG4gICAgICAgICsgJ1wiJ1xuICAgIH1cbiAgICBwdWJsaWMgc3RhdGljIGJpbmRpbmdzVG9PYmplY3Q8VD4ocmVzdWx0OiB7W2lkOiBzdHJpbmddOiBJU3BhcnFsQmluZGluZ30sIHJldG86IHt9ID0ge30sIHN1Yk9iamVjdFByZWZpeGVzPzogc3RyaW5nW10pOiBUIHtcbiAgICAgIGZvciAobGV0IGtleSBpbiByZXN1bHQpIHtcbiAgICAgICAgbGV0IHJldDoge30gPSByZXRvXG4gICAgICAgIGlmIChzdWJPYmplY3RQcmVmaXhlcykgc3ViT2JqZWN0UHJlZml4ZXMuZm9yRWFjaChzb3AgPT4geyBpZiAoa2V5LmluZGV4T2Yoc29wKSA9PT0gMCkgcmV0ID0gcmV0W3NvcF3CoH0pXG4gICAgICAgIGlmICghcmV0W2tleV0pIHJldFtrZXldID0gU3BhcnFsU2VydmljZS5iaW5kaW5nVG9WYWx1ZShyZXN1bHRba2V5XSlcbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXRba2V5XSkpIHJldFtrZXldLnB1c2goU3BhcnFsU2VydmljZS5iaW5kaW5nVG9WYWx1ZShyZXN1bHRba2V5XSkpXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZihyZXRba2V5XSkgPT09ICdvYmplY3QnICYmIHJlc3VsdFtrZXldKSB7XG4gICAgICAgICAgaWYgKHJlc3VsdFtrZXldLnR5cGUgPT09ICdsaXRlcmFsJykge1xuICAgICAgICAgICAgbGV0IGtleTI6IHN0cmluZyA9IHJlc3VsdFtrZXldLmRhdGF0eXBlXG4gICAgICAgICAgICBpZiAoIWtleTIpIHtcbiAgICAgICAgICAgICAga2V5MiA9IHJlc3VsdFtrZXldWyd4bWw6bGFuZyddXG4gICAgICAgICAgICAgIGlmICgha2V5Mikga2V5MiA9ICcnXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXRba2V5XVtrZXkyXSA9IHJlc3VsdFtrZXldLnZhbHVlXG4gICAgICAgICAgfSBlbHNlIHJldFtrZXldW3Jlc3VsdFtrZXldLnZhbHVlXSA9IHJlc3VsdFtrZXldLnZhbHVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiA8VD5yZXRvXG4gICAgfVxuICAgIHB1YmxpYyBzdGF0aWMgYmluZGluZ1RvVmFsdWUoYmluZGluZzogSVNwYXJxbEJpbmRpbmcpOiBhbnkge1xuICAgICAgaWYgKCFiaW5kaW5nKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgICBpZiAoYmluZGluZy50eXBlID09PSAndXJpJykgcmV0dXJuIGJpbmRpbmcudmFsdWVcbiAgICAgIGVsc2UgaWYgKGJpbmRpbmcudHlwZSA9PT0gJ2Jub2RlJykgcmV0dXJuIGJpbmRpbmcudmFsdWVcbiAgICAgIGVsc2UgaWYgKGJpbmRpbmcuZGF0YXR5cGUpIHN3aXRjaCAoYmluZGluZy5kYXRhdHlwZSkge1xuICAgICAgICBjYXNlICdodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYSNpbnRlZ2VyJzpcbiAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjZGVjaW1hbCc6IHJldHVybiBwYXJzZUludChiaW5kaW5nLnZhbHVlLCAxMClcbiAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjZmxvYXQnOlxuICAgICAgICBjYXNlICdodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYSNkb3VibGUnOiByZXR1cm4gcGFyc2VGbG9hdChiaW5kaW5nLnZhbHVlKVxuICAgICAgICBjYXNlICdodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYSNib29sZWFuJzogcmV0dXJuIGJpbmRpbmcudmFsdWUgPyB0cnVlIDogZmFsc2VcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgIH1cbiAgICAgIHJldHVybiBiaW5kaW5nLnZhbHVlXG4gICAgfVxuICAgIHB1YmxpYyBzdGF0aWMgYmluZGluZ1RvU3RyaW5nKGJpbmRpbmc6IElTcGFycWxCaW5kaW5nKTogc3RyaW5nIHtcbiAgICAgIGlmICghYmluZGluZykgcmV0dXJuICdVTkRFRidcbiAgICAgIGVsc2Uge1xuICAgICAgICBsZXQgdmFsdWU6IHN0cmluZyA9IGJpbmRpbmcudmFsdWUucmVwbGFjZSgvXFxcXC9nLCAnXFxcXFxcXFwnKS5yZXBsYWNlKC9cXHQvZywgJ1xcXFx0JykucmVwbGFjZSgvXFxuL2csICdcXFxcbicpLnJlcGxhY2UoL1xcci9nLCAnXFxcXHInKS5yZXBsYWNlKC9bXFxiXS9nLCAnXFxcXGInKS5yZXBsYWNlKC9cXGYvZywgJ1xcXFxmJykucmVwbGFjZSgvXFxcIi9nLCAnXFxcXFwiJykucmVwbGFjZSgvXFwnL2csICdcXFxcXFwnJylcbiAgICAgICAgaWYgKGJpbmRpbmcudHlwZSA9PT0gJ3VyaScpIHJldHVybiAnPCcgKyB2YWx1ZSArICc+J1xuICAgICAgICBlbHNlIGlmIChiaW5kaW5nLnR5cGUgPT09ICdibm9kZScpIHJldHVybiAnXzonICsgdmFsdWVcbiAgICAgICAgZWxzZSBpZiAoYmluZGluZy5kYXRhdHlwZSkgc3dpdGNoIChiaW5kaW5nLmRhdGF0eXBlKSB7XG4gICAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjaW50ZWdlcic6XG4gICAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjZGVjaW1hbCc6XG4gICAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjZG91YmxlJzpcbiAgICAgICAgICBjYXNlICdodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYSNib29sZWFuJzogcmV0dXJuIHZhbHVlXG4gICAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjc3RyaW5nJzogcmV0dXJuICdcIicgKyB2YWx1ZSArICdcIidcbiAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gJ1wiJyArIHZhbHVlICsgJ1wiXl48JyArIGJpbmRpbmcuZGF0YXR5cGUgKyAnPidcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChiaW5kaW5nWyd4bWw6bGFuZyddKSByZXR1cm4gJ1wiJyArIHZhbHVlICsgJ1wiQCcgKyBiaW5kaW5nWyd4bWw6bGFuZyddXG4gICAgICAgIGVsc2UgcmV0dXJuICdcIicgKyB2YWx1ZSArICdcIidcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSAkaHR0cDogYW5ndWxhci5JSHR0cFNlcnZpY2UsIHByaXZhdGUgJHE6IGFuZ3VsYXIuSVFTZXJ2aWNlKSB7fVxuICAgIHB1YmxpYyBjaGVjayhlbmRwb2ludDogc3RyaW5nLCBwYXJhbXM/OiB7fSk6IGFuZ3VsYXIuSVByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgbGV0IGRlZmVycmVkOiBhbmd1bGFyLklEZWZlcnJlZDxhbnk+ID0gdGhpcy4kcS5kZWZlcigpXG4gICAgICB0aGlzLiRodHRwKFxuICAgICAgICBhbmd1bGFyLmV4dGVuZChcbiAgICAgICAgICB7XG4gICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgdXJsOiBlbmRwb2ludCxcbiAgICAgICAgICAgIHBhcmFtczogeyBxdWVyeTogJ0FTSyB7fScgfSxcbiAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9zcGFycWwtcmVzdWx0cytqc29uJyB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwYXJhbXNcbiAgICAgICAgKVxuICAgICAgKS50aGVuKFxuICAgICAgICAocmVzcG9uc2U6IGFuZ3VsYXIuSUh0dHBQcm9taXNlQ2FsbGJhY2tBcmc8SVNwYXJxbEFza1Jlc3VsdD4pID0+IGRlZmVycmVkLnJlc29sdmUocmVzcG9uc2UuZGF0YS5ib29sZWFuID09PSB0cnVlKVxuICAgICAgLCAocmVzcG9uc2U6IGFuZ3VsYXIuSUh0dHBQcm9taXNlQ2FsbGJhY2tBcmc8c3RyaW5nPikgPT4gZGVmZXJyZWQucmVzb2x2ZShmYWxzZSlcbiAgICAgIClcbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cbiAgICBwdWJsaWMgY2hlY2tVcGRhdGUoZW5kcG9pbnQ6IHN0cmluZywgcGFyYW1zPzoge30pOiBhbmd1bGFyLklQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgIGxldCBkZWZlcnJlZDogYW5ndWxhci5JRGVmZXJyZWQ8YW55PiA9IHRoaXMuJHEuZGVmZXIoKVxuICAgICAgdGhpcy4kaHR0cChcbiAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmw6IGVuZHBvaW50LFxuICAgICAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJyA6ICdhcHBsaWNhdGlvbi9zcGFycWwtdXBkYXRlJyB9LFxuICAgICAgICAgICAgZGF0YTogJ0lOU0VSVCBEQVRBIHt9J1xuICAgICAgICAgIH0sXG4gICAgICAgICAgcGFyYW1zXG4gICAgICAgIClcbiAgICAgICkudGhlbihcbiAgICAgICAgKHJlc3BvbnNlOiBhbmd1bGFyLklIdHRwUHJvbWlzZUNhbGxiYWNrQXJnPHN0cmluZz4pID0+IGRlZmVycmVkLnJlc29sdmUocmVzcG9uc2Uuc3RhdHVzID09PSAyMDQpXG4gICAgICAsIChyZXNwb25zZTogYW5ndWxhci5JSHR0cFByb21pc2VDYWxsYmFja0FyZzxzdHJpbmc+KSA9PiBkZWZlcnJlZC5yZXNvbHZlKGZhbHNlKVxuICAgICAgKVxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICAgIHB1YmxpYyBjaGVja1Jlc3QoZW5kcG9pbnQ6IHN0cmluZywgcGFyYW1zPzoge30pOiBhbmd1bGFyLklQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgIGxldCBkZWZlcnJlZDogYW5ndWxhci5JRGVmZXJyZWQ8YW55PiA9IHRoaXMuJHEuZGVmZXIoKVxuICAgICAgdGhpcy4kaHR0cChcbiAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmwgOiBlbmRwb2ludCArICc/ZGVmYXVsdCcsXG4gICAgICAgICAgICBkYXRhIDogJycsXG4gICAgICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnIDogJ3RleHQvdHVydGxlJyB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwYXJhbXNcbiAgICAgICAgKVxuICAgICAgKS50aGVuKFxuICAgICAgICAocmVzcG9uc2U6IGFuZ3VsYXIuSUh0dHBQcm9taXNlQ2FsbGJhY2tBcmc8c3RyaW5nPikgPT4gZGVmZXJyZWQucmVzb2x2ZShyZXNwb25zZS5zdGF0dXMgPT09IDIwNClcbiAgICAgICwgKHJlc3BvbnNlOiBhbmd1bGFyLklIdHRwUHJvbWlzZUNhbGxiYWNrQXJnPHN0cmluZz4pID0+IGRlZmVycmVkLnJlc29sdmUoZmFsc2UpXG4gICAgICApXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG4gICAgcHVibGljIGdldDxUPihlbmRwb2ludDogc3RyaW5nLCBncmFwaElSST86IHN0cmluZywgcGFyYW1zPzoge30pOiBhbmd1bGFyLklIdHRwUHJvbWlzZTxUPiB7XG4gICAgICByZXR1cm4gdGhpcy4kaHR0cChcbiAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgIHVybCA6IGVuZHBvaW50LFxuICAgICAgICAgICAgcGFyYW1zOiBncmFwaElSSSA/IHsgZ3JhcGg6IGdyYXBoSVJJIH0gOiB7J2RlZmF1bHQnOiAnJ30sXG4gICAgICAgICAgICBoZWFkZXJzOiB7ICdBY2NlcHQnIDogJ3RleHQvdHVydGxlJyB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwYXJhbXNcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH1cbiAgICBwdWJsaWMgcG9zdDxUPihlbmRwb2ludDogc3RyaW5nLCBncmFwaDogc3RyaW5nLCBncmFwaElSST86IHN0cmluZywgcGFyYW1zPzoge30pOiBhbmd1bGFyLklIdHRwUHJvbWlzZTxUPiB7XG4gICAgICByZXR1cm4gdGhpcy4kaHR0cChcbiAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmwgOiBlbmRwb2ludCxcbiAgICAgICAgICAgIHBhcmFtczogZ3JhcGhJUkkgPyB7IGdyYXBoOiBncmFwaElSSSB9IDogeydkZWZhdWx0JzogJyd9LFxuICAgICAgICAgICAgZGF0YTogZ3JhcGgsXG4gICAgICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnIDogJ3RleHQvdHVydGxlJyB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwYXJhbXNcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH1cbiAgICBwdWJsaWMgcHV0PFQ+KGVuZHBvaW50OiBzdHJpbmcsIGdyYXBoOiBzdHJpbmcsIGdyYXBoSVJJPzogc3RyaW5nLCBwYXJhbXM/OiB7fSk6IGFuZ3VsYXIuSUh0dHBQcm9taXNlPFQ+IHtcbiAgICAgIHJldHVybiB0aGlzLiRodHRwKFxuICAgICAgICBhbmd1bGFyLmV4dGVuZChcbiAgICAgICAgICB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQVVQnLFxuICAgICAgICAgICAgdXJsIDogZW5kcG9pbnQsXG4gICAgICAgICAgICBwYXJhbXM6IGdyYXBoSVJJID8geyBncmFwaDogZ3JhcGhJUkkgfSA6IHsnZGVmYXVsdCc6ICcnfSxcbiAgICAgICAgICAgIGRhdGE6IGdyYXBoLFxuICAgICAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJyA6ICd0ZXh0L3R1cnRsZScgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcGFyYW1zXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9XG4gICAgcHVibGljIGRlbGV0ZTxUPihlbmRwb2ludDogc3RyaW5nLCBncmFwaElSSTogc3RyaW5nLCBwYXJhbXM/OiB7fSk6IGFuZ3VsYXIuSUh0dHBQcm9taXNlPFQ+IHtcbiAgICAgIHJldHVybiB0aGlzLiRodHRwKFxuICAgICAgICBhbmd1bGFyLmV4dGVuZChcbiAgICAgICAgICB7XG4gICAgICAgICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgICAgICAgdXJsOiBlbmRwb2ludCxcbiAgICAgICAgICAgIHBhcmFtczogZ3JhcGhJUkkgPyB7IGdyYXBoOiBncmFwaElSSSB9IDogeydkZWZhdWx0JzogJyd9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwYXJhbXNcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH1cbiAgICBwdWJsaWMgcXVlcnk8VCBleHRlbmRzIHtbaWQ6IHN0cmluZ106IElTcGFycWxCaW5kaW5nfT4oZW5kcG9pbnQ6IHN0cmluZywgcXVlcnk6IHN0cmluZywgcGFyYW1zPzoge30pOiBhbmd1bGFyLklIdHRwUHJvbWlzZTxJU3BhcnFsQmluZGluZ1Jlc3VsdDxUPj4ge1xuICAgICAgaWYgKHF1ZXJ5Lmxlbmd0aCA8PSAyMDQ4KVxuICAgICAgICByZXR1cm4gdGhpcy4kaHR0cChcbiAgICAgICAgICBhbmd1bGFyLmV4dGVuZChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgdXJsOiBlbmRwb2ludCxcbiAgICAgICAgICAgICAgcGFyYW1zOiB7IHF1ZXJ5OiBxdWVyeSB9LFxuICAgICAgICAgICAgICBoZWFkZXJzOiB7ICdBY2NlcHQnIDogJ2FwcGxpY2F0aW9uL3NwYXJxbC1yZXN1bHRzK2pzb24nIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXJhbXNcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIHRoaXMuJGh0dHAoXG4gICAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICB1cmw6IGVuZHBvaW50LFxuICAgICAgICAgICAgICBkYXRhOiAncXVlcnk9JyArIGVuY29kZVVSSUNvbXBvbmVudChxdWVyeSksXG4gICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICAgICAgJ0FjY2VwdCcgOiAnYXBwbGljYXRpb24vc3BhcnFsLXJlc3VsdHMranNvbidcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhcmFtc1xuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgIH1cbiAgICBwdWJsaWMgY29uc3RydWN0PFQ+KGVuZHBvaW50OiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcsIHBhcmFtcz86IHt9KTogYW5ndWxhci5JSHR0cFByb21pc2U8VD4ge1xuICAgICAgaWYgKHF1ZXJ5Lmxlbmd0aCA8PSAyMDQ4KVxuICAgICAgICByZXR1cm4gdGhpcy4kaHR0cChcbiAgICAgICAgICBhbmd1bGFyLmV4dGVuZChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgdXJsIDogZW5kcG9pbnQsXG4gICAgICAgICAgICAgIHBhcmFtczogeyBxdWVyeTogcXVlcnkgfSxcbiAgICAgICAgICAgICAgaGVhZGVyczogeyAnQWNjZXB0JyA6ICd0ZXh0L3R1cnRsZScgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhcmFtc1xuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gdGhpcy4kaHR0cChcbiAgICAgICAgICBhbmd1bGFyLmV4dGVuZChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgIHVybDogZW5kcG9pbnQsXG4gICAgICAgICAgICAgIGRhdGE6IHF1ZXJ5LFxuICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9zcGFycWwtcXVlcnknLFxuICAgICAgICAgICAgICAgICdBY2NlcHQnIDogJ3RleHQvdHVydGxlJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGFyYW1zXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgfVxuICAgIHB1YmxpYyB1cGRhdGU8VD4oZW5kcG9pbnQ6IHN0cmluZywgcXVlcnk6IHN0cmluZywgcGFyYW1zPzoge30pOiBhbmd1bGFyLklIdHRwUHJvbWlzZTxUPiB7XG4gICAgICByZXR1cm4gdGhpcy4kaHR0cChcbiAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmw6IGVuZHBvaW50LFxuICAgICAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJyA6ICdhcHBsaWNhdGlvbi9zcGFycWwtdXBkYXRlJyB9LFxuICAgICAgICAgICAgZGF0YTogcXVlcnlcbiAgICAgICAgICB9LFxuICAgICAgICAgIHBhcmFtc1xuICAgICAgICApXG4gICAgICApXG4gICAgfVxuICB9XG59XG4iXX0=
