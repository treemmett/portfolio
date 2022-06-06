import cx from 'classnames';
import { NextPage } from 'next';
import { ChangeEventHandler, FormEventHandler, useCallback, useState } from 'react';
import { Button } from '../components/Button';
import { useDataStore } from '../components/DataStore';
import { Input } from '../components/Input';
import styles from './admin.module.scss';

enum UploadState {
  default,
  uploading,
}

const Admin: NextPage = () => {
  const { apiClient } = useDataStore();
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

  const [state, setState] = useState(UploadState.default);
  const uploadPost: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      try {
        // don't duplicate requests
        if (state === UploadState.uploading) return;

        setState(UploadState.uploading);
        e.preventDefault();
        const form = e.target as HTMLFormElement;

        await apiClient.post('/api/post', new FormData(form));

        alert('Upload successful');
        form.reset();
        setImageData('');
      } catch (err) {
        console.error(err?.response?.data?.error || err);
        alert(['Upload failed', err?.response?.data?.message].join(' - '));
      } finally {
        setState(UploadState.default);
      }
    },
    [apiClient, state]
  );

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
      <Button
        className={styles.input}
        disabled={state === UploadState.uploading}
        type="primary"
        submit
      >
        {state === UploadState.uploading ? 'Uploading...' : 'Post'}
      </Button>
    </form>
  );
};

export default Admin;
