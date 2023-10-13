'use client';

import { useForm } from '@mantine/form';
import { Site } from '@prisma/client';
import classNames from 'classnames';
import { ChangeEvent, FC, useState } from 'react';
import { RefreshCw } from 'react-feather';
import styles from './Settings.module.scss';
import { WatermarkPosition } from '@app/(settings)/WatermarkPosition';
import { revalidateResume, updateSettings } from '@app/(settings)/actions';
import { Input } from '@app/Input';
import { Button } from '@components/Button';
import { formatBytes } from '@utils/bytes';
import { useTranslation } from '@utils/translation';

export const SettingsForm: FC<{ count: number | null; site: Site; size: number | null }> = ({
  count,
  size,
  site,
}) => {
  const { t } = useTranslation();
  const [isSaving, setSaving] = useState(false);

  const form = useForm({
    initialValues: {
      description: site.description || '',
      facebook: site.facebook || '',
      github: site.github || '',
      imdb: site.imdb || '',
      instagram: site.instagram || '',
      linkedIn: site.linkedIn || '',
      name: site.name || '',
      resumeUrl: site.resumeUrl || '',
      title: site.title || '',
      twitter: site.twitter || '',
      watermarkPosition: site.watermarkPosition,
    },
  });

  return (
    <>
      <nav className={styles.nav}>
        <a href="#site-information">Site Information</a>
        <a href="#social-media">Social Media</a>
        <a href="#account-information">Account Information</a>
      </nav>

      <form
        className={styles.form}
        onSubmit={form.onSubmit(async (values) => {
          try {
            setSaving(true);
            await updateSettings(values);
          } finally {
            setSaving(false);
          }
        })}
      >
        <section id="site-information">
          <h2>Site Information</h2>
          <Input label={t('Name')} {...form.getInputProps('name')} />
          <Input label={t('Title')} {...form.getInputProps('title')} />
          <Input label={t('Description')} type="textarea" {...form.getInputProps('description')} />
          <Input label={t('Resume URL')} {...form.getInputProps('resumeUrl')} />
          <button
            className="button flex items-center justify-center"
            onClick={() => revalidateResume()}
            title={t('Revalidate cache if upstream source has changed.')}
            type="button"
          >
            {t('Update resume cache')} <RefreshCw className="ml-2" size="1rem" />
          </button>
          {/* TODO this is broken */}
          <Input label={t('Logo - BROKEN')} type="file" disabled />
          <Input
            checked={typeof site.watermarkPosition === 'number'}
            label={t('Post watermark')}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              form.setValues({
                watermarkPosition: e.currentTarget.checked ? WatermarkPosition.BOTTOM_RIGHT : null,
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
              onChange={() => form.setValues({ watermarkPosition: WatermarkPosition.TOP_LEFT })}
              type="checkbox"
            />
            <Input
              checked={site.watermarkPosition === WatermarkPosition.TOP_RIGHT}
              className={classNames(styles.checkbox, styles.tr)}
              disabled={typeof site.watermarkPosition !== 'number'}
              label={t('Top Right')}
              onChange={() => form.setValues({ watermarkPosition: WatermarkPosition.TOP_RIGHT })}
              type="checkbox"
            />
            <Input
              checked={site.watermarkPosition === WatermarkPosition.BOTTOM_LEFT}
              className={classNames(styles.checkbox, styles.bl)}
              disabled={typeof site.watermarkPosition !== 'number'}
              label={t('Bottom Left')}
              onChange={() => form.setValues({ watermarkPosition: WatermarkPosition.BOTTOM_LEFT })}
              type="checkbox"
            />
            <Input
              checked={site.watermarkPosition === WatermarkPosition.BOTTOM_RIGHT}
              className={classNames(styles.checkbox, styles.br)}
              disabled={typeof site.watermarkPosition !== 'number'}
              label={t('Bottom Right')}
              onChange={() => form.setValues({ watermarkPosition: WatermarkPosition.BOTTOM_RIGHT })}
              type="checkbox"
            />
          </div>
        </section>
        <section id="social-media">
          <h2>{t('Social Media')}</h2>
          <Input label="Twitter" {...form.getInputProps('twitter')} />
          <Input label="Instagram" {...form.getInputProps('instagram')} />
          <Input label="LinkedIn" {...form.getInputProps('linkedIn')} />
          <Input label="Facebook" {...form.getInputProps('facebook')} />
          <Input label="GitHub" {...form.getInputProps('github')} />
          <Input label="IMDb" {...form.getInputProps('imdb')} />
        </section>
        <section id="account-information">
          <h2>{t('Account Information')}</h2>
          {typeof size === 'number' && (
            <div>
              {t('Total Photos')}: {count}
            </div>
          )}
          {typeof size === 'number' && (
            <div>
              {t('Size')}: {formatBytes(size)}
            </div>
          )}
        </section>

        <Button disabled={isSaving} type="success" submit>
          {isSaving ? `${t('Saving')}...` : t('Save')}
        </Button>
      </form>
    </>
  );
};
