
<div align="center">
    <h1><a href="https://github.com/hlsiira/Onyx">Onyx</a> - A Concentrated (ES6) library for DOM manipulation.</h1>
</div>

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

</div>

## About
Onyx is a minimalist library for DOM manipulation, with jQuery inspired syntax.uests, built off of <a href="https://github.com/vladocar/nanoJS">VladoCar's NanoJS</a>. Weighing in at around <b>300 lines</b> of code, Onyx provides a convenient interface for almost all your DOM manipulation needs. It also provides innate JSON parsing where possible. Onyx was built in order to be used as a compact and intuitive DOM manipulation library for development on the <a href="https://www.athos.io/">Atheos IDE</a>, however it's proved so valuable as to become it's own mini library. Onyx returns the element wrapped as an object loaded with a multitude of helpful functions.

## Features
<p><code>Pleasently Parsed:</code> Onyx automatically tries to parse JSON replies.</p>
<p><code>Crazily Condensed:</code> The minified version is less than ~1K, roughly 500b gzipped.</p>
<p><code>Easily Extensible:</code> Onyx is easily modifyable to meet your needs.</p>

Below is the functions returned as an object when creating a new Onyx refence.
```javascript
	oX('#selector'){
		focus: ()               => element.focus(),
		display: (d)            => element.style.display = d,
		trigger: (event)        => triggerEvent(element, event),

		css: (k, v)             => setStyle(element, k, v),
		data: (v)               => IO(element, 'data', v),
		prop: (k, v)            => IO(element, 'prop', v, k),
		html: (v)               => IO(element, 'innerHTML', v),
		text: (v)               => IO(element, 'innerText', v),
		value: (v)              => IO(element, 'value', v),
		empty: ()               => element.innerHTML = element.value = '',

		attr: (k, v)            => IO(element, 'attr', v, k),
		removeAttr: (k)         => element.removeAttribute(k),

		addClass: (c)           => setClass(element, 'add', c),
		hasClass: (c)           => setClass(element, 'contains', c),
		removeClass: (c)        => setClass(element, 'remove', c),
		switchClass: (c, n)     => setClass(element, 'switch', c, n),
		toggleClass: (c)        => setClass(element, 'toggle', c),
		replaceClass: (c, n)    => setClass(element, 'replace', c, n),

		find: (s)               => onyx(element.querySelector(s)),
		parent: (s)             => s ? onyx(element.closest(s)) : onyx(element.parentElement),
		findAll: (s)            => search(element, 'find', s),
		sibling: (s)            => search(element, 'siblings', s, true),
		siblings: (s)           => search(element, 'siblings', s),
		children: (s)           => search(element, 'children', s),

		before: insertAdjacent('beforebegin', element),
		after: insertAdjacent('afterend', element),
		first: insertAdjacent('afterbegin', element),
		last: insertAdjacent('beforeend', element),

		insertBefore: insertToAdjacent('beforebegin', element),
		insertAfter: insertToAdjacent('afterend', element),
		insertFirst: insertToAdjacent('afterbegin', element),
		insertLast: insertToAdjacent('beforeend', element),

		prepend: insertAdjacent('afterbegin', element),
		append: insertAdjacent('beforeend', element),

		replace: (el)           => element.replaceWith(el),
		remove: ()              => element.remove(),
		height: (o)             => getSize(element, 'height', o),
		width: (o)              => getSize(element, 'width', o),
		tagName: ()             => element.tagName,
		type: ()                => element.type,
		node: ()                => element,
		el: element,
		exists: ()              => (element && element.nodeType),
		isOnyx: true
	};
});
```