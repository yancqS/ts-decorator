import 'reflect-metadata';
import containerInstance from "../container";

// 反射机制指的是程序在运行时能够获取自身的信息。例如一个对象能够在运行时知道自己有哪些方法和属性。

/**
 * Provider 类装饰器，注册类
 * @params {string} id
 * @params {boolean} singleton - 是否单例初始化
 * @params {any[]} 类实例化参数
*/
export function Provider(
  id?: string,
  singleton?: boolean,
  ...args: any[]
): ClassDecorator {
  return (target: any) => {
    let _id: string | symbol;
    let _singletonInstance: any;

    // console.log(Reflect.getMetadata('design:paramtypes', target));
    // console.log(target.name)

    // 判断如果设置id， id是否唯一
    if (id && containerInstance.get(id)) {
      throw new Error(`[Service]: 此标识符(${id})已被注册使用`);
    }

    _id = id || Symbol(target.name);

    Reflect.defineMetadata('cus:id', _id, target);
    Reflect.defineMetadata('cus:args', args, target);
    Reflect.defineMetadata('cus:singleton', Boolean(singleton), target);

    if(singleton) {
      _singletonInstance = new target(...args);
    }

    containerInstance.set(_id, _singletonInstance || target);
  }
}
