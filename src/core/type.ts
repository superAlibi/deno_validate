import { sprintf } from "fmt";
import { InternalValidator, Value } from "../interface.ts";
import getUrlRegex from "./url.ts";
import { messages } from "../messages.ts";
import { getCustomMessage } from "../util.ts";
/* eslint max-len:0 */

const pattern = {
  // http://emailregex.com/
  email:
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+\.)+[a-zA-Z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]{2,}))$/,
  // url: new RegExp(
  //   '^(?!mailto:)(?:(?:http|https|ftp)://|//)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$',
  //   'i',
  // ),
  hex: /^#?([a-f0-9]{6}|[a-f0-9]{3})$/i,
};
function numberV(value: Value): value is number {
  if (Number.isNaN(value)) {
    return false;
  }
  return typeof value === "number";
}
const types: Record<string, (v: Value) => boolean> = {
  integer(value: Value) {
    return numberV(value) && ~~value === value;
  },
  float(value: Value): value is number {
    return types.number(value) && !types.integer(value);
  },
  array(value: Value): value is [] {
    return Array.isArray(value);
  },
  regexp(value: Value) {
    if (value instanceof RegExp) {
      return true;
    }
    try {
      return !!new RegExp(value as string | RegExp);
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  date(value: Value) {
    return value instanceof Date || numberV(value);
  },
  number: numberV,
  object(value: Value) {
    return typeof value === "object" && !types.array(value);
  },
  method(value: Value) {
    return typeof value === "function";
  },
  email(value: Value) {
    return (
      typeof value === "string" &&
      value.length <= 320 && pattern.email.test(value)
    );
  },
  url(value: Value) {
    return (
      typeof value === "string" &&
      value.length <= 2048 &&
      !!value.match(getUrlRegex())
    );
  },
  hex(value: Value) {
    return typeof value === "string" && pattern.hex.test(value);
  },
};

const type: InternalValidator = (f, v, r) => {
  const { originalRule: rule } = r;

  const custom = Object.keys(types);
  const ruleType = rule.type;

  if (!ruleType) return messages.default;
  // any can't be validate
  if (ruleType === "any") return;
  const cmsg = getCustomMessage(rule.message)
  if (custom.includes(ruleType)) {
    if (!types[ruleType]?.(v)) {
      return cmsg || sprintf(messages.types[ruleType!], f.join("."), rule.type);
    }
    // straight typeof check
  } else if (ruleType && typeof v !== rule.type) {
    return cmsg || sprintf(
      messages.types[ruleType!] || "",
      r.feildPath.join("."),
      rule.type,
    );
  }
};

export default type;
