import 'reflect-metadata';
export const IS_UPLOAD_METHOD = 'is_upload_method';

export const Upload = (): MethodDecorator => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
  Reflect.defineMetadata(IS_UPLOAD_METHOD, true, target, propertyKey);
}
