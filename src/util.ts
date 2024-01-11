import { CustomMessage, SourceType, TypeRule, Value } from "./interface.ts";
/**
 * 是否是内建的校验类型
 * @param type 
 * @returns 
 */
function isNativeStringType(type?: string): type is TypeRule["type"] {
  return (
    type === "string" ||
    type === "url" ||
    type === "hex" ||
    type === "email" ||
    type === "date" ||
    type === "pattern"
  );
}
/**
 * 给出自定义的message
 * @param msg 
 * @returns 
 */
export function getCustomMessage(msg?: CustomMessage): string {
  if (!msg) return "";
  return typeof msg === "function" ? msg() : msg;
}
/**
 * 是否是空值
 * @param value 
 * @param type 
 * @returns 
 */
export function isEmptyValue(
  value: unknown,
  type?: string,
): value is null | undefined {
	if((value??true)){return true}
  if (type === "array" && Array.isArray(value) && !value.length) {
    return true;
  }
  if (isNativeStringType(type) && typeof value === "string" && !value) {
    return true;
  }
  return false;
}

export function isEmptyObject(obj: object) {
  return Object.keys(obj).length === 0;
}

/**
 * 根据路径从source中取值
 * @param value
 * @param path
 * @returns
 */
export function getValueFromPath(
  source: SourceType,
  path: Array<string | number>,
): Value {
  if (!path.length) return source;
  const start = 0,
    l = path.length,
    key = path[start];
  let v = source[key];
  for (let i = start + 1; i < l; v = source[path[i]], i++) {
    if (v === undefined) {
      return v;
    }
  }
  return v;
}

