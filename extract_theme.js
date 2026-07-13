const fs = require('fs');
const html = fs.readFileSync('home.html', 'utf8');
const match = html.match(/tailwind\.config = (\{[\s\S]*?\})\s*<\/script>/);
if (match) {
  const vm = require('vm');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(`var config = ${match[1]};`, sandbox);
  const config = sandbox.config;
  let css = '@theme inline {\n';
  const colors = config.theme.extend.colors;
  for (const [key, value] of Object.entries(colors)) {
    css += `  --color-${key}: ${value};\n`;
  }
  const spacing = config.theme.extend.spacing;
  for (const [key, value] of Object.entries(spacing)) {
    css += `  --spacing-${key}: ${value};\n`;
  }
  const radius = config.theme.extend.borderRadius;
  for (const [key, value] of Object.entries(radius)) {
    if (key === 'DEFAULT') {
      css += `  --radius: ${value};\n`;
    } else {
      css += `  --radius-${key}: ${value};\n`;
    }
  }
  css += '  --font-headline-lg-mobile: var(--font-space-grotesk);\n';
  css += '  --font-label-caps: var(--font-jetbrains-mono);\n';
  css += '  --font-data-mono: var(--font-jetbrains-mono);\n';
  css += '  --font-body-sm: var(--font-inter);\n';
  css += '  --font-body-md: var(--font-inter);\n';
  css += '  --font-headline-lg: var(--font-space-grotesk);\n';
  css += '  --font-display-lg: var(--font-space-grotesk);\n';
  css += '}\n';
  fs.writeFileSync('aura-theme.css', css);
  console.log('Successfully generated aura-theme.css');
} else {
  console.log('Failed to parse config from HTML');
}
