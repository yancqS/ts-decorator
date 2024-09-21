import { config as _config } from '../../config';

export function Config(id?: string): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    // console.log(target, 'config');
    if (id) {
      target[propertyKey] = _config[id];
    } else {
      target[propertyKey] = _config;
    }
  }
}
