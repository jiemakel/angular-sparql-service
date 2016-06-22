declare namespace fi.seco.sparql {
    interface ISparqlBinding {
        type: string;
        value: string;
        'xml:lang'?: string;
        datatype?: string;
    }
    interface ISparqlBindingResult<BindingType extends {
        [id: string]: ISparqlBinding;
    }> {
        head: {
            vars: string[];
            link?: string[];
        };
        results: {
            bindings: BindingType[];
        };
    }
    interface ISparqlAskResult {
        boolean: boolean;
    }
    class SparqlService {
        private $http;
        private $q;
        static stringToSPARQLString(string: any): string;
        static bindingsToObject<T>(result: {
            [id: string]: ISparqlBinding;
        }): T;
        static bindingToValue(binding: ISparqlBinding): any;
        static bindingToString(binding: ISparqlBinding): string;
        constructor($http: angular.IHttpService, $q: angular.IQService);
        check(endpoint: string, params?: {}): angular.IPromise<boolean>;
        checkUpdate(endpoint: string, params?: {}): angular.IPromise<boolean>;
        checkRest(endpoint: string, params?: {}): angular.IPromise<boolean>;
        get(endpoint: string, graphIRI?: string, params?: {}): angular.IHttpPromise<string>;
        post(endpoint: string, graph: string, graphIRI?: string, params?: {}): angular.IHttpPromise<string>;
        put(endpoint: string, graph: string, graphIRI?: string, params?: {}): angular.IHttpPromise<string>;
        delete(endpoint: string, graphIRI: string, params?: {}): angular.IHttpPromise<string>;
        query<T extends {
            [id: string]: ISparqlBinding;
        }>(endpoint: string, query: string, params?: {}): angular.IHttpPromise<ISparqlBindingResult<T>>;
        construct(endpoint: string, query: string, params?: {}): angular.IPromise<string>;
        update(endpoint: string, query: string, params?: {}): angular.IPromise<string>;
    }
}
