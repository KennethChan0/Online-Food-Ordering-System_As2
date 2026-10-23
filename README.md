**Onlie Food Ordering System Overview:The application is designed to help customer and restaurant improve efficient. The system includes many features to achieve the goals. For example, menu management helps to organise the menu items, order management provides convinent ways to order food, restaurant review management allows customer to leave feedbacks to restaurants, user profile management allows customers and restaurant to manage their account and table reservation management helps restaurant to check customers booking effectively. **

**This apps **contain** the following features:**

* Menu Management (Old feature)
* Order Management
* Restaurant Review Management
* User Profile Management
* Table Reservation Management


**Setup**
Node.js
npm
MongoDB Atlas account or local MongoDB database
Git


**Architecture summary**
Online-Food-Ordering-System_As2/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions workflow
├── backend/
│   ├── config/                    # MongoDB connection
│   ├── controllers/               # Request and business logic
│   ├── middleware/                # Authentication and validation
│   ├── models/                    # MongoDB data models
│   ├── routes/                    # API endpoints
│   ├── strategies/                # Profile-related rules
│   ├── test/                      # Backend tests
│   ├── server.js                  # Express application entry point
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/            # Reusable interface components
│   │   ├── context/               # Authentication and cart state
│   │   ├── pages/                 # Application pages
│   │   ├── App.js                 # Frontend routes
│   │   ├── axiosConfig.jsx        # Backend API connection
│   │   └── index.js
│   └── package.json
├── package.json                   # Root installation and start scripts
└── README.md


**Known Limitations**
* An EC2 public IP may change when an instance is stopped and started, so a deployment using that IP may need to be updated.
* The system currently supports one restaurant, although more than one restaurant account may exist.
* CI/CD Github actions is running on a separate self-hosted EC2 instance

**Future Improvement**
* Support multiple restaurants, with menu items, orders and staff access separated by restaurant.
* EC2 could be running without automatically stopping
* CI/CD could run on the instances that deployed the project instead of seperating ec2


**Deployment URL**
  baseURL: 'http://13.210.184.184:5001',
  EC2 public IP change after it closes.

