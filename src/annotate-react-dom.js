/* @flow */

// One-time functions to annotate a single node or entire tree

type Options = {
  attribute?: string
};

export function annotateReactNode(
  node: Node,
  { attribute = "react" }: Options = {}
): void {
  if (node && node.nodeType === Node.ELEMENT_NODE) {
    const element: Element = (node: any);
    const owner = getReactOwner(element);
    const parentOwner = getReactOwner(element.parentNode);
    // only set it for the root element of any particular owner
    if (element && owner && owner !== parentOwner) {
      const type = getReactTypeName(owner);
      if (type) {
        element.setAttribute(attribute, type);
      }
    }
  }
}

export function annotateReactNodes(
  node: Node = document,
  options: Options
): void {
  annotateReactNode(node, options);
  let current = node.firstChild;
  while (current) {
    annotateReactNodes(current, options);
    current = current.nextSibling;
  }
}

// ANNOTATORS
// Keep the annotations updated as new DOM nodes are inserted

export function installAsynchronousAnnotator(
  node: Node = document,
  options: Options
) {
  let observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        annotateReactNodes(node, options);
      }
    }
  });
  annotateReactNodes(node, options);
  observer.observe(node, { childList: true, subtree: true });
  return () => observer.disconnect();
}

export function installSynchronousAnnotator(
  node: Node = document,
  options: Options
) {
  const listener = (e: Event) => {
    annotateReactNodes((e.target: any), options);
  };
  annotateReactNodes(node, options);
  node.addEventListener("DOMNodeInserted", listener, false);
  return () => node.removeEventListener("DOMNodeInserted", listener, false);
}

// HELPERS

type ReactComponent = {
  name: string,
  displayName?: string
};
type ReactType = string | ReactComponent;
type ReactInternalInstance = LegacyReactInternalInstance | FiberNode;

// pre-Fiber
type ReactElement = {
  type: ReactType,
  _owner: LegacyReactInternalInstance
};
type LegacyReactInternalInstance = {
  _currentElement: ReactElement
};

// Fiber
type FiberNode = {
  _debugOwner: FiberNode,
  type: ReactType
};

const RII_REGEX = /^__reactInternalInstance\$/;
const RII_MIN_LENGTH = "__reactInternalInstance$".length;
export function getReactInternalInstance(node: ?Node): ?ReactInternalInstance {
  if (node) {
    for (const name in node) {
      if (name.length >= RII_MIN_LENGTH && RII_REGEX.test(name)) {
        // $FlowFixMe
        return node[name];
      }
    }
  }
}

export function getReactOwner(node: ?Node): ?ReactInternalInstance {
  let internalInstance = getReactInternalInstance(node);
  if (internalInstance) {
    return internalInstance._currentElement
      ? // pre-Fiber
        internalInstance._currentElement._owner
      : // Fiber
        internalInstance._debugOwner;
  }
}

// works for both class and stateless function components
export function getReactType(instance: ReactInternalInstance): ?ReactType {
  return instance._currentElement
    ? // pre-Fiber
      instance._currentElement.type
    : // Fiber
      instance.type;
}

export function getReactTypeName(instance: ReactInternalInstance): ?string {
  const type = getReactType(instance);
  return !type
    ? null
    : typeof type === "string"
    ? type
    : type.displayName || type.name;
}
