import { Json, JSONObject, JSONField } from "../Json";
import { List } from "../List";

abstract class JsonZipper  {
    cata<ZJsonRes, ZArrayRes, ZObjRes>(match: { 
        ZJson: (j: Json) => ZJsonRes;
        ZArray: (parrent: JsonZipper, u: boolean, ls: List<Json>, x: Json, rs: List<Json>) => ZArrayRes;
        ZObj: (parrent: JsonZipper, u: boolean, o: JSONObject, x: [JSONField, Json]) => ZObjRes
    }) {
        type constraintsT = keyof typeof match;
        const cname = (this.constructor.name as unknown) as constraintsT;
        switch (cname) {
            case 'ZJson': {
                const { j } = (this as unknown) as ZJson;
                return match['ZJson'](j);
            }
            case 'ZArray': {
                const { parrent, u, ls, x, rs } = (this as unknown) as ZArray;
                return match['ZArray'](parrent, u, ls, x, rs);
            }
            case 'ZObj': {
                const { parrent, u, o, x } = (this as unknown) as ZObj;
                return match['ZObj'](parrent, u, o, x);
            }
        }
    }
}
export class ZJson extends JsonZipper {
    constructor(public j: Json) {
        super();
    }
}
export class ZArray extends JsonZipper {
    constructor(public parrent: JsonZipper, public u: boolean, public ls: List<Json>, public x: Json, public rs: List<Json>) {
        super();
    }
}
export class ZObj extends JsonZipper {
    constructor(public parrent: JsonZipper, public u: boolean, public o: JSONObject, public x: [JSONField, Json]) {
        super();
    }
}