# NCS E-Commerce API Error Model

## Error Response Structure

All API errors follow a consistent structure:
```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": [
    {
      "field": "fieldName",
      "message": "Field-specific error"
    }
  ]
}