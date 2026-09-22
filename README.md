# SysML v2 highlighting for Marp

A small, reusable Marp slide-deck template that adds real **SysML v2** syntax
highlighting to code fences. Built on [Marp] + [Shiki] using a TextMate grammar
sourced from the [SysML v2 VS Code extension][grammar-src].

---

## What's in here

| File | Purpose |
| --- | --- |
| `slides.md` | The slide deck itself (Markdown + [Marp front-matter][marp-docs]). |
| `transformation.md` | *SysML v1 → v2: A clean-room transformation & utilization toolchain* — 20-slide INCOSE/OMG webinar deck over the [uml2py](https://github.com/mycr0ft/uml2py) + [sysmlpy](https://github.com/mycr0ft/sysmlpy) toolchain. Build with `npx marp transformation.md --engine ./engine.js --html -o transformation.html`. |
| `engine.js` | A custom Marp CLI engine that swaps Marp's default highlight.js for [Shiki][shiki] and registers the SysML v2 grammar. |
| `sysml.tmLanguage.json` | The TextMate grammar that defines SysML v2 tokenization. Pulled from [daltskin/VSCode_SysML_Extension][grammar-src] (MIT). |
| `package.json` | npm scripts and dependencies ([Marp CLI][marp-cli], [Marp Core][marp-core], [Shiki][shiki]). |

---

## Prerequisites (one-time setup)

1. **Install Node.js** (v18 or newer). Download it from <https://nodejs.org/> and
   run the installer for your platform, or use a version manager like
   [`nvm`](https://github.com/nvm-sh/nvm) / [`fnm`](https://github.com/Schniz/fnm).
   Verify it works:

   ```bash
   node --version   # should print v18.x or newer
   npm --version    # should print 9.x or 10.x
   ```

2. **(Optional) Install Chromium for PDF export.** The `pdf` script uses
   Marp CLI's built-in `--pdf` mode, which needs Chromium. On first run Marp
   will offer to download a bundled copy for you automatically, so you can
   usually skip this step. If you'd rather use a system Chromium, install it
   from your package manager and Marp will pick it up.

---

## Install dependencies

From the project folder (the one containing `package.json`), run:

```bash
npm install
```

This downloads Marp CLI, Marp Core, and Shiki into `node_modules/`. You only
need to re-run it when `package.json` changes (e.g. after a `git pull`).

---

## Build / preview commands

All commands are run from the project folder.

```bash
npm run build      # Render slides.md  ->  slides.html  (self-contained HTML)
npm run pdf        # Render slides.md  ->  slides.pdf   (needs Chromium; see above)
npm run watch      # Re-render slides.html whenever slides.md changes
npm run preview    # Start a local web server at http://localhost:8080 and live-preview
```

If you prefer calling Marp CLI directly:

```bash
npx marp slides.md --engine ./engine.js --html --no-stdin -o slides.html
```

Open the resulting `slides.html` in any browser, or open the preview server
URL printed by `npm run preview`.

---

## How it works

- `sysml.tmLanguage.json` is the TextMate grammar used by the
  [SysML v2 VS Code extension][grammar-src] for syntax highlighting.
- `engine.js` is a Marp CLI custom engine. It loads that grammar into
  [Shiki][shiki] (which natively consumes TextMate grammars — no VS Code
  needed), then overrides `marp.highlighter` so ```` ```sysml ```` code fences
  get real SysML v2 tokenization instead of being left unhighlighted by
  highlight.js.
- Other languages (JavaScript, TypeScript, Python, Bash, JSON, YAML, XML) are
  also loaded so mixed decks keep working normally. Add more in the `langs`
  array in `engine.js`.

---

## Writing slides

Edit `slides.md`. Marp front-matter goes in the first YAML block:

```markdown
---
marp: true
theme: default      # or uncover, gaia, or a custom theme
paginate: true
---

# Title slide

```sysml
package MyModel {
    part def Foo { attribute x : Real; }
}
```
```

Full Authoring docs:
- **Marp Markdown syntax:** <https://marp.app/docs/>
- **Marp Core / themes / directives:** <https://github.com/marp-team/marp-core>
- **Marp CLI options:** <https://github.com/marp-team/marp-cli>

---

## Updating the grammar

If the upstream extension updates its grammar, re-download it:

```bash
curl -o sysml.tmLanguage.json \
  https://raw.githubusercontent.com/daltskin/VSCode_SysML_Extension/main/syntaxes/sysml.tmLanguage.json
```

---

## Useful links

- [Marp] — the presentation framework this deck is built with
- [Marp CLI][marp-cli] — the command-line renderer (`marp` command, `--html`,
  `--pdf`, `--watch`, `--preview`, etc.)
- [Marp Core][marp-core] — Marp's core Markdown-it pipeline and built-in themes
- [Shiki] — the syntax highlighter used by the custom engine (VS Code's
  highlighter, runs on TextMate grammars)
- [SysML v2 VS Code extension][grammar-src] — source of the bundled
  `sysml.tmLanguage.json` grammar
- [OMG SysML v2 specification][sysml-spec] — the language itself
- [Node.js] — the runtime you need to run `npm` commands

[Marp]: https://marp.app/
[marp-cli]: https://github.com/marp-team/marp-cli
[marp-core]: https://github.com/marp-team/marp-core
[marp-docs]: https://marp.app/docs/
[shiki]: https://shiki.style/
[shiki-docs]: https://shiki.style/
[grammar-src]: https://github.com/daltskin/VSCode_SysML_Extension
[sysml-spec]: https://www.omg.org/spec/SysML/2.0/
[Node.js]: https://nodejs.org/