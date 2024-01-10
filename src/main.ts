
import {
  AnyRule,
  ArrayRule,
  VerificationError,
  InternalValidator,
  ObjectRule,
  RuleItem,
  SourceType,
  ValidateOption,
  Value,
} from "./interface.ts";
import FeildRules from "./core/index.ts";
/**
 * 解析一个规则,将规则的配置转化为验证函数数组
 * @param ruleOption
 * @returns
 */
function resolveRuleFieldToValidators(
  ruleOption: Omit<RuleItem, "options" | "transform">,
): InternalValidator[] {
  const { validator, type } = ruleOption;
  const validators: InternalValidator[] = []
  const verificationFunc = FeildRules[type || 'any'];
  validators.push(verificationFunc);

  if (validator) {
    validators.push((key, v, _, s) => validator(key, v, s));
  }
  return validators;
}
function VerificationErrorToSimpleValue(params: VerificationError[]): Record<string, string> {
  const errorInfo: Record<string, string> = {}
  for (const iterator of params) {
    errorInfo[iterator.fieldPath.join('.')] = iterator.message
  }
  return errorInfo
}



export class Validator {
  static deepValidateType = ["any", "array", "object"];
  constructor(public rule?: RuleItem[] | Record<string, RuleItem[]>) { }
  /**
   * 判断是否是需要深度递归的属性
   * @param r 
   * @returns 
   */
  #meybeFields(r: RuleItem): r is AnyRule | ObjectRule | ArrayRule {
    const type = r.type || "any";
    const isDeep = Validator.deepValidateType.includes(type);
    const fields = (r as AnyRule | ObjectRule | ArrayRule).fields
    const hasFil = fields && ((Array.isArray(fields) && fields.length) || Object.keys(fields).length)
    return isDeep && !!hasFil
  }
  /**
   * 校验单个字段
   * @param value 
   * @param rules 
   * @param key 
   * @param source 
   * @param option 
   */
  async verifyField(value: Value, rules: RuleItem[], key: string | number, source: SourceType, option?: ValidateOption) {

    const { shortCircuitValidate } = option || {};
    const erros: VerificationError[] = []
    for (const ruleItem of rules) {
      const { transform, options, ...otherRule } = ruleItem
      const tv = transform ? transform(value) : value
      const validators = resolveRuleFieldToValidators(otherRule)
      for (const iterator of validators) {
        const err = await iterator(key, tv, ruleItem, source, options || option)
        if (err) {
          erros.push(err)
          break;
        }
      }
      if (erros.length) {
        if (options?.shortCircuitValidate || shortCircuitValidate) {
          break
        }
      }
    }
    return erros
  }
  /**
   * 负责验证
   * @param source
   * @param option
   */
  async validate<T extends SourceType>(source: T, option?: ValidateOption): Promise<T> {

    const { shortCircuitValidate, suppressWarning } = option || {};
    const errors: VerificationError[] = [];
    // 没有规则直接通过校验
    if (!this.rule) return source;
    if (Array.isArray(this.rule) && !this.rule.length) return source;
    if (!Array.isArray(this.rule) && !Object.keys(this.rule).length) return source;
    // 校验的值必须是一个对象
    if (typeof source !== "object") {
      return Promise.reject(("The validation object must be an object"));
    }

    // 开始检测每个当前层的每个字段
    for (const [key, value] of Object.entries(source)) {
      // 如果规则是数组说明校验值中每一个都是同样的校验方法,否则取指定的校验组
      const rules = Array.isArray(this.rule) ? this.rule : this.rule[key]
      if (!Array.isArray(rules)) continue
      // 单个属性的错误集合
      const errs = await this.verifyField(value, rules, key, source, option)
      if (Array.isArray(errs)) {
        errors.push(...errs)
      }

      if (shortCircuitValidate && errors.length) {
        return Promise.reject(VerificationErrorToSimpleValue(errors))
      }
      const deepRules = rules.filter(i => this.#meybeFields(i)) as Array<AnyRule | ObjectRule | ArrayRule>
      if (value && typeof value === 'object' || Array.isArray(value) && deepRules.length) {
        deepRules.forEach(i => {
          const { fields } = i

        })
      }
    }





    if (errors.length) {
      return Promise.reject(VerificationErrorToSimpleValue(errors));
    }
    return source;

  }

}
