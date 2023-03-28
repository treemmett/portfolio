import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { ChangeEvent, FC, FormEventHandler, useCallback } from 'react';
import { Modal } from './Modal';
import styles from './Settings.module.scss';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { useSite } from '@lib/site';

export const getStaticProps: GetStaticProps = async () => ({
  props: {
    fallback: {},
  },
});

export const Settings: FC = () => {
  const { t } = useTranslation();
  const { isLoading, setSite, site, save } = useSite();
  const { query, push } = useRouter();

  const closeModal = useCallback(() => {
    const q = { ...query };
    delete q.settings;
    push({ query: q }, undefined, { scroll: false, shallow: true });
  }, [push, query]);

  const onSubmit: FormEventHandler = useCallback(
    async (e) => {
      e.preventDefault();
      await save();
      closeModal();
    },
    [closeModal, save]
  );

  return (
    <Modal onClose={closeModal} open={query.settings === 'true'}>
      {!isLoading && site ? (
        <form className={styles.form} onSubmit={onSubmit}>
          <h2>Site Information</h2>
          <Input
            label={t('Name')}
            onChange={(e) => setSite({ ...site, name: e.currentTarget.value })}
            value={site.name || ''}
          />
          <Input
            label={t('Title')}
            onChange={(e) => setSite({ ...site, title: e.currentTarget.value })}
            value={site.title || ''}
          />
          <Input
            label={t('Description')}
            onChange={(e) => setSite({ ...site, description: e.currentTarget.value })}
            type="textarea"
            value={site.description || ''}
          />
          <Input
            file={site.logoFile || site.logo}
            label="Logo"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSite({ ...site, logoFile: e.target.files?.[0] })
            }
            type="file"
          />
          <h2>Social Media</h2>
          <Input
            label="Twitter"
            onChange={(e) => setSite({ ...site, twitter: e.currentTarget.value })}
            value={site.twitter || ''}
          />
          <Input
            label="Instagram"
            onChange={(e) => setSite({ ...site, instagram: e.currentTarget.value })}
            value={site.instagram || ''}
          />
          <Input
            label="LinkedIn"
            onChange={(e) => setSite({ ...site, linkedIn: e.currentTarget.value })}
            value={site.linkedIn || ''}
          />
          <Input
            label="Facebook"
            onChange={(e) => setSite({ ...site, facebook: e.currentTarget.value })}
            value={site.facebook || ''}
          />
          <Input
            label="GitHub"
            onChange={(e) => setSite({ ...site, github: e.currentTarget.value })}
            value={site.github || ''}
          />
          <Input
            label="IMDb"
            onChange={(e) => setSite({ ...site, imdb: e.currentTarget.value })}
            value={site.imdb || ''}
          />
          <Button type="success" submit>
            {t('Save')}
          </Button>
        </form>
      ) : (
        'Loading...'
      )}
    </Modal>
  );
};
