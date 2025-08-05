"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BrainCircuit, Download, Loader2, FileText, Database } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { generateReportAction } from "./actions";

const formSchema = z.object({
  modelOutputs: z
    .string()
    .min(50, {
      message: "Model output must be at least 50 characters.",
    })
    .max(5000, {
      message: "Model output must not exceed 5000 characters.",
    }),
  glueDataset: z.string().min(1, { message: "Please select a GLUE dataset." }),
});

type FormValues = z.infer<typeof formSchema>;

const glueDatasets = [
  "CoLA", "SST-2", "MRPC", "STS-B", "QQP", "MNLI", "QNLI", "RTE", "WNLI"
];

export default function AIEvaluatorPage() {
  const [isPending, startTransition] = useTransition();
  const [report, setReport] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<FormValues | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      modelOutputs: "",
      glueDataset: "",
    },
  });

  function onSubmit(values: FormValues) {
    setReport(null);
    setSubmittedData(null);
    startTransition(async () => {
      const result = await generateReportAction(values);
      if (result.success && result.report) {
        setReport(result.report);
        setSubmittedData(values);
        toast({
          title: "Success!",
          description: "Benchmark report generated successfully.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "An unknown error occurred.",
        });
      }
    });
  }
  
  const handleDownload = () => {
    if (!report) return;
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'benchmark-report.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center bg-accent text-accent-foreground rounded-full p-3 mb-4">
             <BrainCircuit className="h-10 w-10" />
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">AI Model Evaluator</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Benchmark your AI model's performance against standard GLUE datasets with our powerful evaluation tool.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Start Benchmarking</CardTitle>
              <CardDescription>
                Provide your model's output and select a GLUE dataset to begin.
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="modelOutputs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model Outputs</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Paste your model outputs here (e.g., in JSON or CSV format)"
                            className="min-h-[200px] resize-y font-code"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide the raw output from your AI model for evaluation.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="glueDataset"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GLUE Benchmark Dataset</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a dataset" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {glueDatasets.map((dataset) => (
                              <SelectItem key={dataset} value={dataset}>
                                {dataset}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the GLUE dataset for comparison.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isPending} className="w-full">
                    {isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isPending ? "Generating Report..." : "Run Benchmark"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          <div className="space-y-8">
            {isPending && (
              <Card>
                <CardHeader>
                  <CardTitle>Generating Report</CardTitle>
                  <CardDescription>Please wait while we analyze the data...</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            )}

            {report && submittedData && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" /> Submitted Data
                    </CardTitle>
                    <CardDescription>This is the data you provided for benchmarking.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2"><Database className="h-4 w-4 text-muted-foreground" /> GLUE Dataset</h3>
                      <p className="text-sm font-medium text-primary rounded-md px-3 py-1">{submittedData.glueDataset}</p>
                    </div>
                     <div>
                      <h3 className="font-semibold">Model Outputs</h3>
                      <div className="mt-2 border rounded-md p-3 bg-muted/50 max-h-48 overflow-y-auto">
                        <pre className="text-sm font-code whitespace-pre-wrap break-words">{submittedData.modelOutputs}</pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Benchmark Report</CardTitle>
                    <CardDescription>
                      Here is the detailed analysis of your model's performance.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                     <div className="prose prose-sm dark:prose-invert max-w-none border rounded-lg p-4 bg-background">
                       <pre className="font-code text-sm whitespace-pre-wrap break-words">{report}</pre>
                     </div>
                  </CardContent>
                   <CardFooter>
                      <Button onClick={handleDownload} className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download Report
                      </Button>
                  </CardFooter>
                </Card>
              </>
            )}

            {!isPending && !report && (
               <Card className="flex flex-col items-center justify-center text-center p-8 border-dashed">
                 <CardContent>
                    <div className="p-3 bg-muted rounded-full inline-block mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">Your Report Awaits</h3>
                    <p className="text-muted-foreground mt-1">
                      Fill out the form to generate your benchmark report.
                    </p>
                 </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
