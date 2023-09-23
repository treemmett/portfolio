'use client';

import { useEffect, useState, useRef } from 'react';
import { login } from './actions';
import { Spinner } from '@components/Spinner';
import { useTranslation } from '@utils/translation';

export default function LoginPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const { t } = useTranslation();
  const [state, setState] = useState<'pending' | 'success' | Error>('pending');
  const executed = useRef(false);

  useEffect(() => {
    if (executed.current) return;
    executed.current = true;

    login(searchParams?.code, searchParams?.state)
      .then((success) => {
        if (success) {
          setState('success');
        }
      })
      .catch((e) => {
        setState(e);
      });
  }, [searchParams?.code, searchParams?.state]);

  if (state instanceof Error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 font-bold">{t('Error')}</div>
        <div>{state.message}</div>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="text-center py-8">
        <div>{t('Successfully logged in.')}</div>
        <div className="text-xs">{t('You may now close this window.')}</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-8">
      <Spinner />
      <span className="ml-2">{t('Logging in...')}</span>
    </div>
  );
}
