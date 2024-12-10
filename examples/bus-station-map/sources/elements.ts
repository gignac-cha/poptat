export const createElement = <N extends keyof HTMLElementTagNameMap, E extends HTMLElementTagNameMap[N], A extends keyof E>(
  name: N,
  attributes: Partial<Record<A, Partial<E[A]>>> = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[N] => {
  const element = document.createElement<N>(name);
  for (const key in attributes) {
    if (key === 'style') {
      Object.assign(element.style, attributes[key]);
    } else {
      element.setAttribute(key, `${attributes[key]}`);
    }
  }
  for (const child of children) {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  }
  return element;
};
