export function newMessages() {
  return {
    default: " Validation error on field %s",
    required: " is required",
    enum: " must be one of %s",
    whitespace: " cannot be empty",
    date: {
      format: " date %s is invalid for format %s",
      parse: " date could not be parsed, %s is invalid ",
      invalid: "%s date %s is invalid",
    },
    types: {
      string: " is not a %s",
      enum: " is not in %s",
      method: " is not a %s (function)",
      array: " is not an %s",
      object: " is not an %s",
      number: " is not a %s",
      date: " is not a %s",
      boolean: " is not a %s",
      integer: " is not an %s",
      float: " is not a %s",
      regexp: " is not a valid %s",
      email: " is not a valid %s",
      url: " is not a valid %s",
      hex: " is not a valid %s",
    },
    string: {
      len: " must be exactly %d characters",
      min: " must be at least %d characters",
      max: " cannot be longer than %d characters",
      range: " must be between %d and %d characters",
    },
    number: {
      len: " must equal %d",
      min: " cannot be less than %d",
      max: " cannot be greater than %d",
      range: " must be between %d and %d",
    },
    array: {
      len: " must be exactly %d in length",
      min: " cannot be less than %d in length",
      max: " cannot be greater than %d in length",
      range: " must be between %d and %d in length",
    },
    pattern: {
      mismatch: " value %s does not match pattern %s",
    },
  };
}
export const messages = newMessages();
export type MessageType = typeof messages;
