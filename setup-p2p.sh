#!/bin/bash

# Install dependencies
npm install @prisma/client next-auth zustand axios @tanstack/react-query
npm install prisma --save-dev

# Generate Prisma client
npx prisma generate

# Create database and apply migrations
npx prisma db push

echo "P2P system setup completed!"
