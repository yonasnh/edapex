#!/bin/bash

# Quick Start Script for SchoolApex Canvas LMS
# This is a simplified version of start-services.sh for quick development

echo "🚀 SchoolApex Canvas LMS - Quick Start"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "start-services.sh" ]; then
    echo "❌ Please run this from the canvas-modern-ui directory"
    exit 1
fi

# Make sure start-services.sh is executable
chmod +x start-services.sh

# Run the full service manager
./start-services.sh start

echo ""
echo "🎉 Quick start completed!"
echo ""
echo "📋 Available URLs:"
echo "• LMS Frontend:  http://localhost:3003"
echo "• GraphQL API:   http://localhost:4003/graphql"
echo ""
echo "🔧 Management Commands:"
echo "• Check status:  ./start-services.sh status"
echo "• View logs:     ./start-services.sh logs <service>"
echo "• Stop all:      ./start-services.sh stop"
echo "• Restart all:   ./start-services.sh restart"
