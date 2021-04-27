import {regexEscape} from "../regex/regex-escape";
import {escapeMap} from "../map/escape-map";

const escape = function (string) {
	return string.replace(regexEscape, function ($0) {
		// Note: there is no need to check `has(escapeMap, $0)` here.
		return escapeMap[$0];
	});
};

export default escape;
