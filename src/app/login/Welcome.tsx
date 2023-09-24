import { ChangeEvent, FC, FormEventHandler, useCallback, useMemo, useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import styles from './Welcome.module.scss';
import { AuthorizationScopes } from '@entities/Jwt';
import { useUser, usernameAvailable } from '@lib/user';
import { debounce } from '@utils/debounce';
import { useTranslation } from '@utils/translation';

export const Welcome: FC = () => {
  const { t } = useTranslation();
  const { hasPermission, isSaving, save, setUser, user } = useUser();
  const [nameAvailable, setNameAvailable] = useState<boolean>();

  const submitHandler: FormEventHandler = useCallback(
    (e) => {
      e.preventDefault();
      save();
    },
    [save],
  );

  const debouncedCheckUsername = useMemo(
    () =>
      debounce(async (username: string) => {
        if (!username) return;

        const available = await usernameAvailable(username);
        setNameAvailable(available);
      }, 1000),
    [],
  );

  const update = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!user) return;

      setUser({ ...user, username: e.currentTarget.value });
      setNameAvailable(undefined);
      debouncedCheckUsername(e.currentTarget.value);
    },
    [debouncedCheckUsername, setUser, user],
  );

  if (!user) return null;

  let helperText = '';
  if (nameAvailable === true) {
    helperText = t('That name is available!');
  } else if (nameAvailable === false) {
    helperText = t('That name is taken');
  }

  return (
    <Modal canClose={false} open={hasPermission(AuthorizationScopes.onboard)}>
      <form className={styles.welcome} onSubmit={submitHandler}>
        <h1>{t('Welcome!')}</h1>
        <Input
          helperText={helperText}
          label={t('Please enter a username')}
          onChange={update}
          value={user.username}
        />
        <Button disabled={isSaving || nameAvailable === false} type="success" submit>
          {isSaving ? `${t('Setting up account')}...` : t('Create account')}
        </Button>
      </form>
    </Modal>
  );
};
