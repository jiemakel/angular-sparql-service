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
                SparqlService.bindingsToObject = function (result, ret) {
                    if (ret === void 0) { ret = {}; }
                    for (var key in result)
                        ret[key] = SparqlService.bindingToValue(result[key]);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zcGFycWwtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQ3BDLElBQVUsRUFBRSxDQTRQWDtBQTVQRCxXQUFVLEVBQUU7SUFBQyxJQUFBLElBQUksQ0E0UGhCO0lBNVBZLFdBQUEsSUFBSTtRQUFDLElBQUEsTUFBTSxDQTRQdkI7UUE1UGlCLFdBQUEsTUFBTTtZQUN0QixZQUFZLENBQUE7WUF1Qlo7Z0JBZ0RFLHVCQUFvQixLQUEyQixFQUFVLEVBQXFCO29CQUExRCxVQUFLLEdBQUwsS0FBSyxDQUFzQjtvQkFBVSxPQUFFLEdBQUYsRUFBRSxDQUFtQjtnQkFBRyxDQUFDO2dCQS9DcEUsa0NBQW9CLEdBQWxDLFVBQW1DLE1BQU07b0JBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsTUFBTTt5QkFDaEIsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUM7eUJBQ3RCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDO3lCQUNwQixPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQzt5QkFDckIsT0FBTyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7eUJBQ3JCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO3lCQUNyQixPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQzswQkFDcEIsR0FBRyxDQUFBO2dCQUNULENBQUM7Z0JBQ2EsOEJBQWdCLEdBQTlCLFVBQWtDLE1BQXNDLEVBQUUsR0FBWTtvQkFBWixvQkFBQSxFQUFBLFFBQVk7b0JBQ3BGLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQzt3QkFDckIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7b0JBQ3RELE1BQU0sQ0FBSSxHQUFHLENBQUE7Z0JBQ2YsQ0FBQztnQkFDYSw0QkFBYyxHQUE1QixVQUE2QixPQUF1QjtvQkFDbEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7d0JBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQTtvQkFDOUIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUM7d0JBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUE7b0JBQ2hELElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQzt3QkFBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQTtvQkFDdkQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7d0JBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7NEJBQ3BELEtBQUssMENBQTBDLENBQUM7NEJBQ2hELEtBQUssMENBQTBDLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFBOzRCQUNuRixLQUFLLHdDQUF3QyxDQUFDOzRCQUM5QyxLQUFLLHlDQUF5QyxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBOzRCQUNoRixLQUFLLDBDQUEwQyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUE7NEJBQ3BGLFFBQVE7d0JBQ1YsQ0FBQztvQkFDRCxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQTtnQkFDdEIsQ0FBQztnQkFDYSw2QkFBZSxHQUE3QixVQUE4QixPQUF1QjtvQkFDbkQsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7d0JBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQTtvQkFDNUIsSUFBSSxDQUFDLENBQUM7d0JBQ0osSUFBSSxLQUFLLEdBQVcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUE7d0JBQ3JOLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDOzRCQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQTt3QkFDcEQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssT0FBTyxDQUFDOzRCQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFBO3dCQUN0RCxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQzs0QkFBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQ0FDcEQsS0FBSywwQ0FBMEMsQ0FBQztnQ0FDaEQsS0FBSywwQ0FBMEMsQ0FBQztnQ0FDaEQsS0FBSyx5Q0FBeUMsQ0FBQztnQ0FDL0MsS0FBSywwQ0FBMEMsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFBO2dDQUM3RCxLQUFLLHlDQUF5QyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQTtnQ0FDeEUsU0FBUyxNQUFNLENBQUMsR0FBRyxHQUFHLEtBQUssR0FBRyxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUE7NEJBQy9ELENBQUM7d0JBQ0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs0QkFBQyxN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QUksR0FBSixPQUFJLEtBQUosT0FBSSxRQTRQaEI7QUFBRCxDQUFDLEVBNVBTLEVBQUUsS0FBRixFQUFFLFFBNFBYIiwiZmlsZSI6InNwYXJxbC1zZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ2ZpLnNlY28uc3BhcnFsJywgW10pXG5uYW1lc3BhY2UgZmkuc2Vjby5zcGFycWwge1xuICAndXNlIHN0cmljdCdcblxuICBleHBvcnQgaW50ZXJmYWNlIElTcGFycWxCaW5kaW5nIHtcbiAgICB0eXBlOiBzdHJpbmcsXG4gICAgdmFsdWU6IHN0cmluZyxcbiAgICAneG1sOmxhbmcnPzogc3RyaW5nLFxuICAgIGRhdGF0eXBlPzogc3RyaW5nXG4gIH1cblxuICBleHBvcnQgaW50ZXJmYWNlIElTcGFycWxCaW5kaW5nUmVzdWx0PEJpbmRpbmdUeXBlIGV4dGVuZHMge1tpZDogc3RyaW5nXTogSVNwYXJxbEJpbmRpbmd9PiB7XG4gICAgaGVhZDoge1xuICAgICAgdmFyczogc3RyaW5nW10sXG4gICAgICBsaW5rPzogc3RyaW5nW11cbiAgICB9LFxuICAgIHJlc3VsdHM6IHtcbiAgICAgIGJpbmRpbmdzOiBCaW5kaW5nVHlwZVtdXG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGludGVyZmFjZSBJU3BhcnFsQXNrUmVzdWx0IHtcbiAgICBib29sZWFuOiBib29sZWFuXG4gIH1cblxuICBleHBvcnQgY2xhc3MgU3BhcnFsU2VydmljZSB7XG4gICAgcHVibGljIHN0YXRpYyBzdHJpbmdUb1NQQVJRTFN0cmluZyhzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuICdcIicgKyBzdHJpbmdcbiAgICAgICAgLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJylcbiAgICAgICAgLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKVxuICAgICAgICAucmVwbGFjZSgvXFxuL2csICdcXFxcbicpXG4gICAgICAgIC5yZXBsYWNlKC9cXHQvZywgJ1xcXFx0JylcbiAgICAgICAgLnJlcGxhY2UoL1xcci9nLCAnXFxcXHInKVxuICAgICAgICAucmVwbGFjZSgvXFxmL2csICdcXFxcZicpXG4gICAgICAgICsgJ1wiJ1xuICAgIH1cbiAgICBwdWJsaWMgc3RhdGljIGJpbmRpbmdzVG9PYmplY3Q8VD4ocmVzdWx0OiB7W2lkOiBzdHJpbmddOiBJU3BhcnFsQmluZGluZ30sIHJldDoge30gPSB7fSk6IFQge1xuICAgICAgZm9yIChsZXQga2V5IGluIHJlc3VsdClcbiAgICAgICAgcmV0W2tleV0gPSBTcGFycWxTZXJ2aWNlLmJpbmRpbmdUb1ZhbHVlKHJlc3VsdFtrZXldKVxuICAgICAgcmV0dXJuIDxUPnJldFxuICAgIH1cbiAgICBwdWJsaWMgc3RhdGljIGJpbmRpbmdUb1ZhbHVlKGJpbmRpbmc6IElTcGFycWxCaW5kaW5nKTogYW55IHtcbiAgICAgIGlmICghYmluZGluZykgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgaWYgKGJpbmRpbmcudHlwZSA9PT0gJ3VyaScpIHJldHVybiBiaW5kaW5nLnZhbHVlXG4gICAgICBlbHNlIGlmIChiaW5kaW5nLnR5cGUgPT09ICdibm9kZScpIHJldHVybiBiaW5kaW5nLnZhbHVlXG4gICAgICBlbHNlIGlmIChiaW5kaW5nLmRhdGF0eXBlKSBzd2l0Y2ggKGJpbmRpbmcuZGF0YXR5cGUpIHtcbiAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjaW50ZWdlcic6XG4gICAgICAgIGNhc2UgJ2h0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hI2RlY2ltYWwnOiByZXR1cm4gcGFyc2VJbnQoYmluZGluZy52YWx1ZSwgMTApXG4gICAgICAgIGNhc2UgJ2h0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hI2Zsb2F0JzpcbiAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjZG91YmxlJzogcmV0dXJuIHBhcnNlRmxvYXQoYmluZGluZy52YWx1ZSlcbiAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjYm9vbGVhbic6IHJldHVybiBiaW5kaW5nLnZhbHVlID8gdHJ1ZSA6IGZhbHNlXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICB9XG4gICAgICByZXR1cm4gYmluZGluZy52YWx1ZVxuICAgIH1cbiAgICBwdWJsaWMgc3RhdGljIGJpbmRpbmdUb1N0cmluZyhiaW5kaW5nOiBJU3BhcnFsQmluZGluZyk6IHN0cmluZyB7XG4gICAgICBpZiAoIWJpbmRpbmcpIHJldHVybiAnVU5ERUYnXG4gICAgICBlbHNlIHtcbiAgICAgICAgbGV0IHZhbHVlOiBzdHJpbmcgPSBiaW5kaW5nLnZhbHVlLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJykucmVwbGFjZSgvXFx0L2csICdcXFxcdCcpLnJlcGxhY2UoL1xcbi9nLCAnXFxcXG4nKS5yZXBsYWNlKC9cXHIvZywgJ1xcXFxyJykucmVwbGFjZSgvW1xcYl0vZywgJ1xcXFxiJykucmVwbGFjZSgvXFxmL2csICdcXFxcZicpLnJlcGxhY2UoL1xcXCIvZywgJ1xcXFxcIicpLnJlcGxhY2UoL1xcJy9nLCAnXFxcXFxcJycpXG4gICAgICAgIGlmIChiaW5kaW5nLnR5cGUgPT09ICd1cmknKSByZXR1cm4gJzwnICsgdmFsdWUgKyAnPidcbiAgICAgICAgZWxzZSBpZiAoYmluZGluZy50eXBlID09PSAnYm5vZGUnKSByZXR1cm4gJ186JyArIHZhbHVlXG4gICAgICAgIGVsc2UgaWYgKGJpbmRpbmcuZGF0YXR5cGUpIHN3aXRjaCAoYmluZGluZy5kYXRhdHlwZSkge1xuICAgICAgICAgIGNhc2UgJ2h0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hI2ludGVnZXInOlxuICAgICAgICAgIGNhc2UgJ2h0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hI2RlY2ltYWwnOlxuICAgICAgICAgIGNhc2UgJ2h0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hI2RvdWJsZSc6XG4gICAgICAgICAgY2FzZSAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEjYm9vbGVhbic6IHJldHVybiB2YWx1ZVxuICAgICAgICAgIGNhc2UgJ2h0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hI3N0cmluZyc6IHJldHVybiAnXCInICsgdmFsdWUgKyAnXCInXG4gICAgICAgICAgZGVmYXVsdDogcmV0dXJuICdcIicgKyB2YWx1ZSArICdcIl5ePCcgKyBiaW5kaW5nLmRhdGF0eXBlICsgJz4nXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYmluZGluZ1sneG1sOmxhbmcnXSkgcmV0dXJuICdcIicgKyB2YWx1ZSArICdcIkAnICsgYmluZGluZ1sneG1sOmxhbmcnXVxuICAgICAgICBlbHNlIHJldHVybiAnXCInICsgdmFsdWUgKyAnXCInXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgJGh0dHA6IGFuZ3VsYXIuSUh0dHBTZXJ2aWNlLCBwcml2YXRlICRxOiBhbmd1bGFyLklRU2VydmljZSkge31cbiAgICBwdWJsaWMgY2hlY2soZW5kcG9pbnQ6IHN0cmluZywgcGFyYW1zPzoge30pOiBhbmd1bGFyLklQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgIGxldCBkZWZlcnJlZDogYW5ndWxhci5JRGVmZXJyZWQ8YW55PiA9IHRoaXMuJHEuZGVmZXIoKVxuICAgICAgdGhpcy4kaHR0cChcbiAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgIHVybDogZW5kcG9pbnQsXG4gICAgICAgICAgICBwYXJhbXM6IHsgcXVlcnk6ICdBU0sge30nIH0sXG4gICAgICAgICAgICBoZWFkZXJzOiB7ICdBY2NlcHQnOiAnYXBwbGljYXRpb24vc3BhcnFsLXJlc3VsdHMranNvbicgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcGFyYW1zXG4gICAgICAgIClcbiAgICAgICkudGhlbihcbiAgICAgICAgKHJlc3BvbnNlOiBhbmd1bGFyLklIdHRwUHJvbWlzZUNhbGxiYWNrQXJnPElTcGFycWxBc2tSZXN1bHQ+KSA9PiBkZWZlcnJlZC5yZXNvbHZlKHJlc3BvbnNlLmRhdGEuYm9vbGVhbiA9PT0gdHJ1ZSlcbiAgICAgICwgKHJlc3BvbnNlOiBhbmd1bGFyLklIdHRwUHJvbWlzZUNhbGxiYWNrQXJnPHN0cmluZz4pID0+IGRlZmVycmVkLnJlc29sdmUoZmFsc2UpXG4gICAgICApXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG4gICAgcHVibGljIGNoZWNrVXBkYXRlKGVuZHBvaW50OiBzdHJpbmcsIHBhcmFtcz86IHt9KTogYW5ndWxhci5JUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICBsZXQgZGVmZXJyZWQ6IGFuZ3VsYXIuSURlZmVycmVkPGFueT4gPSB0aGlzLiRxLmRlZmVyKClcbiAgICAgIHRoaXMuJGh0dHAoXG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgdXJsOiBlbmRwb2ludCxcbiAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZScgOiAnYXBwbGljYXRpb24vc3BhcnFsLXVwZGF0ZScgfSxcbiAgICAgICAgICAgIGRhdGE6ICdJTlNFUlQgREFUQSB7fSdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHBhcmFtc1xuICAgICAgICApXG4gICAgICApLnRoZW4oXG4gICAgICAgIChyZXNwb25zZTogYW5ndWxhci5JSHR0cFByb21pc2VDYWxsYmFja0FyZzxzdHJpbmc+KSA9PiBkZWZlcnJlZC5yZXNvbHZlKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjA0KVxuICAgICAgLCAocmVzcG9uc2U6IGFuZ3VsYXIuSUh0dHBQcm9taXNlQ2FsbGJhY2tBcmc8c3RyaW5nPikgPT4gZGVmZXJyZWQucmVzb2x2ZShmYWxzZSlcbiAgICAgIClcbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cbiAgICBwdWJsaWMgY2hlY2tSZXN0KGVuZHBvaW50OiBzdHJpbmcsIHBhcmFtcz86IHt9KTogYW5ndWxhci5JUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICBsZXQgZGVmZXJyZWQ6IGFuZ3VsYXIuSURlZmVycmVkPGFueT4gPSB0aGlzLiRxLmRlZmVyKClcbiAgICAgIHRoaXMuJGh0dHAoXG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgdXJsIDogZW5kcG9pbnQgKyAnP2RlZmF1bHQnLFxuICAgICAgICAgICAgZGF0YSA6ICcnLFxuICAgICAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJyA6ICd0ZXh0L3R1cnRsZScgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcGFyYW1zXG4gICAgICAgIClcbiAgICAgICkudGhlbihcbiAgICAgICAgKHJlc3BvbnNlOiBhbmd1bGFyLklIdHRwUHJvbWlzZUNhbGxiYWNrQXJnPHN0cmluZz4pID0+IGRlZmVycmVkLnJlc29sdmUocmVzcG9uc2Uuc3RhdHVzID09PSAyMDQpXG4gICAgICAsIChyZXNwb25zZTogYW5ndWxhci5JSHR0cFByb21pc2VDYWxsYmFja0FyZzxzdHJpbmc+KSA9PiBkZWZlcnJlZC5yZXNvbHZlKGZhbHNlKVxuICAgICAgKVxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICAgIHB1YmxpYyBnZXQ8VD4oZW5kcG9pbnQ6IHN0cmluZywgZ3JhcGhJUkk/OiBzdHJpbmcsIHBhcmFtcz86IHt9KTogYW5ndWxhci5JSHR0cFByb21pc2U8VD4ge1xuICAgICAgcmV0dXJuIHRoaXMuJGh0dHAoXG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICB1cmwgOiBlbmRwb2ludCxcbiAgICAgICAgICAgIHBhcmFtczogZ3JhcGhJUkkgPyB7IGdyYXBoOiBncmFwaElSSSB9IDogeydkZWZhdWx0JzogJyd9LFxuICAgICAgICAgICAgaGVhZGVyczogeyAnQWNjZXB0JyA6ICd0ZXh0L3R1cnRsZScgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcGFyYW1zXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9XG4gICAgcHVibGljIHBvc3Q8VD4oZW5kcG9pbnQ6IHN0cmluZywgZ3JhcGg6IHN0cmluZywgZ3JhcGhJUkk/OiBzdHJpbmcsIHBhcmFtcz86IHt9KTogYW5ndWxhci5JSHR0cFByb21pc2U8VD4ge1xuICAgICAgcmV0dXJuIHRoaXMuJGh0dHAoXG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgdXJsIDogZW5kcG9pbnQsXG4gICAgICAgICAgICBwYXJhbXM6IGdyYXBoSVJJID8geyBncmFwaDogZ3JhcGhJUkkgfSA6IHsnZGVmYXVsdCc6ICcnfSxcbiAgICAgICAgICAgIGRhdGE6IGdyYXBoLFxuICAgICAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJyA6ICd0ZXh0L3R1cnRsZScgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcGFyYW1zXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9XG4gICAgcHVibGljIHB1dDxUPihlbmRwb2ludDogc3RyaW5nLCBncmFwaDogc3RyaW5nLCBncmFwaElSST86IHN0cmluZywgcGFyYW1zPzoge30pOiBhbmd1bGFyLklIdHRwUHJvbWlzZTxUPiB7XG4gICAgICByZXR1cm4gdGhpcy4kaHR0cChcbiAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyxcbiAgICAgICAgICAgIHVybCA6IGVuZHBvaW50LFxuICAgICAgICAgICAgcGFyYW1zOiBncmFwaElSSSA/IHsgZ3JhcGg6IGdyYXBoSVJJIH0gOiB7J2RlZmF1bHQnOiAnJ30sXG4gICAgICAgICAgICBkYXRhOiBncmFwaCxcbiAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZScgOiAndGV4dC90dXJ0bGUnIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHBhcmFtc1xuICAgICAgICApXG4gICAgICApXG4gICAgfVxuICAgIHB1YmxpYyBkZWxldGU8VD4oZW5kcG9pbnQ6IHN0cmluZywgZ3JhcGhJUkk6IHN0cmluZywgcGFyYW1zPzoge30pOiBhbmd1bGFyLklIdHRwUHJvbWlzZTxUPiB7XG4gICAgICByZXR1cm4gdGhpcy4kaHR0cChcbiAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgICAgIHVybDogZW5kcG9pbnQsXG4gICAgICAgICAgICBwYXJhbXM6IGdyYXBoSVJJID8geyBncmFwaDogZ3JhcGhJUkkgfSA6IHsnZGVmYXVsdCc6ICcnfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcGFyYW1zXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9XG4gICAgcHVibGljIHF1ZXJ5PFQgZXh0ZW5kcyB7W2lkOiBzdHJpbmddOiBJU3BhcnFsQmluZGluZ30+KGVuZHBvaW50OiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcsIHBhcmFtcz86IHt9KTogYW5ndWxhci5JSHR0cFByb21pc2U8SVNwYXJxbEJpbmRpbmdSZXN1bHQ8VD4+IHtcbiAgICAgIGlmIChxdWVyeS5sZW5ndGggPD0gMjA0OClcbiAgICAgICAgcmV0dXJuIHRoaXMuJGh0dHAoXG4gICAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgIHVybDogZW5kcG9pbnQsXG4gICAgICAgICAgICAgIHBhcmFtczogeyBxdWVyeTogcXVlcnkgfSxcbiAgICAgICAgICAgICAgaGVhZGVyczogeyAnQWNjZXB0JyA6ICdhcHBsaWNhdGlvbi9zcGFycWwtcmVzdWx0cytqc29uJyB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGFyYW1zXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiB0aGlzLiRodHRwKFxuICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgICAgdXJsOiBlbmRwb2ludCxcbiAgICAgICAgICAgICAgZGF0YTogJ3F1ZXJ5PScgKyBlbmNvZGVVUklDb21wb25lbnQocXVlcnkpLFxuICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgICAgICdBY2NlcHQnIDogJ2FwcGxpY2F0aW9uL3NwYXJxbC1yZXN1bHRzK2pzb24nXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXJhbXNcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICB9XG4gICAgcHVibGljIGNvbnN0cnVjdDxUPihlbmRwb2ludDogc3RyaW5nLCBxdWVyeTogc3RyaW5nLCBwYXJhbXM/OiB7fSk6IGFuZ3VsYXIuSUh0dHBQcm9taXNlPFQ+IHtcbiAgICAgIGlmIChxdWVyeS5sZW5ndGggPD0gMjA0OClcbiAgICAgICAgcmV0dXJuIHRoaXMuJGh0dHAoXG4gICAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgIHVybCA6IGVuZHBvaW50LFxuICAgICAgICAgICAgICBwYXJhbXM6IHsgcXVlcnk6IHF1ZXJ5IH0sXG4gICAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0FjY2VwdCcgOiAndGV4dC90dXJ0bGUnIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXJhbXNcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIHRoaXMuJGh0dHAoXG4gICAgICAgICAgYW5ndWxhci5leHRlbmQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICB1cmw6IGVuZHBvaW50LFxuICAgICAgICAgICAgICBkYXRhOiBxdWVyeSxcbiAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vc3BhcnFsLXF1ZXJ5JyxcbiAgICAgICAgICAgICAgICAnQWNjZXB0JyA6ICd0ZXh0L3R1cnRsZSdcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhcmFtc1xuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgIH1cbiAgICBwdWJsaWMgdXBkYXRlPFQ+KGVuZHBvaW50OiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcsIHBhcmFtcz86IHt9KTogYW5ndWxhci5JSHR0cFByb21pc2U8VD4ge1xuICAgICAgcmV0dXJuIHRoaXMuJGh0dHAoXG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgdXJsOiBlbmRwb2ludCxcbiAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZScgOiAnYXBwbGljYXRpb24vc3BhcnFsLXVwZGF0ZScgfSxcbiAgICAgICAgICAgIGRhdGE6IHF1ZXJ5XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwYXJhbXNcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH1cbiAgfVxufVxuIl19
