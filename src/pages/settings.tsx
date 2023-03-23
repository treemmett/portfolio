import { GetStaticProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { FormEventHandler, useCallback } from 'react';
import styles from './settings.module.scss';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { useSite } from '@lib/site';

export const getStaticProps: GetStaticProps = async () => ({
  props: {
    fallback: {},
  },
});

const Settings: NextPage = () => {
  const { t } = useTranslation();
  const { isLoading, setSite, site, save } = useSite();

  const onSubmit: FormEventHandler = useCallback(
    (e) => {
      e.preventDefault();
      save();
    },
    [save]
  );

  if (isLoading || !site) return <div>Loading...</div>;

  return (
    <div className={styles.settings}>
      <form className={styles.form} onSubmit={onSubmit}>
        <Input
          label={t('Name')}
          onChange={(e) => setSite({ ...site, name: e.currentTarget.value })}
          value={site.name}
        />
        <Button submit>{t('Save')}</Button>
      </form>
    </div>
  );
};

export default Settings;
