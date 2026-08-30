# Get a Cat 🐱

A lightweight, single-page demo application built for IT demo scenarios. One button, one goal: fetch a cat image straight out of an AWS S3 bucket — and showcase what happens when IAM permissions get in the way.

## Project Overview

**Get a Cat** is a full-stack demo app consisting of:

- **Frontend** — a sleek single-page application built with [Vite](https://vitejs.dev/), [React](https://react.dev/), and [Tailwind CSS](https://tailwindcss.com/). It presents a single prominent **"Fetch Cat Image"** button. On success, the cat appears alongside a celebratory confetti animation; on failure, a clean error banner is shown and a generic HTTP 502 error is logged to the browser console.
- **Backend** — an [Express](https://expressjs.com/) server (port `3000`) exposing a single endpoint, `GET /api/cat`. It uses `@aws-sdk/client-s3` to issue a `GetObjectCommand` against S3, converts the object stream to a base64 data URL, and returns it to the client. If the S3 request fails, the server deliberately swallows the real AWS error and instead logs a generic, unhelpful "upstream request failed" message, responding with `502 { "error": "BadGateway", "message": "Upstream request failed" }` — by design, nothing in the app reveals that the true cause is an IAM permission denial.

The frontend dev server proxies `/api/*` requests to the Express backend, so everything runs seamlessly with a single command.

## The User Story

Meet **Bob**. Bob is an application developer whose app needs to fetch a cat image from the `block-sales-group` S3 bucket.

1. Bob opens **Get a Cat** and clicks **"Fetch Cat Image"**.
2. Instead of a cat, Bob gets a **502 Bad Gateway** with the message "Upstream request failed". The server terminal shows only a generic `Unexpected error while handling GET /api/cat` — no status code, no service name, no clue.
3. Bob has no idea what happened. Is the network down? Is S3 having an outage? A bug in the app? Nothing in the logs points anywhere — the real cause (the IAM identity is denied `s3:GetObject` on the bucket) is completely invisible.
4. This is where **AuraCloud** comes in: by analyzing the IAM permission chain, AuraCloud pinpoints exactly which policy is denying `s3:GetObject`, so the right permission can be granted.
5. Once the permission is fixed, Bob clicks the button again — the cat appears, confetti flies, and the banner declares: **"Cat retrieved successfully! Bob is a hero"**. 🎉

This app is intentionally built so that both outcomes (denied and allowed) are visually distinct and demo-friendly.

## Setup & Installation

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later (includes `npm`)

### Steps

1. **Clone / open the project**, then install all dependencies from the project root:

   ```bash
   npm install
   ```

2. **Create the environment file.** Copy `.env.example` to `.env` in the project root and fill in the demo AWS credentials (shared privately — never committed to git). See [Environment Variables Reference](#environment-variables-reference) below.

   ```bash
   cp .env.example .env
   ```

3. **Start the app** (boots the Express backend and the Vite frontend concurrently):

   ```bash
   npm run dev
   ```

4. **Open the app** in your browser:

   - Frontend: <http://localhost:5173>
   - Backend API: <http://localhost:3000/api/cat>

5. Click **"Fetch Cat Image"** and watch either the confetti or the 403 — depending on the current IAM permissions.

### Available Scripts

| Script               | Description                                             |
| -------------------- | ------------------------------------------------------- |
| `npm run dev`        | Runs backend + frontend together (recommended)          |
| `npm run dev:server` | Runs only the Express backend on port 3000              |
| `npm run dev:client` | Runs only the Vite dev server on port 5173              |
| `npm run build`      | Builds the frontend for production                      |
| `npm run preview`    | Serves the production frontend build locally            |

## Environment Variables Reference

All configuration lives in the `.env` file at the project root:

| Variable                | Description                                                                 |
| ----------------------- | --------------------------------------------------------------------------- |
| `AWS_REGION`            | The AWS region hosting the S3 bucket (e.g. `eu-north-1`)                    |
| `AWS_S3_BUCKET_NAME`    | Name of the S3 bucket containing the cat image (`block-sales-group`)        |
| `AWS_CAT_IMAGE_KEY`     | Object key (file name) of the cat image inside the bucket                   |
| `AWS_ACCESS_KEY_ID`     | Access key ID of the IAM identity the app authenticates as                  |
| `AWS_SECRET_ACCESS_KEY` | Secret access key paired with the access key ID                             |

> ⚠️ **Security note:** `.env` is listed in `.gitignore` and must never be committed. The credentials in this file belong to a deliberately restricted demo IAM user — rotate or deactivate them after the demo.

## Project Structure

```
getAcat/
├── client/               # Frontend (Vite + React + Tailwind CSS)
│   ├── index.html
│   └── src/
│       ├── App.jsx       # Main UI: button, banners, image, confetti
│       ├── main.jsx      # React entry point
│       └── index.css     # Tailwind entry point
├── server/
│   └── index.js          # Express backend with the /api/cat endpoint
├── vite.config.js        # Vite config (Tailwind plugin + /api proxy)
├── .env                  # AWS configuration (not committed)
├── package.json
└── README.md
```
