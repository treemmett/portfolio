// eslint-disable-next-line import/no-unresolved
import { Resume as ResumeType } from 'resume';
import { Resume } from '../Resume';
import ResumeLoading from '../loading';
import { ResumeForm } from './Form';

export default async function CustomResume({
  searchParams,
}: {
  searchParams: { link?: string; json?: string };
}) {
  let resume: ResumeType | null = null;

  if (searchParams.json) {
    resume = JSON.parse(searchParams.json);
  } else if (searchParams.link) {
    resume = await fetch(searchParams.link).then((r) => r.json());
  }

  if (resume) {
    return <Resume resume={resume} />;
  }

  return (
    <>
      <ResumeLoading animated={false} />
      <div className="pointer-events-none fixed left-0 top-0 flex h-screen max-h-screen w-screen items-center justify-center bg-black/80 py-8">
        <div className="glass	pointer-events-auto max-h-full w-5/6 overflow-auto p-8 sm:w-3/4 md:w-4/6">
          <ResumeForm />
        </div>
      </div>
    </>
  );
}
