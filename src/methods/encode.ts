import merge from "../utils/merge.js";
import parseError from "../utils/parse-error.js";
import { regexAsciiWhitelist, regexInvalidRawCodePoint, regexEncodeNonAscii, regexEscape, regexAstralSymbols, regexBmpWhitelist } from "../regex/regex.js";
import { encodeMap } from "../map/encode-map.js";

export type optionsType = {
	allowUnsafeSymbols: boolean,
	encodeEverything: boolean,
	strict: boolean,
	useNamedReferences: boolean,
	decimal: boolean
};

function hexEscape(codePoint) {
	return `&#x${codePoint.toString(16).toUpperCase()};`;
}

function decEscape(codePoint) {
	return `&#${codePoint};`;
}

export const encode = function (string: string, options?: optionsType): string {
	options = merge(options, encode.options);
	const strict = options.strict;
	if (strict && regexInvalidRawCodePoint.test(string)) {
		parseError('forbidden code point');
	}
	const encodeEverything = options.encodeEverything;
	const useNamedReferences = options.useNamedReferences;
	const allowUnsafeSymbols = options.allowUnsafeSymbols;
	const escapeCodePoint = options.decimal ? decEscape : hexEscape;

	const escapeBmpSymbol = function (symbol) {
		return escapeCodePoint(symbol.charCodeAt(0));
	};

	if (encodeEverything) {
		// Encode ASCII symbols.
		string = string.replace(regexAsciiWhitelist, function (symbol) {
			// Use named references if requested & possible.
			if (useNamedReferences && encodeMap.hasOwnProperty(symbol)) {
				return `&${encodeMap[symbol]};`;
			}
			return escapeBmpSymbol(symbol);
		});
		// Shorten a few escapes that represent two symbols, of which at least one
		// is within the ASCII range.
		if (useNamedReferences) {
			string = string
				.replace(/&gt;\u20D2/g, '&nvgt;')
				.replace(/&lt;\u20D2/g, '&nvlt;')
				.replace(/&#x66;&#x6A;/g, '&fjlig;');
		}
		// Encode non-ASCII symbols.
		if (useNamedReferences) {
			// Encode non-ASCII symbols that can be replaced with a named reference.
			string = string.replace(regexEncodeNonAscii, function (string) {
				// Note: there is no need to check `has(encodeMap, string)` here.
				return `&${encodeMap[string]};`;
			});
		}
		// Note: any remaining non-ASCII symbols are handled outside of the `if`.
	} else if (useNamedReferences) {
		// Apply named character references.
		// Encode `<>"'&` using named character references.
		if (!allowUnsafeSymbols) {
			string = string.replace(regexEscape, function (string) {
				return `&${encodeMap[string]};`; // no need to check `has()` here
			});
		}
		// Shorten escapes that represent two symbols, of which at least one is
		// `<>"'&`.
		string = string
			.replace(/&gt;\u20D2/g, '&nvgt;')
			.replace(/&lt;\u20D2/g, '&nvlt;');
		// Encode non-ASCII symbols that can be replaced with a named reference.
		string = string.replace(regexEncodeNonAscii, function (string) {
			// Note: there is no need to check `has(encodeMap, string)` here.
			return `&${encodeMap[string]};`;
		});
	} else if (!allowUnsafeSymbols) {
		// Encode `<>"'&` using hexadecimal escapes, now that they’re not handled
		// using named character references.
		string = string.replace(regexEscape, escapeBmpSymbol);
	}
	return string
		// Encode astral symbols.
		.replace(regexAstralSymbols, function ($0) {
			// https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
			const high = $0.charCodeAt(0);
			const low = $0.charCodeAt(1);
			const codePoint = (high - 0xD800) * 0x400 + low - 0xDC00 + 0x10000;
			return escapeCodePoint(codePoint);
		})
		// Encode any remaining BMP symbols that are not printable ASCII symbols
		// using a hexadecimal escape.
		.replace(regexBmpWhitelist, escapeBmpSymbol);
};

encode.options = {
	'allowUnsafeSymbols': false,
	'encodeEverything': false,
	'strict': false,
	'useNamedReferences': false,
	'decimal': false
};
