import { MessageType } from "./messages.ts";

export interface ValidateOption {
  messages: MessageType;
  // whether to suppress internal warning
  suppressWarning?: boolean;
  // 当某一个校验不通过时,停止所有的校验
  // Immediately stop all verifications in case of failure
  shortCircuitValidate?: boolean;
}
/**
 * 源数据类型
 */
export type SourceType = {
  [k: string]:
  | boolean
  | number
  | string
  | Date
  | Partial<SourceType>
  | Array<SourceType>;
};
/**
 * 值类型
 */
export type Value =
  | Partial<SourceType>
  | boolean
  | number
  | string
  | Date
  | undefined
  | Array<SourceType>
  | RegExp;

interface VerificationErrorOption extends ErrorOptions {
  fieldPath: string | Array<string | number>
}
/**
 * 校验时产生的错误信息
 */
export class VerificationError extends Error {
  fieldPath: Array<string | number> = []
  constructor(msg: string, option: VerificationErrorOption) {
    const { cause, fieldPath } = option || {}
    super(msg, { cause: cause })
    this.fieldPath = Array.isArray(fieldPath) ? fieldPath : [fieldPath]
  }
  /**
   * 补充错误属性父路径
   */
  public unshiftPath(pathFragment: string) {
    this.fieldPath.unshift(pathFragment)
  }
  /**
   * 补充错误属性子路径
   */
  public pushPath(pathFragment: string) {
    this.fieldPath.push(pathFragment)
  }
  /**
   * 设置错误消息
   */
  public setMessage(msg: string) {
    this.message = msg
  }
  /**
   * alias for setMessage
   */
  public setMsg(msg: string) {
    this.setMessage(msg)
  }
}

/**
 *  Rule for validating a value exists in an enumerable list.
 *  内部格式化以后的校验函数,内部使用
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param source The source object being validated.
 *  validation errors to.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */
export type InternalValidator = (
  key: number | string,
  value: Value,
  rules: RuleItem,
  source: SourceType,
  options?: ValidateOption,
) => Promise<VerificationError | undefined> | VerificationError | undefined;


/**
 *  Performs validation for any type.
 *  客户端传入的
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param callback The callback function.
 *  @param source The source object being validated.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */
export type ValidateFunc = (
  key: string | number,
  value: Value,
  source: Value,
) => ReturnType<InternalValidator>;
export type CustomMessage = string | (() => string);
/**
 * 基本规则
 */
export interface BaseRule {
  type?: string;
  required?: boolean;
  options?: ValidateOption;
  message?: CustomMessage;
  // 在校验前将值转化为指定值
  transform?: (value: Value) => Value;
  validator?: ValidateFunc;
}
export interface AnyRule extends BaseRule {
  type?: "any";
  fields?: RuleItem[] | Record<string, RuleItem[]>;
  allowWhitespace?: boolean;
  range?: [number, number?];
  pattern?: RegExp | string;
  enum?: Array<string | number | boolean>;
}
export interface StringRule extends BaseRule {
  type: "string";
  range?: [number, number?];
  pattern?: RegExp | string;
  allowWhitespace?: boolean;
  enum?: Array<string>;
}
export interface ArrayRule extends BaseRule {
  type: "array";
  range?: [number, number?];
  fields?: RuleItem[];
}
export interface ObjectRule extends BaseRule {
  type: "object";
  fields?: RuleItem[] | Record<string, RuleItem[]>;
}
export interface EnumRule extends BaseRule {
  type: "enum";
  enum?: Array<string | number>;
}

export interface NumberRule extends BaseRule {
  type: "number";
  range?: [number, number?];
}
export interface IntegerRule extends Omit<NumberRule, "type"> {
  type: "integer";
}
export interface FloatRule extends Omit<NumberRule, "type"> {
  type: "float";
}
export interface TypeRule extends BaseRule {
  type: "date"
  | "regexp"
  | "boolean"
  | "method"
  | "url"
  | "hex"
  | "hex";
}

export type RuleItem =
  | AnyRule
  | StringRule
  | ArrayRule
  | NumberRule
  | IntegerRule
  | FloatRule
  | ObjectRule
  | EnumRule
  | TypeRule
