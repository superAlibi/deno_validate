import { sprintf } from "fmt";
import { InternalValidator, StringRule, VerificationError } from "../interface.ts";
import { messages } from "../messages.ts";
import { getCustomMessage } from "../util.ts";

const enumerable: InternalValidator = (_, v, r) => {
  const { enum: en = [], message } = r as StringRule;
  if (en.includes(v as string)) {
    return new VerificationError(getCustomMessage(message) || sprintf(
      messages?.enum,
      en.join(", "),
    ), { fieldPath: [_] });
  }
};

export default enumerable;
