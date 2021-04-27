# lean-he-esm

it is forked from lean-he and converted to typescript.

# lean-he [![codecov](https://codecov.io/gh/adnaan1703/lean-he/branch/master/graph/badge.svg)](https://codecov.io/gh/adnaan1703/lean-he) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) ![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg?style=flat-square)


_lean-he_ (for “HTML entities”) is a robust HTML entity encoder/decoder written in JavaScript. It supports [all standardized named character references as per HTML](https://html.spec.whatwg.org/multipage/syntax.html#named-character-references), handles [ambiguous ampersands](https://mathiasbynens.be/notes/ambiguous-ampersands) and other edge cases [just like a browser would](https://html.spec.whatwg.org/multipage/syntax.html#tokenizing-character-references), has an extensive test suite, and — contrary to many other JavaScript solutions — _lean-he_ handles astral Unicode symbols just fine.
 You can get a hint of how it works from [an online demo is available.](https://mothereff.in/html-entities) created by the same creator of original [he](https://github.com/mathiasbynens/he) library.
 This was created keeping bundling in mind. It will help in creating leaner bundle by using only the specific function developers needs, like if a use case requires only encoding then using `lean-he/encode` 
 will result in only encode file to be bundle leaving rest of the code hence creating leaner bundle.

**It is forked from [he](https://github.com/mathiasbynens/he) with minute changes to make it leaner and all thanks to it's author.**

## Installation

Via [npm](https://www.npmjs.com/):

```bash
npm install lean-he
```

Via [Bower](http://bower.io/):

Coming soon

Via [Component](https://github.com/component/component):

Coming soon

In [Node.js](https://nodejs.org/), [io.js](https://iojs.org/), [Narwhal](http://narwhaljs.org/), and [RingoJS](http://ringojs.org/):

```js
var he = require('lean-he');
```

In [Rhino](http://www.mozilla.org/rhino/):

```js
load('lean-he.js');
```

## API

### `leanHe.encode(text, options)`

This function takes a string of text and encodes (by default) any symbols that aren’t printable ASCII symbols and `&`, `<`, `>`, `"`, `'`, and `` ` ``, replacing them with character references.

>Can also use `var encode = require('lean-he/encode');` instead to reduce the imported file size if the only need is to encode.

```js
leanHe.encode('foo © bar ≠ baz 𝌆 qux');
// → 'foo &#xA9; bar &#x2260; baz &#x1D306; qux'
```

As long as the input string contains [allowed code points](https://html.spec.whatwg.org/multipage/parsing.html#preprocessing-the-input-stream) only, the return value of this function is always valid HTML. Any [(invalid) code points that cannot be represented using a character reference](https://html.spec.whatwg.org/multipage/syntax.html#table-charref-overrides) in the input are not encoded:

```js
leanHe.encode('foo \0 bar');
// → 'foo \0 bar'
```

However, enabling [the `strict` option](https://github.com/mathiasbynens/he#strict) causes invalid code points to throw an exception. With `strict` enabled, `he.encode` either throws (if the input contains invalid code points) or returns a string of valid HTML.

The `options` object is optional. It recognizes the following properties:

#### `useNamedReferences`

The default value for the `useNamedReferences` option is `false`. This means that `encode()` will not use any named character references (e.g. `&copy;`) in the output — hexadecimal escapes (e.g. `&#xA9;`) will be used instead. Set it to `true` to enable the use of named references.

**Note that if compatibility with older browsers is a concern, this option should remain disabled.**

```js
// Using the global default setting (defaults to `false`):
leanHe.encode('foo © bar ≠ baz 𝌆 qux');
// → 'foo &#xA9; bar &#x2260; baz &#x1D306; qux'

// Passing an `options` object to `encode`, to explicitly disallow named references:
leanHe.encode('foo © bar ≠ baz 𝌆 qux', {
  'useNamedReferences': false
});
// → 'foo &#xA9; bar &#x2260; baz &#x1D306; qux'

// Passing an `options` object to `encode`, to explicitly allow named references:
leanHe.encode('foo © bar ≠ baz 𝌆 qux', {
  'useNamedReferences': true
});
// → 'foo &copy; bar &ne; baz &#x1D306; qux'
```

#### `decimal`

The default value for the `decimal` option is `false`. If the option is enabled, `encode` will generally use decimal escapes (e.g. `&#169;`) rather than hexadecimal escapes (e.g. `&#xA9;`). Beside of this replacement, the basic behavior remains the same when combined with other options. For example: if both options `useNamedReferences` and `decimal` are enabled, named references (e.g. `&copy;`) are used over decimal escapes. HTML entities without a named reference are encoded using decimal escapes.

```js
// Using the global default setting (defaults to `false`):
leanHe.encode('foo © bar ≠ baz 𝌆 qux');
// → 'foo &#xA9; bar &#x2260; baz &#x1D306; qux'

// Passing an `options` object to `encode`, to explicitly disable decimal escapes:
leanHe.encode('foo © bar ≠ baz 𝌆 qux', {
  'decimal': false
});
// → 'foo &#xA9; bar &#x2260; baz &#x1D306; qux'

// Passing an `options` object to `encode`, to explicitly enable decimal escapes:
leanHe.encode('foo © bar ≠ baz 𝌆 qux', {
  'decimal': true
});
// → 'foo &#169; bar &#8800; baz &#119558; qux'

// Passing an `options` object to `encode`, to explicitly allow named references and decimal escapes:
leanHe.encode('foo © bar ≠ baz 𝌆 qux', {
  'useNamedReferences': true,
  'decimal': true
});
// → 'foo &copy; bar &ne; baz &#119558; qux'
```

#### `encodeEverything`

The default value for the `encodeEverything` option is `false`. This means that `encode()` will not use any character references for printable ASCII symbols that don’t need escaping. Set it to `true` to encode every symbol in the input string. When set to `true`, this option takes precedence over `allowUnsafeSymbols` (i.e. setting the latter to `true` in such a case has no effect).

```js
// Using the global default setting (defaults to `false`):
leanHe.encode('foo © bar ≠ baz 𝌆 qux');
// → 'foo &#xA9; bar &#x2260; baz &#x1D306; qux'

// Passing an `options` object to `encode`, to explicitly encode all symbols:
leanHe.encode('foo © bar ≠ baz 𝌆 qux', {
  'encodeEverything': true
});
// → '&#x66;&#x6F;&#x6F;&#x20;&#xA9;&#x20;&#x62;&#x61;&#x72;&#x20;&#x2260;&#x20;&#x62;&#x61;&#x7A;&#x20;&#x1D306;&#x20;&#x71;&#x75;&#x78;'

// This setting can be combined with the `useNamedReferences` option:
leanHe.encode('foo © bar ≠ baz 𝌆 qux', {
  'encodeEverything': true,
  'useNamedReferences': true
});
// → '&#x66;&#x6F;&#x6F;&#x20;&copy;&#x20;&#x62;&#x61;&#x72;&#x20;&ne;&#x20;&#x62;&#x61;&#x7A;&#x20;&#x1D306;&#x20;&#x71;&#x75;&#x78;'
```

#### `strict`

The default value for the `strict` option is `false`. This means that `encode()` will encode any HTML text content you feed it, even if it contains any symbols that cause [parse errors](https://html.spec.whatwg.org/multipage/parsing.html#preprocessing-the-input-stream). To throw an error when such invalid HTML is encountered, set the `strict` option to `true`. This option makes it possible to use _he_ as part of HTML parsers and HTML validators.

```js
// Using the global default setting (defaults to `false`, i.e. error-tolerant mode):
leanHe.encode('\x01');
// → '&#x1;'

// Passing an `options` object to `encode`, to explicitly enable error-tolerant mode:
leanHe.encode('\x01', {
  'strict': false
});
// → '&#x1;'

// Passing an `options` object to `encode`, to explicitly enable strict mode:
leanHe.encode('\x01', {
  'strict': true
});
// → Parse error
```

#### `allowUnsafeSymbols`

The default value for the `allowUnsafeSymbols` option is `false`. This means that characters that are unsafe for use in HTML content (`&`, `<`, `>`, `"`, `'`, and `` ` ``) will be encoded. When set to `true`, only non-ASCII characters will be encoded. If the `encodeEverything` option is set to `true`, this option will be ignored.

```js
leanHe.encode('foo © and & ampersand', {
  'allowUnsafeSymbols': true
});
// → 'foo &#xA9; and & ampersand'
```

#### Overriding default `encode` options globally

The global default setting can be overridden by modifying the `he.encode.options` object. This saves you from passing in an `options` object for every call to `encode` if you want to use the non-default setting.

```js
// Read the global default setting:
leanHe.encode.options.useNamedReferences;
// → `false` by default

// Override the global default setting:
leanHe.encode.options.useNamedReferences = true;

// Using the global default setting, which is now `true`:
leanHe.encode('foo © bar ≠ baz 𝌆 qux');
// → 'foo &copy; bar &ne; baz &#x1D306; qux'
```

### `he.decode(html, options)`

This function takes a string of HTML and decodes any named and numerical character references in it using [the algorithm described in section 12.2.4.69 of the HTML spec](https://html.spec.whatwg.org/multipage/syntax.html#tokenizing-character-references).

>Can also use `var decode = require('lean-he/decode');` instead to reduce the imported file size if the only need is to decode.

```js
leanHe.decode('foo &copy; bar &ne; baz &#x1D306; qux');
// → 'foo © bar ≠ baz 𝌆 qux'
```

The `options` object is optional. It recognizes the following properties:

#### `isAttributeValue`

The default value for the `isAttributeValue` option is `false`. This means that `decode()` will decode the string as if it were used in [a text context in an HTML document](https://html.spec.whatwg.org/multipage/syntax.html#data-state). HTML has different rules for [parsing character references in attribute values](https://html.spec.whatwg.org/multipage/syntax.html#character-reference-in-attribute-value-state) — set this option to `true` to treat the input string as if it were used as an attribute value.

```js
// Using the global default setting (defaults to `false`, i.e. HTML text context):
leanHe.decode('foo&ampbar');
// → 'foo&bar'

// Passing an `options` object to `decode`, to explicitly assume an HTML text context:
leanHe.decode('foo&ampbar', {
  'isAttributeValue': false
});
// → 'foo&bar'

// Passing an `options` object to `decode`, to explicitly assume an HTML attribute value context:
leanHe.decode('foo&ampbar', {
  'isAttributeValue': true
});
// → 'foo&ampbar'
```

#### `strict`

The default value for the `strict` option is `false`. This means that `decode()` will decode any HTML text content you feed it, even if it contains any entities that cause [parse errors](https://html.spec.whatwg.org/multipage/syntax.html#tokenizing-character-references). To throw an error when such invalid HTML is encountered, set the `strict` option to `true`. This option makes it possible to use _he_ as part of HTML parsers and HTML validators.

```js
// Using the global default setting (defaults to `false`, i.e. error-tolerant mode):
leanHe.decode('foo&ampbar');
// → 'foo&bar'

// Passing an `options` object to `decode`, to explicitly enable error-tolerant mode:
leanHe.decode('foo&ampbar', {
  'strict': false
});
// → 'foo&bar'

// Passing an `options` object to `decode`, to explicitly enable strict mode:
leanHe.decode('foo&ampbar', {
  'strict': true
});
// → Parse error
```

#### Overriding default `decode` options globally

The global default settings for the `decode` function can be overridden by modifying the `he.decode.options` object. This saves you from passing in an `options` object for every call to `decode` if you want to use a non-default setting.

```js
// Read the global default setting:
leanHe.decode.options.isAttributeValue;
// → `false` by default

// Override the global default setting:
leanHe.decode.options.isAttributeValue = true;

// Using the global default setting, which is now `true`:
leanHe.decode('foo&ampbar');
// → 'foo&ampbar'
```

### `leanHe.escape(text)`

This function takes a string of text and escapes it for use in text contexts in XML or HTML documents. Only the following characters are escaped: `&`, `<`, `>`, `"`, `'`, and `` ` ``.

>Can also use `var escape = require('lean-he/escape');` instead to reduce the imported file size if the only need is to escape.

```js
leanHe.escape('<img src=\'x\' onerror="prompt(1)">');
// → '&lt;img src=&#x27;x&#x27; onerror=&quot;prompt(1)&quot;&gt;'
```

### `leanHe.unescape(html, options)`

`leanHe.unescape` is an alias for `leanHe.decode`. It takes a string of HTML and decodes any named and numerical character references in it.

>Can also use `var unescape = require('lean-he/unescape');` instead to reduce the imported file size if the only need is to unescape.

## Unit tests & code coverage

After cloning this repository, run `npm install` to install the dependencies needed for he development and testing.

Once that’s done, you can run the unit tests in Node using `npm test`.

Code coverage report will be generated in coverage directory. Code coverage data will be presented as:
- html
- json
- text

## Acknowledgements

Thanks to [Mathias Bynens](https://www.npmjs.com/~mathias) for creating [he](https://www.npmjs.com/package/he).

## Author

| [![twitter/adnaan1703](https://en.gravatar.com/userimage/144283979/c8970eb942f95c327ad8f29c8fc91378.jpg?size=70)](https://twitter.com/adnaan1703 "Follow @adnaan1703 on Twitter") |
|---|
|[![GitHub followers](https://img.shields.io/github/followers/espadrine.svg?style=social&label=Follow)](https://github.com/adnaan1703) |
| [![Twitter URL](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/adnaan1703) |

## License

_lean-he_ is available under the [MIT](https://mths.be/mit) license.
