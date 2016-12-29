/* @flow */

// One-time functions to annotate a single node or entire tree

type Options = {
    attribute?: string,
};

export function annotateReactNode(node: Node, { attribute = "react" }: Options = {}): void {
    if (node && node.nodeType === Node.ELEMENT_NODE) {
        let element: Element = (node: any);
        let owner = getReactOwner(element);
        let parentOwner = getReactOwner(element.parentNode);
        // only set it for the root element of any particular owner
        if (owner && owner !== parentOwner) {
            element.setAttribute(attribute, getReactElementName(owner._currentElement))
        }
    }
}

export function annotateReactNodes(node: Node = document, options: Options): void {
    annotateReactNode(node, options);
    let current = node.firstChild;
    while (current) {
        annotateReactNodes(current, options);
        current = current.nextSibling;
    }
}

// ANNOTATORS
// Keep the annotations updated as new DOM nodes are inserted

export function installAsynchronousAnnotator(node: Node = document, options: Options) {
    let observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
             for (const node of mutation.addedNodes) {
                 annotateReactNodes(node, options);
             }
         }
    })
    annotateReactNodes(node, options);
    observer.observe(node, { childList: true, subtree: true });
    return () => observer.disconnect();
}

export function installSynchronousAnnotator(node: Node = document, options: Options) {
    const listener = (e: Event) => {
        annotateReactNodes((e.target: any), options);
    }
    annotateReactNodes(node, options);
    node.addEventListener("DOMNodeInserted", listener, false);
    return () => node.removeEventListener("DOMNodeInserted", listener, false);
}

// HELPERS

type ReactComponent = {
    name: string
};
type ReactElement = {
    type: ReactComponent,
    _owner: ReactInternalInstance
};
type ReactInternalInstance = {
    _currentElement: ReactElement
};

export function getReactInternalInstance(node: ?Node): ?ReactInternalInstance {
    if (node) {
        for (const name in node) {
            if (name.startsWith("__reactInternalInstance$")) {
                // $FlowFixMe
                return node[name];
            }
        }
    }
}

export function getReactOwner(node: ?Node): ?ReactInternalInstance {
    let internalInstance = getReactInternalInstance(node);
    if (internalInstance) {
        return internalInstance._currentElement._owner;
    }
}

// works for both class and stateless function components
export function getReactElementName(element: ReactElement): string {
    return element.type.name;
}
