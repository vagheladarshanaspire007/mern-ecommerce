import { useAppSelector } from '@/store';
import { useForm } from 'react-hook-form';


interface ProfileFormData {
  firstName: string;
  lastName: string;
}

const ProfilePage = () => {
  const user = useAppSelector((state) => state.auth.user);

  const { register, handleSubmit } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    void data;
  };

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Unable to load profile.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-gray-500">
          View and update your profile information.
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">
          Account Information
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="mt-1 font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="mt-1 font-medium text-gray-900">{user.email}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Role</p>
            <span className="mt-1 inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
              {user.role}
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="mt-1 font-medium text-gray-900">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-lg border bg-white p-6 shadow-sm"
      >
        <h2 className="text-xl font-semibold text-gray-900">
          Edit Profile
        </h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="firstName"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              {...register('firstName')}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2"
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              {...register('lastName')}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={user.email}
              readOnly
              className="w-full rounded-lg border bg-gray-100 px-3 py-2 text-gray-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="rounded-lg px-5 py-2.5 font-medium text-white hover:opacity-90"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;