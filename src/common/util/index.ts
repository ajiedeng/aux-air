import moment, { Moment } from "moment";
export const parseUrl = (url: string) => {
  const pattern = /(\w+)=(\w+)/gi;
  const parames = {} as any;
  url.replace(pattern, (match: string, ...arg: string[]) => {
    parames[arg[0]] = arg[1];
    return arg[1];
  });
  return parames;
};

export const getHost = () => {
  return window.localStorage.getItem('saas_host') + '/';
};


/*
* params:[..]    =>  {
*                       key:value
* vals:[..]      =>  }
* */
export const origin2KeyVal = function ({ params = [], vals = [] }: { params: string[], vals: any }) {
  if (Array.isArray(params) && Array.isArray(vals)) {
    return params.reduce((acc, cur, idx) => {
      if (vals[idx].length > 1) {
        acc[cur] = vals[idx].map((item: any) => item.val);
      } else {
        acc[cur] = vals[idx][0].val;
      }
      return acc;
    }, {} as any);
  } else {
    console.error('_origin2KeyVal error !');
    return {};
  }

};

/*
*{            => params:[..]
* key:value
* }           => vals:[..]
* */
export const keyVal2Origin = function (status = {} as { [param: string]: string | number }) {
  const params = [], vals = [];

  let keys = Object.keys(status);
  for (let i = 0; i < keys.length; ++i) {
    let key = keys[i];
    let val = status[key];
    params.push(key);

    if (Array.isArray(val)) {
      vals.push(val.map(item => ({ 'val': item, 'idx': 1 })))
    } else {
      vals.push([{ 'val': val, 'idx': 1 }]);
    }
  }

  return { params, vals };
};


export const isFunction = function (func: any) {
  return Object.prototype.toString.call(func).slice(8, -1) === 'Function';
};

export const simpleClone: <T>(obj: T) => T = (obj) => {
  if (!obj || 'object' != typeof obj) {
    return obj;
  }
  const copy = Object.keys(obj).reduce((copy, field) => {
    const val = (obj as any)[field];
    let copyVal;
    if (Array.isArray(val)) {
      copyVal = [...val];
    } else if ('object' === typeof val) {
      if (val && val.clone && isFunction(val.clone)) {
        //如果对象本身提供了clone方法
        copyVal = val.clone();
      } else {
        copyVal = simpleClone(val);
      }
    } else {
      copyVal = val;
    }
    copy[field] = copyVal;
    return copy;
  }, {} as any);

  return Object.setPrototypeOf(copy, Object.getPrototypeOf(obj));
};

export const C2F = (C: number) => Math.round(C * 9 / 5 + 32);

export const F2C = (F: number) => Math.round(5 * (F - 32) / 9 * 10);

export const M1IsTimeBeforeM2 = (M1: Moment, M2: Moment) => {//时/分/秒
  const now = moment();
  const _m1 = now.clone().hour(M1.hour()).minute(M1.minute());
  const _m2 = now.clone().hour(M2.hour()).minute(M2.minute());
  return _m1.isBefore(_m2)
}