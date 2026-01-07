# Multi-Mode AI Assistant

A production-ready web application that uses the OpenAI Chat Completions API to power a smart multi-mode conversational assistant with both **Text** and **Voice** capabilities.

## 🌟 Features

### Core Functionality
- **4 Specialized Modes**: Each mode has its own system prompt and isolated chat history
- **Text + Voice Input**: Web Speech API integration for voice commands
- **Text-to-Speech Output**: Optional voice responses for assistant messages
- **Streaming Responses**: Real-time streaming from OpenAI API
- **JSON Action Protocol**: Structured actions for complex interactions

### Alameed Mode (Ordering Assistant)
- **Real-time Cart Management**: Add, update, remove products with live pricing
- **Menu Database**: Configurable products with weight-based and fixed pricing
- **Cardamom Options**: Multi-level customization (none/light/medium/strong)
- **Checkout Flow**: Complete order summary with price breakdown
- **Server-side Validation**: All pricing calculated and validated on server

### Admin Panel (Embedded in Alameed)
- **Secure Authentication**: Password-protected admin access
- **Menu Management**: CRUD operations for products and categories
- **Order Tracking**: View and update order status
- **Prompt Editor**: Edit system prompts with version history
- **Keyboard Shortcut**: `Ctrl+Shift+A` to open admin panel

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: SQLite (dev) / PostgreSQL (prod) via Prisma
- **AI**: OpenAI GPT-4o with streaming
- **Validation**: Zod schemas
- **Styling**: Tailwind CSS
- **Voice**: Web Speech API (STT/TTS)

## 📁 Project Structure

```
agentAI/
├── app/
│   ├── api/
│   │   ├── admin/           # Admin APIs (auth, menu, orders, prompts)
│   │   ├── cart/            # Cart operations (add, update, remove, checkout)
│   │   └── chat/            # OpenAI chat integration
│   ├── alameed/             # Alameed ordering page
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page with mode selector
├── components/
│   ├── alameed/
│   │   ├── admin/           # Admin panel components
│   │   ├── AlameedChat.tsx  # Alameed chat interface
│   │   ├── CartPanel.tsx    # Cart UI panel
│   │   └── CheckoutSummary.tsx
│   ├── ChatInterface.tsx    # Main chat component
│   ├── ChatMessage.tsx      # Message bubble component
│   ├── ModeSelector.tsx     # Mode tabs
│   ├── TTSToggle.tsx        # Voice output toggle
│   └── VoiceInput.tsx       # Voice input button
├── lib/
│   ├── action-parser.ts     # JSON action parser
│   ├── admin-auth.ts        # Admin authentication
│   ├── pricing.ts           # Pricing engine
│   ├── prisma.ts            # Prisma client
│   ├── prompts.ts           # Prompt loader
│   ├── schemas.ts           # Zod schemas
│   └── session.ts           # Session management
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed data script
├── prompts/
│   ├── mode1.txt            # Amjad (Saudi) system prompt
│   ├── mode2.txt            # Amjad (Jordan) system prompt
│   ├── mode3.txt            # Noura (Healthcare) system prompt
│   └── mode4.txt            # Alameed (Ordering) system prompt
└── package.json
```

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key

### 2. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd agentAI

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env and add your OpenAI API key and admin password
```

### 3. Environment Configuration

Create a `.env` file:

```env
# OpenAI API Key (REQUIRED)
OPENAI_API_KEY=sk-...

# Database URL
DATABASE_URL="file:./dev.db"

# Admin Password (REQUIRED)
ADMIN_PASSWORD=your_secure_password

# Currency
CURRENCY=JOD

# Prompts Directory
PROMPTS_DIR=./prompts
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed default data
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Usage Guide

### Main Interface

1. **Select Mode**: Choose from 4 available modes
2. **Chat**: Type or use voice input to interact
3. **Voice Toggle**: Enable/disable text-to-speech output
4. **Alameed Mode**: Special ordering interface with cart

### Alameed Ordering

1. Navigate to Alameed page
2. Chat with Salma in Arabic
3. Request products: "بدي قهوة عميد كلاسيك 500 غرام مع هيل خفيف"
4. View cart updates in real-time
5. Checkout to see summary and confirm order

### Admin Panel

**Access Methods:**
- Click the gear icon in Alameed page header
- Press `Ctrl+Shift+A` keyboard shortcut

**Features:**
- **Menu Management**: Enable/disable products, view pricing
- **Orders View**: Track and update order status
- **Prompt Editor**: Edit system prompts with version control

## 🗂 Database Schema

### Key Models

- **MenuCategory**: Product categories
- **MenuItem**: Products with pricing
- **CardamomPricing**: Cardamom level pricing
- **Cart**: Shopping cart
- **CartLineItem**: Cart items with selections
- **Order**: Completed orders
- **OrderItem**: Order line items
- **ChatMessage**: Conversation history (per-mode isolated)
- **PromptRevision**: Prompt version history
- **AdminSetting**: App configuration

## 🔒 Security

- Admin panel protected by password authentication
- Server-side session management
- Cart operations validated on server
- Pricing calculated server-side only
- No sensitive data in client-side code

## 🎯 JSON Action Protocol

Mode 4 (Alameed) uses structured JSON for cart operations:

### Add Product
```json
{
  "action": "add_product",
  "product": {
    "name": "almade_coffee_classic",
    "weight": "500g",
    "cardamom": "light",
    "quantity": 1,
    "ready": true
  }
}
```

### Update Product
```json
{
  "action": "update_product",
  "lineItemId": "item-id",
  "patch": {
    "quantity": 2
  }
}
```

### Checkout
```json
{
  "action": "order_batch",
  "checkout": true
}
```

## 📝 Prompt Management

### File-based Prompts

Prompts are loaded from `/prompts` directory at runtime:
- `mode1.txt` - Saudi banking assistant
- `mode2.txt` - Jordanian banking assistant
- `mode3.txt` - Healthcare assistant
- `mode4.txt` - Ordering assistant

### Editing Prompts

**Option 1: File System**
```bash
nano prompts/mode1.txt
```

**Option 2: Admin Panel**
1. Open Admin Panel
2. Go to "Prompt Editor" tab
3. Select mode
4. Edit content
5. Add change notes (optional)
6. Save

All edits are versioned in the database.

## 🔧 Development

### Available Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
npm run db:push     # Push schema changes
npm run db:seed     # Seed database
npm run db:studio   # Open Prisma Studio
```

### Adding New Products

```typescript
// Via Admin Panel UI (recommended)
// Or via Prisma Studio:
npx prisma studio

// Or programmatically:
const item = await prisma.menuItem.create({
  data: {
    name: 'new_product',
    displayNameAr: 'منتج جديد',
    categoryId: 'category-id',
    priceType: 'weighted',
    pricesByWeight: JSON.stringify({
      '250g': 10.0,
      '500g': 18.0,
      '1kg': 32.0,
    }),
  },
})
```

## 🌐 Production Deployment

### Database Migration

For production with PostgreSQL:

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Set production DATABASE_URL:
```env
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
```

3. Run migrations:
```bash
npx prisma db push
npm run db:seed
```

### Deployment Checklist

- [ ] Set `OPENAI_API_KEY`
- [ ] Set strong `ADMIN_PASSWORD`
- [ ] Configure production `DATABASE_URL`
- [ ] Update `CURRENCY` if needed
- [ ] Replace placeholder prompts with real content
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS
- [ ] Configure CORS if needed

## 🎨 Customization

### Styling

Edit `app/globals.css` and Tailwind classes in components.

### Adding New Modes

1. Create prompt file: `prompts/mode5.txt`
2. Add mode to `MODES` array in `app/page.tsx`
3. Optionally create dedicated page like Alameed

### Changing Currency

Update `.env`:
```env
CURRENCY=SAR  # or USD, EUR, etc.
```

## 🐛 Troubleshooting

### Voice Input Not Working
- Ensure HTTPS (or localhost)
- Check browser compatibility (Chrome/Edge recommended)
- Grant microphone permissions

### Database Errors
```bash
# Reset database
rm prisma/dev.db
npx prisma db push
npm run db:seed
```

### Prisma Engine Issues
```bash
# Ignore checksum errors in restricted environments
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
```

## 📄 License

[Your License Here]

## 🤝 Contributing

[Your Contributing Guidelines Here]

## 📧 Support

[Your Support Contact Here]

---

**Built with ❤️ using Next.js, OpenAI, and Prisma**
