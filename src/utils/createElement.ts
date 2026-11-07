type ElementOptions = {
  className?: string;
  textContent?: string;
  attributes?: Record<string, string>;
};

function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options: ElementOptions = {},
  children: Node[] = [],
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);
  const { className, textContent, attributes = {} } = options;

  if (className) {
    element.className = className;
  }

  if (textContent !== undefined) {
    element.textContent = textContent;
  }

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });

  children.forEach((child) => {
    element.append(child);
  });

  return element;
}

export { createElement };
