import { readFile } from 'fs/promises';
import { join } from 'path';
import { GetStaticProps, NextPage } from 'next';
import getConfig from 'next/config';
import { Resume as ResumeType } from 'resume';
import styles from './resume.module.scss';

export const getStaticProps: GetStaticProps = async () => {
  const { root } = getConfig().serverRuntimeConfig;

  const resumeText = await readFile(join(root, 'public/resume.json'), 'utf-8');

  return {
    props: {
      resume: JSON.parse(resumeText),
    },
  };
};

export interface ResumeProps {
  resume: ResumeType;
}

const Resume: NextPage<ResumeProps> = ({ resume }) => (
  <div className={styles.page}>
    <header>
      <h1>{resume.basics.name}</h1>
      <h2>{resume.basics.label}</h2>
    </header>

    <main>
      <aside>
        <section>
          <h3>About</h3>
          <hr />
          <a href={`mailto:${resume.basics.email}`}>{resume.basics.email}</a>
          <a href={resume.basics.url}>{resume.basics.url}</a>
          {resume.basics.profiles.map((profile) => (
            <a href={profile.url} key={profile.network}>
              /{profile.username}
            </a>
          ))}
        </section>
      </aside>
    </main>
  </div>
);

export default Resume;
