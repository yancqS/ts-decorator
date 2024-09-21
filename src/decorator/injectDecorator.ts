import 'reflect-metadata';
import containerInstance from "../container";

export function Inject(id?: string): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    // console.log(target, 'inject');
    const dependency = Reflect.getMetadata('design:type', target, propertyKey);
    // console.log(dependency, propertyKey);

    const _isSingleton: boolean = Reflect.getMetadata('cus:singleton', dependency);
    const _args: any[] = Reflect.getMetadata('cus:args', dependency) ?? [];
    const _id = id || Reflect.getMetadata('cus:id', dependency);
    
    const _dep: any = containerInstance.get(_id);

    if (!_dep) throw new Error(`[Error in Inject]: Container 中未注册 ${id}`);

    Reflect.defineProperty(target, propertyKey, {
      value: _isSingleton ? _dep : new _dep(..._args),
    });
  }
}
