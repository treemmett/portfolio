import { readFile } from 'fs/promises';
import { join } from 'path';
import { GetStaticProps, NextPage } from 'next';
import getConfig from 'next/config';
import { FC, PropsWithChildren } from 'react';
// eslint-disable-next-line import/no-unresolved
import { Resume as ResumeType } from 'resume';
import styles from './resume.module.scss';
import { Anchor } from '@components/Anchor';
import { ReactComponent as At } from '@icons/at-sign.svg';
import { ReactComponent as ExternalLinkIcon } from '@icons/external-link.svg';
import { ReactComponent as GitHub } from '@icons/github.svg';
import { ReactComponent as Instagram } from '@icons/instagram.svg';
import { ReactComponent as LinkIcon } from '@icons/link.svg';
import { ReactComponent as LinkedIn } from '@icons/linkedin.svg';
import { ReactComponent as Twitter } from '@icons/twitter.svg';

export const getStaticProps: GetStaticProps = async () => {
  const { root } = getConfig().serverRuntimeConfig;

  const resumeText = await readFile(join(root, 'public/resume.json'), 'utf-8');

  return {
    props: {
      resume: JSON.parse(resumeText),
    },
  };
};

const Section: FC<PropsWithChildren<{ className?: string; name?: string }>> = ({
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

const ExternalLink: FC = () => <ExternalLinkIcon className={styles['external-link']} />;

const Resume: NextPage<ResumeProps> = ({ resume }) => (
  <div className={styles.page}>
    <header className={styles.header}>
      {resume.basics?.name && <h1>{resume.basics.name}</h1>}
      {resume.basics?.label && <h2>{resume.basics.label}</h2>}
    </header>

    <Section className={styles.contact} name="Contact">
      <div className={styles.dual}>
        {resume.basics?.email && (
          <Anchor href={`mailto:${resume.basics.email}`}>
            <h5>
              <At />
              {resume.basics.email}
              <ExternalLink />
            </h5>
          </Anchor>
        )}
        {resume.basics?.url && (
          <Anchor href={resume.basics.url}>
            <h5>
              <LinkIcon />
              {resume.basics.url}
              <ExternalLink />
            </h5>
          </Anchor>
        )}
        {resume.basics?.profiles?.map((profile) => {
          if (!profile.url) return null;

          let Icon: FC | null = null;

          switch (profile.network?.toLowerCase()) {
            case 'github':
              Icon = GitHub;
              break;

            case 'instagram':
              Icon = Instagram;
              break;

            case 'linkedin':
              Icon = LinkedIn;
              break;

            case 'twitter':
              Icon = Twitter;
              break;

            default:
              break;
          }

          return (
            <Anchor href={profile.url} key={profile.network}>
              <h5>
                {Icon && <Icon />}/{profile.username}
                <ExternalLink />
              </h5>
            </Anchor>
          );
        })}
      </div>
    </Section>

    <section className={styles.skills}>
      {resume.skills?.map((skill) => (
        <Section key={skill.name} name={skill.name}>
          <div className={styles.dual}>
            {skill.keywords?.map((keyword) => (
              <h5 className={styles.skill} key={keyword}>
                {keyword}
              </h5>
            ))}
          </div>
        </Section>
      ))}
    </section>

    <Section className={styles.languages} name="Languages">
      <div className={styles.list}>
        {resume?.languages?.map((language) => (
          <div className={styles.language} key={language.language}>
            <h5>{language.language}</h5>
            <span>{language.fluency}</span>
          </div>
        ))}
      </div>
    </Section>

    <Section className={styles.experience} name="Experience">
      {resume.work?.map((work) => (
        <div className={styles.work} key={work.name}>
          <h6>{`${work.startDate} - ${work.endDate || 'Present'}`}</h6>
          <h4>
            <Anchor href={work.url}>
              {work.name}
              <ExternalLink />
            </Anchor>
          </h4>
          <h5>{work.position}</h5>
          <ul>{work.highlights?.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
        </div>
      ))}
    </Section>
  </div>
);

export default Resume;
