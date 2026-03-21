# YouTube Video API Documentation

## Overview
API endpoints to manage YouTube video links with titles. Supports role-based access control for admins and employees.

## Base URL
```
https://nk5.yaatrabuddy.com/api/youtube-videos
```

## Access Control

### Admin Access (Full Access)
- Endpoints: `/api/youtube-videos/admin/*`
- Requires: Admin token
- Can: Create, read, update, delete all videos

### Employee Access (Permission-Based)
- Endpoints: `/api/youtube-videos/*` (except admin routes)
- Requires: Employee token + `content-management` module permissions
- Permissions needed:
  - **Create video**: `content-management` module with `create` action
  - **Update video**: `content-management` module with `update` action
  - **Delete video**: `content-management` module with `delete` action

### Public Access
- Endpoints: `GET /api/youtube-videos`, `GET /api/youtube-videos/:id`
- No authentication required
- Can only view active videos

---

## Endpoints

### 1. Add YouTube Video

#### Admin Version
**Endpoint:** `POST /api/youtube-videos/admin/add`

**Headers:**
```json
{
  "Authorization": "Bearer ADMIN_TOKEN",
  "Content-Type": "application/json"
}
```

#### Employee Version (Requires Permission)
**Endpoint:** `POST /api/youtube-videos/add`

**Headers:**
```json
{
  "Authorization": "Bearer EMPLOYEE_TOKEN",
  "Content-Type": "application/json"
}
```

**Required Permission:** `content-management` module with `create` action

**Request:**
```json
{
  "title": "Luxury Living Rooms",
  "videoLink": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Response:**
```json
{
  "success": true,
  "message": "YouTube video added successfully",
  "data": {
    "_id": "65abc123...",
    "title": "Luxury Living Rooms",
    "videoLink": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "videoId": "dQw4w9WgXcQ",
    "uploaderType": "admin",
    "createdAt": "2026-01-19T10:30:00.000Z"
  }
}
```

**Supported YouTube URL Formats:**
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `http://www.youtube.com/watch?v=VIDEO_ID`

---

### 2. Get All YouTube Videos (Public)
**Endpoint:** `GET /api/youtube-videos`

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `isActive` (optional, true/false)

**Example:**
```
GET /api/youtube-videos?page=1&limit=10&isActive=true
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65abc123...",
      "title": "Luxury Living Rooms",
      "videoLink": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "videoId": "dQw4w9WgXcQ",
      "isActive": true,
      "createdAt": "2026-01-19T10:30:00.000Z",
      "updatedAt": "2026-01-19T10:30:00.000Z"
    },
    {
      "_id": "65abc124...",
      "title": "Project - Doors",
      "videoLink": "https://youtu.be/xyz123",
      "videoId": "xyz123",
      "isActive": true,
      "createdAt": "2026-01-19T09:15:00.000Z",
      "updatedAt": "2026-01-19T09:15:00.000Z"
    }
  ],
  "totalPages": 1,
  "currentPage": 1,
  "totalVideos": 2
}
```

---

### 3. Get Single YouTube Video (Public)
**Endpoint:** `GET /api/youtube-videos/:id`

**Example:**
```
GET /api/youtube-videos/65abc123...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123...",
    "title": "Luxury Living Rooms",
    "videoLink": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "videoId": "dQw4w9WgXcQ",
    "isActive": true,
    "createdAt": "2026-01-19T10:30:00.000Z",
    "updatedAt": "2026-01-19T10:30:00.000Z"
  }
}
```

---

### 4. Update YouTube Video

#### Admin Version
**Endpoint:** `PUT /api/youtube-videos/admin/update/:id`

**Headers:**
```json
{
  "Authorization": "Bearer ADMIN_TOKEN",
  "Content-Type": "application/json"
}
```

#### Employee Version (Requires Permission)
**Endpoint:** `PUT /api/youtube-videos/update/:id`

**Headers:**
```json
{
  "Authorization": "Bearer EMPLOYEE_TOKEN",
  "Content-Type": "application/json"
}
```

**Required Permission:** `content-management` module with `update` action

**Request:**
```json
{
  "title": "Updated Luxury Living Rooms",
  "videoLink": "https://www.youtube.com/watch?v=newVideoId",
  "isActive": true
}
```

**Response:**
---

### 5. Delete YouTube Video

#### Admin Version
**Endpoint:** `DELETE /api/youtube-videos/admin/delete/:id`

**Headers:**
```json
{
  "Authorization": "Bearer ADMIN_TOKEN"
}
```

#### Employee Version (Requires Permission)
**Endpoint:** `DELETE /api/youtube-videos/delete/:id`

**Headers:**
```json
{
  "Authorization": "Bearer EMPLOYEE_TOKEN"
}
```

**Required Permission:** `content-management` module with `delete` action "updatedAt": "2026-01-19T11:00:00.000Z"
  }
}
```

---

### 5. Delete YouTube Video (Admin Only)
**Endpoint:** `DELETE /api/youtube-videos/delete/:id`

**Headers:**
---

### 6. Toggle Video Status

#### Admin Version
**Endpoint:** `PATCH /api/youtube-videos/admin/toggle-status/:id`

**Headers:**
```json
{
  "Authorization": "Bearer ADMIN_TOKEN"
}
```

#### Employee Version (Requires Permission)
**Endpoint:** `PATCH /api/youtube-videos/toggle-status/:id`

**Headers:**
```json
{
  "Authorization": "Bearer EMPLOYEE_TOKEN"
}
```

**Required Permission:** `content-management` module with `update` actionmessage": "YouTube video deleted successfully"
}
```

---

### 6. Toggle Video Status (Admin Only)
**Endpoint:** `PATCH /api/youtube-videos/toggle-status/:id`

**Headers:**
```json
{
  "Authorization": "Bearer ADMIN_TOKEN"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Video activated successfully",
  "data": {
    "_id": "65abc123...",
    "isActive": true
  }
}
```

---

## CURL Examples

### Add Video
```bash
curl --location 'https://nk5.yaatrabuddy.com/api/youtube-videos/add' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer ADMIN_TOKEN' \
--data '{
  "title": "Luxury Living Rooms",
  "videoLink": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}'
```

### Get All Videos
```bash
curl --location 'https://nk5.yaatrabuddy.com/api/youtube-videos?page=1&limit=10'
```

### Get Single Video
```bash
curl --location 'https://nk5.yaatrabuddy.com/api/youtube-videos/65abc123...'
```

### Update Video
```bash
curl --location --request PUT 'https://nk5.yaatrabuddy.com/api/youtube-videos/update/65abc123...' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer ADMIN_TOKEN' \
--data '{
  "title": "Updated Title",
  "videoLink": "https://www.youtube.com/watch?v=newId"
}'
```

### Delete Video
```bash
curl --location --request DELETE 'https://nk5.yaatrabuddy.com/api/youtube-videos/delete/65abc123...' \
--header 'Authorization: Bearer ADMIN_TOKEN'
```

### Toggle Status
```bash
curl --location --request PATCH 'https://nk5.yaatrabuddy.com/api/youtube-videos/toggle-status/65abc123...' \
--header 'Authorization: Bearer ADMIN_TOKEN'
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Title and video link are required"
}
```

### 400 Invalid URL
```json
{
  "success": false,
  "message": "YoutubeVideo validation failed: videoLink: Invalid YouTube URL format"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided"
}
```

### 403 Forbidden (No Permission)
```json
{
  "success": false,
  "message": "Access denied. No create permission for content-management module."
}
```

### 403 Forbidden (Inactive Role)
```json
{
  "success": false,
  "message": "Access denied. Role inactive or not assigned."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "YouTube video not found"
}
```

---

## Role Setup

### Creating Content Manager Role

To allow employees to manage YouTube videos, create a role with `content-management` permissions:

```bash
curl --location 'https://nk5.yaatrabuddy.com/admin/roles/create' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer ADMIN_TOKEN' \
--data '{
  "name": "Content Manager",
  "description": "Can manage YouTube videos and blog content",
  "permissions": [
    {
      "module": "content-management",
      "actions": ["create", "read", "update", "delete"]
    },
    {
      "module": "blogs",
      "actions": ["create", "read", "update"]
    }
  ]
}'
```

### Available Permissions for Content Management
- `create` - Add new YouTube videos
- `read` - View YouTube videos (public access doesn't need this)
- `update` - Edit videos, toggle status
- `delete` - Remove videos

---

## Frontend Integration

### Display YouTube Video
Use the `videoId` field to embed videos:

```html
<!-- React/HTML -->
<iframe 
  width="560" 
  height="315" 
  src={`https://www.youtube.com/embed/${video.videoId}`}
  frameborder="0" 
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
  allowfullscreen
></iframe>
```

### React Component Example
```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function YoutubeVideos() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get('https://nk5.yaatrabuddy.com/api/youtube-videos');
        setVideos(response.data.data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };
    fetchVideos();
  }, []);

  return (
    <div className="video-grid">
      {videos.map(video => (
        <div key={video._id} className="video-card">
          <h3>{video.title}</h3>
          <iframe
            width="100%"
            height="315"
            src={`https://www.youtube.com/embed/${video.videoId}`}
            frameBorder="0"
            allowFullScreen
          />
        </div>
      ))}
    </div>
  );
}
```

---

## Database Schema

```javascript
{
  title: String (required),
  videoLink: String (required, validated YouTube URL),
  videoId: String (auto-extracted),
  uploadedBy: ObjectId (optional, references Admin),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Notes

1. **Video ID Extraction**: The system automatically extracts video ID from YouTube URLs
2. **URL Validation**: Only valid YouTube URLs are accepted
3. **Admin Only**: Add, update, delete operations require admin authentication
4. **Public Access**: Anyone can view active videos
5. **Pagination**: Use page and limit parameters for large datasets
