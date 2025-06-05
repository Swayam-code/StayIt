# WanderLust - Vacation Rental Platform
![image](https://github.com/user-attachments/assets/b4e22c16-70a9-469f-a96f-76765aa956f6)

WanderLust is a full-stack vacation rental web application built with Node.js, Express, MongoDB, and EJS. It allows users to browse, search, and book unique accommodations around the world.

## 🚀 Features

- **User Authentication**
  - Secure signup and login with password hashing
  - User profile management
  - Password reset functionality

- **Listings**
  - Browse and search vacation rentals
  - Detailed property views with images
  - Filter by categories (Beach, Mountain, City, etc.)
  - Price filtering and sorting
  - Tax-inclusive pricing toggle

- **User Interactions**
  - Leave reviews and ratings
  - Add properties to wishlist
  - View booking history

- **Responsive Design**
  - Mobile-first approach
  - Fully responsive layout across all devices
  - Intuitive navigation

## 🛠️ Tech Stack

### Frontend
- **EJS** - Templating engine
- **Bootstrap 5** - Responsive UI components
- **Font Awesome** - Icons
- **Leaflet.js** - Interactive maps
- **Custom CSS** - For styling and animations

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Passport.js** - Authentication
- **Cloudinary** - Image storage
- **Mapbox** - Geocoding and maps

### Development Tools
- **Nodemon** - Development server
- **dotenv** - Environment variables
- **Express-Session** - Session management
- **Connect-Flash** - Flash messages
- **Method-Override** - HTTP method override

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)
- Mapbox API key (for maps and geocoding)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/wanderlust.git
   cd wanderlust
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```
   ATLASDB_URL=your_mongodb_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_KEY=your_cloudinary_key
   CLOUDINARY_SECRET=your_cloudinary_secret
   SECRET=your_session_secret
   ```

4. **Run the application**
   ```bash
   node app.js
   ```
   Or with nodemon for development:
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:8080`

## 📂 Project Structure

```
wanderlust/
├── config/               # Configuration files
├── controllers/          # Route controllers
├── middleware/           # Custom middleware
├── models/               # Database models
├── public/               # Static files
│   ├── css/             # Stylesheets
│   ├── js/              # Client-side JavaScript
│   └── images/          # Static images
├── routes/               # Route definitions
├── utils/                # Utility functions
├── views/                # EJS templates
│   ├── includes/        # Reusable components
│   ├── layouts/         # Layout templates
│   ├── listings/        # Listing-related views
│   └── users/           # User-related views
├── .env                 # Environment variables
├── .gitignore           # Git ignore file
├── app.js               # Main application file
├── package.json         # Project dependencies
└── README.md            # Project documentation
```

## 🌟 Key Features Implementation

### User Authentication
- Implemented using Passport.js with local strategy
- Secure password hashing with bcrypt
- Session management with express-session

### Image Upload
- Cloudinary integration for image storage
- Client-side image compression before upload
- Responsive image display with lazy loading

### Search & Filtering
- Full-text search functionality
- Category-based filtering
- Price range filtering
- Location-based search using Mapbox Geocoding

### Interactive Maps
- Property locations displayed on Leaflet maps
- Interactive markers with popups
- Geospatial queries for nearby listings

## 🛡️ Security Features

- **Authentication & Authorization**
  - Secure password hashing
  - Protected routes
  - CSRF protection
  - Rate limiting

- **Data Validation**
  - Server-side validation
  - Input sanitization
  - XSS protection

- **Session Security**
  - HTTP-only cookies
  - Secure session management
  - Session expiration

## 📱 Responsive Design

- Mobile-first approach
- Responsive navigation
- Adaptive image loading
- Touch-friendly UI elements
- Optimized for all screen sizes

## 🚀 Deployment

The application can be deployed to platforms like:
- Heroku
- Render
- Railway
- AWS Elastic Beanstalk

### Environment Variables for Production
Ensure these are set in your production environment:
- `NODE_ENV=production`
- `ATLASDB_URL` - MongoDB connection string
- `CLOUDINARY_*` - Cloudinary credentials
- `SECRET` - Session secret

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Bootstrap](https://getbootstrap.com/) for the responsive UI components
- [Font Awesome](https://fontawesome.com/) for the beautiful icons
- [Leaflet](https://leafletjs.com/) for interactive maps
- [Cloudinary](https://cloudinary.com/) for image storage and manipulation

---

Made with ❤️ by Swayam
