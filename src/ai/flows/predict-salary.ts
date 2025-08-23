'use server';

/**
 * @fileOverview Predicts salary based on job details and location.
 *
 * - predictSalary - A function that predicts a salary range and currency.
 * - PredictSalaryInput - The input type for the predictSalary function.
 * - PredictSalaryOutput - The return type for the predictSalary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictSalaryInputSchema = z.object({
  jobRole: z.string().describe('The job role.'),
  experience: z.string().describe('The experience level of the applicant (e.g., entry-level, mid-level, senior-level).'),
  location: z.string().describe('The job location (e.g., "San Francisco, CA", "London, UK").'),
  skills: z.string().describe('A comma-separated list of relevant skills.'),
});
export type PredictSalaryInput = z.infer<typeof PredictSalaryInputSchema>;

const PredictSalaryOutputSchema = z.object({
  minSalary: z.number().describe('The minimum predicted salary in the local currency.'),
  maxSalary: z.number().describe('The maximum predicted salary in the local currency.'),
  currencyCode: z.string().describe('The ISO 4217 currency code (e.g., USD, EUR, GBP).'),
});
export type PredictSalaryOutput = z.infer<typeof PredictSalaryOutputSchema>;

export async function predictSalary(input: PredictSalaryInput): Promise<PredictSalaryOutput> {
  return predictSalaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictSalaryPrompt',
  input: {schema: PredictSalaryInputSchema},
  output: {schema: PredictSalaryOutputSchema},
  prompt: `You are a salary prediction expert. Based on the following job details, predict a realistic salary range.

Job Role: {{{jobRole}}}
Experience: {{{experience}}}
Location: {{{location}}}
Skills: {{{skills}}}

Provide the estimated minimum and maximum salary in the local currency for the specified location, along with the appropriate ISO 4217 currency code. Do not add any commentary.`,
});

const predictSalaryFlow = ai.defineFlow(
  {
    name: 'predictSalaryFlow',
    inputSchema: PredictSalaryInputSchema,
    outputSchema: PredictSalaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
