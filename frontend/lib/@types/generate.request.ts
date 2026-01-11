import { z } from "zod";

const CssSelectorSchema = z
  .string()
  .min(1, "CSS selector cannot be empty")
  .max(500, "CSS selector is too long");

const schema = z.object({
  targetUrl: z.url(),
  container: CssSelectorSchema,
  paginationUrlTemplate: z.string().optional(),
  pages: z.number().positive(),
  selectors: z
    .array(
      z.object({
        id: z.number().nonnegative(),
        columnName: z.string().min(1),
        selector: CssSelectorSchema,
        selectorType: z.enum(["content", "attribute"]),
        attributeName: z.string().optional(), // Required when selectorType is "attribute"
        dataType: z.enum(["text", "number", "boolean"]).default("text"),
      })
    )
    .min(1)
    .refine(
      (selectors) =>
        selectors.every((s) =>
          s.selectorType === "attribute" ? !!s.attributeName : true
        ),
      {
        message: "attributeName is required when selectorType is 'attribute'",
      }
    ),
});

export { schema as GenerateRequestBodySchema };
export type GenerateRequestBody = z.infer<typeof schema>;
