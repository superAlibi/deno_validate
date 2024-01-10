import { assertEquals } from "assert";
import { Validator } from "../src/main.ts";

Deno.test("校验库单元测试开始", async (ctx) => {
  const validtor = new Validator({
    visible: [{ type: "boolean" }],
    name: [{ type: "string", range: [1, 2] }],
  });
  await ctx.step("测试布尔值", async (ctx) => {
    await ctx.step("visible等于字符串时报错", async () => {
      await validtor.validate({
        visible: "",
      }).catch((e) => {
        assertEquals(e.visible, " is not a boolean");
      });
    });
    await ctx.step("visible等于布尔值校验通过", async () => {
      await validtor.validate({
        visible: true,
      }).then((d) => {
        assertEquals(true, d.visible);
      });
    });
  });
});
