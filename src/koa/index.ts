import 'reflect-metadata';
import Koa, {Context} from 'koa';
import cors from '@koa/cors';
import {bodyParser} from "@koa/bodyparser";
import Router from 'koa-router';
import {glob} from 'glob';
import {koaFormidable} from "../middleware/koa-formidable";
import {getQuery, isConstrucor, mapRoute} from "../utils/common";
import {QUERY_PARAMS, BODY_PARAMS, IS_ALL_PARAMS} from '../decorator/controllerDecorator';
import {IS_UPLOAD_METHOD} from "../decorator/uploadDecorator";

// 自动扫描 Controller
const getRouterInfoList = async () => {
  const controllerList = await glob('**/controller/*.ts', {
    absolute: true,
  });

  const classFnList: Record<string, { new(): any }>[] = controllerList.map(controller => require(controller));

  return classFnList.map(classFn => {
    return Reflect.ownKeys(classFn)
      .filter(key => key !== '__esModule')
      .map((className: string) => {
        const _class = classFn[className];
        const id = Reflect.getMetadata('cus:id', _class);
        const isCons = isConstrucor(_class);
        if (isCons && id) {
          return mapRoute(_class);
        }
      });
  }).flat().filter(Boolean);
}

const getParams = (queryString: string | Record<string, unknown>, keys: string[], isAll: boolean = false) => {
  const params = [];
  if (isAll && typeof queryString === 'string') {
    return getQuery(queryString);
  }
  for (const index in keys) {
    params[index] = typeof queryString === 'string' ?
      getQuery(queryString, keys[index]) :
      queryString[keys[index]];
  }
  return params;
}

getRouterInfoList().then(routeInfoList => {
  routeInfoList.forEach(({prefix, info}) => {
    info.forEach(item => {
      const {path, method, fn, classFn, methodName} = item;
      router[method.toLowerCase()](`${prefix}${path}`, async (ctx: Context) => {
        const keys: string[] = Reflect.getMetadata(QUERY_PARAMS, classFn.prototype, methodName);
        const bodyPropertyKeys: string[] = Reflect.getMetadata(BODY_PARAMS, classFn.prototype, methodName);
        const isAll: boolean = Reflect.getMetadata(IS_ALL_PARAMS, classFn.prototype, methodName);
        const isUpload = Reflect.getMetadata(IS_UPLOAD_METHOD, classFn.prototype, methodName) ?? false;
        const methodFunc = fn.bind(classFn.prototype);
        if (ctx.method === "GET") {
          const queryString: string = ctx.request.querystring;
          const params = getParams(queryString, keys, isAll);
          ctx.body = isAll ?
            await methodFunc(params) :
            await methodFunc(...(params as unknown[]).reverse());
        } else {
          const params = getParams(ctx.request.body, bodyPropertyKeys, isAll);
          ctx.body = isAll || isUpload ?
            await methodFunc(ctx.request.body) :
            await methodFunc(...(params as unknown[]).reverse());
        }
      });
    });
  });
});

const app: Koa = new Koa();
const router = new Router();

app.use(cors({
  origin(ctx) {
    return ctx.get('Origin') || '*';
  },
}));
app.use(koaFormidable({}));
app.use(bodyParser({
  enableTypes: ['json', 'form'],
  encoding: 'utf8'
}));
app.use(router.routes());

app.listen(8080, () => {
  console.log('sir, service is running at http://localhost:8080...');
});
