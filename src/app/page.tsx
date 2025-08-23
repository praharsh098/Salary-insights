'use client';

import { useState } from 'react';
import { SalaryForm, type SalaryFormValues } from '@/components/salary-form';
import { ResultsDisplay } from '@/components/results-display';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, WalletMinimal } from 'lucide-react';
import { predictSalary, PredictSalaryOutput } from '@/ai/flows/predict-salary';
import { useToast } from '@/hooks/use-toast';

export type ResultData = {
  formData: SalaryFormValues;
  predictedSalary: string;
  salaryData: PredictSalaryOutput;
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const { toast } = useToast();

  const handleFormSubmit = async (data: SalaryFormValues) => {
    setIsLoading(true);
    setResult(null);

    try {
      const salaryPrediction = await predictSalary(data);

      const formatter = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: salaryPrediction.currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });

      const predictedSalary = `${formatter.format(salaryPrediction.minSalary)} - ${formatter.format(salaryPrediction.maxSalary)}`;
      
      setResult({ formData: data, predictedSalary, salaryData: salaryPrediction });
    } catch (error) {
      console.error('Error predicting salary:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to predict salary. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-accent/10 -z-10"></div>
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent font-headline tracking-tight">Salary Insights</h1>
          <p className="text-muted-foreground mt-2 text-lg">Your AI-powered guide to smarter salary negotiation.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <Card className="shadow-2xl sticky top-8 bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2 font-headline">
                <Sparkles className="text-primary"/>
                Enter Job Details
              </CardTitle>
              <CardDescription>Provide the details below to get a salary estimate.</CardDescription>
            </CardHeader>
            <CardContent>
              <SalaryForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            </CardContent>
          </Card>
          
          <div className="space-y-8">
            {isLoading && (
              <Card className="shadow-2xl animate-fade-in bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Analyzing your profile...</CardTitle>
                  <CardDescription>The Salary Oracle is predicting your worth.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                   <div className="flex justify-center py-10">
                     <svg className="animate-spin h-16 w-16 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                   </div>
                   <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            )}
            {result && !isLoading && (
              <div className="animate-fade-in-up">
                <ResultsDisplay result={result} />
              </div>
            )}
            {!result && !isLoading && (
                <Card className="shadow-lg border-dashed border-border/50 bg-transparent">
                    <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                        <div className="p-4 bg-primary/10 rounded-full mb-4">
                          <WalletMinimal className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 font-headline">Your Results Await</h3>
                        <p className="text-muted-foreground">Fill out the form to see your estimated salary and career insights.</p>
                    </CardContent>
                </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
