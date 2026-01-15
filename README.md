# Dumb Visual Timer

A beautiful, minimalist oven-style visual countdown timer built with Next.js.

## Features

- **Visual Timer**: Large clock face with a decreasing sector animation (like an oven timer)
- **Simple Controls**: Start, Pause, Reset buttons
- **Adjustable Duration**: Set minutes with +/- buttons
- **Clean Aesthetic**: Dark theme with warm orange accent colors

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
docker build -t visual-timer .
docker run -p 3000:3000 visual-timer
```

## Controls

| Control | Location | Function |
|---------|----------|----------|
| Start/Pause | Bottom-left | Start or pause the timer |
| Reset | Bottom-left | Reset to the set duration |
| Settings (⚙) | Bottom-right | Click to open minute adjuster |
| +/- | Settings panel | Adjust timer duration by 1 minute |

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Fonts**: Bebas Neue (display), JetBrains Mono (UI)
- **Deployment**: Docker with multi-stage build

## License

MIT
