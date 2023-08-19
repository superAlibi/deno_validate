import { assertEquals } from "https://deno.land/std@0.196.0/assert/mod.ts";
import { add } from "./main.ts";
import { Validator } from '../src/main.ts'
Deno.test(async function addTest() {
  const v = new Validator({
    name: [{
      required: true,
      message: '请传入名字',
      type: 'object',
    
    }]
  })
  try {
    await v.validate({})
  } catch (e) {
    console.error(e);
  }
});
