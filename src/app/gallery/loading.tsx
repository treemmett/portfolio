import styles from './Mosaic.module.scss';
import tile from './Tile.module.scss';

export default async function GalleryPageLoading() {
  return (
    <div className={styles.mosaic}>
      {new Array(12).fill(null).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i}>
          <div
            className={tile.tile}
            style={{ backgroundColor: 'red', height: `${Math.random() * 300 + 300}px` }}
          />
        </div>
      ))}
    </div>
  );
}
