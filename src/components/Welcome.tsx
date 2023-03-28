import { useTranslation } from 'next-i18next';
import { FC, FormEventHandler, useCallback } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import styles from './Welcome.module.scss';
import { AuthorizationScopes } from '@entities/Jwt';
import { useUser } from '@lib/user';

export const Welcome: FC = () => {
  const { t } = useTranslation();
  const { hasPermission, save, setUser, user } = useUser();

  const submitHandler: FormEventHandler = useCallback(
    (e) => {
      e.preventDefault();
      save();
    },
    [save]
  );

  if (!user) return null;

  return (
    <Modal canClose={false} open={hasPermission(AuthorizationScopes.onboard)}>
      <form className={styles.welcome} onSubmit={submitHandler}>
        <h1>{t('Welcome!')}</h1>
        <Input
          label={t('Please enter a username')}
          onChange={(e) => setUser({ ...user, username: e.currentTarget.value })}
          value={user.username}
        />
        <Button type="success" submit>
          {t('Create account')}
        </Button>
      </form>
    </Modal>
  );
};
