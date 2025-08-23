'use client';

import { useState } from 'react';
import type { ResultData } from '@/app/page';
import { generateCoverLetter } from '@/ai/flows/generate-cover-letter';
import { suggestSkills } from '@/ai/flows/suggest-skills';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { FileText, Lightbulb, Loader2, Copy, Check, DollarSign } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';


interface ResultsDisplayProps {
  result: ResultData;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const { formData, predictedSalary, salaryData } = result;
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isSuggestingSkills, setIsSuggestingSkills] = useState(false);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleSuggestSkills = async () => {
    setIsSuggestingSkills(true);
    try {
      const response = await suggestSkills({ jobDescription: formData.jobDescription });
      setSuggestedSkills(response.suggestedSkills);
    } catch (error) {
      console.error('Error suggesting skills:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to suggest skills. Please try again.',
      });
    } finally {
      setIsSuggestingSkills(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    setIsGeneratingLetter(true);
    setCoverLetter('');
    try {
      const response = await generateCoverLetter({ ...formData, predictedSalary });
      setCoverLetter(response.coverLetter);
    } catch (error) {
      console.error('Error generating cover letter:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate cover letter. Please try again.',
      });
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const chartData = [
    { name: 'Min Salary', value: salaryData.minSalary, fill: "hsl(var(--chart-1))" },
    { name: 'Max Salary', value: salaryData.maxSalary, fill: "hsl(var(--chart-2))" },
  ];

  const chartConfig = {
      value: {
          label: "Salary",
      },
      min: {
          label: "Min Salary",
          color: "hsl(var(--chart-1))",
      },
      max: {
          label: "Max Salary",
          color: "hsl(var(--chart-2))",
      },
  }
  
  return (
    <div className="space-y-8">
      <Card className="shadow-2xl bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="text-center">
          <div className="mx-auto bg-accent/10 p-3 rounded-full w-fit mb-2">
             <DollarSign className="w-8 h-8 text-accent" />
          </div>
          <CardDescription>Predicted Salary Range</CardDescription>
          <CardTitle className="text-5xl font-extrabold font-headline" style={{ color: 'hsl(var(--accent))' }}>
            {predictedSalary}
          </CardTitle>
           <CardDescription>({salaryData.currencyCode})</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="w-full h-[250px]">
              <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.replace(" Salary", "")}
                  />
                  <YAxis
                    tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value as number)}
                  />
                  <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="value" radius={8} />
              </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-2xl bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Lightbulb className="text-primary" />
            Career Insights
          </CardTitle>
          <CardDescription>Leverage AI to boost your application and earning potential.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Suggested Skills for Higher Salary</h3>
            {isSuggestingSkills ? (
              <div className="flex items-center text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </div>
            ) : suggestedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {suggestedSkills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-base py-1 px-3 cursor-pointer hover:bg-primary/20" onClick={() => toast({title: "Salary Boost!", description: `Learning ${skill} could increase your salary!`})}>
                            {skill}
                        </Badge>
                    ))}
                </div>
            ) : (
                <Button onClick={handleSuggestSkills} variant="outline" size="sm">
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Suggest Skills
                </Button>
            )}
            {suggestedSkills.length > 0 && <p className="text-xs text-muted-foreground mt-2">Click a skill to see its potential impact!</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Dialog>
            <DialogTrigger asChild>
              <Button onClick={handleGenerateCoverLetter} className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Generate Cover Letter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Your AI-Generated Cover Letter</DialogTitle>
                <DialogDescription>
                  Here is a tailored cover letter based on your profile. You can copy and edit it as needed.
                </DialogDescription>
              </DialogHeader>
              {isGeneratingLetter ? (
                 <div className="flex items-center justify-center py-20 text-muted-foreground">
                    <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                    <span>Crafting your letter...</span>
                </div>
              ) : (
                <div className="relative">
                  <pre className="mt-2 w-full whitespace-pre-wrap rounded-md bg-secondary p-4 font-body text-secondary-foreground text-sm max-h-[50vh] overflow-y-auto">
                    {coverLetter}
                  </pre>
                  <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-8 w-8" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}
