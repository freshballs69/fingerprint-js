export function getPlugins(): string[] {
  const plugins: string[] = [];

  if (!navigator.plugins) return plugins;

  for (let i = 0; i < navigator.plugins.length; i++) {
    const plugin = navigator.plugins[i];
    if (plugin) {
      plugins.push(plugin.name);
    }
  }

  return plugins.sort();
}
