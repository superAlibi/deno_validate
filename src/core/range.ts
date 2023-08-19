import { sprintf } from "fmt";
import {
  ArrayRule,
  InternalValidator,
  NumberRule,
  StringRule,
} from "../interface.ts";
import { messages } from "../messages.ts";
import { getCustomMessage, isEmptyValue } from "../util.ts";
const spRegexp = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
function outOfRange(
  v: number,
  type: "string" | "number" | "array",
  fp: string[],
  min?: number,
  max?: number,
) {
  if (isEmptyValue(min) && isEmptyValue(max)) return;
  if (!isEmptyValue(min) && isEmptyValue(max) && v < min) {
    return sprintf(messages[type].min, fp.join("."), min);
  }
  if (!isEmptyValue(max) && isEmptyValue(min) && v >= max) {
    return sprintf(messages[type].max, fp.join("."), max);
  }
  if (!isEmptyValue(max) && !isEmptyValue(min) && v >= max && v < min) {
    return sprintf(
      messages[type].range,
      fp.join("."),
      min,
      max,
    );
  }
}
const range: InternalValidator = (fp, value, r) => {
  const { range, type = "string", message } = r.originalRule as
    | StringRule
    | ArrayRule
    | NumberRule;
  const cmsg = getCustomMessage(message)
  const [min, max] = range as number[];
  if (type === "string" && typeof value === "string") {
    // 处理码点大于U+010000的文字length属性不准确的bug，如"𠮷𠮷𠮷".length !== 3
    const tvl = value.replace(spRegexp, "_").length;
    return cmsg || (outOfRange(tvl, type, fp, min, max));
  } else if (type === "array" && Array.isArray(value)) {
    const tvl = value.length;
    return cmsg || (outOfRange(tvl, type, fp, min, max));
  } else if (type === "number" && !Number.isNaN(value)) {
    const tvl = Number(value);
    return cmsg || (outOfRange(tvl, type, fp, min, max));
  }
};

export default range;
