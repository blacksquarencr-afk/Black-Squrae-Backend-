# Chatbot Q&A API Documentation

## Overview
The Chatbot Q&A system allows intelligent keyword-based matching to provide automated responses to user queries. It uses MongoDB text search and keyword matching for accurate results.

---

## Database Schema

```javascript
{
  question: String,          // The question text
  answer: String,            // The answer text
  keywords: [String],        // Keywords for matching
  category: String,          // Category (e.g., 'greeting', 'buying', 'renting')
  priority: Number,          // Higher priority = shown first (default: 0)
  usageCount: Number,        // Tracks how many times used
  isActive: Boolean,         // Enable/disable Q&A
  createdBy: ObjectId,       // Admin or Employee who created
  createdByType: String,     // 'Admin' or 'Employee'
  timestamps: true
}
```

---

## API Endpoints

### 1. Ask Chatbot (Public)

**Endpoint:** `POST /api/chatbot/ask`

**Description:** User asks a question and gets an automated response.

**Request Body:**
```json
{
  "question": "hi"
}
```

**Response (Match Found):**
```json
{
  "success": true,
  "found": true,
  "data": {
    "question": "Hi, Hello, Hey",
    "answer": "Hello 👋 Welcome to our Real Estate Support. How can I help you today?",
    "category": "greeting"
  }
}
```

**Response (No Match):**
```json
{
  "success": true,
  "found": false,
  "message": "I'm sorry, I don't have an answer to that question yet. Please contact our support team for assistance.",
  "suggestions": [
    {
      "question": "Hi, Hello, Hey",
      "category": "greeting"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X POST https://nk5.yaatrabuddy.com/api/chatbot/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "I want to buy a property"}'
```

---

### 2. Get All Q&A (Admin)

**Endpoint:** `GET /api/chatbot/qa`

**Description:** Get all Q&A entries with filtering and pagination.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | Number | 1 | Page number |
| limit | Number | 10 | Items per page |
| category | String | - | Filter by category |
| isActive | Boolean | - | Filter by active status |
| search | String | - | Search in question/answer/keywords |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "67abc123",
      "question": "Hi, Hello, Hey",
      "answer": "Hello 👋 Welcome to our Real Estate Support...",
      "keywords": ["hi", "hello", "hey"],
      "category": "greeting",
      "priority": 100,
      "usageCount": 45,
      "isActive": true,
      "createdAt": "2026-01-27T10:00:00Z"
    }
  ],
  "pagination": {
    "totalPages": 2,
    "currentPage": 1,
    "totalQAs": 15,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**cURL Examples:**
```bash
# Get all Q&A
curl -X GET "https://nk5.yaatrabuddy.com/api/chatbot/qa?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by category
curl -X GET "https://nk5.yaatrabuddy.com/api/chatbot/qa?category=greeting" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Search
curl -X GET "https://nk5.yaatrabuddy.com/api/chatbot/qa?search=property" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. Get Single Q&A

**Endpoint:** `GET /api/chatbot/qa/:id`

**Description:** Get a specific Q&A by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "67abc123",
    "question": "I want to buy a property",
    "answer": "Sure! We can help you buy residential and commercial properties...",
    "keywords": ["buy", "purchase", "acquire"],
    "category": "buying",
    "priority": 90,
    "usageCount": 120,
    "isActive": true
  }
}
```

**cURL Example:**
```bash
curl -X GET https://nk5.yaatrabuddy.com/api/chatbot/qa/67abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. Add New Q&A (Admin)

**Endpoint:** `POST /api/chatbot/qa`

**Description:** Create a new Q&A entry.

**Request Body:**
```json
{
  "question": "What are the property registration charges?",
  "answer": "Property registration charges are typically 5-7% of the property value, varying by state.",
  "keywords": ["registration", "charges", "fees", "stamp duty"],
  "category": "legal",
  "priority": 70
}
```

**Response:**
```json
{
  "success": true,
  "message": "Q&A added successfully",
  "data": {
    "_id": "67abc456",
    "question": "What are the property registration charges?",
    "answer": "Property registration charges are typically 5-7%...",
    "keywords": ["registration", "charges", "fees", "stamp duty"],
    "category": "legal",
    "priority": 70,
    "usageCount": 0,
    "isActive": true
  }
}
```

**cURL Example:**
```bash
curl -X POST https://nk5.yaatrabuddy.com/api/chatbot/qa \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are the property registration charges?",
    "answer": "Property registration charges are typically 5-7% of the property value.",
    "keywords": ["registration", "charges", "fees"],
    "category": "legal",
    "priority": 70
  }'
```

---

### 5. Update Q&A (Admin)

**Endpoint:** `PUT /api/chatbot/qa/:id`

**Description:** Update an existing Q&A entry.

**Request Body:**
```json
{
  "answer": "Updated answer with more details...",
  "priority": 85,
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Q&A updated successfully",
  "data": {
    "_id": "67abc123",
    "question": "Hi, Hello, Hey",
    "answer": "Updated answer with more details...",
    "priority": 85,
    "isActive": true
  }
}
```

**cURL Example:**
```bash
curl -X PUT https://nk5.yaatrabuddy.com/api/chatbot/qa/67abc123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answer": "Updated answer",
    "priority": 85
  }'
```

---

### 6. Delete Q&A (Admin)

**Endpoint:** `DELETE /api/chatbot/qa/:id`

**Description:** Delete a Q&A entry.

**Response:**
```json
{
  "success": true,
  "message": "Q&A deleted successfully"
}
```

**cURL Example:**
```bash
curl -X DELETE https://nk5.yaatrabuddy.com/api/chatbot/qa/67abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 7. Get Categories

**Endpoint:** `GET /api/chatbot/categories`

**Description:** Get all unique categories.

**Response:**
```json
{
  "success": true,
  "data": [
    "greeting",
    "buying",
    "renting",
    "pricing",
    "location",
    "site-visit",
    "financing",
    "documentation",
    "contact",
    "general"
  ]
}
```

**cURL Example:**
```bash
curl -X GET https://nk5.yaatrabuddy.com/api/chatbot/categories \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 8. Get Popular Questions

**Endpoint:** `GET /api/chatbot/popular`

**Description:** Get most frequently asked questions.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | Number | 10 | Number of results |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "question": "I want to buy a property",
      "category": "buying",
      "usageCount": 450
    },
    {
      "question": "Can I talk to an agent?",
      "category": "contact",
      "usageCount": 380
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET "https://nk5.yaatrabuddy.com/api/chatbot/popular?limit=5"
```

---

## Keyword Matching Logic

The chatbot uses a 3-tier matching system:

### 1. **Text Search** (Highest Priority)
- Uses MongoDB full-text search on question, answer, and keywords
- Matches exact phrases and relevant words

### 2. **Keyword Matching** (Medium Priority)
- Breaks user question into words
- Matches against the `keywords` array
- Case-insensitive matching

### 3. **Partial Question Match** (Lowest Priority)
- Uses regex to find similar questions
- Fallback when no exact match found

**Priority Order:**
```
Higher priority number → Shown first
More usage count → Shown first (if same priority)
```

---

## Seeded Q&A Categories

| Category | Description | Example Questions |
|----------|-------------|-------------------|
| greeting | Welcome messages | "hi", "hello", "hey" |
| buying | Property purchase | "buy", "purchase" |
| renting | Property rental | "rent", "lease" |
| pricing | Cost information | "price", "budget", "cost" |
| location | Area queries | "noida", "delhi", "location" |
| site-visit | Property viewing | "visit", "tour", "inspection" |
| financing | Loan assistance | "loan", "emi", "mortgage" |
| documentation | Required papers | "documents", "papers", "legal" |
| contact | Agent connection | "agent", "broker", "contact" |
| property-types | Property categories | "2bhk", "apartment", "villa" |
| amenities | Facilities | "gym", "parking", "pool" |
| general | Office hours, etc. | "timing", "hours" |
| gratitude | Thank you messages | "thanks", "thank you" |
| farewell | Goodbye messages | "bye", "goodbye" |

---

## Integration Examples

### Frontend React Integration

```javascript
// Ask chatbot
const askChatbot = async (userQuestion) => {
  const response = await fetch('https://nk5.yaatrabuddy.com/api/chatbot/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: userQuestion })
  });
  return response.json();
};

// Usage
const handleUserMessage = async (message) => {
  const result = await askChatbot(message);
  if (result.found) {
    displayBotMessage(result.data.answer);
  } else {
    displayBotMessage(result.message);
    displaySuggestions(result.suggestions);
  }
};
```

### Admin Panel - Add Q&A

```javascript
const addNewQA = async (qaData, token) => {
  const response = await fetch('https://nk5.yaatrabuddy.com/api/chatbot/qa', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(qaData)
  });
  return response.json();
};
```

---

## Best Practices

1. **Keywords:** Add multiple variations and synonyms
2. **Priority:** Set higher priority for important questions
3. **Categories:** Use consistent category names
4. **Testing:** Test keywords thoroughly before deploying
5. **Updates:** Regularly review `usageCount` to identify popular topics
6. **Fallback:** Always provide contact information in default response

---

## Seeding the Database

Run the seed script to populate initial Q&A:

```bash
cd /www/wwwroot/BlackSquareBackend/backend
node seed-chatbot-qa.js
```

This will insert 15 pre-configured Q&A entries covering common real estate queries.

---

## Testing

Run the test script:

```bash
chmod +x test-chatbot-qa.sh
./test-chatbot-qa.sh
```

Or test manually with cURL as shown in examples above.

---

## Related Files

- **Model:** `/models/chatbotQA.js`
- **Controller:** `/controllers/chatbotQAController.js`
- **Routes:** `/routes/chatbotQARoute.js`
- **Seed Script:** `/seed-chatbot-qa.js`
- **Test Script:** `/test-chatbot-qa.sh`
