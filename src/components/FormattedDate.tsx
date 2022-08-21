import { useTranslation } from 'next-i18next';
import { DetailedHTMLProps, FC, HTMLAttributes, useMemo } from 'react';

export interface DateProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
  date: string | Date;
}

export const FormattedDate: FC<DateProps> = ({ date, ...props }) => {
  const { t } = useTranslation();

  const months = useMemo(
    () => [
      t('January'),
      t('February'),
      t('March'),
      t('April'),
      t('May'),
      t('June'),
      t('July'),
      t('August'),
      t('September'),
      t('October'),
      t('November'),
      t('December'),
    ],
    [t]
  );

  const d = useMemo(() => {
    const dateObj = new Date(date);
    if (Number.isNaN(dateObj.getTime())) {
      throw new Error('Invalid date');
    }
    return dateObj;
  }, [date]);

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <span {...props}>
      {d.getDate()} {months[d.getMonth()]}, {d.getFullYear()}
    </span>
  );
};
