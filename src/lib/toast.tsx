// Tiny imperative toast store on top of Wensity's presentational Toast components.
import { useEffect, useState } from "react";
import { Toast, ToastViewport, type ToastVariant } from "@/components/wensity/toast";

type ToastItem = { id: number; variant: ToastVariant; title: string; description?: string };

let nextId = 1;
let listeners: ((toasts: ToastItem[]) => void)[] = [];
let toasts: ToastItem[] = [];

function emit() {
  for (const l of listeners) l(toasts);
}

export function toast(variant: ToastVariant, title: string, description?: string) {
  const id = nextId++;
  toasts = [...toasts, { id, variant, title, description }];
  emit();
  setTimeout(() => dismiss(id), 4500);
}

function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>(toasts);
  useEffect(() => {
    listeners.push(setItems);
    return () => {
      listeners = listeners.filter((l) => l !== setItems);
    };
  }, []);
  if (items.length === 0) return null;
  return (
    <ToastViewport placement="top-center" className="z-[100]">
      {items.map((t) => (
        <Toast
          key={t.id}
          variant={t.variant}
          title={t.title}
          description={t.description}
          onDismiss={() => dismiss(t.id)}
        />
      ))}
    </ToastViewport>
  );
}
