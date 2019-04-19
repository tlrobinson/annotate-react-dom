"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.annotateReactNode = annotateReactNode;
exports.annotateReactNodes = annotateReactNodes;
exports.installAsynchronousAnnotator = installAsynchronousAnnotator;
exports.installSynchronousAnnotator = installSynchronousAnnotator;
exports.getReactInternalInstance = getReactInternalInstance;
exports.getReactOwner = getReactOwner;
exports.getReactType = getReactType;
exports.getReactTypeName = getReactTypeName;
function annotateReactNode(node) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$attribute = _ref.attribute,
      attribute = _ref$attribute === undefined ? "react" : _ref$attribute;

  if (node && node.nodeType === Node.ELEMENT_NODE) {
    var element = node;
    var owner = getReactOwner(element);
    var parentOwner = getReactOwner(element.parentNode);
    // only set it for the root element of any particular owner
    if (element && owner && owner !== parentOwner) {
      var _type = getReactTypeName(owner);
      if (_type) {
        element.setAttribute(attribute, _type);
      }
    }
  }
}

// One-time functions to annotate a single node or entire tree

function annotateReactNodes() {
  var node = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
  var options = arguments[1];

  annotateReactNode(node, options);
  var current = node.firstChild;
  while (current) {
    annotateReactNodes(current, options);
    current = current.nextSibling;
  }
}

// ANNOTATORS
// Keep the annotations updated as new DOM nodes are inserted

function installAsynchronousAnnotator() {
  var node = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
  var options = arguments[1];

  var observer = new MutationObserver(function (mutations) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = mutations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var mutation = _step.value;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = mutation.addedNodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _node = _step2.value;

            annotateReactNodes(_node, options);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  });
  annotateReactNodes(node, options);
  observer.observe(node, { childList: true, subtree: true });
  return function () {
    return observer.disconnect();
  };
}

function installSynchronousAnnotator() {
  var node = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
  var options = arguments[1];

  var listener = function listener(e) {
    annotateReactNodes(e.target, options);
  };
  annotateReactNodes(node, options);
  node.addEventListener("DOMNodeInserted", listener, false);
  return function () {
    return node.removeEventListener("DOMNodeInserted", listener, false);
  };
}

// HELPERS

// pre-Fiber


// Fiber


var RII_REGEX = /^__reactInternalInstance\$/;
var RII_MIN_LENGTH = "__reactInternalInstance$".length;
function getReactInternalInstance(node) {
  if (node) {
    for (var _name in node) {
      if (_name.length >= RII_MIN_LENGTH && RII_REGEX.test(_name)) {
        // $FlowFixMe
        return node[_name];
      }
    }
  }
}

function getReactOwner(node) {
  var internalInstance = getReactInternalInstance(node);
  if (internalInstance) {
    return internalInstance._currentElement ? // pre-Fiber
    internalInstance._currentElement._owner : // Fiber
    internalInstance._debugOwner;
  }
}

// works for both class and stateless function components
function getReactType(instance) {
  return instance._currentElement ? // pre-Fiber
  instance._currentElement.type : // Fiber
  instance.type;
}

function getReactTypeName(instance) {
  var type = getReactType(instance);
  return !type ? null : typeof type === "string" ? type : type.displayName || type.name;
}