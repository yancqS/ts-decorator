import 'reflect-metadata';
import {TypeEnum} from "../interface";
export const METHOD_METADATA = 'method';
export const PATH_PREFIX_METADATA = 'path_prefix';
export const PATH_METADATA = 'path';
export const QUERY_PARAMS = 'query_params';
export const BODY_PARAMS = 'body_params';
export const IS_ALL_PARAMS = 'is_all_params';

export const Controller = (prefix: string = ''): ClassDecorator => target => {
  Reflect.defineMetadata(PATH_PREFIX_METADATA, prefix, target);
};

const createRequestMethod = (method: 'GET' | 'POST') =>
  (path: string): MethodDecorator =>
    (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) =>
      {
        Reflect.defineMetadata(PATH_METADATA, path, descriptor.value);
        Reflect.defineMetadata(METHOD_METADATA, method, descriptor.value);
      }
const createGetParams = (method: 'GET' | 'POST') =>
  (key: string | TypeEnum.ALL): ParameterDecorator =>
    (target: any, propertyKey: string | symbol, index: number) =>
      {
        if (Array.isArray(target[propertyKey].paramList)) {
          if (target[propertyKey].paramList.includes(key)) return;
          target[propertyKey].paramList.push(key);
        } else {
          target[propertyKey].paramList = [key];
        }
        Reflect.defineMetadata(method === 'GET' ? QUERY_PARAMS : BODY_PARAMS, target[propertyKey].paramList, target, propertyKey);
        Reflect.defineMetadata(IS_ALL_PARAMS, key === TypeEnum.ALL, target, propertyKey);
      }

export const Get = createRequestMethod('GET');
export const Post = createRequestMethod('POST');

export const Query = createGetParams('GET');
export const Body = createGetParams('POST');
