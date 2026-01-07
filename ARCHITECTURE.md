# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Mode 1  │  │  Mode 2  │  │  Mode 3  │  │  Alameed │   │
│  │  Saudi   │  │  Jordan  │  │  Health  │  │  Order   │   │
│  │  Banking │  │  Banking │  │  care    │  │  Asst.   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Voice I/O (STT/TTS)                        │  │
│  │           Web Speech API                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ API Calls (JSON/SSE)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Chat   │  │   Cart   │  │  Admin   │  │ Checkout │   │
│  │   API    │  │   API    │  │   API    │  │   API    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
┌─────────────────┐  ┌──────────┐  ┌──────────────┐
│   OpenAI API    │  │ Prisma   │  │  File System │
│  (Streaming)    │  │   ORM    │  │   (Prompts)  │
└─────────────────┘  └──────────┘  └──────────────┘
                           │
                           ▼
                    ┌──────────┐
                    │ Database │
                    │  SQLite  │
                    │   /PG    │
                    └──────────┘
```

## Core Components

### 1. Chat Engine
**Location**: `app/api/chat/route.ts`

**Flow**:
1. Receives user message + mode + session ID
2. Loads system prompt from file
3. Fetches chat history for mode (isolated per mode)
4. Calls OpenAI API with streaming
5. Parses response for JSON actions
6. Stores message in database
7. Returns streaming SSE response

**Key Features**:
- Server-Sent Events (SSE) for streaming
- Per-mode chat history isolation
- JSON action detection
- Error handling and retry logic

### 2. Action Parser
**Location**: `lib/action-parser.ts`

**Responsibilities**:
- Detect pure JSON in assistant response
- Validate JSON against Zod schemas
- Distinguish between action/navigation/text
- Return structured action objects

**Action Types**:
- `add_product`: Add item to cart
- `update_product`: Modify cart item
- `remove_product`: Delete cart item
- `clear_cart`: Empty cart
- `order_batch`: Checkout with all items

### 3. Pricing Engine
**Location**: `lib/pricing.ts`

**Calculations**:
```typescript
// For weighted items:
unitPrice = basePrice(weight) + cardamomExtra(level)
lineTotal = unitPrice * quantity

// For fixed items:
unitPrice = priceFixed
lineTotal = unitPrice * quantity
```

**Server-side Only**:
- All pricing calculated on server
- Client never computes prices
- Menu data validated before use
- Cart totals computed from database

### 4. Cart Management
**Location**: `app/api/cart/*`

**State Flow**:
```
User Message → JSON Action → API Endpoint → Database Update → Cart Refresh
```

**Operations**:
1. **Add**: Validate product → Calculate price → Insert line item
2. **Update**: Patch fields → Recalculate → Update line item
3. **Remove**: Verify ownership → Delete line item
4. **Checkout**: Create order → Copy items → Clear cart

### 5. Admin Panel
**Location**: `components/alameed/admin/*`

**Authentication Flow**:
```
1. User clicks gear icon or Ctrl+Shift+A
2. Password prompt appears
3. POST /api/admin/auth with password
4. Server validates against ADMIN_PASSWORD
5. Session cookie created (2 hours)
6. Admin panel unlocked
```

**Capabilities**:
- Menu CRUD: Enable/disable items
- Order management: View/update status
- Prompt editing: Live editing with version control

## Data Models

### Menu Item
```typescript
{
  id: string
  name: string              // English key
  displayNameAr: string     // Arabic display
  priceType: 'weighted' | 'fixed'
  pricesByWeight?: {        // JSON
    "250g": 7.00,
    "500g": 12.00,
    "1kg": 22.00
  }
  priceFixed?: number
  enabled: boolean
  category: Category
}
```

### Cart Line Item
```typescript
{
  id: string
  cartId: string
  menuItemId: string
  weight?: '250g' | '500g' | '1kg'
  cardamom?: 'none' | 'light' | 'medium' | 'strong'
  quantity: number
  unitPrice: number         // Computed at add time
  lineTotal: number         // unitPrice * quantity
}
```

### Order
```typescript
{
  id: string
  sessionId: string
  status: 'new' | 'in_progress' | 'completed' | 'cancelled'
  items: OrderItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  createdAt: Date
}
```

## Security Model

### Authentication
- **User Sessions**: Cookie-based session IDs
- **Admin Sessions**: Separate admin cookie (2-hour expiry)
- **Password Protection**: Plain comparison (can be upgraded to bcrypt)

### Authorization
```typescript
// Admin endpoint guard
const isAuthenticated = await isAdminAuthenticated()
if (!isAuthenticated) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Data Validation
1. **Client**: Basic UI validation
2. **Zod Schemas**: Runtime type checking
3. **Server**: Business logic validation
4. **Database**: Constraints and relations

### Attack Prevention
- No user-provided pricing
- Server-side calculations only
- SQL injection prevented by Prisma
- XSS prevented by React escaping
- CSRF token in admin routes (recommended)

## Prompt System

### Loading Flow
```
Runtime Request → lib/prompts.ts → File System → mode{N}.txt → Return Content
```

### Editing Flow
```
Admin Panel → Edit Form → POST /api/admin/prompts → File System Write + DB Revision → Reload
```

### Version Control
- Every edit creates `PromptRevision` record
- `version` increments
- Previous version marked `isCurrent: false`
- Rollback possible via admin panel

## Voice Integration

### Speech-to-Text (STT)
```javascript
const recognition = new SpeechRecognition()
recognition.lang = 'ar-SA'  // Arabic
recognition.start()
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript
  sendMessage(transcript)
}
```

### Text-to-Speech (TTS)
```javascript
const synth = window.speechSynthesis
const utterance = new SpeechSynthesisUtterance(text)
utterance.lang = 'ar-SA'
utterance.rate = 0.9
synth.speak(utterance)
```

**Important**: Voice features require HTTPS (or localhost)

## Performance Optimizations

### Database
- Indexed fields: `sessionId`, `mode`, `createdAt`, `status`
- Lazy loading with `include` clauses
- Limited history queries (last 20 messages)

### API
- Streaming responses (SSE)
- Chunked encoding for large responses
- Efficient JSON parsing

### Frontend
- React component memoization
- Lazy loading of admin panel
- Optimistic UI updates for cart

### Caching
- Prisma query caching
- Static prompt files (no DB reads)
- Browser speech synthesis caching

## Deployment Considerations

### Environment Variables
```env
OPENAI_API_KEY=...          # Required
ADMIN_PASSWORD=...          # Required
DATABASE_URL=...            # SQLite or Postgres
CURRENCY=JOD                # Optional
PROMPTS_DIR=./prompts       # Optional
```

### Database Migration
```bash
# Development
DATABASE_URL="file:./dev.db"

# Production
DATABASE_URL="postgresql://user:pass@host:5432/db"
```

### Scaling
- **Horizontal**: Multiple Next.js instances + shared DB
- **Vertical**: Increase memory for OpenAI streaming
- **Database**: Use connection pooling for Postgres
- **CDN**: Serve static assets via CDN

## Extension Points

### Adding New Modes
1. Create `prompts/mode5.txt`
2. Add to `MODES` array in UI
3. Optionally create dedicated page

### Custom Actions
1. Define schema in `lib/schemas.ts`
2. Add to `ActionSchema` discriminated union
3. Handle in chat API
4. Implement UI response

### Payment Integration
1. Add payment provider SDK
2. Create `/api/payment` route
3. Integrate in checkout flow
4. Store transaction IDs in orders

### Analytics
1. Add analytics provider
2. Track events:
   - Chat messages
   - Cart actions
   - Orders created
   - Admin actions
3. Create dashboard in admin panel

## Testing Strategy

### Unit Tests
- Zod schema validation
- Pricing calculations
- Action parsing
- Prompt loading

### Integration Tests
- API endpoints
- Database operations
- OpenAI integration (mocked)
- Cart flow

### E2E Tests
- Full chat flow
- Order creation
- Admin panel operations
- Voice input (if possible)

### Manual Testing Checklist
- [ ] All 4 modes respond correctly
- [ ] Voice input works
- [ ] Voice output works
- [ ] Cart updates in real-time
- [ ] Prices match database
- [ ] Checkout creates order
- [ ] Admin login works
- [ ] Menu CRUD operations
- [ ] Prompt editing saves
- [ ] Mobile responsive

---

**Architecture Version**: 1.0
**Last Updated**: January 2026
**Framework**: Next.js 15 + React 19
