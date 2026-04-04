import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}

const EmptyState = ({ icon: Icon, title, description, actionLabel, actionTo, onAction }: EmptyStateProps) => (
  <main className="flex min-h-screen items-center justify-center px-4 pt-20">
    <ScrollReveal className="text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Icon size={36} className="text-muted-foreground/50" />
      </div>
      <h2 className="mt-5 font-display text-2xl font-semibold text-foreground">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-6 inline-block bg-foreground px-8 py-3 text-sm font-semibold uppercase tracking-wider text-background transition-all hover:shadow-lg active:scale-[0.97]"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button
          onClick={onAction}
          className="mt-6 inline-block bg-foreground px-8 py-3 text-sm font-semibold uppercase tracking-wider text-background transition-all hover:shadow-lg active:scale-[0.97]"
        >
          {actionLabel}
        </button>
      )}
    </ScrollReveal>
  </main>
);

export default EmptyState;
