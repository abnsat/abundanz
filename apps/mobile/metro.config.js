const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

config.watchFolders = [workspaceRoot]

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'ws') {
    return { filePath: path.resolve(__dirname, 'shims/ws.js'), type: 'sourceFile' }
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
