# Scrip Writer <https://scrip.web.app/>

## Description

App is build with Bun, React, TypeScript, Vite & TailwindCSS. It is a simple app that allows you to write notes and share them with live collaboration

## Features

- Real-time collaboration
- Formatting
- Shareable links

## Prerequisites

- Node.js <https://nodejs.org/>
- Bun <https://bun.sh/>

## Installation

```bash
git clone https://github.com/KumarShubham001/online-notepad
```

```bash
cd online-notepad
```

- Add .env file from .example.env and add your firebase config

```bash
bun install
```

- Start the development server
```bash
bun dev
```

- Build the app
```bash
bun run build

bun run preview
```


## Hosting

This website is hosted on Firebase Hosting but you can host in any static hosting provider like GitHub Pages, Versel, Netlify etc.

### For Firebase Hosting

- Install Firebase CLI
```bash
npm install -g firebase-tools
```

- Login to Firebase
```bash
firebase login
```

- Initialize Firebase
```bash
firebase init
```

- Select Hosting and follow the instructions

- Deploy to Firebase
```bash
firebase deploy --only hosting
```
