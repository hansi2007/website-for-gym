export const GYM_WHATSAPP_NUMBER = '919945457747';
export const GYM_PHONE_DISPLAY = '+91 99454 57747';
export const GYM_PHONE_TEL = '+919945457747';
export const GOOGLE_MAPS_LINK = 'https://maps.app.goo.gl/c2u15pLQEHF3tXzv5';

export type WhatsAppTopic = 'general' | 'trial' | 'pricing' | 'hours' | 'membership' | 'join';

export const WHATSAPP_MESSAGES: Record<WhatsAppTopic, string> = {
  general: 'Hello Sri Maruthi Power House Gym 24/7, I would like to know more about your membership plans and trial sessions.',
  trial: 'Hello Sri Maruthi Power House Gym 24/7, I would like to book a trial workout session at your gym in Jigani.',
  pricing: 'Hello Sri Maruthi Power House Gym 24/7, please share your current membership packages and pricing options.',
  hours: 'Hello Sri Maruthi Power House Gym 24/7, could you please confirm your current gym opening and coaching hours?',
  membership: 'Hello Sri Maruthi Power House Gym 24/7, I am applying for gym membership and would like to finalize my enrollment.',
  join: 'Hello Sri Maruthi Power House Gym 24/7, I am submitting my membership application and have a few questions.',
};

export function getWhatsAppUrl(topic: WhatsAppTopic = 'general', customMessage?: string): string {
  const message = customMessage || WHATSAPP_MESSAGES[topic];
  return `https://wa.me/${GYM_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
