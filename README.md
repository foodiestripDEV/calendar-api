# Google Calendar & Tasks API Setup and Usage
# keep them important on developers@foodiestrip.com/foodiesrtrip/calendar-api/service account credentials
<!-- public url : https://calendar.google.com/calendar/embed?src=developers%40foodiestrip.com&ctz=Europe%2FIstanbul  -->
<!-- embed code :
<iframe src="https://calendar.google.com/calendar/embed?src=developers%40foodiestrip.com&ctz=Europe%2FIstanbul" style="border: 0" width="800" height="600" frameborder="0" scrolling="no"></iframe> -->

# Google Calendar & Tasks API - Complete Documentation

## 🎯 Project Overview

### **Purpose**
A secure, multi-project backend API for Google Calendar and Tasks integration. Built with Express.js and enterprise-grade security features.

### **Key Features**
- ✅ **Google Calendar Integration** - Create, read, update, delete events
- ✅ **Google Tasks Integration** - Manage task lists and tasks
- ✅ **Multi-Project Support** - Different API keys for different projects
- ✅ **Security First** - Comprehensive security middleware stack
- ✅ **General & Private Events** - Support for both event types
- ✅ **Service Account Authentication** - Server-to-server communication

### **Use Cases**
1. **Company Event Management** - Create events visible to all employees
2. **Private Meeting Coordination** - Restricted access events
3. **Task Management Integration** - Add tasks to Google Tasks
4. **Multi-Project Backend** - Single API serving multiple applications

---

## 🏗️ Architecture

### **Technology Stack**
- **Runtime:** Node.js v18+
- **Framework:** Express.js v4.21.2
- **Authentication:** Google Service Account
- **Validation:** Joi v17.13.3
- **Security:** Helmet, CORS, Rate Limiting
- **APIs:** Google Calendar API v3, Google Tasks API v1

### **Project Structure**
```
calendar-api/
├── server.js                 # Main application entry point
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables
├── .gitignore               # Git ignore rules
├── config/
│   └── service-account-key.json  # Google Service Account credentials
├── controllers/
│   ├── calendarController.js # Calendar business logic
│   └── tasksController.js    # Tasks business logic
├── routes/
│   ├── calendar.js          # Calendar API routes
│   └── tasks.js             # Tasks API routes
├── middleware/
│   ├── security.js          # Authentication & rate limiting
│   ├── sanitization.js      # Input sanitization
│   ├── errorHandling.js     # Error handling
│   └── validation.js        # Request validation schemas
├── lib/
│   ├── google-auth.js       # Google authentication setup
│   ├── calendar-service.js  # Calendar API service layer
│   └── tasks-service.js     # Tasks API service layer
└── utils/
    └── api-key-generator.js  # Utility for generating API keys
```

---

## 🔐 Security Features

### **Multi-Layer Security Stack**

#### **1. Request Pipeline Security**
```javascript
Request → Security Headers → IP Whitelist → CORS → Rate Limiting 
       → Input Sanitization → API Key Auth → Route Handler
```

#### **2. Authentication & Authorization**
- **API Key Authentication** - 64-character hex keys
- **Rate Limiting** - 50 requests per 15 minutes per API key
- **IP Whitelisting** - Optional IP restriction
- **Request ID Tracking** - Unique ID for each request

#### **3. Input Protection**
- **XSS Prevention** - HTML entity escaping
- **SQL Injection Protection** - Pattern-based detection
- **Request Size Limiting** - 1MB body limit
- **String Length Validation** - 10,000 character limit

#### **4. Security Headers**
- **Content Security Policy** - Script and style restrictions
- **HSTS** - Force HTTPS connections
- **X-Frame-Options** - Clickjacking protection
- **X-Content-Type-Options** - MIME type sniffing prevention

---

## **Base URL**
```
http://localhost:3000/api
```

## 🔑 Authentication

### **API Key System**

#### **Generate New API Key**
```bash
openssl rand -hex 32
```

#### **Add to Environment**
Add new keys to `.env` file:
```bash
VALID_API_KEYS=key1,key2,key3,new-key
```


### **Google Service Account Setup**

#### **1. Create Service Account**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services > Credentials**
3. Click **Create Credentials > Service Account**
4. Fill in details:
   - Name: `calendar-tasks-service`
   - Description: `Backend API for Calendar and Tasks`
5. Assign role: **Editor**
6. Create and download JSON key

#### **2. Enable Required APIs**
Enable these APIs in Google Cloud Console:
- Google Calendar API
- Google Tasks API

#### **3. Configure Calendar Sharing**
1. Open [Google Calendar](https://calendar.google.com)
2. Go to calendar settings
3. Share with service account email:
   ```
   service-account-name@project-id.iam.gserviceaccount.com
   ```
4. Grant permission: **Make changes to events**

---

## 🧪 Testing

### **Manual Testing**

#### **1. Start Server**
```bash
npm start
```

#### **2. Test Health Endpoint**
```bash
curl http://localhost:3000/health
# Expected: {"status":"OK","message":"Server is healthy","timestamp":"..."}
```

#### **3. Test Authentication**
```bash
# Without API key (should fail)
curl http://localhost:3000/api/tasks/
# Expected: {"success":false,"error":"API key required"}

# With valid API key (should work)
curl -H "X-API-Key: your-key" http://localhost:3000/api/tasks/
# Expected: {"success":true,"taskLists":[...]}
```


### **Postman Collection**
Import the included `postman-collection.json` for comprehensive API testing.

### **Production Checklist**
- ✅ Secure API keys generated
- ✅ CORS origins configured
- ✅ Rate limiting tuned for production load
- ✅ Google Service Account properly configured
- ✅ SSL/HTTPS enabled
- ✅ Log aggregation setup
- ✅ Health monitoring configured
- ✅ Backup strategy for configuration

---


## 📊 API Rate Limits & Quotas

### **Application Rate Limits**
- **General Rate Limit:** 50 requests per 15 minutes per IP
- **API Key Rate Limit:** 50 requests per 15 minutes per API key
- **Request Body Size:** 1MB maximum
- **String Length:** 10,000 characters maximum

### **Google API Quotas**
- **Calendar API:** 1,000,000 requests per day
- **Tasks API:** 50,000 requests per day
- **Rate Limit:** 10 requests per second per user

### **Optimization Tips**
1. **Batch Operations:** Group multiple events/tasks when possible
2. **Caching:** Implement caching for frequently accessed data
3. **Error Handling:** Implement exponential backoff for quota errors
4. **Monitoring:** Track API usage to avoid quota exhaustion

---


## 📈 Scaling Considerations
- redis can be used different api keys and caching, postql or mongoDB for flexibe db options.
- microservice for different services