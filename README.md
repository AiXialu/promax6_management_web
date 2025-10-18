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

