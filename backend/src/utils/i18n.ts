import authEn from '../locales/en/auth.json';

type Locale = 'en';

const resources = {
  en: {
    auth: authEn,
  },
} as const;

type MessageKey = keyof typeof authEn;

export const t = (key: `auth.${MessageKey}`, locale: Locale = 'en'): string => {
  const [namespace, messageKey] = key.split('.') as ['auth', MessageKey];
  return resources[locale][namespace][messageKey] ?? key;
};
