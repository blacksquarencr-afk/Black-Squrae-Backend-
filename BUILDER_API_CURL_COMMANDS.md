# Builder API - CURL Commands

## Base URL
```
http://localhost:5000/api/builders
```

---

## 1. Create a New Builder (with image)

### cURL Command:
```bash
curl -X POST http://localhost:5000/api/builders/create \
  -F "builderName=Prestige Constructions" \
  -F "builderImage=@/path/to/image.jpg"
```

### Request Body (Form Data):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| builderName | string | Yes | Name of the builder |
| builderImage | file | No | Builder logo/image (jpg, png, etc.) |

### Success Response (201):
```json
{
  "message": "Builder created successfully",
  "builder": {
    "_id": "507f1f77bcf86cd799439011",
    "builderName": "Prestige Constructions",
    "builderImage": "uploads/builders/1707225600000-image.jpg",
    "isActive": true,
    "createdAt": "2026-02-06T10:30:00.000Z",
    "updatedAt": "2026-02-06T10:30:00.000Z"
  }
}
```

---

## 2. Create Builder (without image)

### cURL Command:
```bash
curl -X POST http://localhost:5000/api/builders/create \
  -H "Content-Type: application/json" \
  -d '{
    "builderName": "DLF Limited"
  }'
```

---

## 3. Get All Builders

### Basic Request:
```bash
curl -X GET http://localhost:5000/api/builders/all
```

### With Pagination:
```bash
curl -X GET "http://localhost:5000/api/builders/all?page=1&limit=10"
```

### Get Only Active Builders:
```bash
curl -X GET "http://localhost:5000/api/builders/all?isActive=true"
```

### Get Inactive Builders:
```bash
curl -X GET "http://localhost:5000/api/builders/all?isActive=false"
```

### Success Response (200):
```json
{
  "message": "Builders retrieved successfully",
  "builders": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "builderName": "Prestige Constructions",
      "builderImage": "uploads/builders/1707225600000-image.jpg",
      "isActive": true,
      "createdAt": "2026-02-06T10:30:00.000Z",
      "updatedAt": "2026-02-06T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "totalCount": 5,
    "totalPages": 1
  }
}
```

---

## 4. Search Builders

### cURL Command:
```bash
curl -X GET "http://localhost:5000/api/builders/search?query=Prestige"
```

### Success Response (200):
```json
{
  "message": "Search results retrieved successfully",
  "builders": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "builderName": "Prestige Constructions",
      "builderImage": "uploads/builders/1707225600000-image.jpg",
      "isActive": true,
      "createdAt": "2026-02-06T10:30:00.000Z",
      "updatedAt": "2026-02-06T10:30:00.000Z"
    }
  ]
}
```

---

## 5. Get Builder by ID

### cURL Command:
```bash
curl -X GET http://localhost:5000/api/builders/507f1f77bcf86cd799439011
```

### Success Response (200):
```json
{
  "message": "Builder retrieved successfully",
  "builder": {
    "_id": "507f1f77bcf86cd799439011",
    "builderName": "Prestige Constructions",
    "builderImage": "uploads/builders/1707225600000-image.jpg",
    "isActive": true,
    "createdAt": "2026-02-06T10:30:00.000Z",
    "updatedAt": "2026-02-06T10:30:00.000Z"
  }
}
```

### Error Response (404):
```json
{
  "message": "Builder not found"
}
```

---

## 6. Update Builder

### Update with Image:
```bash
curl -X PUT http://localhost:5000/api/builders/507f1f77bcf86cd799439011 \
  -F "builderName=Prestige Group" \
  -F "builderImage=@/path/to/new-image.jpg"
```

### Update without Image (JSON):
```bash
curl -X PUT http://localhost:5000/api/builders/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "builderName": "Prestige Group",
    "isActive": true
  }'
```

### Update Only Name:
```bash
curl -X PUT http://localhost:5000/api/builders/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "builderName": "Prestige Group"
  }'
```

### Success Response (200):
```json
{
  "message": "Builder updated successfully",
  "builder": {
    "_id": "507f1f77bcf86cd799439011",
    "builderName": "Prestige Group",
    "builderImage": "uploads/builders/1707225600000-new-image.jpg",
    "isActive": true,
    "createdAt": "2026-02-06T10:30:00.000Z",
    "updatedAt": "2026-02-06T11:45:00.000Z"
  }
}
```

---

## 7. Deactivate Builder (Soft Delete)

### cURL Command:
```bash
curl -X PATCH http://localhost:5000/api/builders/507f1f77bcf86cd799439011/deactivate
```

### Success Response (200):
```json
{
  "message": "Builder deactivated successfully",
  "builder": {
    "_id": "507f1f77bcf86cd799439011",
    "builderName": "Prestige Constructions",
    "builderImage": "uploads/builders/1707225600000-image.jpg",
    "isActive": false,
    "createdAt": "2026-02-06T10:30:00.000Z",
    "updatedAt": "2026-02-06T11:50:00.000Z"
  }
}
```

---

## 8. Delete Builder (Permanent)

### cURL Command:
```bash
curl -X DELETE http://localhost:5000/api/builders/507f1f77bcf86cd799439011
```

### Success Response (200):
```json
{
  "message": "Builder deleted successfully",
  "builder": {
    "_id": "507f1f77bcf86cd799439011",
    "builderName": "Prestige Constructions",
    "builderImage": "uploads/builders/1707225600000-image.jpg",
    "isActive": true,
    "createdAt": "2026-02-06T10:30:00.000Z",
    "updatedAt": "2026-02-06T10:30:00.000Z"
  }
}
```

---

## Error Responses

### 400 - Bad Request:
```json
{
  "message": "Builder name is required and must be a valid string"
}
```

### 409 - Conflict (Duplicate Name):
```json
{
  "message": "Builder with this name already exists"
}
```

### 404 - Not Found:
```json
{
  "message": "Builder not found"
}
```

### 500 - Server Error:
```json
{
  "message": "Server error",
  "error": "Error details here"
}
```

---

## Batch Operations

### Create Multiple Builders:
```bash
# Builder 1
curl -X POST http://localhost:5000/api/builders/create \
  -H "Content-Type: application/json" \
  -d '{
    "builderName": "DLF Limited"
  }'

# Builder 2
curl -X POST http://localhost:5000/api/builders/create \
  -H "Content-Type: application/json" \
  -d '{
    "builderName": "Godrej Properties"
  }'

# Builder 3
curl -X POST http://localhost:5000/api/builders/create \
  -H "Content-Type: application/json" \
  -d '{
    "builderName": "Oberoi Realty"
  }'
```

---

## Using with Property Creation

When adding a property, you can now include the `builderId`:

```bash
curl -X POST http://localhost:5000/property/add \
  -F "propertyLocation=Mumbai" \
  -F "propertyTitle=Luxury Apartment" \
  -F "areaDetails=2000" \
  -F "availability=Ready to Move" \
  -F "price=50000000" \
  -F "description=Premium 3BHK apartment" \
  -F "furnishingStatus=Furnished" \
  -F "parking=Available" \
  -F "purpose=Sell" \
  -F "propertyType=Residential" \
  -F "residentialType=Apartment" \
  -F "contactNumber=+919876543210" \
  -F "bedrooms=3" \
  -F "bathrooms=2" \
  -F "balconies=1" \
  -F "floorNumber=5" \
  -F "totalFloors=10" \
  -F "facingDirection=North" \
  -F "builderId=507f1f77bcf86cd799439011" \
  -F "photosAndVideo=@/path/to/image1.jpg" \
  -F "photosAndVideo=@/path/to/image2.jpg" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Notes

- All endpoints support both JSON and form-data
- Image uploads are optional except in cases where specified
- Soft delete (deactivate) keeps the data in database with `isActive: false`
- Hard delete removes the builder permanently
- Pagination defaults: page=1, limit=10
- Search is case-insensitive and searches across name, description, and email
- Maximum file size for images: 5MB
- Supported image formats: jpg, jpeg, png, gif, webp, etc.
