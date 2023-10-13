import cx from 'classnames';
import styles from './Mosaic.module.scss';
import { Nav } from '@app/navbar/Nav';
import { Spinner } from '@components/Spinner';
import { toPx } from '@utils/pixels';

function randomClamp(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

export default async function Mosaic() {
  return (
    <>
      <Nav />

      <div className={cx('gap-4 p-4', styles.mosaic)}>
        {new Array(25).fill(null).map((_, i) => (
          <div
            className="mb-4 flex max-h-full max-w-full items-center justify-center bg-red-400"
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
    </>
  );
}
