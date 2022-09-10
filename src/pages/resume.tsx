import { readFile } from 'fs/promises';
import { join } from 'path';
import { GetStaticProps, NextPage } from 'next';
import getConfig from 'next/config';
import { Resume as ResumeType } from 'resume';
import { ReactComponent as At } from '../icons/at-sign.svg';
import { ReactComponent as GitHub } from '../icons/github.svg';
import { ReactComponent as Instagram } from '../icons/instagram.svg';
import { ReactComponent as LinkIcon } from '../icons/link.svg';
import { ReactComponent as LinkedIn } from '../icons/linkedin.svg';
import { ReactComponent as Twitter } from '../icons/twitter.svg';
import styles from './resume.module.scss';

const ProfileIcons = {
  github: GitHub,
  instagram: Instagram,
  linkedin: LinkedIn,
  twitter: Twitter,
};

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
          <h5>
            <At />
            <a href={`mailto:${resume.basics.email}`}>{resume.basics.email}</a>
          </h5>
          <h5>
            <LinkIcon />
            <a href={resume.basics.url}>{resume.basics.url}</a>
          </h5>
          {resume.basics.profiles.map((profile) => {
            const Icon = ProfileIcons[profile.network?.toLowerCase()];

            return (
              <h5 key={profile.network}>
                {Icon && <Icon />}
                <a href={profile.url}>/{profile.username}</a>
              </h5>
            );
          })}
        </section>
      </aside>
    </main>
  </div>
);

export default Resume;
