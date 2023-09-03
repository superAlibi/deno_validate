
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
 * 解析一个规则,将规则的配置转化为验证函数
 * @param ruleOption
 * @returns
 */
function resolveRuleFieldToValidators(
  ruleOption: Omit<RuleItem, "options" | "transform">,
): InternalValidator[] {
  const { validator, ...other } = ruleOption;
  const validators = Object.keys(other).reduce<InternalValidator[]>(
    (pre, k) => {
      const validator = FeildRules[k];
      if (!validator) return pre;
      return pre.concat(validator);
    },
    [],
  );
  if (validator) {
    validators.push((key, v, _, s) => validator(key, v, s));
  }
  return validators;
}
function VerificationErrorToSImpleValue(params: VerificationError[]): Record<string, string> {
  const errorInfo: Record<string, string> = {}
  for (const iterator of params) {
    errorInfo[iterator.fieldPath.join('.')] = iterator.message
  }
  return errorInfo
}
export class Validator {
  static deepValidateType = ["any", "array", "object"];
  constructor(public rule: RuleItem[] | Record<string, RuleItem[]>) { }
  #meybeFields(r: RuleItem): r is AnyRule | ObjectRule | ArrayRule {
    const type = r.type || "any";
    const isDeep = Validator.deepValidateType.includes(type);
    const fields = (r as AnyRule | ObjectRule | ArrayRule).fields
    const hasFil = fields && ((Array.isArray(fields) && fields.length) || Object.keys(fields).length)
    return isDeep && !!hasFil
  }

  /**
   * 负责验证
   * @param source
   * @param option
   */
  async validate(source: SourceType, option?: ValidateOption): Promise<Value> {

    const { shortCircuitValidate, suppressWarning } = option || {};
    const errors: VerificationError[] = [];
    if (!Object.keys(this.rule).length) return true;
    if (typeof source !== "object") {
      return Promise.reject(("The validation object must be an object"));
    }
    const erros: VerificationError[] = []
    // 开始检测每个当前层的每个字段
    for (const [key, value] of Object.entries(source)) {
      const rules = Array.isArray(this.rule) ? this.rule : this.rule[key]
      // resolveRuleFieldToValidators()
      if (!Array.isArray(rules)) continue
      for (const ruleItem of rules) {
        const { transform, options, ...otherRule } = ruleItem
        const tv = transform ? transform(value) : value
        const validators = resolveRuleFieldToValidators(otherRule)
        let eror: VerificationError | undefined
        for (const iterator of validators) {
          eror = await iterator(key, tv, ruleItem, source, options || option)
          if (eror) {
            eror.unshiftPath(key)
            break;
          }
        }
        if (eror) {
          erros.push(eror)
          if (options?.shortCircuitValidate || shortCircuitValidate) {
            break
          }
        }


      }
      if (shortCircuitValidate && errors.length) {
        return Promise.reject(VerificationErrorToSImpleValue(errors))
      }
      const deepRules = rules.filter(i => this.#meybeFields(i)) as Array<AnyRule | ObjectRule | ArrayRule>
      if (value && typeof value === 'object' || Array.isArray(value) && deepRules.length) {
        deepRules.forEach(i => {
          const { fields } = i

        })
      }
    }





    if (errors.length) {
      return Promise.reject(VerificationErrorToSImpleValue(errors));
    }
    return source;

  }

}
