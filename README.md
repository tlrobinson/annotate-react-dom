# annotate-react-dom

Annotates DOM nodes with their React component name to make them targetable by CSS selector, e.x. `document.querySelector("[react=MyComponent]")`.

Useful for Selenium testing, etc. Not recommended for use in production. Currently known to work with React 15.

Install with yarn or npm:

```
yarn add --dev annotate-react-dom

npm install -D annotate-react-dom
```

# Usage

Annotate an entire tree of DOM nodes:

```javascript

// defaults the root node to `document`
annotateReactNode();

// you can provide another node
annotateReactNode(document.getElementById("foo"));

// can also provide an options object with an `attribute` name (default is `react`)
annotateReactNode(document, { attribute: "_react_" });
```

Annotate a single node (typically you'd use one of the other higher-level functions instead)

```javascript
annotateReactNode(document.body.firstChild);
```

Annotate a tree of nodes, and keep updated when new nodes are added. Uses [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) and operates asynchronously.

```javascript
installAsynchronousAnnotator(); 
```

Annotate a tree of nodes, and keep updated when new nodes are added. Uses (deprecated) [mutation events](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Mutation_events) and operates synchronously.

This is also demonstrating you can pass a root node, as well as an options object containing an attribute name.

```javascript
installSynchronousAnnotator();
```


## Example

```javascript
require("annotate-react-dom").installSynchronousAnnotator();

const Hello = () =>
  <div>hello</div>

ReactDOM.render(<Hello />, document.body.firstChild);

alert(document.querySelector("[react=MyComponent]").textContent);
```

## Notes

The `[react=ComponentName]` syntax is a valid standard CSS selector, but you may want to add nicer syntax such as a psuedo-class `:react(ComponentName)`.

You can do this with a CSS parser or simple regular expression:

```javascript
selector.replace(/:react\((\w+)\)/, "[react=$1]")
```
