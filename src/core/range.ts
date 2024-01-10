import { sprintf } from "fmt";
import {
  ArrayRule,
  InternalValidator,
  NumberRule,
  StringRule,
  VerificationError,
} from "../interface.ts";
import { messages } from "../messages.ts";
import { getCustomMessage, isEmptyValue } from "../util.ts";
const spRegexp = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
function outOfRange(
  length: number,
  type: "string" | "number" | "array",
  min?: number,
  max?: number,
): string | void {
  if (isEmptyValue(min) && isEmptyValue(max)) return;

  if (!isEmptyValue(min) && isEmptyValue(max) && length < min) {
    return sprintf(messages[type].min, min);
  }
  if (!isEmptyValue(max) && isEmptyValue(min) && length > max) {
    return sprintf(messages[type].max, max);
  }
  if (!isEmptyValue(max) && !isEmptyValue(min) && (length > max || length < min)) {
    return sprintf(
      messages[type].range,
      min,
      max,
    );
  }
}
const range: InternalValidator = (_, value, r) => {
  const { range, type = "string", message } = r as StringRule | ArrayRule | NumberRule;
  const cmsg = getCustomMessage(message)
  const [min, max] = range as number[];
  if (type === "string" && typeof value === "string") {
    // 处理码点大于U+010000的文字length属性不准确的bug，如"𠮷𠮷𠮷".length !== 3
    const tvl = value.replace(spRegexp, "_").length;
    const msg = cmsg || (outOfRange(tvl, type, min, max));
    return msg ? new VerificationError(msg, { fieldPath: [_] }) : void 0;
  } else if (type === "array" && Array.isArray(value)) {
    const tvl = value.length;
    const msg = cmsg || (outOfRange(tvl, type, min, max))
    return msg ? new VerificationError(msg, { fieldPath: [_] }) : void 0;
  } else if (type === "number" && !Number.isNaN(value)) {
    const tvl = Number(value);
    const msg = cmsg || (outOfRange(tvl, type, min, max))
    return msg ? new VerificationError(msg, { fieldPath: [_] }) : void 0;
  }
};

export default range;
