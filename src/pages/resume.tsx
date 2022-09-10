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

    <main className={styles.grid}>
      <aside className={styles.contact}>
        <h3>Contact</h3>
        <hr />
        <h5>
          <At />
          <a href={`mailto:${resume.basics.email}`} rel="noreferrer" target="_blank">
            {resume.basics.email}
          </a>
        </h5>
        <h5>
          <LinkIcon />
          <a href={resume.basics.url} rel="noreferrer" target="_blank">
            {resume.basics.url}
          </a>
        </h5>
        {resume.basics.profiles.map((profile) => {
          const Icon = ProfileIcons[profile.network?.toLowerCase()];

          return (
            <h5 key={profile.network}>
              {Icon && <Icon />}
              <a href={profile.url} rel="noreferrer" target="_blank">
                /{profile.username}
              </a>
            </h5>
          );
        })}
      </aside>

      <aside className={styles.skills}>
        {resume.skills?.map((skill) => (
          <section key={skill.name}>
            <h3>{skill.name}</h3>
            <hr />
            {skill.keywords.map((keyword) => (
              <h5 key={keyword}>{keyword}</h5>
            ))}
          </section>
        ))}
      </aside>

      <aside className={styles.about}>
        <h3>About</h3>
        <hr />
        <p>{resume.basics.summary}</p>
      </aside>

      <aside className={styles.experience}>
        <section>
          <h3>Experience</h3>
          <hr />
          {resume.work?.map((work) => (
            <section className={styles.work} key={work.name}>
              <h5>{`${work.startDate} - ${work.endDate || 'Present'}`}</h5>
              <h4>{work.name}</h4>
              <ul>
                {work.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </section>
          ))}
        </section>
      </aside>
    </main>
  </div>
);

export default Resume;
