import cx from 'classnames';
import { NextPage } from 'next';
import { ChangeEventHandler, FormEventHandler, useCallback, useState } from 'react';
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

  const uploadPost: FormEventHandler<HTMLFormElement> = useCallback(async (e) => {
    try {
      e.preventDefault();
      const form = e.target as HTMLFormElement;

      const response = await fetch('/api/post', {
        body: new FormData(form),
        method: 'post',
      });

      if (response.status === 200 || response.status === 201) {
        alert('Upload successful');
        form.reset();
        setImageData('');
        return;
      }

      const data = await response.json();

      if (data.error) {
        console.error(data.error);
      }

      alert(['Upload failed', data.message].join(' - '));
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  }, []);

  return (
    <form className={styles.container} onSubmit={uploadPost}>
      <label className={cx(styles.picker, { [styles.selected]: imageData })} htmlFor="image">
        {imageData ? (
          <img alt="selection preview" className={styles.preview} src={imageData} />
        ) : (
          <div>Pick an image</div>
        )}
        <input accept="image/*" id="image" name="file" onChange={handleFileChange} type="file" />
      </label>
      <Input className={styles.input} label="Title" />
      <Button className={styles.input} type="submit">
        Post
      </Button>
    </form>
  );
};

export default Admin;
