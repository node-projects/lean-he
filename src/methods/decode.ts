import merge from "../utils/merge.js";
import parseError from "../utils/parse-error.js";
import { regexDecode, regexInvalidEntity } from "../regex/regex.js";
import { decodeMapNumeric } from "../map/decode-map-numeric.js";
import { invalidReferenceCodePoints } from "../utils/invalid-reference-code-points.js";
import contains from "../utils/constains.js";
import { decodeMap } from "../map/decode-map.js";
import { decodeMapLegacy } from "../map/decode-map-legacy.js";

export type optionsType = {
	isAttributeValue: boolean,
	strict: boolean
};

function codePointToSymbol(codePoint, strict) {
	let output = '';
	if ((codePoint >= 0xD800 && codePoint <= 0xDFFF) || codePoint > 0x10FFFF) {
		// See issue #4:
		// “Otherwise, if the number is in the range 0xD800 to 0xDFFF or is
		// greater than 0x10FFFF, then this is a parse error. Return a U+FFFD
		// REPLACEMENT CHARACTER.”
		if (strict) {
			parseError('character reference outside the permissible Unicode range');
		}
		return '\uFFFD';
	}

	if (decodeMapNumeric.hasOwnProperty(codePoint)) {
		if (strict) {
			parseError('disallowed character reference');
		}
		return decodeMapNumeric[codePoint];
	}
	if (strict && contains(invalidReferenceCodePoints, codePoint)) {
		parseError('disallowed character reference');
	}
	if (codePoint > 0xFFFF) {
		codePoint -= 0x10000;
		output += String.fromCharCode(codePoint >>> 10 & 0x3FF | 0xD800);
		codePoint = 0xDC00 | codePoint & 0x3FF;
	}
	output += String.fromCharCode(codePoint);
	return output;
}


export const decode = function (html: string, options?: optionsType): string {
	options = merge(options, decode.options);
	const strict = options.strict;
	if (strict && regexInvalidEntity.test(html)) {
		parseError('malformed character reference');
	}
	return html.replace(regexDecode, function ($0, $1, $2, $3, $4, $5, $6, $7) {
		let codePoint;
		let semicolon;
		let decDigits;
		let hexDigits;
		let reference;
		let next;
		if ($1) {
			// Decode decimal escapes, e.g. `&#119558;`.
			decDigits = $1;
			semicolon = $2;
			if (strict && !semicolon) {
				parseError('character reference was not terminated by a semicolon');
			}
			codePoint = parseInt(decDigits, 10);
			return codePointToSymbol(codePoint, strict);
		}
		if ($3) {
			// Decode hexadecimal escapes, e.g. `&#x1D306;`.
			hexDigits = $3;
			semicolon = $4;
			if (strict && !semicolon) {
				parseError('character reference was not terminated by a semicolon');
			}
			codePoint = parseInt(hexDigits, 16);
			return codePointToSymbol(codePoint, strict);
		}
		if ($5) {
			// Decode named character references with trailing `;`, e.g. `&copy;`.
			reference = $5;
			if (decodeMap.hasOwnProperty(reference)) {
				return decodeMap[reference];
			} else {
				// Ambiguous ampersand. https://mths.be/notes/ambiguous-ampersands
				if (strict) {
					parseError(
						'named character reference was not terminated by a semicolon'
					);
				}
				return $0;
			}
		}
		// If we’re still here, it’s a legacy reference for sure. No need for an
		// extra `if` check.
		// Decode named character references without trailing `;`, e.g. `&amp`
		// This is only a parse error if it gets converted to `&`, or if it is
		// followed by `=` in an attribute context.
		reference = $6;
		next = $7;
		if (next && options.isAttributeValue) {
			if (strict && next === '=') {
				parseError('`&` did not start a character reference');
			}
			return $0;
		} else {
			if (strict) {
				parseError(
					'named character reference was not terminated by a semicolon'
				);
			}
			// Note: there is no need to check `has(decodeMapLegacy, reference)`.
			return decodeMapLegacy[reference] + (next || '');
		}
	});
};

decode.options = {
	'isAttributeValue': false,
	'strict': false
};
