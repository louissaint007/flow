import { Zap } from 'lucide-react';

export function Header() {
  return (
    <header className="py-6 mb-8 text-center border-b">
      <div className="container mx-auto flex items-center justify-center gap-2">
        <Zap className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary font-headline">
          FocusFlow
        </h1>
      </div>
    </header>
  );
}
