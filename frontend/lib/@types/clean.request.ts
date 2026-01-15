// lib/@types/clean.request.ts
import { z } from "zod";

const schema = z
  .object({
    targetColumn: z.string().min(1, "Target column is required"),
    nhs: z.enum([
      "rows",
      "columns",
      "mean",
      "median",
      "mode",
      "zero",
      "custom",
      "none",
    ]),
    normalization: z.enum(["mix_max_0_1", "mix_max_-1_1", "z_score_standard"]),
    customValue: z.string().optional(),
    trimWhiteSpaces: z.boolean(),
    removeDupRows: z.boolean(),
    enableNormalization: z.boolean(),
  })
  .refine(
    (data) => {
      // If NHS is custom, customValue must be provided
      if (data.nhs === "custom") {
        return !!data.customValue;
      }
      return true;
    },
    {
      message: "Custom value is required when NHS strategy is 'custom'",
      path: ["customValue"],
    }
  );
export { schema as CleanRequestBodySchema };
export type CleanRequest = z.infer<typeof schema>;
