import {regexEscape} from "../regex/regex.js";
import {escapeMap} from "../map/escape-map.js";

export const escape = function (string: string): string {
	return string.replace(regexEscape, function ($0) {
		// Note: there is no need to check `has(escapeMap, $0)` here.
		return escapeMap[$0];
	});
};
