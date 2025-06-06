# RuneChat

A real-time chat application inspired by RuneScape's chat system, featuring text effects and room-based communication.

## Features

- Real-time WebSocket communication
- Room-based chat system
- Text effects (wave, scroll, slide, flash, glow)
- Persistent user sessions
- Responsive design with RuneScape-inspired styling

## Tech Stack

### Client
- React 18 with TypeScript
- Vite for build tooling
- React Router for navigation
- WebSocket for real-time communication
- Custom CSS animations and effects

### Server
- Node.js WebSocket server
- CORS support
- Room management system
- User session handling

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## Project Structure

```
runechat/
├── client/           # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── styles/
│   │   └── main.tsx
│   └── package.json
└── server/           # WebSocket server
    ├── server.js
    └── package.json
```

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/runechat.git
cd runechat
```

2. Install client dependencies:
```bash
cd client
npm install
```

3. Install server dependencies:
```bash
cd ../server
npm install
```

4. Start the development server:
```bash
# Terminal 1 - Start the WebSocket server
cd server
npm run dev

# Terminal 2 - Start the React development server
cd client
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

1. Build the client:
```bash
cd client
npm run build
```

2. Start the production server:
```bash
cd ../server
npm start
```

## Deployment

### Client Deployment

The client can be deployed to any static hosting service. Here are the specific configurations for popular platforms:

#### Vercel
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Framework Preset: Vite

#### Netlify
- Build Command: `npm run build`
- Publish Directory: `dist`
- Install Command: `npm install`
- Environment Variables:
  - `VITE_WS_URL`: Your WebSocket server URL

#### GitHub Pages
1. Add to `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/runechat/', // Your repo name
  // ... other config
})
```
2. Build Command: `npm run build`
3. Deploy from `dist` directory

#### AWS S3 + CloudFront
1. Build: `npm run build`
2. Upload `dist` contents to S3 bucket
3. Configure CloudFront distribution:
   - Origin: Your S3 bucket
   - Default root object: `index.html`
   - Error pages: Redirect 404 to `index.html`

### Server Deployment

#### DigitalOcean App Platform
- Build Command: `npm install`
- Run Command: `node server/server.js`
- Environment Variables:
  - `PORT`: 443
  - `NODE_ENV`: production

### Deployment Checklist

1. Environment Variables:
   - Client:
     - `VITE_SERVER_URL`: The full WebSocket URL of your server (e.g., `wss://your-server-domain.com` or `ws://localhost:3001` for development)
     - Important: The URL must start with `ws://` for development or `wss://` for production
   - Server:
     - `PORT`: Server port (default: 3001)
     - `NODE_ENV`: Environment (production/development)

2. WebSocket Configuration:
   - For production:
     - Use `wss://` protocol (WebSocket Secure)
     - Ensure your server has valid SSL certificates
     - The WebSocket URL should be the direct URL to your server, not through a proxy
   - For development:
     - Use `ws://` protocol
     - Default URL is `ws://localhost:3001`

3. CORS Configuration:
   - Update server CORS settings to allow your client domain
   - Example:
   ```javascript
   cors({
     origin: ['https://your-client-domain.com'],
     methods: ['GET', 'POST']
   })
   ```

4. SSL/TLS:
   - Ensure WebSocket connections use `wss://` in production
   - Configure SSL certificates for both client and server
   - If using a reverse proxy (like Nginx), ensure it's configured to handle WebSocket upgrades

5. Domain Configuration:
   - Set up DNS records for your domain
   - Configure SSL certificates
   - Set up proper routing rules
   - Important: The WebSocket server should be accessible directly at its domain, not through a path

6. Monitoring:
   - Set up error logging
   - Configure uptime monitoring
   - Set up performance monitoring
   - Monitor WebSocket connection errors and timeouts

### Common Deployment Issues

1. WebSocket Connection Failures:
   - Check that the `VITE_SERVER_URL` environment variable is set correctly
   - Verify the server is running and accessible
   - Ensure SSL certificates are valid for production
   - Check CORS settings if connecting from a different domain
   - Verify the WebSocket URL is direct and not proxied through a path

2. SSL/TLS Issues:
   - Ensure all certificates are valid and not expired
   - Check that the certificate domain matches your server domain
   - Verify the certificate chain is complete

3. CORS Issues:
   - Check the allowed origins in your server configuration
   - Verify the client domain is included in the allowed origins
   - Ensure CORS is properly configured for WebSocket connections

## Development

### Available Scripts

Client:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

Server:
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

### Code Style

This project uses ESLint for code quality. The configuration includes:
- TypeScript-aware linting
- React-specific rules
- Strict type checking

## License

[MIT License](LICENSE)
