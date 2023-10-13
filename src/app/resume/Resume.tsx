'use client';

import cx from 'classnames';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC, PropsWithChildren } from 'react';
import {
  AtSign,
  Code,
  Download,
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
import { useTranslation } from '@utils/translation';

const Section: FC<PropsWithChildren<{ className?: string; name?: string }>> = ({
  children,
  className,
  name,
}) => (
  <section className={className}>
    <h3>{name}</h3>
    <hr className="my-2" />
    {children}
  </section>
);

const ExternalLink: FC<{ className?: string }> = ({ className }) => (
  <ExternalLinkIcon className={cx(className, 'mb-auto ml-1 h-3 w-3 print:hidden')} />
);

export const Resume: FC<{ resume: ResumeType }> = ({ resume }) => {
  const { t } = useTranslation();
  const pathname = usePathname();

  const isCanonical = pathname === '/resume';

  return (
    <>
      <div className={cx(styles.page, 'm-auto grid w-full max-w-6xl gap-8 p-8')}>
        <header className={styles.header}>
          {resume.basics?.name && <h1>{resume.basics.name}</h1>}
          {resume.basics?.label && <h2>{resume.basics.label}</h2>}
        </header>

        <Section className={styles.contact} name="Contact">
          <div className="grid grid-cols-2 gap-4 pt-3 md:grid-cols-3">
            {resume.basics?.email && (
              <Anchor className="flex items-center" href={`mailto:${resume.basics.email}`}>
                <AtSign className="mr-2 stroke-1" />
                {resume.basics.email}
                <ExternalLink />
              </Anchor>
            )}
            {resume.basics?.url && (
              <Anchor className="flex items-center" href={resume.basics.url}>
                <ExternalLinkIcon className="mr-2 stroke-1" />
                {resume.basics.url}
                <ExternalLink />
              </Anchor>
            )}
            {resume.basics?.profiles?.map((profile) => {
              if (!profile.url) return null;

              let Icon: FC<{ className?: string }> | null = null;

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
                <Anchor className="flex items-center" href={profile.url} key={profile.network}>
                  {Icon && <Icon className="mr-2 stroke-1" />}/{profile.username}
                  <ExternalLink />
                </Anchor>
              );
            })}
          </div>
        </Section>

        <div className={cx(styles.skills, 'flex flex-col gap-4')}>
          {resume.skills?.map((skill) => (
            <Section key={skill.name} name={skill.name}>
              <div className="grid grid-cols-2  gap-x-4 gap-y-2 pt-2 lg:grid-cols-3">
                {skill.keywords?.map((keyword) => (
                  <h5 className="self-center" key={keyword}>
                    {keyword}
                  </h5>
                ))}
              </div>
            </Section>
          ))}
        </div>

        <Section className={styles.languages} name="Languages">
          <div className="flex justify-between">
            {resume?.languages?.map((language) => (
              <div key={language.language}>
                <h5>{language.language}</h5>
                <span>{language.fluency}</span>
              </div>
            ))}
          </div>
        </Section>

        <div className={styles.experience}>
          <h3>Experience</h3>
          <hr className="my-2" />
          <div className="flex flex-col gap-6">
            {resume.work?.map((work) => (
              <div key={work.name}>
                <div className="flex justify-between">
                  <h4>
                    {work.url ? (
                      <Anchor className="inline-flex items-center" href={work.url}>
                        {work.name}
                        <ExternalLink className="inline-block" />
                      </Anchor>
                    ) : (
                      <div>{work.name}</div>
                    )}
                  </h4>
                  <h6>{`${work.startDate} - ${work.endDate || 'Present'}`}</h6>
                </div>
                <h5 className="mb-2">{work.position}</h5>
                <ul>
                  {work.highlights?.map((highlight) => (
                    <li className="list-disc" key={highlight}>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="sticky bottom-2 flex justify-center print:hidden">
        <div className="glass flex gap-2 p-2">
          <Link className="button green text-xs" href="/resume/custom">
            {t('Generate your own resume')}
          </Link>

          <button
            className="button action flex items-center px-2"
            onClick={() => window.print()}
            title="Download PDF"
            type="button"
          >
            <Download size={16} />
          </button>

          {isCanonical && (
            <Link
              className="button action flex items-center px-2"
              href="/resume.json"
              title="View resume.json"
            >
              <Code size={16} />
            </Link>
          )}
        </div>
      </div>
    </>
  );
};
