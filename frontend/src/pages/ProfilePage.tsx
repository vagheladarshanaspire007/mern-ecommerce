import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { BadgeCheck, CalendarDays, Mail, Shield, UserRound } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/store';
import { updateCurrentUser } from '@/store/slices/authSlice';
import type { User } from '@/types/auth.types';

type ProfileFormValues = {
  firstName: string;
  lastName: string;
};

const roleLabelMap = {
  admin: 'Admin',
  manager: 'Manager',
  user: 'Customer',
} as const;

const dummyUser: User = {
  id: 'demo-user',
  firstName: 'Evening',
  lastName: 'Rose',
  email: 'demo.user@example.com',
  role: 'user',
  emailVerified: true,
  createdAt: '2025-01-15T00:00:00.000Z',
  updatedAt: '2025-01-15T00:00:00.000Z',
};

const formatMemberSince = (dateString?: string) => {
  if (!dateString) return 'Recently joined';

  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) return 'Recently joined';

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
};

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [demoUser, setDemoUser] = useState(dummyUser);
  const [saveMessage, setSaveMessage] = useState('');
  const activeUser = user ?? demoUser;
  useEffect(() => {
    document.title = 'Profile | MERN E-Commerce';
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      firstName: activeUser.firstName,
      lastName: activeUser.lastName,
    },
  });

  useEffect(() => {
    reset({
      firstName: activeUser.firstName,
      lastName: activeUser.lastName,
    });
  }, [activeUser.firstName, activeUser.lastName, reset]);

  const onSubmit = async (values: ProfileFormValues) => {
    const trimmedValues = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
    };

    if (user) {
      dispatch(updateCurrentUser(trimmedValues));
      setSaveMessage('Profile details updated locally.');
      return;
    }

    setDemoUser((currentUser) => ({
      ...currentUser,
      ...trimmedValues,
      updatedAt: new Date().toISOString(),
    }));
    setSaveMessage('Demo profile updated locally.');
  };

  const fullName = `${activeUser.firstName} ${activeUser.lastName}`.trim();
  const memberSince = formatMemberSince(activeUser.createdAt);
  const roleLabel = roleLabelMap[activeUser.role] ?? 'Customer';

  return (
    <div className="mx-auto max-w-full space-y-8 px-4 py-6 bg-gray-900 min-h-screen">
      <section className="rounded-3xl border border-gray-700 bg-gray-800 p-8 shadow-lg">
        <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
          Account profile
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Manage your details
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-gray-300">
          Review your membership details and keep your personal information up to date.
        </p>
        {!user && (
          <p className="mt-4 inline-flex rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-300">
            Showing demo profile because no user is logged in.
          </p>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_1.35fr]">
        <article className="rounded-3xl border border-gray-700 bg-gray-800 p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-indigo-500/10 p-4 text-indigo-400">
              <UserRound className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">{fullName}</h2>
              <p className="mt-1 text-sm text-gray-400">{activeUser.email}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-gray-100">
              <Shield className="h-4 w-4" aria-hidden="true" />
              {roleLabel}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-300">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              {activeUser.emailVerified ? 'Verified account' : 'Email not verified'}
            </span>
          </div>

          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-gray-700 bg-gray-700/40 p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-indigo-400" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-gray-300">Email address</p>
                  <p className="mt-1 text-sm text-white">{activeUser.email}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-700 bg-gray-700/40 p-4">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-indigo-400" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-gray-300">Member since</p>
                  <p className="mt-1 text-sm text-white">{memberSince}</p>
                </div>
              </div>
            </div>
          </div>
        </article>

        <section className="rounded-3xl border border-gray-700 bg-gray-800 p-6 shadow-md">
          <div>
            <h2 className="text-2xl font-semibold text-white">Edit profile</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Update your name below. Your email stays read-only for account security.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-200">First name</span>
                <input
                  type="text"
                  autoComplete="given-name"
                  className="w-full rounded-2xl border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                  placeholder="Enter first name"
                  {...register('firstName', {
                    required: 'First name is required.',
                    minLength: {
                      value: 2,
                      message: 'First name must be at least 2 characters.',
                    },
                  })}
                />
                {errors.firstName ? (
                  <p className="mt-2 text-sm text-red-300">{errors.firstName.message}</p>
                ) : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-200">Last name</span>
                <input
                  type="text"
                  autoComplete="family-name"
                  className="w-full rounded-2xl border border-gray-600 bg-gray-900 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                  placeholder="Enter last name"
                  {...register('lastName', {
                    required: 'Last name is required.',
                    minLength: {
                      value: 2,
                      message: 'Last name must be at least 2 characters.',
                    },
                  })}
                />
                {errors.lastName ? (
                  <p className="mt-2 text-sm text-red-300">{errors.lastName.message}</p>
                ) : null}
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-200">Email</span>
              <input
                type="email"
                readOnly
                value={activeUser.email}
                className="w-full cursor-not-allowed rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-gray-300 outline-none"
              />
            </label>

            <div className="flex flex-col gap-3 border-t border-gray-700 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-h-6 text-sm text-gray-300">
                {saveMessage || 'Changes update locally until the API is connected.'}
              </div>

              <button
                type="submit"
                disabled={!isDirty || isSubmitting}
                className="inline-flex items-center justify-center rounded-2xl border border-indigo-500 bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:cursor-not-allowed disabled:border-gray-600 disabled:bg-gray-700 disabled:text-gray-400"
              >
                {isSubmitting ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </section>
      </section>
    </div>
  );
};

export default ProfilePage;
