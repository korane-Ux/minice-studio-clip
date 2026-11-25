import { AppShell } from '@/components/shell/AppShell';

export default function Home() {
  return (
    <AppShell active="creer">
      <main className="p-8">
        <h1 className="text-3xl font-bold">Minice Studio Clip</h1>
      </main>
    </AppShell>
  );
}
