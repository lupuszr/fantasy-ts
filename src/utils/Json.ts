import { List, cons, nil } from "./List";

export abstract class Json {
  cata<JNullRes, JBoolRes, JNumberRes, JStringRes, JArrayRes, JObjectRes>(
    match: {
      JNull: () => JNullRes;
      JBool: (b: boolean) => JBoolRes;
      JNumber: (n: number) => JNumberRes;
      JString: (s: string) => JStringRes;
      JArray: (a: JSONArray) => JArrayRes;
      JObject: (o: JSONObject) => JObjectRes;
    }
    ) {
      type constraintsT = keyof typeof match;
      const cname = (this.constructor.name as unknown) as constraintsT;
      switch (cname) {
        case 'JNull': {
          return match['JNull']();
        }
        case 'JBool': {
          const { b } = (this as unknown) as JBool;
          return match['JBool'](b);
        }
        case 'JNumber': {
          const { n } = (this as unknown) as JNumber;
          return match['JNumber'](n);
        }
        case 'JString': {
          const { s } = (this as unknown) as JString;
          return match['JString'](s);
        }
        case 'JArray': {
          const { a } = (this as unknown) as JArray;
          return match['JArray'](a);
        }
        case 'JObject':
        default: {
          const { o } = (this as unknown) as JObject;
          return match['JObject'](o);
        }
      }
    }

    
    static fromJSON(a: possibleJSON): Json {
      switch(true) {
        case a === null: {
          return new JNull();
        }
        case Array.isArray(a): {
          const x = a as Array<possibleJSON>
          return new JArray(List.fromArray(x).chain(u => cons<Json>(Json.fromJSON(u), nil() as List<Json>)));
        }
        case typeof a === "string": {
          return new JString(a as string);
        }
        case typeof a === "number": {
          return new JNumber(a as number);
        }
        case typeof a === "boolean": {
          return new JBool(a as boolean);
        }
        case typeof a === "object":
        default: {
          const x = a as {[name in string]: unknown};  
          const u = Object.keys(x).reduce((acc, curr) => ({
            ...acc,
            [curr]: Json.fromJSON(x[curr] as possibleJSON)
          }), {}) as {[name in string]: constraints};
          return new JObject(u);
        }
      }
    }
  }
  type possibleJSON = null | boolean | number | unknown[] | string | object
  type constraints = JSONArray | JSONObject | JSONField | JNull | JBool | JNumber | JString
  export type JSONArray = List<Json>;
  export type JSONObject = {[a in string]: unknown};
  export type JSONField = string;

  export class JNull extends Json {
    constructor() {
      super();
    }
  }
  export class JBool extends Json {
    constructor(public b: boolean) {
      super();
    }
  }
  export class JNumber extends Json {
    constructor(public n: number) {
      super();
    }
  }
  export class JString extends Json {
    constructor(public s: string) {
      super();
    }
  }
  export class JArray extends Json {
    constructor(public a: JSONArray) {
      super();
    }
  }
  export class JObject extends Json {
    constructor(public o: JSONObject) {
      super();
    }
  }

console.log(JSON.stringify(Json.fromJSON({a: [1,2,"d"]})))