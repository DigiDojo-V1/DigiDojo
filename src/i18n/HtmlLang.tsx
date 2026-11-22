"use client";

import { useEffect } from "react";
import { useLocale } from "./hooks";
import { HTML_LANG } from "./locale";

/** Keeps `<html lang>` in step with the player's language. Renders nothing. */
export function HtmlLang() {
  const locale = useLocale();
  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale];
  }, [locale]);
  return null;
}
