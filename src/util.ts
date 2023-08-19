import { CustomMessage, SourceType, Value } from "./interface.ts";

function isNativeStringType(type?: string) {
  return (
    type === "string" ||
    type === "url" ||
    type === "hex" ||
    type === "email" ||
    type === "date" ||
    type === "pattern"
  );
}
export function getCustomMessage(msg?: CustomMessage): string {
  if (!msg) return "";
  return typeof msg === "function" ? msg() : msg;
}
export function isEmptyValue(
  value: unknown,
  type?: string,
): value is null | undefined {
  if (value === undefined || value === null) {
    return true;
  }
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

/**
 * 合并两级对象
 *  键深度两级以上无法深度clone
 * 参考类型:ValidateMessages,它只有两级属性
 * @param target
 * @param source
 * @returns
 */
export function mergeMessage<T extends object>(
  target: T,
  source?: Partial<T>,
): T {
  if (!source) {
    return target;
  }
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sv = source[key],
        tv = target[key],
        OV = typeof sv === "object" && typeof tv === "object";
      Object.assign(target, {
        [key]: OV ? { ...tv, ...sv } : sv,
      });
    }
  }
  return target;
}
