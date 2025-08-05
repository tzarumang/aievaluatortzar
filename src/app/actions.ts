
'use server';

import { z } from 'zod';
import { generateBenchmarkReport } from '@/ai/flows/generate-benchmark-report';

const formSchema = z.object({
  modelOutputs: z
    .string()
    .min(50, {
      message: "Model output must be at least 50 characters.",
    })
    .max(50000, {
      message: "Model output must not exceed 50000 characters.",
    }),
  glueDataset: z.string().min(1, { message: "Please select a GLUE dataset." }),
});

type GenerateReportResult = {
  success: true;
  report: string;
} | {
  success: false;
  error: string;
}

export async function generateReportAction(values: z.infer<typeof formSchema>): Promise<GenerateReportResult> {
  const validatedFields = formSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Invalid input.",
    };
  }

  try {
    const { report } = await generateBenchmarkReport(validatedFields.data);
    if (!report) {
        return { success: false, error: 'The AI failed to generate a report. Please try again.' };
    }
    return { success: true, report };
  } catch (error) {
    console.error("Error generating benchmark report:", error);
    return { success: false, error: 'An unexpected error occurred while generating the report. Please check the server logs.' };
  }
}
