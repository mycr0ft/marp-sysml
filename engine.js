const { createHighlighter } = require('shiki')
const rawSysmlGrammar = require('./sysml.tmLanguage.json')

// Shiki registers a grammar under its `name` field, not its scopeName —
// the downloaded grammar's name is "SysML" (capitalized), which won't
// match the lowercase "sysml" used in markdown fences. Normalize it and
// add an alias so both spellings resolve.
const sysmlGrammar = {
  ...rawSysmlGrammar,
  name: 'sysml',
  aliases: ['sysml-v2', 'SysML'],
}

// Built once and reused for every code block in the deck.
let highlighterPromise = null
function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark'],
      langs: [
        sysmlGrammar, // registers as "sysml" (scopeName: source.sysml)
        'javascript',
        'typescript',
        'python',
        'bash',
        'json',
        'yaml',
        'xml',
      ],
    })
  }
  return highlighterPromise
}

// marp-cli invokes this with an options object whose `marp` getter
// constructs a ready-to-use Marp instance (marp-core's Marp class,
// which already has .highlighter, .render(), etc).
module.exports = async ({ marp }) => {
  const highlighter = await getHighlighter()
  const loadedLangs = new Set(highlighter.getLoadedLanguages())

  // Override the default highlight.js-based highlighter with Shiki.
  // markdown-it's fence renderer uses this return value verbatim
  // whenever it starts with "<pre", which is exactly what
  // highlighter.codeToHtml() produces.
  marp.highlighter = (code, lang) => {
    const useLang = loadedLangs.has(lang) ? lang : 'text'
    return highlighter.codeToHtml(code, { lang: useLang, theme: 'github-dark' })
  }

  return marp
}
