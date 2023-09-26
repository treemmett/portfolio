import cx from 'classnames';
import styles from './Mosaic.module.scss';
import { Spinner } from '@components/Spinner';
import { toPx } from '@utils/pixels';

function randomClamp(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

export default async function Mosaic() {
  return (
    <div className={cx('p-4 gap-4', styles.mosaic)}>
      {new Array(25).fill(null).map((_, i) => (
        <div
          className="bg-red-400 max-w-full max-h-full mb-4 flex justify-center items-center"
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          style={{
            height: toPx(randomClamp(200, 400)),
          }}
        >
          <Spinner />
        </div>
      ))}
    </div>
  );
}
