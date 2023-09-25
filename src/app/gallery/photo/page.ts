import { permanentRedirect } from 'next/navigation';

export default function PageRedirect() {
  return permanentRedirect('/');
}
