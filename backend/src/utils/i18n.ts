import authEn from '../locales/en/auth.json';
import orderEn from '../locales/en/orders.json';

type Locale = 'en';

const resources = {
  en: {
    auth: authEn,
    orders: orderEn,
  },
} as const;

type AuthMessageKey = keyof typeof authEn;
type OrderMessageKey = keyof typeof orderEn;

type MessageKey = `auth.${AuthMessageKey}` | `orders.${OrderMessageKey}`;

export const t = (key: MessageKey, locale: Locale = 'en'): string => {
  const [namespace, messageKey] = key.split('.') as ['auth' | 'orders', string];
  return (resources[locale][namespace] as Record<string, string>)[messageKey] ?? key;
};
