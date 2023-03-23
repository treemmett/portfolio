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
        <h2>Site Information</h2>
        <Input
          label={t('Name')}
          onChange={(e) => setSite({ ...site, name: e.currentTarget.value })}
          value={site.name}
        />
        <Input
          label={t('Title')}
          onChange={(e) => setSite({ ...site, title: e.currentTarget.value })}
          value={site.title}
        />
        <Input
          label={t('Description')}
          onChange={(e) => setSite({ ...site, description: e.currentTarget.value })}
          type="textarea"
          value={site.description}
        />
        <h2>Social Media</h2>
        <Input
          label={t('Twitter')}
          onChange={(e) => setSite({ ...site, twitter: e.currentTarget.value })}
          value={site.twitter}
        />
        <Input
          label={t('Instagram')}
          onChange={(e) => setSite({ ...site, instagram: e.currentTarget.value })}
          value={site.instagram}
        />
        <Input
          label={t('LinkedIn')}
          onChange={(e) => setSite({ ...site, linkedIn: e.currentTarget.value })}
          value={site.linkedIn}
        />
        <Input
          label={t('Facebook')}
          onChange={(e) => setSite({ ...site, facebook: e.currentTarget.value })}
          value={site.facebook}
        />
        <Input
          label={t('GitHub')}
          onChange={(e) => setSite({ ...site, github: e.currentTarget.value })}
          value={site.github}
        />
        <Input
          label={t('IMDb')}
          onChange={(e) => setSite({ ...site, imdb: e.currentTarget.value })}
          value={site.imdb}
        />
        <Button submit>{t('Save')}</Button>
      </form>
    </div>
  );
};

export default Settings;
