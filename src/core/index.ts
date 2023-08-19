import {
  ArrayRule,
  VerificationError,
  InternalRuleItem,
  InternalValidator,
  NumberRule,
  SourceType,
  StringRule,
  ValidateOption,
  Value,
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
  fp: string[],
  v: Value,
  r: InternalRuleItem,
  s: SourceType,
) => {
  const { validator } = r.originalRule
  const rqerror = requiredValidator(fp, v, r, s) as VerificationError;
  if (rqerror) return rqerror;
  const typeerror = typedValidator(fp, v, r, s) as VerificationError;
  if (typeerror) return typeerror;
  if (validator) {
    const ve = await validator(v, s);
    if (ve) return ve;
  }
  return;
};
export async function ValidatorHelper(
  f: InternalValidator,
  fp: string[],
  v: Value,
  r: InternalRuleItem,
  s: SourceType,
  o: ValidateOption,
) {
  const { transform } = r.originalRule,
    tv = transform ? transform(v) : v,
    errors: VerificationError[] = [];
  // 执行基本校验
  const be = await BaseValidator(fp, tv, r, s);

  // 如果设置了短路验证,那么基本交发发现错误就不再继续验证了
  if ((o.shortCircuitValidate || o.shortCircuitValidate === undefined) && be) {
    errors.push(be);
    return errors;
  }
  if (f === BaseValidator) return errors;
  // 执行实际的规则
  const VerificationError = await f(fp, tv, r, s, o);
  if (VerificationError) {
    errors.push(VerificationError);
  }
  return errors;
}
const patternValidator: InternalValidator = (fp, v, r, d, o) => {
  return patternCore(fp, v, r, d, o);
};
const stringValidator: InternalValidator = (fp, v, r, s, o) => {
  const { range, pattern, allowWhitespace, enum: em } = r
    .originalRule as StringRule;
  const vs = [
    range ? rangeValidator : false,
    pattern ? patternValidator : false,
    (allowWhitespace || allowWiteSapceValidator === undefined)
      ? allowWiteSapceValidator
      : false,
    em ? enumValidator : false,
  ].filter((v) => typeof v === "function");
  for (const iterator of vs as InternalValidator[]) {
    const er = iterator(fp, v, r, s, o) as VerificationError;
    if (er) return er;
  }

  return "";
};
const numberValidator: InternalValidator = (fp, v, r, s, o) => {
  const { range } = r.originalRule as NumberRule;
  if (range) {
    const er = rangeValidator(fp, v, r, s, o) as VerificationError;
    if (er) return er;
  }
};
const arrayValidator: InternalValidator = (fp, v, r, s, o) => {
  const { range } = r.originalRule as ArrayRule;
  if (range) {
    const re = rangeValidator(fp, v, r, s, o);
    if (re) return re;
  }
};

// 最复杂的校验,以后再说,因为可以校验所有类型
const anyValidator: InternalValidator = (
  fp, v, r, s, o
) => {
  switch (typeof v) {
    case "boolean":
      return BaseValidator(fp, v, r, s, o)
    case "string":
      return stringValidator(fp, v, r, s, o)
    case "number":
      return numberValidator(fp, v, r, s, o)
    case "bigint":
      return numberValidator(fp, v, r, s, o)
    case "undefined":
      return BaseValidator(fp, v, r, s, o)
    case "object":
      return BaseValidator(fp, v, r, s, o)
    case "function":
      return BaseValidator(fp, v, r, s, o)
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
