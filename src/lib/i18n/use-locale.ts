"use client";

import { useMemo, useState } from "react";
import { messages, t, type Locale } from "@/lib/i18n/messages";

export function useLocale() {
  const [locale] = useState<Locale>("en");

  return useMemo(
    () => ({
      locale,
      messages: messages[locale],
      t: (section: keyof (typeof messages)["en"], key: string) => t(locale, section, key),
    }),
    [locale]
  );
}
