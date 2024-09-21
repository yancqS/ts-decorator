import 'reflect-metadata';
import { PATH_PREFIX_METADATA, PATH_METADATA, METHOD_METADATA } from '../decorator/controllerDecorator';

export type RouteInfo = {
  path: string;
  method: 'GET' | 'POST',
  fn: Function,
  classFn: new () => any,
  methodName: string,
};

export const isConstrucor = (fn: any): boolean => {
  try {
    new fn();
  } catch (err) {
    if (err.message.indexOf('is not a constructor') >= 0) {
      return false;
    }
  }
  return true;
};

export const isFunction = (functionToCheck: unknown): boolean => {
  return functionToCheck && Object.prototype.toString.call(functionToCheck) === '[object Function]';
};

export const mapRoute = (classFn: new () => any): {
  prefix: string,
  info: RouteInfo[]
} => {
  const prefix = Reflect.getMetadata(PATH_PREFIX_METADATA, classFn) ?? '';
  const methodNames = Object.getOwnPropertyNames(classFn.prototype)
    .filter(item => isFunction(classFn.prototype[item]) && !isConstrucor(classFn.prototype[item]) && Reflect.getMetadata(PATH_METADATA, classFn.prototype[item]));
  const info: RouteInfo[] = methodNames.map(methodName => {
    const fn: Function = classFn.prototype[methodName];
    // 取出定义的 metadata
    const path: string = Reflect.getMetadata(PATH_METADATA, fn);
    const method: 'GET' | 'POST' = Reflect.getMetadata(METHOD_METADATA, fn);
    return {
      path,
      method,
      fn,
      classFn,
      methodName,
    };
  });
  return { prefix, info }
}

export function getQuery<T extends Record<string, string>>(urlParams: string): { [K in keyof T]: string };
export function getQuery(urlParams: string, key: string): string;
export function getQuery<T extends Record<string, string>>(urlParams: string, key?: string): string | { [K in keyof T]: string } {
  if (!urlParams) return '';
  const params: Record<string, string> = {};
  const paramsKVStr = urlParams.split('&');
  paramsKVStr.forEach((item) => {
    // 为了防止value中含有 = 引起 bug
    const [paramKey, ...value] = item.split('=');
    params[paramKey] = value.join('=');
  });
  if (key) return params[key];
  return params as T;
}
