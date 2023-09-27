'use client';

import classNames from 'classnames';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FC, FormEventHandler, useCallback } from 'react';
import styles from './Settings.module.scss';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { WatermarkPosition } from '@entities/WatermarkPosition';
import { usePhotoStats } from '@lib/photoStats';
import { useSite } from '@lib/site';
import { formatBytes } from '@utils/bytes';
import { useTranslation } from '@utils/translation';

export const SettingsForm: FC = () => {
  const { t } = useTranslation();
  const { isLoading, isSaving, setSite, site, save } = useSite();
  const { count, size } = usePhotoStats();
  const { push } = useRouter();

  const onSubmit: FormEventHandler = useCallback(
    async (e) => {
      e.preventDefault();
      await save();
      push('/');
    },
    [push, save],
  );

  return (
    <>
      <nav className={styles.nav}>
        <a href="#site-information">Site Information</a>
        <a href="#social-media">Social Media</a>
        <a href="#account-information">Account Information</a>
      </nav>

      {!isLoading && site ? (
        <div className={styles.form}>
          <form onSubmit={onSubmit}>
            <section id="site-information">
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
                label={t('Logo')}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSite({ ...site, logoFile: e.target.files?.[0] })
                }
                type="file"
              />
              <Input
                checked={typeof site.watermarkPosition === 'number'}
                label={t('Post watermark')}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setSite({
                    ...site,
                    watermarkPosition: e.currentTarget.checked
                      ? WatermarkPosition.BOTTOM_RIGHT
                      : null,
                  });
                }}
                type="checkbox"
              />
              <span>{t('Watermark position')}</span>
              <div
                className={classNames(styles.quadrants, {
                  [styles.disabled]: typeof site.watermarkPosition !== 'number',
                })}
              >
                <Input
                  checked={site.watermarkPosition === WatermarkPosition.TOP_LEFT}
                  className={classNames(styles.checkbox, styles.tl)}
                  disabled={typeof site.watermarkPosition !== 'number'}
                  label={t('Top Left')}
                  onChange={() =>
                    setSite({ ...site, watermarkPosition: WatermarkPosition.TOP_LEFT })
                  }
                  type="checkbox"
                />
                <Input
                  checked={site.watermarkPosition === WatermarkPosition.TOP_RIGHT}
                  className={classNames(styles.checkbox, styles.tr)}
                  disabled={typeof site.watermarkPosition !== 'number'}
                  label={t('Top Right')}
                  onChange={() =>
                    setSite({ ...site, watermarkPosition: WatermarkPosition.TOP_RIGHT })
                  }
                  type="checkbox"
                />
                <Input
                  checked={site.watermarkPosition === WatermarkPosition.BOTTOM_LEFT}
                  className={classNames(styles.checkbox, styles.bl)}
                  disabled={typeof site.watermarkPosition !== 'number'}
                  label={t('Bottom Left')}
                  onChange={() =>
                    setSite({ ...site, watermarkPosition: WatermarkPosition.BOTTOM_LEFT })
                  }
                  type="checkbox"
                />
                <Input
                  checked={site.watermarkPosition === WatermarkPosition.BOTTOM_RIGHT}
                  className={classNames(styles.checkbox, styles.br)}
                  disabled={typeof site.watermarkPosition !== 'number'}
                  label={t('Bottom Right')}
                  onChange={() =>
                    setSite({ ...site, watermarkPosition: WatermarkPosition.BOTTOM_RIGHT })
                  }
                  type="checkbox"
                />
              </div>
            </section>
            <section id="social-media">
              <h2>{t('Social Media')}</h2>
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
            </section>
            <section id="account-information">
              <h2>{t('Account Information')}</h2>
              <div>
                {t('Total Photos')}: {count}
              </div>
              <div>
                {t('Size')}: {formatBytes(size)}
              </div>
            </section>

            <Button disabled={isSaving} type="success" submit>
              {isSaving ? `${t('Saving')}...` : t('Save')}
            </Button>
          </form>
        </div>
      ) : (
        'Loading...'
      )}
    </>
  );
};
