import {Context, Next} from "koa";
import formidable, {Options} from "formidable";

export const koaFormidable = (opt: Options) => {
  return async (ctx: Context, next: Next) => {
    const contentType = ctx.request.headers['content-type'];
    if (contentType?.startsWith('multipart/form-data') && ctx.method.toLocaleLowerCase() === 'post') {
      const form = formidable(opt);
      await new Promise<void>((resolve, reject) => {
        form.parse(ctx.req, (err, fields, files) => {
          if (err) {
            reject(err);
            return;
          }
          ctx.request.body = { fields, files };
          resolve();
          return;
        });
      });
    }
    await next();
  }
}