import { readFile } from 'fs/promises';
import { join } from 'path';
import { GetStaticProps, NextPage } from 'next';
import getConfig from 'next/config';
import { FC, PropsWithChildren } from 'react';
import { Resume as ResumeType } from 'resume';
import styles from './resume.module.scss';
import { ReactComponent as At } from '@icons/at-sign.svg';
import { ReactComponent as GitHub } from '@icons/github.svg';
import { ReactComponent as Instagram } from '@icons/instagram.svg';
import { ReactComponent as LinkIcon } from '@icons/link.svg';
import { ReactComponent as LinkedIn } from '@icons/linkedin.svg';
import { ReactComponent as Twitter } from '@icons/twitter.svg';

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

const Section: FC<PropsWithChildren<{ className?: string; name: string }>> = ({
  children,
  className,
  name,
}) => (
  <section className={className}>
    <h3>{name}</h3>
    <hr />
    {children}
  </section>
);

export interface ResumeProps {
  resume: ResumeType;
}

const Resume: NextPage<ResumeProps> = ({ resume }) => (
  <div className={styles.page}>
    <header className={styles.header}>
      <h1>{resume.basics.name}</h1>
      <h2>{resume.basics.label}</h2>
    </header>

    <Section className={styles.contact} name="Contact">
      <a href={`mailto:${resume.basics.email}`} rel="noreferrer" target="_blank">
        <At />
        <h5>{resume.basics.email}</h5>
      </a>
      <a href={resume.basics.url} rel="noreferrer" target="_blank">
        <LinkIcon />
        <h5>{resume.basics.url}</h5>
      </a>
      {resume.basics.profiles.map((profile) => {
        const Icon = ProfileIcons[profile.network?.toLowerCase()];

        return (
          <a href={profile.url} key={profile.network} rel="noreferrer" target="_blank">
            {Icon && <Icon />}
            <h5>/{profile.username}</h5>
          </a>
        );
      })}
    </Section>

    <section className={styles.skills}>
      {resume.skills?.map((skill) => (
        <Section key={skill.name} name={skill.name}>
          {skill.keywords.map((keyword) => (
            <h5 key={keyword}>{keyword}</h5>
          ))}
        </Section>
      ))}
    </section>

    <Section className={styles.about} name="About">
      <p>{resume.basics.summary}</p>
    </Section>

    <Section className={styles.languages} name="Languages">
      <div className={styles.list}>
        {resume?.languages?.map((language) => (
          <div className={styles.language} key={language.language}>
            <h5>{language.language}</h5>
            <h6>{language.fluency}</h6>
          </div>
        ))}
      </div>
    </Section>

    <Section className={styles.experience} name="Experience">
      {resume.work?.map((work) => (
        <div className={styles.work} key={work.name}>
          <h5>{`${work.startDate} - ${work.endDate || 'Present'}`}</h5>
          <h4>{work.name}</h4>
          <ul>
            {work.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </div>
      ))}
    </Section>
  </div>
);

export default Resume;
