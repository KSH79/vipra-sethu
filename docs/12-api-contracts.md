# API Contracts
**Updated:** 2025-10-26 12:31

**POST /api/onboard** (multipart): name, phone, whatsapp?, category, languages, sampradaya?, photo.  
→ Inserts provider with `pending_review`; uploads photo to `provider-photos` (private).  
**RPC search_providers**: arguments for text/category/languages/sampradaya/lat/lon/radius/limit.
