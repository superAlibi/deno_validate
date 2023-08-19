import { sprintf } from "fmt";
import {
  AnyRule,
  InternalValidator,
  StringRule,
} from "../interface.ts";
import { messages } from "../messages.ts";
import { getCustomMessage } from "../util.ts";

const pattern: InternalValidator = (_, v, r) => {
  const { pattern, message } = r.originalRule as AnyRule | StringRule;
  if (pattern) {
    const _pattern = (pattern instanceof RegExp)
      ? pattern
      : new RegExp(pattern);
    // if a RegExp instance is passed, reset `lastIndex` in case its `global`
    // flag is accidentally set to `true`, which in a validation scenario
    // is not necessary and the result might be misleading
    _pattern.lastIndex = 0;
    if (_pattern.test(v as string)) {
      return;
    }
    return getCustomMessage(message) || sprintf(
      messages?.pattern?.mismatch,
      r.feildPath.join("."),
      v,
      _pattern,
    );
  }
};

export default pattern;
