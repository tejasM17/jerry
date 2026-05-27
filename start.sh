#!/bin/bash
set -e

echo "Starting MCP servers..."

# Start MCP servers in background (silent output)
npx -y @modelcontextprotocol/server-filesystem . > /dev/null 2>&1 &
npx -y tailwindcss-mcp-server > /dev/null 2>&1 &
npx -y pskill9/web-search > /dev/null 2>&1 &
npx -y @arabold/docs-mcp-server@latest > /dev/null 2>&1 &

echo "MCP servers started!"
echo ""
echo "Starting OpenCode..."
opencode
