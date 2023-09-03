import {
  ArrayRule,
  VerificationError,
  InternalValidator,
  NumberRule,
  SourceType,
  StringRule,
  ValidateOption,
  Value,
  RuleItem,
} from "../interface.ts";

import requiredValidator from "./required.ts";
import typedValidator from "./type.ts";
import enumValidator from "./enum.ts";
import patternCore from "./pattern.ts";
import allowWiteSapceValidator from "./whitespace.ts";
import rangeValidator from "./range.ts";


/**
 * baserule validator
 * @param v
 * @param r
 * @param s
 * @returns
 */
const BaseValidator: InternalValidator = async (
  key,
  v: Value,
  r,
  s: SourceType,
) => {
  const { validator } = r
  const rqerror = requiredValidator(key, v, r, s) as VerificationError;
  if (rqerror) return rqerror;
  const typeerror = typedValidator(key, v, r, s) as VerificationError;
  if (typeerror) return typeerror;
  if (validator) {
    const ve = await validator(key, v, s);
    if (ve) return ve;
  }
  return;
};
export async function ValidatorHelper(
  f: InternalValidator,
  key: string | number,
  v: Value,
  r: RuleItem,
  s: SourceType,
  o: ValidateOption,
) {
  const { transform } = r,
    tv = transform ? transform(v) : v,
    errors: VerificationError[] = [];
  // 执行基本校验
  const be = await BaseValidator(key, tv, r, s);

  // 如果设置了短路验证,那么基本交发发现错误就不再继续验证了
  if ((o.shortCircuitValidate || o.shortCircuitValidate === undefined) && be) {
    errors.push(be);
    return errors;
  }
  if (f === BaseValidator) return errors;
  // 执行实际的规则
  const VerificationError = await f(key, tv, r, s, o);
  if (VerificationError) {
    errors.push(VerificationError);
  }
  return errors;
}
const patternValidator: InternalValidator = (key, v, r, d, o) => {
  return patternCore(key, v, r, d, o);
};
const stringValidator: InternalValidator = (key, v, r, s, o) => {
  const { range, pattern, allowWhitespace, enum: em } = r as StringRule;
  const vs = [
    range ? rangeValidator : false,
    pattern ? patternValidator : false,
    (allowWhitespace || allowWiteSapceValidator === undefined)
      ? allowWiteSapceValidator
      : false,
    em ? enumValidator : false,
  ].filter((v) => typeof v === "function");
  for (const iterator of vs as InternalValidator[]) {
    const er = iterator(key, v, r, s, o);
    if (er) return er;
  }

  return;
};
const numberValidator: InternalValidator = (key, v, r, s, o) => {
  const { range } = r as NumberRule;
  if (range) {
    const er = rangeValidator(key, v, r, s, o);
    if (er) return er;
  }
};
const arrayValidator: InternalValidator = (key, v, r, s, o) => {
  const { range } = r as ArrayRule;
  if (range) {
    const re = rangeValidator(key, v, r, s, o);
    if (re) return re;
  }
};

// 最复杂的校验,以后再说,因为可以校验所有类型
const anyValidator: InternalValidator = (
  v, r, s, o
) => {
  switch (typeof v) {
    case "boolean":
      return BaseValidator(v, r, s, o)
    case "string":
      return stringValidator(v, r, s, o)
    case "number":
      return numberValidator(v, r, s, o)
    case "bigint":
      return numberValidator(v, r, s, o)
    case "undefined":
      return BaseValidator(v, r, s, o)
    case "object":
      return BaseValidator(v, r, s, o)
    case "function":
      return BaseValidator(v, r, s, o)
  }
};
const validators: Record<string, InternalValidator> = {
  any: anyValidator,
  string: stringValidator,
  pattern: patternValidator,
  number: numberValidator,
  array: arrayValidator,
  enum: enumValidator,


  boolean: BaseValidator,
  regexp: BaseValidator,
  integer: BaseValidator,
  float: BaseValidator,
  object: BaseValidator,
  date: BaseValidator,
  url: BaseValidator,
  required: BaseValidator
};
export default validators;
