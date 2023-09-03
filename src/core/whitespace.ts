import { sprintf } from "fmt";
import { InternalValidator, VerificationError } from "../interface.ts";
import { messages } from "../messages.ts";
import { getCustomMessage } from "../util.ts";

/**
 *  Rule for validating whitespace.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param source The source object being validated.
 *  @param errors An array of errors that this rule may add
 *  validation errors to.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */
const allowWhitespace: InternalValidator = (_, v, r) => {
  const value = v as string;
  if (/^\s+$/.test(value) || value === "") {
    return new VerificationError(getCustomMessage(r.message) || sprintf(messages.whitespace || ""), { fieldPath: [_] });
  }
};

export default allowWhitespace;
