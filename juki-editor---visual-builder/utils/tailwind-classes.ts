// A curated list of common Tailwind CSS classes for autocomplete suggestions.
// This is not exhaustive but covers a wide range of common use cases.

export const TAILWIND_CLASSES: string[] = [
  // Layout
  "block", "inline-block", "inline", "flex", "inline-flex", "grid", "inline-grid",
  "hidden", "absolute", "relative", "static", "fixed", "sticky",
  "inset-0", "inset-x-0", "inset-y-0", "top-0", "bottom-0", "left-0", "right-0",
  "z-0", "z-10", "z-20", "z-30", "z-40", "z-50", "z-auto",

  // Flexbox & Grid
  "flex-row", "flex-row-reverse", "flex-col", "flex-col-reverse",
  "flex-wrap", "flex-wrap-reverse", "flex-nowrap",
  "flex-1", "flex-auto", "flex-initial", "flex-none",
  "items-start", "items-end", "items-center", "items-baseline", "items-stretch",
  "justify-start", "justify-end", "justify-center", "justify-between", "justify-around", "justify-evenly",
  "gap-0", "gap-1", "gap-2", "gap-4", "gap-8", "gap-px",
  "gap-x-0", "gap-x-1", "gap-x-2", "gap-x-4", "gap-x-8",
  "gap-y-0", "gap-y-1", "gap-y-2", "gap-y-4", "gap-y-8",
  "grid-cols-1", "grid-cols-2", "grid-cols-3", "grid-cols-4", "grid-cols-5", "grid-cols-6", "grid-cols-12",
  "grid-rows-1", "grid-rows-2", "grid-rows-3", "grid-rows-6",
  "col-span-1", "col-span-2", "col-span-3", "col-span-full",
  "row-span-1", "row-span-2", "row-span-3", "row-span-full",
  
  // Spacing (Padding, Margin, Space Between)
  "p-0", "p-1", "p-2", "p-4", "p-6", "p-8", "p-12", "p-px",
  "px-0", "px-1", "px-2", "px-4", "px-6", "px-8", "px-12",
  "py-0", "py-1", "py-2", "py-4", "py-6", "py-8", "py-12",
  "pt-0", "pt-1", "pt-2", "pt-4", "pt-6", "pt-8", "pt-12",
  "pb-0", "pb-1", "pb-2", "pb-4", "pb-6", "pb-8", "pb-12",
  "pl-0", "pl-1", "pl-2", "pl-4", "pl-6", "pl-8", "pl-12",
  "pr-0", "pr-1", "pr-2", "pr-4", "pr-6", "pr-8", "pr-12",
  "m-0", "m-1", "m-2", "m-4", "m-6", "m-8", "m-12", "m-auto",
  "mx-0", "mx-1", "mx-2", "mx-4", "mx-6", "mx-8", "mx-12", "mx-auto",
  "my-0", "my-1", "my-2", "my-4", "my-6", "my-8", "my-12", "my-auto",
  "mt-0", "mt-1", "mt-2", "mt-4", "mt-6", "mt-8", "mt-12",
  "mb-0", "mb-1", "mb-2", "mb-4", "mb-6", "mb-8", "mb-12",
  "ml-0", "ml-1", "ml-2", "ml-4", "ml-6", "ml-8", "ml-12",
  "mr-0", "mr-1", "mr-2", "mr-4", "mr-6", "mr-8", "mr-12",
  
  // Sizing
  "w-0", "w-1", "w-2", "w-4", "w-8", "w-16", "w-32", "w-64", "w-auto", "w-px",
  "w-1/2", "w-1/3", "w-2/3", "w-1/4", "w-3/4", "w-full", "w-screen",
  "min-w-0", "min-w-full", "max-w-xs", "max-w-md", "max-w-lg", "max-w-xl", "max-w-full",
  "h-0", "h-1", "h-2", "h-4", "h-8", "h-16", "h-32", "h-64", "h-auto", "h-px",
  "h-1/2", "h-full", "h-screen",
  "min-h-0", "min-h-full", "min-h-screen", "max-h-full", "max-h-screen",

  // Typography
  "text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl", "text-3xl", "text-4xl",
  "font-thin", "font-extralight", "font-light", "font-normal", "font-medium", "font-semibold", "font-bold", "font-extrabold", "font-black",
  "italic", "not-italic",
  "text-left", "text-center", "text-right", "text-justify",
  "text-black", "text-white",
  "text-slate-500", "text-gray-500", "text-zinc-500", "text-neutral-500", "text-stone-500",
  "text-red-500", "text-orange-500", "text-amber-500", "text-yellow-500", "text-lime-500",
  "text-green-500", "text-emerald-500", "text-teal-500", "text-cyan-500", "text-sky-500",
  "text-blue-500", "text-indigo-500", "text-violet-500", "text-purple-500", "text-fuchsia-500", "text-pink-500", "text-rose-500",
  "underline", "line-through", "no-underline",
  "truncate", "text-ellipsis", "text-clip",

  // Backgrounds
  "bg-transparent", "bg-current", "bg-black", "bg-white",
  "bg-slate-500", "bg-gray-500", "bg-zinc-500", "bg-neutral-500", "bg-stone-500",
  "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-yellow-500", "bg-lime-500",
  "bg-green-500", "bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-sky-500",
  "bg-blue-500", "bg-indigo-500", "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", "bg-pink-500", "bg-rose-500",
  "bg-gradient-to-t", "bg-gradient-to-tr", "bg-gradient-to-r", "bg-gradient-to-br", "bg-gradient-to-b", "bg-gradient-to-bl", "bg-gradient-to-l", "bg-gradient-to-tl",

  // Borders
  "rounded-none", "rounded-sm", "rounded", "rounded-md", "rounded-lg", "rounded-xl", "rounded-2xl", "rounded-3xl", "rounded-full",
  "border", "border-0", "border-2", "border-4", "border-8",
  "border-x", "border-y", "border-t", "border-b", "border-l", "border-r",
  "border-solid", "border-dashed", "border-dotted", "border-double", "border-none",
  "border-black", "border-white", "border-slate-500", "border-blue-500", "border-green-500", "border-red-500",

  // Effects
  "shadow-sm", "shadow", "shadow-md", "shadow-lg", "shadow-xl", "shadow-2xl", "shadow-inner", "shadow-none",
  "opacity-0", "opacity-5", "opacity-25", "opacity-50", "opacity-75", "opacity-100",

  // Transitions & Animation
  "transition-none", "transition-all", "transition", "transition-colors", "transition-opacity", "transition-shadow", "transition-transform",
  "duration-75", "duration-100", "duration-150", "duration-200", "duration-300", "duration-500", "duration-700", "duration-1000",
  "ease-linear", "ease-in", "ease-out", "ease-in-out",
  "animate-spin", "animate-ping", "animate-pulse", "animate-bounce",
  
  // Interactivity
  "cursor-pointer", "cursor-wait", "cursor-text", "cursor-move", "cursor-not-allowed",
  "outline-none", "outline", "outline-dashed", "outline-dotted", "outline-double",
  "ring", "ring-2", "ring-4", "ring-blue-500",
  "hover:", "focus:", "active:", "disabled:", "focus-visible:",
];
