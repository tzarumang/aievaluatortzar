'use server';

/**
 * @fileOverview Compares AI model outputs against GLUE benchmark datasets using generative AI.
 *
 * - generateBenchmarkReport - A function that handles the benchmark report generation process.
 * - GenerateBenchmarkReportInput - The input type for the generateBenchmarkReport function.
 * - GenerateBenchmarkReportOutput - The return type for the generateBenchmarkReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBenchmarkReportInputSchema = z.object({
  modelOutputs: z
    .string()
    .describe('AI model outputs in JSON or CSV format.'),
  glueDataset: z.string().describe('The GLUE benchmark dataset to compare against.'),
});
export type GenerateBenchmarkReportInput = z.infer<
  typeof GenerateBenchmarkReportInputSchema
>;

const GenerateBenchmarkReportOutputSchema = z.object({
  report: z.string().describe('A detailed benchmark report.'),
});
export type GenerateBenchmarkReportOutput = z.infer<
  typeof GenerateBenchmarkReportOutputSchema
>;

export async function generateBenchmarkReport(
  input: GenerateBenchmarkReportInput
): Promise<GenerateBenchmarkReportOutput> {
  return generateBenchmarkReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBenchmarkReportPrompt',
  input: {schema: GenerateBenchmarkReportInputSchema},
  output: {schema: GenerateBenchmarkReportOutputSchema},
  prompt: `You are an AI model evaluation expert. Compare the provided AI model outputs against the specified GLUE benchmark dataset and generate a comprehensive benchmark report.

AI Model Outputs:
{{modelOutputs}}

GLUE Benchmark Dataset:
{{glueDataset}}

Include key metrics such as accuracy, precision, recall, and F1-score. Identify areas where the model excels and areas for improvement.
`,
});

const generateBenchmarkReportFlow = ai.defineFlow(
  {
    name: 'generateBenchmarkReportFlow',
    inputSchema: GenerateBenchmarkReportInputSchema,
    outputSchema: GenerateBenchmarkReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
