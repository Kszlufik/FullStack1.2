Playtime POI Web Application

Overview

Playtime is a web application that allows users to create, view, and manage Points of Interest (POIs). Users can add markers to POIs, upload images, and explore locations. The application is built using Node.js, Hapi.js, and Handlebars.js.

Features

User Authentication (Signup/Login/Logout)

Create and View POIs

Add Markers to POIs (Latitude/Longitude)

Upload Images for POIs

Add to POI to Favourites

ADD a review

Leave a rating

Check public POIs from any account

Ability to access admin page promote/delete users. 

see the map on the POI.

Session-Based Authentication using JWT strategy 

Hashing and Salting passwords 

Technologies Used

Backend: Node.js, Hapi.js, MongoDB (JSON-based storage for now)

Frontend: Handlebars.js, Bulma CSS

File Uploads: Multipart handling with Hapi.js

Authentication: JWT based autentication

Installation Guide

Prerequisites

Ensure you have the following installed:

Node.js (v14+ recommended)

npm (Node Package Manager)

MongoDB (if using a database for persistent storage)

Steps to Run Locally

Install Dependencies

npm install

Set Up Environment Variables
Create a .env file in the root directory:

PORT=3000
SESSION_SECRET=your-secret-key

Start the Server

npm start

The server will run on http://localhost:3000.

Project Structure

playtime-poi/
│── src/
│   ├── controllers/        # Business logic for POIs, authentication
│   ├── models/            # Data storage logic (POI store, user store)
│   ├── views/             # Handlebars templates
│   ├── routes/            # Web routes (Hapi.js endpoints)
│   ├── server.js          # Main server file
│── public/
│   ├── uploads/           # Image uploads
│── package.json
│── README.md

Usage Guide

User Authentication

Signup/Login: Users can register and log in to manage their POIs.

Session-Based Auth: Users stay logged in via cookies.

POI Management

View All POIs: Users can browse and view details of different POIs.

Create POI: Users can create a POI with a title and description.

Add Markers: Users can add latitude & longitude markers to their POIs.

Upload Images: Each POI supports image uploads.

Add POI to favourites we can now add favourite POI and display it in the favourites view.

Leave a review users can now leave a review on a POI 

you can now leave a star rating also to give us a little idea of how much you enjoyed the POI

Discussions tab is also open. LEave a comment and engage with others chat over natre, trails and points of interest.

make your pois visible to others or not by using make public feature.

If y ou have an admin privilage promote or delete other users. 

File Uploads

Allowed File Types: JPEG, PNG, GIF

Max File Size: 10MB

Storage: Uploaded files are saved in public/uploads/

Known Issues & Future Improvements

Improve Image Validation: Add frontend validation for file size and type.

Database Integration: Transition from JSON-based storage to MongoDB.

About View accessible only when logged in.

Enhanced UI/UX: Improve styling and user experience.

Add weather API so users can see the weather of the given region

Add maps api so users can place markers manually.



---

## 💻 Getting Started

### Prerequisites

- Node.js v16+ installed
- npm (Node package manager)

### Installation

1. Clone the repo

```bash
git clone https://github.com/your-username/playtime.git

npm install

set up .env file at the root and use this inside :
PORT=3000
COOKIE_PASSWORD=your-secure-cookie-password
JWT_SECRET=your-secure-jwt-secret
npm start



