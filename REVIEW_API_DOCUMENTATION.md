# Property Review API Documentation

## Overview
The Review API allows users to post reviews and ratings on properties, get review statistics, and manage their reviews.

---

## Base URL
```
/api/reviews
```

---

## Authentication
Most endpoints require JWT token authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## API Endpoints

### 1. Post a Review
**POST** `/api/reviews`

Post a new review for a property.

**Authentication:** Required (User)

**Request Body:**
```json
{
  "propertyId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "rating": 4.5,
  "title": "Great Property!",
  "comment": "This is an excellent property with great amenities.",
  "photos": ["url1.jpg", "url2.jpg"],
  "aspects": {
    "location": 5,
    "amenities": 4,
    "valueForMoney": 4,
    "connectivity": 5
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Review posted successfully.",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
    "property": "65f1a2b3c4d5e6f7g8h9i0j1",
    "user": {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "fullName": "John Doe",
      "avatar": "avatar.jpg"
    },
    "rating": 4.5,
    "title": "Great Property!",
    "comment": "This is an excellent property with great amenities.",
    "photos": ["url1.jpg", "url2.jpg"],
    "aspects": {
      "location": 5,
      "amenities": 4,
      "valueForMoney": 4,
      "connectivity": 5
    },
    "isVerified": false,
    "isApproved": true,
    "helpfulCount": 0,
    "createdAt": "2026-02-10T10:00:00.000Z",
    "updatedAt": "2026-02-10T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Property ID, rating, and comment are required
- `400` - Rating must be between 1 and 5
- `401` - User authentication required
- `404` - Property not found
- `400` - User already reviewed this property

---

### 2. Get Review Count for a Property
**GET** `/api/reviews/property/:propertyId/count`

Get the total number of reviews and rating statistics for a property.

**Authentication:** Not Required (Public)

**Parameters:**
- `propertyId` (URL parameter) - The ID of the property

**Response (200):**
```json
{
  "success": true,
  "data": {
    "propertyId": "65f1a2b3c4d5e6f7g8h9i0j1",
    "totalReviews": 25,
    "averageRating": 4.2,
    "ratingDistribution": {
      "5": 10,
      "4": 8,
      "3": 5,
      "2": 1,
      "1": 1
    }
  }
}
```

**Error Responses:**
- `400` - Property ID is required
- `404` - Property not found

---

### 3. Get All Reviews for a Property
**GET** `/api/reviews/property/:propertyId`

Get all reviews for a specific property with pagination.

**Authentication:** Not Required (Public)

**Parameters:**
- `propertyId` (URL parameter) - The ID of the property

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Number of reviews per page
- `sortBy` (optional, default: "createdAt") - Field to sort by (createdAt, rating, helpfulCount)
- `order` (optional, default: "desc") - Sort order (asc or desc)

**Example:**
```
GET /api/reviews/property/65f1a2b3c4d5e6f7g8h9i0j1?page=1&limit=10&sortBy=rating&order=desc
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
        "property": "65f1a2b3c4d5e6f7g8h9i0j1",
        "user": {
          "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
          "fullName": "John Doe",
          "avatar": "avatar.jpg"
        },
        "rating": 4.5,
        "title": "Great Property!",
        "comment": "This is an excellent property with great amenities.",
        "photos": ["url1.jpg", "url2.jpg"],
        "aspects": {
          "location": 5,
          "amenities": 4,
          "valueForMoney": 4,
          "connectivity": 5
        },
        "helpfulCount": 5,
        "createdAt": "2026-02-10T10:00:00.000Z",
        "updatedAt": "2026-02-10T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalReviews": 25,
      "limit": 10
    }
  }
}
```

**Error Responses:**
- `400` - Property ID is required
- `404` - Property not found

---

### 4. Update a Review
**PUT** `/api/reviews/:reviewId`

Update an existing review (only by the review author).

**Authentication:** Required (User)

**Parameters:**
- `reviewId` (URL parameter) - The ID of the review

**Request Body:**
```json
{
  "rating": 5,
  "title": "Updated: Excellent Property!",
  "comment": "Updated comment with more details.",
  "photos": ["url1.jpg", "url2.jpg", "url3.jpg"],
  "aspects": {
    "location": 5,
    "amenities": 5,
    "valueForMoney": 5,
    "connectivity": 5
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Review updated successfully.",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
    "property": "65f1a2b3c4d5e6f7g8h9i0j1",
    "user": {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "fullName": "John Doe",
      "avatar": "avatar.jpg"
    },
    "rating": 5,
    "title": "Updated: Excellent Property!",
    "comment": "Updated comment with more details.",
    "photos": ["url1.jpg", "url2.jpg", "url3.jpg"],
    "aspects": {
      "location": 5,
      "amenities": 5,
      "valueForMoney": 5,
      "connectivity": 5
    },
    "helpfulCount": 5,
    "createdAt": "2026-02-10T10:00:00.000Z",
    "updatedAt": "2026-02-10T11:00:00.000Z"
  }
}
```

**Error Responses:**
- `401` - User authentication required
- `404` - Review not found
- `403` - You can only update your own reviews
- `400` - Rating must be between 1 and 5

---

### 5. Delete a Review
**DELETE** `/api/reviews/:reviewId`

Delete a review (only by the review author).

**Authentication:** Required (User)

**Parameters:**
- `reviewId` (URL parameter) - The ID of the review

**Response (200):**
```json
{
  "success": true,
  "message": "Review deleted successfully."
}
```

**Error Responses:**
- `401` - User authentication required
- `404` - Review not found
- `403` - You can only delete your own reviews

---

### 6. Get My Reviews
**GET** `/api/reviews/my-reviews`

Get all reviews posted by the authenticated user.

**Authentication:** Required (User)

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Number of reviews per page

**Example:**
```
GET /api/reviews/my-reviews?page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
        "property": {
          "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
          "propertyLocation": "Mumbai, Maharashtra",
          "propertyTitle": "Luxury Apartment",
          "photosAndVideo": ["photo1.jpg"],
          "price": 5000000
        },
        "rating": 4.5,
        "title": "Great Property!",
        "comment": "This is an excellent property with great amenities.",
        "helpfulCount": 5,
        "createdAt": "2026-02-10T10:00:00.000Z",
        "updatedAt": "2026-02-10T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalReviews": 3,
      "limit": 10
    }
  }
}
```

**Error Responses:**
- `401` - User authentication required

---

### 7. Mark Review as Helpful
**POST** `/api/reviews/:reviewId/helpful`

Mark or unmark a review as helpful. Toggle functionality - if already marked, it will unmark.

**Authentication:** Required (User)

**Parameters:**
- `reviewId` (URL parameter) - The ID of the review

**Response (200):**
```json
{
  "success": true,
  "message": "Review marked as helpful.",
  "data": {
    "helpfulCount": 6,
    "isMarkedHelpful": true
  }
}
```

**Or if unmarking:**
```json
{
  "success": true,
  "message": "Review unmarked as helpful.",
  "data": {
    "helpfulCount": 5,
    "isMarkedHelpful": false
  }
}
```

**Error Responses:**
- `401` - User authentication required
- `404` - Review not found

---

### 8. Get Review Statistics (Admin Only)
**GET** `/api/reviews/stats`

Get overall review statistics for the platform.

**Authentication:** Required (Admin)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalReviews": 150,
    "approvedReviews": 145,
    "pendingReviews": 5,
    "verifiedReviews": 80,
    "averageRating": 4.25,
    "recentReviews": [
      {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
        "user": {
          "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
          "fullName": "John Doe",
          "avatar": "avatar.jpg"
        },
        "property": {
          "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
          "propertyLocation": "Mumbai, Maharashtra",
          "propertyTitle": "Luxury Apartment"
        },
        "rating": 4.5,
        "comment": "This is an excellent property...",
        "createdAt": "2026-02-10T10:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**
- `401` - Admin authentication required

---

## Review Schema

### Review Object:
```javascript
{
  property: ObjectId (ref: Property),
  user: ObjectId (ref: User),
  rating: Number (1-5),
  title: String (max 100 chars),
  comment: String (max 1000 chars, required),
  photos: [String],
  aspects: {
    location: Number (1-5),
    amenities: Number (1-5),
    valueForMoney: Number (1-5),
    connectivity: Number (1-5)
  },
  isVerified: Boolean (default: false),
  isApproved: Boolean (default: true),
  helpfulCount: Number (default: 0),
  helpfulBy: [ObjectId (ref: User)],
  response: {
    text: String,
    respondBy: ObjectId (ref: Admin),
    respondedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## Testing with cURL

### 1. Post a Review
```bash
curl -X POST https://backend.blacksquare.estate/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "propertyId": "65f1a2b3c4d5e6f7g8h9i0j1",
    "rating": 4.5,
    "title": "Great Property!",
    "comment": "This is an excellent property with great amenities."
  }'
```

### 2. Get Review Count
```bash
curl -X GET https://backend.blacksquare.estate/api/reviews/property/65f1a2b3c4d5e6f7g8h9i0j1/count
```

### 3. Get Property Reviews
```bash
curl -X GET "https://backend.blacksquare.estate/api/reviews/property/65f1a2b3c4d5e6f7g8h9i0j1?page=1&limit=10"
```

### 4. Update a Review
```bash
curl -X PUT https://backend.blacksquare.estate/api/reviews/65f1a2b3c4d5e6f7g8h9i0j2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "rating": 5,
    "comment": "Updated comment"
  }'
```

### 5. Delete a Review
```bash
curl -X DELETE https://backend.blacksquare.estate/api/reviews/65f1a2b3c4d5e6f7g8h9i0j2 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Get My Reviews
```bash
curl -X GET https://backend.blacksquare.estate/api/reviews/my-reviews \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 7. Mark Review as Helpful
```bash
curl -X POST https://backend.blacksquare.estate/api/reviews/65f1a2b3c4d5e6f7g8h9i0j2/helpful \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 8. Get Review Stats (Admin)
```bash
curl -X GET https://backend.blacksquare.estate/api/reviews/stats \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

## Features

✅ **Post Reviews** - Users can post reviews with ratings and comments  
✅ **Review Count** - Get total reviews and rating distribution for properties  
✅ **Average Rating** - Automatically calculated average rating  
✅ **Rating Distribution** - Shows breakdown of ratings (5-star, 4-star, etc.)  
✅ **Update/Delete** - Users can update or delete their own reviews  
✅ **Pagination** - All list endpoints support pagination  
✅ **Filtering & Sorting** - Sort by date, rating, or helpful count  
✅ **Helpful Count** - Users can mark reviews as helpful  
✅ **Aspects Rating** - Rate different aspects (location, amenities, etc.)  
✅ **Photo Upload** - Support for review photos  
✅ **One Review per User** - Users can only post one review per property  
✅ **Admin Statistics** - Comprehensive review analytics for admins  

---

## Error Handling

All endpoints return errors in the following format:
```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error information"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Resource created successfully
- `400` - Bad request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Resource not found
- `500` - Internal server error

---

## Notes

1. **One Review per Property**: Each user can only post one review per property. If they try to post again, they'll receive an error message suggesting they update their existing review.

2. **Authentication**: Most endpoints require user authentication via JWT token.

3. **Pagination**: Default pagination is 10 items per page. Maximum recommended limit is 50.

4. **Rating Validation**: Ratings must be between 1 and 5. Decimal values are supported.

5. **Auto-approval**: Reviews are auto-approved by default. Admins can change the `isApproved` flag if manual review is needed.

6. **Review Photos**: Photo URLs should be uploaded separately and then included in the review.

7. **Helpful Count**: The helpful count feature allows users to mark reviews that they find useful.

---

## Future Enhancements

- [ ] Admin endpoints to approve/reject reviews
- [ ] Verified purchase badge
- [ ] Review moderation queue
- [ ] Report inappropriate reviews
- [ ] Review response from property owners
- [ ] Sort by most helpful
- [ ] Filter by rating range
- [ ] Real-time notifications for new reviews
