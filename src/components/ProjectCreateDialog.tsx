"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Loader2 } from "lucide-react";
import { createProject, checkProjectLabelUnique } from "@/lib/api";

const schema = z.object({
  project_label: z
    .string()
    .trim()
    .min(2, "Project label is required")
    .max(64, "Max 64 characters")
    .regex(/^[a-zA-Z0-9._-]+$/, "Use letters, numbers, dot, dash or underscore"),
  project_description: z.string().trim().max(500, "Max 500 characters").optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ProjectCreateDialog() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [checking, setChecking] = React.useState(false);
  const [labelTaken, setLabelTaken] = React.useState<string | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    watch,
    reset,
    trigger,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { project_label: "", project_description: "" },
    mode: "onChange",
  });

  const labelValue = watch("project_label");

  // Debounced uniqueness check on label changes
  React.useEffect(() => {
    let active = true;
    const v = (labelValue || "").trim();
    if (!v) {
      setLabelTaken(null);
      return;
    }
    setChecking(true);
    const id = setTimeout(async () => {
      try {
        const unique = await checkProjectLabelUnique(v);
        console.log("unirqu::",unique);
        if (!active) return;
        setLabelTaken(unique ? null : "This label is already taken");
      } catch {
        if (!active) return;
        setLabelTaken(null);
      } finally {
        if (active) setChecking(false);
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [labelValue]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      // Ensure schema is valid and uniqueness is respected
      await trigger();
      if (labelTaken) throw new Error(labelTaken);

      await createProject({
        project_label: values.project_label.trim(),
        project_description: (values.project_description || "").trim(),
      });

      toast({ title: "Project created", description: "Your project has been saved." });
      reset();
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message ?? "Failed to create project. Please try again.",
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
          New Project
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project_label">Project label</Label>
            <Input id="project_label" placeholder="e.g. payments-core" {...register("project_label")} disabled={loading} />
            <div className="text-xs h-4">
              {errors.project_label ? (
                <span className="text-red-500">{errors.project_label.message}</span>
              ) : labelTaken ? (
                <span className="text-red-500">{labelTaken}</span>
              ) : checking ? (
                <span className="text-muted-foreground">Checking…</span>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project_description">Description (optional)</Label>
            <Textarea id="project_description" rows={4} placeholder="What is this project about?" {...register("project_description")} disabled={loading} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={loading || isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || isSubmitting || !isValid || Boolean(labelTaken)}>
              {(loading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

