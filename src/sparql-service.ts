angular.module('fi.seco.sparql', [])
namespace fi.seco.sparql {
  'use strict'

  export interface ISparqlBinding {
    type: 'uri' | 'bnode' | 'literal',
    value: string,
    'xml:lang'?: string,
    datatype?: string
  }

  export interface ISparqlBindingResult<BindingType extends {[id: string]: ISparqlBinding}> {
    head: {
      vars: string[],
      link?: string[]
    },
    results: {
      bindings: BindingType[]
    }
  }

  export interface ISparqlAskResult {
    boolean: boolean
  }

  export interface IBindingsToObjectConfiguration {
    bindingTypes?: {[varname: string]: 'ignore' | 'single' | 'array' | {[id: string]: ''} | 'hash'}
    bindingConverters?: {[varname: string]: (binding: ISparqlBinding, bindings: {[id: string]: ISparqlBinding}) => any }
    subObjectPrefixes?: {[prefix: string]: {[id: string]: {}}}
  }

  export class SparqlService {
    public static stringToSPARQLString(string): string {
      return '"' + string
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\t/g, '\\t')
        .replace(/\r/g, '\\r')
        .replace(/\f/g, '\\f')
        + '"'
    }
    public static bindingsToObject<T>(bindings: {[id: string]: ISparqlBinding}, ret: {} = {}, config?: IBindingsToObjectConfiguration): T {
      for (let bkey in bindings) {
        let okey: string = bkey
        let obj: {} = ret
        let val: any
        if (config && config.subObjectPrefixes && config.subObjectPrefixes[bkey]) {
          if (!config.subObjectPrefixes[bkey][bindings[bkey].value]) {
            if (config && config.bindingConverters && config.bindingConverters[bkey])
              val = config.bindingConverters[bkey](bindings[bkey], bindings)
            else val = {}
            config.subObjectPrefixes[bkey][bindings[bkey].value] = val
          } else val = config.subObjectPrefixes[bkey][bindings[bkey].value]
        } else {
          if (config && config.subObjectPrefixes)
            for (let sop in config.subObjectPrefixes)
              if (bkey.indexOf(sop) === 0) {
                if (!config.subObjectPrefixes[sop][bindings[sop].value]) {
                  if (config && config.bindingConverters && config.bindingConverters[sop])
                    obj = config.bindingConverters[sop](bindings[sop], bindings)
                  else obj = {}
                  config.subObjectPrefixes[sop][bindings[sop].value] = obj
                } else obj = config.subObjectPrefixes[sop][bindings[sop].value]
                okey = bkey.substring(sop.length)
              }
          if (config && config.bindingConverters && config.bindingConverters[bkey])
            val = config.bindingConverters[bkey](bindings[bkey], bindings)
          else if (!config || !config.bindingTypes || !config.bindingTypes[bkey] || (config.bindingTypes[bkey] !== 'hash' && config.bindingTypes[bkey] !== 'ignore'))
            val = SparqlService.bindingToValue(bindings[bkey])
        }
        if (config && config.bindingTypes && config.bindingTypes[bkey]) {
          switch (config.bindingTypes[bkey]) {
            case 'ignore': break
            case 'single': obj[okey] = val; break
            case 'array':
              if (!Array.isArray(obj[okey])) obj[okey] = []
              obj[okey].push(val)
              break
            case 'hash':
              if (!obj[okey]) obj[okey] = {}
              if (val) obj[okey][bindings[bkey].value] = val
              else if (bindings[bkey].type === 'literal') {
                let key2: string = bindings[bkey].datatype
                if (!key2) {
                  key2 = bindings[bkey]['xml:lang']
                  if (!key2) key2 = ''
                }
                obj[okey][key2] = bindings[bkey].value
              } else obj[okey][bindings[bkey].value] = bindings[bkey].value
              break
            default: // uniqueArray
              if (!obj[okey]) obj[okey] = []
              if (config.bindingTypes[bkey][bindings[bkey].value] !== '') {
                config.bindingTypes[bkey][bindings[bkey].value] = ''
                obj[okey].push(val)
              }
          }
        } else if (Array.isArray(obj[okey])) obj[okey].push(val)
        else if (typeof(obj[okey]) === 'object' && bindings[bkey]) {
          if (bindings[bkey].type === 'literal') {
            let key2: string = bindings[bkey].datatype
            if (!key2) {
              key2 = bindings[bkey]['xml:lang']
              if (!key2) key2 = ''
            }
            obj[okey][key2] = bindings[bkey].value
          } else obj[okey][bindings[bkey].value] = bindings[bkey].value
        }
        else obj[okey] = val
      }
      return <T>ret
    }
    public static bindingToValue(binding: ISparqlBinding): any {
      if (!binding) return undefined
      if (binding.type === 'uri') return binding.value
      else if (binding.type === 'bnode') return binding.value
      else if (binding.datatype) switch (binding.datatype) {
        case 'http://www.w3.org/2001/XMLSchema#integer':
        case 'http://www.w3.org/2001/XMLSchema#decimal': return parseInt(binding.value, 10)
        case 'http://www.w3.org/2001/XMLSchema#float':
        case 'http://www.w3.org/2001/XMLSchema#double': return parseFloat(binding.value)
        case 'http://www.w3.org/2001/XMLSchema#boolean': return binding.value ? true : false
        default:
      }
      return binding.value
    }
    public static bindingToString(binding: ISparqlBinding): string {
      if (!binding) return 'UNDEF'
      else {
        let value: string = binding.value.replace(/\\/g, '\\\\').replace(/\t/g, '\\t').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/[\b]/g, '\\b').replace(/\f/g, '\\f').replace(/\"/g, '\\"').replace(/\'/g, '\\\'')
        if (binding.type === 'uri') return '<' + value + '>'
        else if (binding.type === 'bnode') return '_:' + value
        else if (binding.datatype) switch (binding.datatype) {
          case 'http://www.w3.org/2001/XMLSchema#integer':
          case 'http://www.w3.org/2001/XMLSchema#decimal':
          case 'http://www.w3.org/2001/XMLSchema#double':
          case 'http://www.w3.org/2001/XMLSchema#boolean': return value
          case 'http://www.w3.org/2001/XMLSchema#string': return '"' + value + '"'
          default: return '"' + value + '"^^<' + binding.datatype + '>'
        }
        else if (binding['xml:lang']) return '"' + value + '"@' + binding['xml:lang']
        else return '"' + value + '"'
      }
    }
    constructor(private $http: angular.IHttpService, private $q: angular.IQService) {}
    public check(endpoint: string, params?: {}): angular.IPromise<boolean> {
      let deferred: angular.IDeferred<any> = this.$q.defer()
      this.$http(
        angular.extend(
          {
            method: 'GET',
            url: endpoint,
            params: { query: 'ASK {}' },
            headers: { 'Accept': 'application/sparql-results+json' }
          },
          params
        )
      ).then(
        (response: angular.IHttpPromiseCallbackArg<ISparqlAskResult>) => deferred.resolve(response.data.boolean === true)
      , (response: angular.IHttpPromiseCallbackArg<string>) => deferred.resolve(false)
      )
      return deferred.promise;
    }
    public checkUpdate(endpoint: string, params?: {}): angular.IPromise<boolean> {
      let deferred: angular.IDeferred<any> = this.$q.defer()
      this.$http(
        angular.extend(
          {
            method: 'POST',
            url: endpoint,
            headers: { 'Content-Type' : 'application/sparql-update' },
            data: 'INSERT DATA {}'
          },
          params
        )
      ).then(
        (response: angular.IHttpPromiseCallbackArg<string>) => deferred.resolve(response.status === 204)
      , (response: angular.IHttpPromiseCallbackArg<string>) => deferred.resolve(false)
      )
      return deferred.promise;
    }
    public checkRest(endpoint: string, params?: {}): angular.IPromise<boolean> {
      let deferred: angular.IDeferred<any> = this.$q.defer()
      this.$http(
        angular.extend(
          {
            method: 'POST',
            url : endpoint + '?default',
            data : '',
            headers: { 'Content-Type' : 'text/turtle' }
          },
          params
        )
      ).then(
        (response: angular.IHttpPromiseCallbackArg<string>) => deferred.resolve(response.status === 204)
      , (response: angular.IHttpPromiseCallbackArg<string>) => deferred.resolve(false)
      )
      return deferred.promise;
    }
    public get<T>(endpoint: string, graphIRI?: string, params?: {}): angular.IHttpPromise<T> {
      return this.$http(
        angular.extend(
          {
            method: 'GET',
            url : endpoint,
            params: graphIRI ? { graph: graphIRI } : {'default': ''},
            headers: { 'Accept' : 'text/turtle' }
          },
          params
        )
      )
    }
    public post<T>(endpoint: string, graph: string, graphIRI?: string, params?: {}): angular.IHttpPromise<T> {
      return this.$http(
        angular.extend(
          {
            method: 'POST',
            url : endpoint,
            params: graphIRI ? { graph: graphIRI } : {'default': ''},
            data: graph,
            headers: { 'Content-Type' : 'text/turtle' }
          },
          params
        )
      )
    }
    public put<T>(endpoint: string, graph: string, graphIRI?: string, params?: {}): angular.IHttpPromise<T> {
      return this.$http(
        angular.extend(
          {
            method: 'PUT',
            url : endpoint,
            params: graphIRI ? { graph: graphIRI } : {'default': ''},
            data: graph,
            headers: { 'Content-Type' : 'text/turtle' }
          },
          params
        )
      )
    }
    public delete<T>(endpoint: string, graphIRI: string, params?: {}): angular.IHttpPromise<T> {
      return this.$http(
        angular.extend(
          {
            method: 'DELETE',
            url: endpoint,
            params: graphIRI ? { graph: graphIRI } : {'default': ''}
          },
          params
        )
      )
    }
    public query<T extends {[id: string]: ISparqlBinding}>(endpoint: string, query: string, params?: {}): angular.IHttpPromise<ISparqlBindingResult<T>> {
      if (query.length <= 2048)
        return this.$http(
          angular.extend(
            {
              method: 'GET',
              url: endpoint,
              params: { query: query },
              headers: { 'Accept' : 'application/sparql-results+json' }
            },
            params
          )
        )
      else
        return this.$http(
          angular.extend(
            {
              method: 'POST',
              url: endpoint,
              data: 'query=' + encodeURIComponent(query),
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept' : 'application/sparql-results+json'
              }
            },
            params
          )
        )
    }
    public construct<T>(endpoint: string, query: string, params?: {}): angular.IHttpPromise<T> {
      if (query.length <= 2048)
        return this.$http(
          angular.extend(
            {
              method: 'GET',
              url : endpoint,
              params: { query: query },
              headers: { 'Accept' : 'text/turtle' }
            },
            params
          )
        )
      else
        return this.$http(
          angular.extend(
            {
              method: 'POST',
              url: endpoint,
              data: query,
              headers: {
                'Content-Type': 'application/sparql-query',
                'Accept' : 'text/turtle'
              }
            },
            params
          )
        )
    }
    public update<T>(endpoint: string, query: string, params?: {}): angular.IHttpPromise<T> {
      return this.$http(
        angular.extend(
          {
            method: 'POST',
            url: endpoint,
            headers: { 'Content-Type' : 'application/sparql-update' },
            data: query
          },
          params
        )
      )
    }
  }
}
