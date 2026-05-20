#!/bin/bash
echo "Starting MCP servers..."

# Start MCP servers in background
npx -y @modelcontextprotocol/server-filesystem . &
npx -y tailwindcss-mcp-server &
npx -y pskill9/web-search &

echo "MCP servers started! Starting OpenCode..."
opencode
