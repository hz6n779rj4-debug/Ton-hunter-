import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { getAdminTokens } from '@/lib/ton';

type Props = { searchParams?: Promise<{ error?: string }> };

export default async function AdminPage({ searchParams }: Props){
  const params = (await searchParams) || {};
  const tokens = await getAdminTokens();
  return <section className="container-main py-14"><div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><h1 className="text-3xl font-bold">Admin dashboard</h1><p className="mt-2 text-slate-400">Approve free submissions, review pending projects, and manage fast-track TON listings owned by SpyTON.</p></div></div><AdminDashboard tokens={tokens} error={params.error} /></section>;
}
