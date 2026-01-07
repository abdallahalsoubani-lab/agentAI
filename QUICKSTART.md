# Quick Start Guide

Get your Multi-Mode AI Assistant running in 5 minutes!

## ⚡ Fast Setup

### 1. Environment Setup (1 minute)

```bash
# Copy and edit environment file
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
OPENAI_API_KEY=sk-your-key-here
ADMIN_PASSWORD=your-secure-password
```

### 2. Install & Setup (2 minutes)

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push
npm run db:seed
```

### 3. Run (30 seconds)

```bash
npm run dev
```

Visit: http://localhost:3000

## 🎯 First Steps

### Try Basic Chat
1. Select "Amjad (Saudi)" mode
2. Type: "مرحبا" or "Hello"
3. Toggle voice output (speaker icon)
4. Try voice input (microphone icon)

### Try Alameed Ordering
1. Click "Go to Alameed Page"
2. Say in Arabic: "بدي قهوة عميد كلاسيك 500 غرام مع هيل خفيف"
3. Watch cart update in real-time
4. Click items to review
5. Say "خلاص كمل" to checkout

### Access Admin Panel
1. On Alameed page, click gear icon (⚙️)
2. Or press `Ctrl+Shift+A`
3. Enter your admin password
4. Explore:
   - **Menu Management**: Enable/disable products
   - **Orders**: View order history
   - **Prompt Editor**: Customize assistant behavior

## 📝 Important Notes

### Placeholder Prompts
The app includes **placeholder system prompts**. Replace them with your actual prompts:

**Option 1: Direct File Edit**
```bash
nano prompts/mode4.txt  # Paste your full Alameed prompt
```

**Option 2: Admin Panel**
1. Open Admin Panel
2. Go to "Prompt Editor"
3. Select mode
4. Paste full prompt
5. Save

### Default Menu Items
5 products are seeded by default:
- Alameed Coffee Classic (250g/500g/1kg)
- Alameed Coffee Premium (250g/500g/1kg)
- Alameed Decaf (250g/500g/1kg)
- Alameed Arabic Blend (250g/500g/1kg)
- Alameed Cups 50 (fixed price)

### Default Credentials
- **Admin Password**: Set in `.env` file
- **Currency**: JOD (Jordan Dinars) - change in `.env`

## 🔍 Testing Checklist

- [ ] Basic chat works in Mode 1
- [ ] Voice input works (requires HTTPS or localhost)
- [ ] Voice output works (toggle speaker icon)
- [ ] Alameed cart adds products
- [ ] Cart shows correct prices
- [ ] Checkout creates order
- [ ] Admin panel login works
- [ ] Admin can view/edit menu
- [ ] Admin can see orders
- [ ] Prompt editor saves changes

## 🐛 Common Issues

### "OPENAI_API_KEY not set"
- Edit `.env` file
- Add valid OpenAI API key
- Restart dev server

### Voice input not working
- Use HTTPS or localhost
- Grant microphone permission
- Try Chrome/Edge browser

### Database errors
```bash
rm prisma/dev.db
npx prisma db push
npm run db:seed
```

### Admin password not working
- Check `.env` file
- Ensure `ADMIN_PASSWORD` is set
- No quotes needed in `.env`

## 📚 Next Steps

1. **Customize Prompts**: Replace placeholder prompts with your actual system prompts
2. **Add Products**: Use admin panel to add more menu items
3. **Test Ordering Flow**: Try complete order cycle
4. **Deploy**: See README.md for production deployment guide

## 🚀 Production Deployment

See full deployment guide in `README.md` including:
- PostgreSQL setup
- Environment configuration
- Security best practices
- HTTPS setup

---

**Need Help?** Check the full README.md for comprehensive documentation.
