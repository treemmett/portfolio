import cx from 'classnames';
import { NextPage } from 'next';
import { ChangeEventHandler, useCallback, useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import styles from './admin.module.scss';

const Admin: NextPage = () => {
  const [imageData, setImageData] = useState('');
  const handleFileChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    const file = e.currentTarget.files[0];
    if (!file) {
      setImageData('');
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageData(reader.result.toString());
    });
    reader.readAsDataURL(file);
  }, []);

  return (
    <div className={styles.container}>
      <label className={cx(styles.picker, { [styles.selected]: imageData })} htmlFor="image">
        {imageData ? (
          <img alt="selection preview" className={styles.preview} src={imageData} />
        ) : (
          <div>Pick an image</div>
        )}
        <input accept="image/*" id="image" onChange={handleFileChange} type="file" />
      </label>
      <Input className={styles.input} label="Title" />
      <Button className={styles.input}>Post</Button>
    </div>
  );
};

export default Admin;
