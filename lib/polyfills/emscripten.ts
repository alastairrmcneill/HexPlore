// h3-js v3 is compiled by Emscripten as asm.js. Its generated JS glue has two
// React Native / Hermes incompatibilities that are fixed here.
//
// This file MUST be the first import in any module that imports h3-js.

// Fix 1 — document stub
// Emscripten sees React Native's `window` polyfill and assumes a browser
// environment, then reads `document.currentScript` to locate the script path.
// That property doesn't exist in Hermes; stub the minimum needed.
if (typeof document === 'undefined') {
  (global as any).document = { currentScript: null };
}

// Fix 2 — TextDecoder utf-16le stub
// Emscripten declares:
//   var UTF16Decoder = typeof TextDecoder !== "undefined"
//                        ? new TextDecoder("utf-16le") : undefined;
// React Native exposes TextDecoder but Hermes does not implement utf-16le,
// so this throws. H3 is a geometry library — it never actually calls
// UTF16Decoder.decode() in any code path we use, so a no-op stub is safe.
const _OriginalTextDecoder = (global as any).TextDecoder as
  | (new (encoding?: string, options?: TextDecoderOptions) => TextDecoder)
  | undefined;

if (_OriginalTextDecoder) {
  function PatchedTextDecoder(
    this: any,
    encoding?: string,
    options?: TextDecoderOptions,
  ) {
    try {
      return new _OriginalTextDecoder!(encoding, options);
    } catch {
      // Unsupported encoding (e.g. utf-16le) — return a no-op stub
      return { decode: () => '' };
    }
  }
  PatchedTextDecoder.prototype = _OriginalTextDecoder.prototype;
  (global as any).TextDecoder = PatchedTextDecoder;
}
