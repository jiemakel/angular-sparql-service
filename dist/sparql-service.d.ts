/// <reference types="angular" />
import * as angular from 'angular';
export interface ISparqlBinding {
    type: 'uri' | 'bnode' | 'literal';
    value: string;
    'xml:lang'?: string;
    datatype?: string;
}
export interface ISparqlBindingResult<BindingType extends {
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
export interface ISparqlAskResult {
    boolean: boolean;
}
export interface IBindingsToObjectConfiguration {
    bindingTypes?: {
        [varname: string]: 'ignore' | 'single' | 'array' | 'uniqueArray' | 'hash';
    };
    bindingConverters?: {
        [varname: string]: (binding: ISparqlBinding, bindings: {
            [id: string]: ISparqlBinding;
        }) => any;
    };
    bindingHandlers?: {
        [varname: string]: (obj: any, prop: any, value: any, bkey: string, binding: ISparqlBinding, bindings: {
            [id: string]: ISparqlBinding;
        }) => void;
    };
}
export declare class UniqueObjectTracker {
    objectsById?: {
        [id: string]: {};
    };
    assignmentsById?: {
        [trackId: string]: {
            [id: string]: {};
        };
    };
}
export declare class SparqlService {
    private $http;
    private $q;
    static stringToSPARQLString(string: any): string;
    static bindingsToObject<T>(bindings: {
        [id: string]: ISparqlBinding;
    }, ret?: {}, config?: IBindingsToObjectConfiguration, trackId?: string, tracker?: UniqueObjectTracker): T;
    static bindingToValue(binding: ISparqlBinding): any;
    static bindingToString(binding: ISparqlBinding): string;
    constructor($http: angular.IHttpService, $q: angular.IQService);
    check(endpoint: string, params?: {}): angular.IPromise<boolean>;
    checkUpdate(endpoint: string, params?: {}): angular.IPromise<boolean>;
    checkRest(endpoint: string, params?: {}): angular.IPromise<boolean>;
    get<T>(endpoint: string, graphIRI?: string, params?: {}): angular.IHttpPromise<T>;
    post<T>(endpoint: string, graph: string, graphIRI?: string, params?: {}): angular.IHttpPromise<T>;
    put<T>(endpoint: string, graph: string, graphIRI?: string, params?: {}): angular.IHttpPromise<T>;
    delete<T>(endpoint: string, graphIRI: string, params?: {}): angular.IHttpPromise<T>;
    query<T extends {
        [id: string]: ISparqlBinding;
    }>(endpoint: string, query: string, params?: {}): angular.IHttpPromise<ISparqlBindingResult<T>>;
    construct<T>(endpoint: string, query: string, params?: {}): angular.IHttpPromise<T>;
    update<T>(endpoint: string, query: string, params?: {}): angular.IHttpPromise<T>;
}
