import { sprintf } from "fmt";
import { InternalValidator, VerificationError } from "../interface.ts";
import { getCustomMessage, isEmptyValue } from "../util.ts";
import { messages } from "../messages.ts";

const required: InternalValidator = (_,v, r) => {
  if (
    r.required && isEmptyValue(v, r.type)
  ) {
    return new VerificationError(getCustomMessage(r?.message) || sprintf(messages.required), { fieldPath: [_] });
  }
};

export default required;
