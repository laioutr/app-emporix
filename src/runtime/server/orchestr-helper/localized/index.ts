import type { LocalizedObject } from "../../client/types/localized";

export const resolveLocalized = (obj: LocalizedObject, locale: string) => {
  const lang = locale.split("-")[0];

  if (!lang) console.warn(`Invalid locale ${locale} passed`);

  return obj[lang] ?? obj[Object.keys(obj)[0]];
};
