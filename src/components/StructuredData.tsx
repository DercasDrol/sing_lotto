"use client";

import Script from "next/script";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Sing Loto",
  "alternateName": ["Пой Лото", "Music Bingo Generator", "Музыкальное Лото"],
  "description": "Бесплатный генератор билетов для музыкального лото и караоке-бинго. Создайте билеты для вечеринки за секунды!",
  "url": "https://sing-lotto.fan-side-of-mars.ovh",
  "applicationCategory": "GameApplication",
  "operatingSystem": "All",
  "browserRequirements": "Requires JavaScript. Requires HTML5.",
  "softwareVersion": "1.0.0",
  "author": {
    "@type": "Person",
    "name": "DercasDrol",
    "url": "https://github.com/DercasDrol"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "featureList": [
    "Generate music bingo tickets",
    "PDF export",
    "Support for up to 90 tracks",
    "Russian Lotto style 3x9 grid",
    "Bilingual interface (Russian/English)",
    "PWA support - works offline"
  ],
  "screenshot": "https://sing-lotto.fan-side-of-mars.ovh/og-image.png",
  "image": "https://sing-lotto.fan-side-of-mars.ovh/icons/icon-512x512.png",
  "inLanguage": ["ru", "en"],
  "isAccessibleForFree": true,
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5",
    "ratingCount": "1",
    "bestRating": "5",
    "worstRating": "1"
  }
};

// Additional Organization schema
const organizationData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Sing Loto",
  "url": "https://sing-lotto.fan-side-of-mars.ovh",
  "logo": "https://sing-lotto.fan-side-of-mars.ovh/icons/icon-512x512.png",
  "sameAs": [
    "https://github.com/DercasDrol/sing_lotto"
  ]
};

// FAQ Schema for better SEO
const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Что такое музыкальное лото?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Музыкальное лото (Sing Loto) - это игра по типу русского лото, где вместо чисел используются названия песен. Ведущий включает треки, а игроки отмечают их на своих билетах."
      }
    },
    {
      "@type": "Question",
      "name": "Как создать билеты для музыкального лото?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Введите список треков (до 90 штук), выберите количество билетов и нажмите 'Сгенерировать'. Билеты можно экспортировать в PDF для печати."
      }
    },
    {
      "@type": "Question",
      "name": "Сколько стоит использование Sing Loto?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sing Loto абсолютно бесплатен. Нет регистрации, нет подписок, нет скрытых платежей."
      }
    },
    {
      "@type": "Question",
      "name": "What is music bingo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Music bingo is a game similar to traditional bingo, but instead of numbers, players mark off song titles on their cards when they hear the songs played."
      }
    }
  ]
};

export function StructuredData() {
  return (
    <>
      <Script
        id="structured-data-webapp"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Script
        id="structured-data-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <Script
        id="structured-data-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
    </>
  );
}
