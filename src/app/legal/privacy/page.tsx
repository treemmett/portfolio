'use client';

import classNames from 'classnames';
import Content from './privacy-policy.mdx';
import styles from './style.module.scss';

export default function PrivacyPolicy() {
  return (
    <div className={classNames(styles.markdown, 'container mx-auto flex flex-col gap-4 p-12')}>
      <Content />
    </div>
  );
}
