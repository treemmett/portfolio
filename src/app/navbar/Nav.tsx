import { Menu } from './Menu';
import { getSite } from '@lib/getSite';

export async function Nav({ className }: { className?: string }) {
  const site = await getSite();

  return <Menu className={className} site={site} />;
}
