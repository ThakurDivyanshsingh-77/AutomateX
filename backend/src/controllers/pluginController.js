import { PluginRegistry } from '../plugins/registry/PluginRegistry.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listPlugins = asyncHandler(async (req, res) => {
  const plugins = PluginRegistry.listPlugins();
  return res.status(200).json({
    success: true,
    count: plugins.length,
    data: plugins,
  });
});

export const getPluginByName = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const plugin = PluginRegistry.getPlugin(name);
  return res.status(200).json({
    success: true,
    plugin: {
      name: plugin.name,
      displayName: plugin.displayName,
      version: plugin.version,
      icon: plugin.icon,
      category: plugin.category,
      actions: plugin.actions,
    },
  });
});
