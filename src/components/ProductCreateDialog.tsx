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
  feature_name: z.string().min(2, "Feature name is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function FlowCreateDialog() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { project_label: "", label: "", feature_name: "", description: "" },
    mode: "onChange",
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const body: Record<string, any> = {
        label: values.label.trim(),
        feature_name: values.feature_name.trim(),
        description: (values.description ?? "").trim(),
      };
      if (values.project_label?.trim()) {
        body.project_label = values.project_label.trim();
      }

      await createFlow(body);

      toast({ title: "Flow created", description: "Your flow has been saved." });
      reset();
      setOpen(false);
      router.refresh();
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

      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="mb-1">
          <DialogTitle>Create New Flow</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Group by project (optional), then add a label and feature name.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="project_label" className="text-xs text-muted-foreground">
              Project label (optional)
            </Label>
            <Input
              id="project_label"
              placeholder="e.g. payments-core"
              {...register("project_label")}
              disabled={loading}
            />
            <p className="text-[11px] leading-4 text-muted-foreground">
              Use this to group flows by project. Enter an existing label or a new one.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="label" className="text-xs">Flow label</Label>
            <Input id="label" placeholder="Enter flow label" {...register("label")} disabled={loading} />
            {errors.label && <p className="text-xs text-red-500">{errors.label.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="feature_name" className="text-xs">Feature name</Label>
            <Input id="feature_name" placeholder="Enter feature name" {...register("feature_name")} disabled={loading} />
            {errors.feature_name && <p className="text-xs text-red-500">{errors.feature_name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs text-muted-foreground">Description (optional)</Label>
            <Textarea id="description" rows={4} placeholder="Enter description" {...register("description")} disabled={loading} />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={loading || isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || isSubmitting || !isValid}>
              {(loading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Flow
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
