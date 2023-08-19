import { sprintf } from "fmt";
import { InternalValidator, StringRule } from "../interface.ts";
import { messages } from "../messages.ts";
import { getCustomMessage } from "../util.ts";

const enumerable: InternalValidator = (f, v, r, s, options) => {
  const { enum: en = [], message } = r.originalRule as StringRule;
  if (en.includes(v as string | number | boolean | null | undefined)) {
    return getCustomMessage(message) || sprintf(
      messages?.enum,
      r.feildPath.join("."),
      en.join(", "),
    );
  }
};

export default enumerable;
