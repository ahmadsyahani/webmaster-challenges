import Assessment from '@/components/Assessment';
import { mcqQuestions } from '@/lib/mcq';
import { notFound } from 'next/navigation';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[1-9][0-9]?$/.test(id) || Number(id) > mcqQuestions.length) notFound();
  return <Assessment initialId={Number(id)} />;
}
