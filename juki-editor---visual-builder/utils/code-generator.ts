import { AnyCanvasItem, ItemType, PageItem } from '../types';

const formatProps = (props: Record<string, any>): string => {
  return Object.entries(props)
    .map(([key, value]) => {
      if (typeof value === 'string') {
        // Special handling for className to keep it clean
        if (key === 'className' && value.trim() === '') return '';
        return `${key}="${value}"`;
      }
      if (typeof value === 'boolean' && value) {
        return key;
      }
      if (typeof value === 'number') {
        return `${key}={${value}}`;
      }
      // For other types like objects or arrays, you might want to JSON.stringify
      // but for basic props, this is a simplification.
      return '';
    })
    .filter(Boolean)
    .join(' ');
};

const generateItemCode = (item: AnyCanvasItem, indentLevel: number): string => {
  const indent = ' '.repeat(indentLevel * 2);
  const propsString = formatProps(item.props);

  if (item.type === ItemType.Element) {
    // FIX: Explicitly convert item.tag to a string to prevent implicit conversion errors.
    const Tag = String(item.tag);
    if (Array.isArray(item.content) && item.content.length > 0) {
      const childrenCode = item.content.map(child => generateItemCode(child, indentLevel + 1)).join('\n');
      return `${indent}<${Tag} ${propsString}>\n${childrenCode}\n${indent}</${Tag}>`;
    }
    if (typeof item.content === 'string') {
      return `${indent}<${Tag} ${propsString}>${item.content}</${Tag}>`;
    }
    return `${indent}<${Tag} ${propsString} />`;
  }

  // FIX: Changed to `else if` to ensure proper type narrowing.
  if (item.type === ItemType.Component) {
    const ComponentName = item.componentType;
    if (Array.isArray(item.content) && item.content.length > 0) {
      const childrenCode = item.content.map(child => generateItemCode(child, indentLevel + 1)).join('\n');
      return `${indent}<${ComponentName} ${propsString}>\n${childrenCode}\n${indent}</${ComponentName}>`;
    }
    return `${indent}<${ComponentName} ${propsString} />`;
  }

  // FIX: After the type checks, `item` is `never`. Do not access properties on it.
  return `${indent}<!-- Unknown item type -->`;
};

export const generateReactCode = (page: PageItem): string => {
  if (!page) {
    return '// No active page to generate code for.';
  }

  const componentImports = new Set<string>();
  const collectImports = (items: AnyCanvasItem[]) => {
      for (const item of items) {
          if (item.type === ItemType.Component) {
              componentImports.add(item.componentType);
          }
          if (Array.isArray(item.content)) {
              collectImports(item.content);
          }
      }
  };

  collectImports(page.children);
  
  const importsString = `import React from 'react';\n` + 
    (componentImports.size > 0 
      ? `import { ${Array.from(componentImports).join(', ')} } from './components';\n\n` 
      : '\n');

  const childrenCode = page.children.map(item => generateItemCode(item, 1)).join('\n');

  const pageProps = formatProps(page.props);

  const componentName = page.name.replace(/\s+/g, '');

  return `${importsString}const ${componentName}Page = () => {
  return (
    <div ${pageProps}>
${childrenCode}
    </div>
  );
};

export default ${componentName}Page;
`;
};
