/* eslint-disable react/no-array-index-key */
import cx from 'classnames';
import { FC, PropsWithChildren } from 'react';
import styles from './resume.module.scss';

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

export default async function ResumeLoading(
  { animated }: { animated: boolean } = { animated: true },
) {
  const skeleton = animated ? 'skeleton' : 'skeleton reduce';

  return (
    <div className={cx(styles.page, 'm-auto grid w-full max-w-6xl gap-8 p-8')}>
      <header className={styles.header}>
        <div className={`${skeleton} h-4 w-1/2`} />
        <div className={`${skeleton} mt-2 h-4 w-3/4`} />
      </header>

      <Section className={styles.contact} name="Contact">
        <div className="grid grid-cols-2 gap-4 pt-3 md:grid-cols-3">
          {new Array(6).fill(null).map((_, i) => (
            <div className="flex items-center" key={i}>
              <div className={`rounded-full ${skeleton} h-8 w-8`} />
              <div className={`ml-2 inline-block ${skeleton} h-4 w-1/2`} />
            </div>
          ))}
        </div>
      </Section>

      <section className={styles.skills}>
        {new Array(3).fill(null).map((_, i) => (
          <div className="mb-8" key={i}>
            <div className={`${skeleton} h-4 w-2/5`} />
            <hr className="mt-2" />
            <div className="grid grid-cols-2  gap-x-4 gap-y-2 pt-2 lg:grid-cols-3">
              {new Array(5).fill(null).map((__, j) => (
                <div className={`${skeleton} h-4 w-3/5`} key={j} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <Section className={cx(styles.languages, 'relative')} name="Languages">
        <div className="flex justify-between">
          {new Array(3).fill(null).map((_, i) => (
            <div className={cx(styles.language, 'mt-2 w-full')} key={i}>
              <div className={`${skeleton} h-3 w-1/3`} />
              <div className={`${skeleton} mt-3 h-2 w-1/5`} />
            </div>
          ))}
        </div>
      </Section>

      <div>
        <h5>Experience</h5>
        <hr className="my-2" />
        <div className="flex flex-col gap-6">
          {new Array(5).fill({}).map((_, i) => (
            <div className={styles.work} key={i}>
              <div className="flex justify-between">
                <div className={`${skeleton} mt-2 h-4 w-1/3`} />
                <div className={`${skeleton} ml-auto mt-3 h-4 w-1/4`} />
              </div>
              <div className={`${skeleton} mt-2 h-4 w-2/5`} />
              <div className={`${skeleton} mt-2 h-4 w-full`} />
              <div className={`${skeleton} mt-2 h-4 w-full`} />
              <div className={`${skeleton} mt-2 h-4 w-3/4`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
