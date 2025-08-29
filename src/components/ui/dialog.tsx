// components/ui/dialog.tsx
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export function DialogOverlay(
    { className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
  ) {
    return (
      <DialogPrimitive.Overlay
        className={cn(
          "fixed inset-0 z-40",
          // very light background instead of dark shadow
          "bg-black/20 backdrop-blur-[1px]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          className
        )}
        {...props}
      />
    );
  }
  
  export function DialogContent(
    { className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
  ) {
    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2",
            // white panel
            "rounded-xl border border-neutral-200 bg-white text-neutral-900",
            "shadow-lg",
            "p-6 sm:max-w-md sm:p-7",
            // animation
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "focus:outline-none",
            className
          )}
          {...props}
        />
      </DialogPortal>
    );
  }
  

export function DialogHeader(
  { className, ...props }: React.HTMLAttributes<HTMLDivElement>
) {
  return <div className={cn("space-y-1 mb-2", className)} {...props} />;
}

export function DialogTitle(
  { className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
) {
  return (
    <DialogPrimitive.Title
      className={cn("text-[15px] font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

export function DialogDescription(
  { className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function DialogFooter(
  { className, ...props }: React.HTMLAttributes<HTMLDivElement>
) {
  return <div className={cn("flex items-center justify-end gap-2 pt-3", className)} {...props} />;
}
