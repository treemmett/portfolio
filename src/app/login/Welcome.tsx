import { FC } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import styles from './Welcome.module.scss';
import { AuthorizationScopes } from '@app/scopes';
import { useUser } from '@lib/user';
import { useTranslation } from '@utils/translation';

export const Welcome: FC = () => {
  const { t } = useTranslation();
  const { hasPermission, user } = useUser();

  if (!user) return null;

  return (
    <Modal canClose={false} open={hasPermission(AuthorizationScopes.onboard)}>
      <form className={styles.welcome}>
        <h1>{t('Welcome!')}</h1>
        <Input label={t('Please enter a username')} />
        <Button type="success" submit>
          {t('Create account')}
        </Button>
      </form>
    </Modal>
  );
};
