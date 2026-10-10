**Onlie Food Ordering Overview:The application is designed to help customer and restaurant improve efficient in terms of making order(not avaliable now) and menu management manage by providing a user-friendly interface for creating, viewing, updating, and deleting menu. It includes essential features such as secure user authentication, allowing individuals to sign up and log in to their accounts, as well as role base selection to seperate role authutication to the application. With built-in validation such as input field validation and email validation, the application ensures a seamless user experience while enhancing productivity. Restaurants can create, view, edit, and delete menu items while customers can only register, log in, and view the restaurant menu. **

**This apps **contain** the following features:**

* Role-based signup
* Login
* Logout
* Add Menu items
* View Menu 
* Update Menu items
* Delete Menu items


**Setup**
Node.js
npm
MongoDB Atlas account or local MongoDB database
Git


**Architecture summary**
taskmanager/
├── backend/                         
│   ├── config/                      
│   ├── controllers/                 
│   ├── middleware/                  
│   ├── models/                      
│   ├── routes/ 
│   ├── server.js 
│   ├── .env    
│   └── package.json 
│
├── frontend/                       
│   ├── src/                        
│   │   ├── components/              
│   │   ├── context/                
│   │   ├── pages/                  
│   │   ├── App.js                   
│   │   ├── axiosConfig.js          
│   │   └── index.js                 
│   ├── public/                    
│   ├── tailwind.config.js        
│   ├── .gitignore                
│   └── package.json       
│
├── package.json             
└── README.md         


**Known Limitations**
* It only support one restaurant with multiple restaurant accouts
* The application does not implement order functions
* photo can only use URL but not uploading images
* Customer restrictions of updating, deleting and adding menu items are currently applied in the frontend only.

**Future Improvement**
* Support more than one restaurants
* Image upload function support
* add server-side authorization
* add order function 


**Deployment URL**
  baseURL: 'http://13.210.184.184:5001',
  EC2 public IP change after it closes.


Testing for jira linkage