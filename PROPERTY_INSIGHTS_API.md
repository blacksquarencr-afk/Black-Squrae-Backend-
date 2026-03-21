# Property Insights API Documentation

## Base URL
```
http://your-domain/api/property-insights
```

## Endpoints

### 1. Property Price Insights
Get comprehensive price insights for a specific location.

**Endpoint:** `GET /price-insights`

**Query Parameters:**
- `location` (required): Location name (e.g., "Faridabad")

**Response:**
```json
{
  "location": "Faridabad",
  "totalListings": 7961,
  "medianPrice": 6700,
  "avgPrice": 6850,
  "priceRangeDistribution": {
    "Below 1.5K": 0,
    "1.5K - 3.5K": 550,
    "3.5K - 5.5K": 2100,
    "5.5K - 8K": 2800,
    "8K - 10K": 1900,
    "10K - 12K": 500,
    "12K Above": 111
  },
  "currency": "₹"
}
```

**Example:**
```bash
curl -X GET "http://localhost:4000/api/property-insights/price-insights?location=Faridabad"
```

---

### 2. Micromarket Price Comparison
Compare average prices across different micro-locations within a city.

**Endpoint:** `GET /micromarket-comparison`

**Query Parameters:**
- `location` (required): Location name

**Response:**
```json
{
  "location": "Faridabad",
  "micromarkets": [
    {
      "location": "Badkhal SurajKund",
      "avgPricePerSqft": 7800,
      "listingsCount": 45
    },
    {
      "location": "Faridabad North",
      "avgPricePerSqft": 7400,
      "listingsCount": 120
    },
    {
      "location": "Faridabad Central",
      "avgPricePerSqft": 7200,
      "listingsCount": 98
    }
  ]
}
```

**Example:**
```bash
curl -X GET "http://localhost:4000/api/property-insights/micromarket-comparison?location=Faridabad"
```

---

### 3. Rental Supply Insights
Get rental property availability and pricing by configuration.

**Endpoint:** `GET /rental-supply`

**Query Parameters:**
- `location` (required): Location name

**Response:**
```json
{
  "location": "Faridabad",
  "totalRentalListings": 450,
  "rentalRates": [
    {
      "configuration": "STUDIO",
      "minRent": 8000,
      "maxRent": 12000,
      "avgRent": 10100,
      "availableCount": 25
    },
    {
      "configuration": "1 BHK",
      "minRent": 10000,
      "maxRent": 18000,
      "avgRent": 13800,
      "availableCount": 85
    },
    {
      "configuration": "2 BHK",
      "minRent": 15000,
      "maxRent": 25000,
      "avgRent": 20100,
      "availableCount": 150
    }
  ]
}
```

**Example:**
```bash
curl -X GET "http://localhost:4000/api/property-insights/rental-supply?location=Faridabad"
```

---

### 4. Property Heatmap Data
Get geolocation data for properties to display on a map.

**Endpoint:** `GET /heatmap`

**Query Parameters:**
- `location` (required): Location name

**Response:**
```json
{
  "location": "Faridabad",
  "totalProperties": 234,
  "heatmapData": [
    {
      "location": "Sector 15, Faridabad",
      "coordinates": [77.3178, 28.4089],
      "pricePerSqft": 7500,
      "propertyType": "Residential",
      "purpose": "Sell"
    }
  ]
}
```

**Example:**
```bash
curl -X GET "http://localhost:4000/api/property-insights/heatmap?location=Faridabad"
```

---

### 5. Property Statistics
Get overall property market statistics.

**Endpoint:** `GET /statistics`

**Query Parameters:**
- `location` (optional): Location name (if not provided, shows all locations)

**Response:**
```json
{
  "location": "Faridabad",
  "totalProperties": 1250,
  "propertyTypes": {
    "Residential": 980,
    "Commercial": 220,
    "Land": 50
  },
  "purposes": {
    "Sell": 800,
    "Rent/Lease": 400,
    "Paying Guest": 50
  },
  "availability": {
    "Ready to Move": 950,
    "Under Construction": 300
  },
  "furnishing": {
    "Furnished": 450,
    "Semi-Furnished": 400,
    "Unfurnished": 400
  },
  "priceStatistics": {
    "avgPrice": 4500000,
    "minPrice": 500000,
    "maxPrice": 25000000
  }
}
```

**Example:**
```bash
curl -X GET "http://localhost:4000/api/property-insights/statistics?location=Faridabad"
curl -X GET "http://localhost:4000/api/property-insights/statistics"
```

---

### 6. Trending Properties
Get most visited/popular properties.

**Endpoint:** `GET /trending`

**Query Parameters:**
- `location` (optional): Location name
- `limit` (optional): Number of properties to return (default: 10)

**Response:**
```json
{
  "location": "Faridabad",
  "trendingProperties": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "customPropertyId": "PROP-2026-001",
      "propertyLocation": "Sector 21, Faridabad",
      "price": 5500000,
      "areaDetails": 1200,
      "bedrooms": 3,
      "visitCount": 145,
      "propertyType": "Residential",
      "purpose": "Sell"
    }
  ]
}
```

**Example:**
```bash
curl -X GET "http://localhost:4000/api/property-insights/trending?location=Faridabad&limit=5"
```

---

### 7. Price Trends
Get price trends over time (monthly analysis).

**Endpoint:** `GET /price-trends`

**Query Parameters:**
- `location` (optional): Location name
- `months` (optional): Number of months to analyze (default: 6)

**Response:**
```json
{
  "location": "Faridabad",
  "months": 6,
  "trends": [
    {
      "month": "2025-08",
      "listingsCount": 45,
      "avgPricePerSqft": 6500,
      "avgTotalPrice": 4200000
    },
    {
      "month": "2025-09",
      "listingsCount": 52,
      "avgPricePerSqft": 6650,
      "avgTotalPrice": 4350000
    }
  ]
}
```

**Example:**
```bash
curl -X GET "http://localhost:4000/api/property-insights/price-trends?location=Faridabad&months=12"
```

---

### 8. Amenities Popularity
Get most popular amenities in properties.

**Endpoint:** `GET /amenities-popularity`

**Query Parameters:**
- `location` (optional): Location name

**Response:**
```json
{
  "location": "Faridabad",
  "totalProperties": 500,
  "popularAmenities": [
    {
      "amenity": "24 x 7 Security",
      "count": 450,
      "percentage": "90.00"
    },
    {
      "amenity": "Power Backup",
      "count": 425,
      "percentage": "85.00"
    },
    {
      "amenity": "Lift",
      "count": 400,
      "percentage": "80.00"
    }
  ]
}
```

**Example:**
```bash
curl -X GET "http://localhost:4000/api/property-insights/amenities-popularity?location=Faridabad"
```

---

## Use Cases

### Dashboard Integration
Use these endpoints to create comprehensive property insights dashboards:

1. **Price Heatmap**: Use `/heatmap` to show property prices on a map
2. **Market Overview**: Use `/statistics` for overall market statistics
3. **Price Distribution**: Use `/price-insights` for histogram charts
4. **Location Comparison**: Use `/micromarket-comparison` for comparative analysis
5. **Rental Market**: Use `/rental-supply` for rental property insights
6. **Popular Properties**: Use `/trending` to highlight top properties
7. **Market Trends**: Use `/price-trends` for time-series analysis
8. **Feature Analysis**: Use `/amenities-popularity` for amenity insights

### Frontend Example (React)
```javascript
// Fetch price insights
const fetchPriceInsights = async (location) => {
  const response = await fetch(
    `http://localhost:4000/api/property-insights/price-insights?location=${location}`
  );
  const data = await response.json();
  return data;
};

// Fetch rental supply
const fetchRentalSupply = async (location) => {
  const response = await fetch(
    `http://localhost:4000/api/property-insights/rental-supply?location=${location}`
  );
  const data = await response.json();
  return data;
};
```

---

## Error Responses

All endpoints return standard error responses:

```json
{
  "error": "Error message description"
}
```

**Common Error Codes:**
- `400`: Bad Request (missing required parameters)
- `404`: Not Found (no data found for the location)
- `500`: Internal Server Error

---

## Notes

1. All price values are in Indian Rupees (₹)
2. Location searches are case-insensitive and support partial matches
3. Properties marked as `isSold: true` are excluded from insights
4. Coordinates format: `[longitude, latitude]`
5. All endpoints support CORS for frontend integration
