'use client';

import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { Input } from '@components/Input';
import { TextArea } from '@components/TextArea';
import { useTranslation } from '@utils/translation';

export const ResumeForm: FC = () => {
  const { t } = useTranslation();
  const { push } = useRouter();

  const form = useForm({
    initialValues: {
      json: '',
      link: '',
    },
    validate: (values) => {
      if (!values.json && !values.link) {
        return {
          json: 'At least one is required.',
          link: 'At least one is required.',
        };
      }

      return {};
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        if (values.json) {
          push(`/resume/custom?json=${encodeURIComponent(values.json)}`);
        } else if (values.link) {
          push(`/resume/custom?link=${encodeURIComponent(values.link)}`);
        }
      })}
    >
      <TextArea
        inputClassName="block w-full text-xs min-h-[8rem]"
        label={t('Paste your resume.json below')}
        placeholder={JSON.stringify({ firstName: 'Bob' }, undefined, '  ')}
        {...form.getInputProps('json')}
      />

      <Input
        inputClassName="w-full text-sm"
        label={t('or paste a link')}
        placeholder="https://raw.github.com/..."
        {...form.getInputProps('link')}
      />

      <button className="green button mt-5 w-full">Generate</button>
    </form>
  );
};
