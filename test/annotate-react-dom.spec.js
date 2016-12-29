import React from "react";
import ReactDOM from "react-dom";

import { annotateReactNode, annotateReactNodes } from "../src/annotate-react-dom";

const Hello = ({ children }) =>
    <div>Hello {children}</div>;

class World extends React.Component {
    render() {
        return <div>World</div>;
    }
}

describe("annotate-react-dom", () => {
    let container;
    beforeEach(() => {
        container = document.createElement("div");
    })

    describe("annotateReactNode", () => {
        it("should annotate a React component's DOM node", () => {
            const component = ReactDOM.render(<World />, container);
            const element = ReactDOM.findDOMNode(component);
            annotateReactNode(element);
            expect(element.getAttribute("react")).toBe("World");
        });
        it("should annotate a React component's DOM node with custom attribute", () => {
            const component = ReactDOM.render(<World />, container);
            const element = ReactDOM.findDOMNode(component);
            annotateReactNode(element, { attribute: "__react__" });
            expect(element.getAttribute("__react__")).toBe("World");
        });
    });

    describe("annotateReactNodes", () => {
        it("should annotate a React component's DOM node with custom attribute", () => {
            ReactDOM.render(<Hello><World /></Hello>, container);
            annotateReactNodes(container);

            expect(container.querySelector("[react=Hello]").textContent).toBe("Hello World")
            expect(container.querySelector("[react=Hello] [react=World]").textContent).toBe("World")
        });
    });
});
