import { FC } from 'react';
import { Modal } from '../../components/Modal';
import styles from './Welcome.module.scss';
import { Input } from '@app/Input';
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
        <button className="button green" type="submit">
          {t('Create account')}
        </button>
      </form>
    </Modal>
  );
};
