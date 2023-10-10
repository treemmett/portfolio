import { Spinner } from '@components/Spinner';

export default async function DashboardPhotoLoading() {
  return (
    <div className="align-center flex justify-center p-12">
      <Spinner />
    </div>
  );
}
