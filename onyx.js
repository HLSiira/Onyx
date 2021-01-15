//////////////////////////////////////////////////////////////////////////////80
// Onyx
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/license.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2019 Vladimir Carrer
// Source: https://github.com/vladocar/femtoJS
//////////////////////////////////////////////////////////////////////////////80

(function(global) {
	'use strict';

	let alwaysReturn = [
		window,
		document,
		document.documentElement
	];

	let argToElement = function(selector) {
		if (!selector) {
			return false;
		}

		if (alwaysReturn.includes(selector)) {
			return selector;
		} else if (typeof selector === 'string') {
			const tagName = /^<(.+)>$/.exec(selector);

			if (tagName !== null) {
				// https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
				var template = document.createElement('template');
				selector = selector.trim(); // Never return a text node of whitespace as the result
				template.innerHTML = selector;
				return template.content.firstChild;
				// return document.createElement(tagName[1]);
			} else {
				return document.querySelector(selector);
			}
		} else if (selector instanceof HTMLElement) {
			return selector;
		} else if (selector.isOnyx) {
			return selector.el;
		}

		throw new TypeError('Expected String | HTMLElement | OnyxJS; got ' + typeof selector);

	};

	const isSelectorValid = function(selector) {
		try {
			document.createDocumentFragment().querySelector(selector);
		} catch (e) {
			return false;
		}
		return true;
	};

	let pxStyles = ['height', 'width', 'top', 'left', 'right', 'bottom'];
	// let classTypes = ['add', 'contains', 'toggle', 'remove', 'replace'];
	let domTypes = ['data', 'innerHTML', 'innerText', 'value'];

	// This attach function will probably be removed as it's honestly
	// more of an overcomplication than a helper, but it also just need
	// optimization. The goal is to allow you to add child selectors to
	// the event handler.
	let attach = (element, action, type, children, fn) => {
		//https://stackoverflow.com/questions/2068272/getting-a-jquery-selector-for-an-element
		let sel = children;
		if (typeof(selector) === 'function') {
			fn = selector;
			children = null;
		} else {
			sel = element + ' ' + children;
		}
		events[action](type, sel, fn);
	};

	let setClass = function(element, type, cls, nCls) {
		if (type === 'replace') {
			setClass(element, 'remove', cls);
			setClass(element, 'add', nCls);
		} else if (type === 'remove') {
			if (cls) {
				element.classList.remove(...cls.split(' '));
			} else {
				element.className = '';
			}
		} else if (type === 'switch') {
			if (element.classList.contains(cls)) {
				setClass(element, 'remove', cls);
				setClass(element, 'add', nCls);
			} else {
				setClass(element, 'add', cls);
				setClass(element, 'remove', nCls);
			}
		} else {
			// add, contains, toggle
			return element.classList[type](...cls.split(' '));
		}
	};

	let setStyle = function(element, key, value) {
		if (typeof key === 'string') {
			if (typeof(value) !== 'undefined') {
				if (pxStyles.includes(key) && isFinite(value) && value !== '') {
					value = value + 'px';
				}
				element.style[key] = value;
			}
			return element.style[key] || null;
		} else if (typeof key === 'object') {
			const entries = Object.entries(key);
			for (const [key, value] of entries) {
				element.style[key] = value;
			}
		}
	};

	let getSize = (element, type, outer) => {
		var init = {
			'display': element.style.display,
			'visibility': element.style.visibility,
			'opacity': element.style.opacity
		};

		setStyle(element, {
			'display': 'block',
			'visibility': 'hidden',
			'opacity': 0
		});

		var computedStyle = window.getComputedStyle(element);
		var size = parseFloat(computedStyle[type].replace('px', ''));
		if (outer) { //OuterHeight or OuterWidth
			if (type === 'height') {
				size += parseFloat(computedStyle.marginTop.replace('px', ''));
				size += parseFloat(computedStyle.marginBottom.replace('px', ''));
				size += parseFloat(computedStyle.borderTopWidth.replace('px', ''));
				size += parseFloat(computedStyle.borderBottomWidth.replace('px', ''));
			} else if (type === 'width') {
				size += parseFloat(computedStyle.marginLeft.replace('px', ''));
				size += parseFloat(computedStyle.marginRight.replace('px', ''));
				size += parseFloat(computedStyle.borderLeftWidth.replace('px', ''));
				size += parseFloat(computedStyle.borderRightWidth.replace('px', ''));
			}
		}
		setStyle(element, init);

		return size;
	};

	let insertToAdjacent = (location, element) => function(target) {
		if (typeof target === 'string') {
			target = argToElement(target);
			target.insertAdjacentElement(location, element);
		} else if (target instanceof HTMLElement) {
			target.insertAdjacentElement(location, element);
		} else if ('isOnyx' in target) {
			target = target.el;
			target.insertAdjacentElement(location, element);
		}
	};

	let insertAdjacent = (location, element) => function(addition) {
		if (typeof addition === 'string') {
			element.insertAdjacentHTML(location, addition);
		} else if (addition instanceof HTMLElement) {
			element.insertAdjacentElement(location, addition);
		} else if ('isOnyx' in addition) {
			addition = addition.el;
			element.insertAdjacentElement(location, addition);
		}
	};

	let IO = (element, type, value, key) => {
		if (domTypes.includes(type)) {
			if (typeof(value) !== 'undefined') {
				element[type] = value;
			}
			return element[type];
		} else if (type === 'prop') {
			if (typeof(value) !== 'undefined') {
				element[key] = value;
			}
			return element[key];
		} else if (type === 'attr') {
			if (typeof key === 'string') {
				if (typeof(value) !== 'undefined') {
					element.setAttribute(key, value);
				}
				return element.getAttribute(key);
			} else if (typeof key === 'object') {
				const entries = Object.entries(key);
				for (const [key, value] of entries) {
					element.setAttribute(key, value);
				}
			}
		}
	};

	let search = (element, type, selector, all) => {
		var matches = [];
		if (type === 'find') {
			var nodes = element.querySelectorAll(selector);
			for (var i = 0; i < nodes.length; i++) {
				matches.push(onyx(nodes[i]));
			}
		} else {
			var match = type === 'children' ? element.firstElementChild : element.parentNode.firstElementChild;

			while (match) {
				if ((!selector || match.matches(selector)) && match !== element) {
					matches.push(onyx(match));
				}
				match = match.nextElementSibling;
			}
		}
		if (all) {
			return matches[0] || false;
		} else {
			return matches;
		}
	};

	let triggerEvent = function(element, types) {
		types = types.split(',');
		types.forEach(function(type) {
			type = type.trim();
			if (element && type) {

				var event = new CustomEvent(type, {
					bubbles: true,
					cancelable: true
				});
				return element.dispatchEvent(event);
			}

		});
	};

	const onyx = function(selector) {
		let element = argToElement(selector);
		selector = isSelectorValid(selector) ? selector : element;

		if (!element) return;

		return {
			focus: () => element.focus(),
			display: (d) => element.style.display = d,
			trigger: (event) => triggerEvent(element, event),

			css: (k, v) => setStyle(element, k, v),

			data: (v) => IO(element, 'data', v),
			prop: (k, v) => IO(element, 'prop', v, k),
			html: (v) => IO(element, 'innerHTML', v),
			text: (v) => IO(element, 'innerText', v),
			value: (v) => IO(element, 'value', v),

			empty: () => element.innerHTML = element.value = '',

			attr: (k, v) => IO(element, 'attr', v, k),
			removeAttr: (k) => element.removeAttribute(k),

			addClass: (c) => setClass(element, 'add', c),
			hasClass: (c) => setClass(element, 'contains', c),
			removeClass: (c) => setClass(element, 'remove', c),
			switchClass: (c, n) => setClass(element, 'switch', c, n),
			toggleClass: (c) => setClass(element, 'toggle', c),
			replaceClass: (c, n) => setClass(element, 'replace', c, n),

			find: (s) => onyx(element.querySelector(s)),
			parent: (s) => s ? onyx(element.closest(s)) : onyx(element.parentElement),
			findAll: (s) => search(element, 'find', s),
			sibling: (s) => search(element, 'siblings', s, true),
			siblings: (s) => search(element, 'siblings', s),
			children: (s) => search(element, 'children', s),

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

			replace: (el) => element.replaceWith(el),
			remove: () => element.remove(),

			height: (o) => getSize(element, 'height', o),
			width: (o) => getSize(element, 'width', o),

			tagName: () => element.tagName,
			type: () => element.type,
			node: () => element,
			el: element,
			exists: () => (element && element.nodeType),
			isOnyx: true
		};
	};

	global.oX = onyx;
})(this);