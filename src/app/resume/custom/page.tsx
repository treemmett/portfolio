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
      <div className="fixed pointer-events-none bg-black/80 py-8 flex items-center justify-center w-screen h-screen max-h-screen top-0 left-0">
        <div className="pointer-events-auto	w-5/6 sm:w-3/4 md:w-4/6 max-h-full glass p-8 overflow-auto">
          <ResumeForm />
        </div>
      </div>
    </>
  );
}
