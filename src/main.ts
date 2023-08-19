import { sprintf } from "fmt";
import {
  AnyRule,
  ArrayRule,
  VerificationError,
  InternalRuleItem,
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
 * @param validateFields
 * @returns
 */
function resolveRuleFieldToValidator(
  validateFields: Omit<RuleItem, "options" | "message" | "transform">,
): InternalValidator[] {
  const { validator, ...other } = validateFields;
  const validators = Object.keys(other).reduce<InternalValidator[]>(
    (pre, k) => {
      const validator = FeildRules[k];
      if (!validator) return pre;
      return pre.concat(validator);
    },
    [],
  );
  if (validator) {
    validators.push((__, v, _, s) => validator(v, s));
  }
  return validators;
}
export class Validator {
  #internalRule: InternalRuleItem[] = [];
  static deepValidateType = ["any", "array", "object"];
  constructor(public rule: RuleItem[] | Record<string, RuleItem[]>) { }
  #formtToInternalRule(
    rules: RuleItem[],
    parendsPaths: string[],
    feilds: string[],
  ): InternalRuleItem[];
  #formtToInternalRule(
    rules: Record<string, RuleItem[]>,
    parendsPaths: string[],
  ): InternalRuleItem[];
  /**
   * 负责格式化规则
   * @param rule
   * @param source
   * @param parendsPaths
   */
  #formtToInternalRule(
    rules: RuleItem[] | Record<string, RuleItem[]>,
    parendsPaths: string[] = [],
    paths: string[] = [],
  ): InternalRuleItem[] {
    // 默认规则处理
    if (Array.isArray(rules)) {
      const tempRuleValidators = rules.reduce<
        Omit<InternalRuleItem, "feildPath" | "feild">[]
      >((pre, curr) => {
        return pre.concat({
          originalRule: curr,
          validators: resolveRuleFieldToValidator(curr),
        });
      }, []);
      return paths.reduce<InternalRuleItem[]>((pre, key) => {
        const items = tempRuleValidators.map<InternalRuleItem>((i) => ({
          ...i,
          feild: key,
          feildPath: parendsPaths.concat(key),
        }));
        return pre.concat(items);
      }, []);
    }
    // 指定规则处理
    return Object.entries(rules).reduce<InternalRuleItem[]>(
      (pre, [key, rule]) => {
        const its = rule.reduce<InternalRuleItem[]>((pre, curr) => {
          const { options, message, transform, ...otherInfo } = curr;
          const validators = resolveRuleFieldToValidator(otherInfo),
            path = parendsPaths.concat(key);
          const ir = {
            feildPath: path,
            originalRule: curr,
            feild: key,
            validators,
          };
          return pre.concat(ir);
        }, []);
        return pre.concat(its);
      },
      [],
    );
  }
  #meybeFields(r: RuleItem): r is AnyRule | ObjectRule | ArrayRule {
    const type = r.type || "any";
    return Validator.deepValidateType.includes(type);
  }
  /**
   * 负责验证
   * @param source
   * @param option
   */
  validate(source: SourceType, option?: ValidateOption): Promise<Value> {
    return this._validate(source, option, []);
  }
  async _validate(
    source: SourceType,
    option?: ValidateOption,
    patranPath: string[] = [],
  ): Promise<boolean> {
    const { shortCircuitValidate, suppressWarning } = option || {};
    const errors: VerificationError[] = [];
    if (!Object.keys(this.rule).length) return true;
    if (typeof source !== "object") {
      return Promise.reject(("The validation object must be an object"));
    }
    this.#internalRule = Array.isArray(this.rule)
      ? this.#formtToInternalRule(this.rule, patranPath, Object.keys(source))
      : this.#formtToInternalRule(this.rule, patranPath);
    // 开始检测每个当前层的每个字段
    for (const iterator of this.#internalRule) {
      const { originalRule, feildPath, feild, validators } = iterator,
        v = source[feild];
      // 逐个执行校验器
      for (const validator of validators) {
        const VerificationError = await validator(
          feildPath,
          v,
          iterator,
          source,
          option,
        );
        if (!VerificationError) continue;
        if (suppressWarning) console.error(VerificationError);
        errors.push(VerificationError);
        if (shortCircuitValidate) return Promise.reject(errors);
      }
      // 深度检测
      if (
        this.#meybeFields(originalRule) && originalRule.fields &&
        typeof v === "object"
      ) {
        const validator = new Validator(originalRule.fields);
        try {
          await validator._validate(
            v as SourceType,
            option,
            patranPath.concat(feild),
          );
        } catch (deepError) {
          errors.push(...deepError);
          if (suppressWarning) console.error(errors);
          if (shortCircuitValidate && (errors).length) {
            return Promise.reject(errors);
          }
        }
      }
    }
    if (errors.length) {
      return Promise.reject(errors);
    }
    return true;
  }
}
