module.exports = {
  locales: ['ru', 'en', 'uz'],
  defaultLocale: 'uz',
  loadLocaleFrom: (lang, ns) =>
    import(`locales/${lang}/${ns}.json`).then((m) => m.default),
  pages: {
    '*': ['common'],
    '/about': ['about'],
    '/branches': ['branches'],
    '/branches/[id]': ['branches'],
    '/cart': ['order'],
    '/checkout': ['order'],
    '/myorders': ['order'],
    '/myorders/[id]': ['order'],
    '/myorders/[id]/status': ['order'],

  },
  localeDetection: false,
}
