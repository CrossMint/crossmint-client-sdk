"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { classNames } from "@/utils/classNames";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={classNames(
            "fixed inset-0 z-50 bg-black/80 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:animate-fade-out data-[state=open]:animate-in data-[state=open]:animate-fade-in",
            className
        )}
        {...props}
    />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
    showCloseButton?: boolean;
    closeButtonColor?: string;
    closeButtonRingColor?: string;
}

const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DialogContentProps>(
    ({ className, children, showCloseButton = true, closeButtonColor, closeButtonRingColor, ...props }, ref) => (
        <DialogPortal>
            <DialogOverlay />
            <DialogPrimitive.Content
                ref={ref}
                className={classNames(
                    "fixed z-50 p-6 pb-2 bg-cm-background-primary border border-cm-border shadow-xl transition-none",
                    // Small viewport styles (bottom sheet)
                    "inset-x-0 bottom-0 w-full border-t rounded-t-xl",
                    "data-[state=closed]:animate-slide-out-to-bottom data-[state=open]:animate-slide-in-from-bottom",
                    // Regular viewport styles (centered modal)
                    "xs:inset-auto !xs:p-10 xs:left-[50%] xs:top-[50%] xs:translate-x-[-50%] xs:translate-y-[-50%]",
                    "xs:max-w-[448px] xs:rounded-xl",
                    "xs:data-[state=closed]:animate-fade-out xs:data-[state=closed]:animate-zoom-out-95",
                    "xs:data-[state=open]:animate-fade-in xs:data-[state=open]:animate-zoom-in-95",
                    // Duration for animations
                    "data-[state=closed]:duration-300 data-[state=open]:duration-500",
                    className
                )}
                {...props}
            >
                {children}
                {showCloseButton && (
                    <DialogPrimitive.Close
                        className="absolute right-4 top-4 rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-cm-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-text-primary"
                        style={{
                            color: closeButtonColor,
                            // @ts-expect-error --tw-ring-color is not recognized by typescript but gets picked up by tailwind
                            "--tw-ring-color": closeButtonRingColor ?? "#1A73E8",
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6"
                        >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                )}
            </DialogPrimitive.Content>
        </DialogPortal>
    )
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={classNames("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={classNames("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
        {...props}
    />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={classNames("text-lg font-semibold leading-none tracking-tight", className)}
        {...props}
    />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={classNames("text-sm text-muted-foreground", className)}
        {...props}
    />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogClose,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
};