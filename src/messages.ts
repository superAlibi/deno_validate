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
      len: " must be exactly %s characters",
      min: " must be at least %s characters",
      max: " cannot be longer than %s characters",
      range: " must be between %s and %s characters",
    },
    number: {
      len: " must equal %s",
      min: " cannot be less than %s",
      max: " cannot be greater than %s",
      range: " must be between %s and %s",
    },
    array: {
      len: " must be exactly %s in length",
      min: " cannot be less than %s in length",
      max: " cannot be greater than %s in length",
      range: " must be between %s and %s in length",
    },
    pattern: {
      mismatch: " value %s does not match pattern %s",
    },
  };
}
export const messages = newMessages();
export type MessageType = typeof messages;
