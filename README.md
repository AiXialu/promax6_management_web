# Customer Management Platform

A customer management system based on React + Ant Design, supporting CRUD operations for customer information with data persistence in browser's localStorage.

## Features

- ✅ Customer information table display
- ✅ Add new customers
- ✅ Edit customer information
- ✅ Delete customer records
- ✅ Automatic sequence number management
- ✅ Date picker
- ✅ Local data persistence (localStorage)
- ✅ Responsive design
- ✅ Beautiful UI interface

## Table Fields

1. **No.** - Auto-incrementing number
2. **Customer Name** - Customer's name
3. **Activation Start Date** - Customer service start date
4. **Activation End Date** - Customer service expiration date

## Tech Stack

- React 18
- TypeScript
- Ant Design 5
- Vite
- Day.js

## Cheapest Deployment (OSS/Static Hosting + GitHub Public Data Repo)

To minimize cost, you can deploy this app as a static site (Aliyun OSS / GitHub Pages / Cloudflare Pages etc),
and store data in a **separate GitHub public repository** as JSON files.

### How it works

- **Audit page** reads JSON via GitHub raw URL (no login required, repo must be public)
- **Accountant** edits data in UI and writes JSON back to GitHub using a **GitHub Token (PAT)**
- This avoids paying for ECS / database

### Create a GitHub public repo for data

Example repo structure:

- `data/payments.json`
- `data/clockins.json`

The app will create these files on first write (if not exists).

### Configure data source (recommended)

Option A: configure at build time via env variables:

- `VITE_DATA_REPO_OWNER`
- `VITE_DATA_REPO_NAME`
- `VITE_DATA_REPO_BRANCH` (default: `main`)
- `VITE_DATA_PAYMENTS_PATH` (default: `data/payments.json`)
- `VITE_DATA_CLOCKINS_PATH` (default: `data/clockins.json`)

Option B: open UI page `/data-source` and save config in browser localStorage (per device).

### Accountant login (write permission)

Open `/login` and paste a **Fine-grained PAT** with minimal permission:

- Repository access: only the data repo
- Permissions: **Contents: Read and write**

## Optional: All-in-one Server via Docker Compose (more cost, real DB)

If you still want a single server deployment (web + api + postgres), see previous Docker setup in this repo:

- `docker-compose.yml`
- `Dockerfile.web`
- `server/`

## Install Dependencies

```bash
npm install
```

## Run Project

```bash
npm run dev
```

The project will start at http://localhost:5173

## Build Project

```bash
npm run build
```

Built files will be in the `dist` directory

## Usage Instructions

1. **Add Customer**: Click the "Add Customer" button in the upper right corner, a new record will be created automatically and enter edit mode
2. **Edit Customer**: Click the "Edit" button in the action column to modify customer information
3. **Save Changes**: Click the "Save" button after editing
4. **Cancel Edit**: Click the "Cancel" button if you don't want to save changes
5. **Delete Customer**: Click the "Delete" button, confirm to delete the customer record
6. **Data Persistence**: All data is automatically saved to browser's localStorage, data will not be lost after refreshing the page

## Notes

- Data is stored in browser's localStorage, clearing browser cache will cause data loss
- It's recommended to regularly export important data for backup
- Only one record can be edited at a time

