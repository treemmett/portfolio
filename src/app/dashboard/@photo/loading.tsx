import { Spinner } from '@components/Spinner';

export default async function DashboardPhotoLoading() {
  return (
    <div className="p-12 flex justify-center align-center">
      <Spinner />
    </div>
  );
}
