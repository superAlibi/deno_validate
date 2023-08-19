import { sprintf } from "fmt";
import { InternalValidator } from "../interface.ts";
import { getCustomMessage, isEmptyValue } from "../util.ts";
import { messages } from "../messages.ts";

const required: InternalValidator = (f, v, r, s) => {
  const { originalRule } = r;
  if (
    originalRule.required &&
    (!Object.prototype.hasOwnProperty.call(s, r.feild) ||
      isEmptyValue(v, originalRule.type))
  ) {
    return getCustomMessage(originalRule?.message) || sprintf(messages.required, f.join("."));
  }
};

export default required;
