'use server';

/**
 * @fileOverview Cover letter generation tailored to predicted salary and job description.
 *
 * - generateCoverLetter - A function that generates a cover letter.
 * - GenerateCoverLetterInput - The input type for the generateCoverLetter function.
 * - GenerateCoverLetterOutput - The return type for the generateCoverLetter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCoverLetterInputSchema = z.object({
  jobRole: z.string().describe('The job role for which the cover letter is being generated.'),
  experience: z.string().describe('The experience level of the applicant.'),
  location: z.string().describe('The location of the job.'),
  skills: z.string().describe('The skills relevant to the job.'),
  predictedSalary: z.string().describe('The predicted salary range for the job.'),
  jobDescription: z.string().describe('The detailed job description.'),
});
export type GenerateCoverLetterInput = z.infer<typeof GenerateCoverLetterInputSchema>;

const GenerateCoverLetterOutputSchema = z.object({
  coverLetter: z.string().describe('The generated cover letter.'),
});
export type GenerateCoverLetterOutput = z.infer<typeof GenerateCoverLetterOutputSchema>;

export async function generateCoverLetter(input: GenerateCoverLetterInput): Promise<GenerateCoverLetterOutput> {
  return generateCoverLetterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCoverLetterPrompt',
  input: {schema: GenerateCoverLetterInputSchema},
  output: {schema: GenerateCoverLetterOutputSchema},
  prompt: `You are an expert cover letter writer, specializing in tailoring cover letters to predicted salaries and job descriptions.

  Based on the job role, experience, location, skills, predicted salary, and job description, generate a cover letter that highlights the applicant's strengths and justifies the desired salary.

  Job Role: {{{jobRole}}}
  Experience: {{{experience}}}
  Location: {{{location}}}
  Skills: {{{skills}}}
  Predicted Salary: {{{predictedSalary}}}
  Job Description: {{{jobDescription}}}

  Cover Letter:`,  //Crucially, this line MUST end with "Cover Letter:"
});

const generateCoverLetterFlow = ai.defineFlow(
  {
    name: 'generateCoverLetterFlow',
    inputSchema: GenerateCoverLetterInputSchema,
    outputSchema: GenerateCoverLetterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
