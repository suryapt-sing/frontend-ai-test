"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFlow } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const schema = z.object({
  project_label: z.string().trim().max(64, "Max 64 characters").optional(),
  label: z.string().min(1, "Flow label is required"),
  start_url: z
    .string()
    .trim()
    .min(1, "Start URL is required")
    .url("Enter a valid URL (e.g. https://example.com)"),
  feature_name: z.string().min(2, "Feature name is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function FlowCreateDialog() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { project_label: "", label: "", start_url: "", feature_name: "", description: "" },
    mode: "onChange",
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      // Only include project label if provided
      const body: Record<string, any> = {
        flow_id_ext: values.label.trim(),
        start_url: values.start_url.trim(),
        feature_name: values.feature_name.trim(),
        description: (values.description ?? "").trim(),
      };
      if (values.project_label?.trim()) {
        body.project_label = values.project_label.trim();
      }

      await createFlow(body);

      toast({ title: "Success", description: "Flow created successfully" });
      form.reset();
      setOpen(false);
      router.refresh(); // refresh the server list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message ?? "Failed to create flow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Flow
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Flow</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project_label">Project label</Label>
            <Input
              id="project_label"
              placeholder="e.g. payments-core"
              {...form.register("project_label")}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">Flow label</Label>
            <Input id="label" placeholder="Enter flow label" {...form.register("label")} disabled={loading} />
            {form.formState.errors.label && (
              <p className="text-sm text-red-500">{form.formState.errors.label.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_url">Start URL</Label>
            <Input id="start_url" placeholder="https://example.com/start" {...form.register("start_url")} disabled={loading} />
            {form.formState.errors.start_url && (
              <p className="text-sm text-red-500">{form.formState.errors.start_url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="feature_name">Feature name</Label>
            <Input id="feature_name" placeholder="Enter feature name" {...form.register("feature_name")} disabled={loading} />
            {form.formState.errors.feature_name && (
              <p className="text-sm text-red-500">{form.formState.errors.feature_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Enter description" {...form.register("description")} disabled={loading} rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !form.formState.isValid}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Flow
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
