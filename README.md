# Coderover

![Coderover Logo](/Frontend/public/logo.png)

## Live Link  
[Link 1 - Vercel](https://code-rover-frontend.vercel.app/)  
[Link 2 - OnRender](https://coderover-frontend.onrender.com/)  

**Note:** The Docker-based *Run Code* and *Submit Code* functionalities are currently not available in the deployed version. To access these features, please run the project locally with Docker configured.

## Overview

Coderover is a full-stack web application designed for remote coding interviews and solving challenging problems. It features a robust code execution engine powered by Docker and real-time collaboration capabilities using Socket.io, enabling interviewers and interviewees to code together in separate rooms.

Built on the MERN stack (MongoDB, Express, React, Node.js), Coderover offers secure authentication, asynchronous code execution, and real-time communication for a seamless coding experience.

## Technologies Used

- **Docker**: For containerization to isolate code execution
- **Socket.io**: Real-time communication for collaborative coding
- **Node.js and Express**: Backend API development
- **MongoDB**: Database for storing user data and problem sets
- **React.js**: Frontend with a modern and responsive user interface
- **Redux**: State management 
- **Tailwind**: Designing UI
  
## Features

- **Code Sanitization**: Each code execution request is sanitized to prevent harmful operations
- **Dockerized Code Execution**: Separate Docker containers for each code execution, ensuring isolation from the host system
- **Real-time Collaboration**: Socket.io enables interviewers and interviewees to join rooms for real-time collaboration
- **Asynchronous Execution**: The server handles multiple code execution requests simultaneously without blocking other users
- **Secure Authentication**: User login and registration secured with JWT tokens
  
## Screenshots

Here are some screenshots of Coderover in action:

### Home Page

![Home](/Screenshots/home.png)

### Live Interview

![Live Interview - Video Chat](/Screenshots/vc.png)

![Live Interview - Code Editor](/Screenshots/vc1.png)

![Live Interview - Problem Description](/Screenshots/vc2.png)

![Live Interview - Problem Description](/Screenshots/vc3.png)

### User Profile

![Profile Overview](/Screenshots/profile.png)

![Profile Details](/Screenshots/profile2.png)

### Problem Set

![Problem Set List](/Screenshots/problemset.png)

### Problem View

![Problem Description](/Screenshots/problem.png)

![Problem Solution](/Screenshots/problem2.png)

### Discussion Forum
![Discuss Page](/Screenshots/discuss.png)
## How to Run the Project Locally


### Clone the Repository

```bash
git clone https://github.com/yourusername/coderover.git
cd coderover
```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend/
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory and add the following variables:
   ```
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    PORT=desired_port_for_backend
    CORS_ORIGIN=*
    ACCESS_TOKEN_SECRET=your_secret
    ACCESS_TOKEN_EXPIRY=days
    REFRESH_TOKEN_SECRET=your_secret
    REFRESH_TOKEN_EXPIRY=days
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Frontend/
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory and add the following variables:
   ```
   VITE_BACKEND_URL=http://localhost:8000/api/v1
   VITE_BACKEND_URL_FOR_SOCKET=http://localhost:8000
   ```

4. Start the frontend application:
   ```bash
   npm run dev
   ```

### Docker Setup for Code Execution

1. Open Docker desktop
2. Container will get formed automatically and destroyed after code execution


You can now register or log in, create coding rooms, and collaborate in real-time!


## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make to Coderover are greatly appreciated.

If you have any ideas for new features, bug fixes, or improvements, feel free to submit a pull request. Here's how you can get started:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## Author

**Pranav Jarande**

- Email: jarandepranav2004@gmail.com

For questions, feedback, or collaboration opportunities, feel free to reach out!
