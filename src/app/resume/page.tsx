import { notFound } from 'next/navigation';
import { FC, PropsWithChildren } from 'react';
import {
  AtSign,
  ExternalLink as ExternalLinkIcon,
  GitHub,
  Instagram,
  Linkedin,
  Twitter,
} from 'react-feather';
// eslint-disable-next-line import/no-unresolved
import { Resume as ResumeType } from 'resume';
import styles from './resume.module.scss';
import { Anchor } from '@components/Anchor';
import { getSite } from '@lib/getSite';

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

const ExternalLink: FC = () => <ExternalLinkIcon className={styles['external-link']} />;

export default async function Resume() {
  const site = await getSite();

  if (!site.resumeUrl) notFound();

  const response = await fetch(site.resumeUrl, { next: { tags: ['resume'] } });
  if (!response.ok) notFound();

  const resume: ResumeType = await response.json();

  return (
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
                <AtSign />
                {resume.basics.email}
                <ExternalLink />
              </h5>
            </Anchor>
          )}
          {resume.basics?.url && (
            <Anchor href={resume.basics.url}>
              <h5>
                <ExternalLinkIcon />
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
                Icon = Linkedin;
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
}
