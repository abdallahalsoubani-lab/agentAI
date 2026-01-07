import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ============================================================================
  // 1. CARDAMOM PRICING
  // ============================================================================
  console.log('Seeding cardamom pricing...')

  const cardamomLevels = [
    { level: 'none', price: 0.0 },
    { level: 'light', price: 0.5 },
    { level: 'medium', price: 1.0 },
    { level: 'strong', price: 1.5 },
  ]

  for (const cardamom of cardamomLevels) {
    await prisma.cardamomPricing.upsert({
      where: { level: cardamom.level },
      update: { price: cardamom.price },
      create: cardamom,
    })
  }

  console.log('✅ Cardamom pricing seeded')

  // ============================================================================
  // 2. MENU CATEGORIES
  // ============================================================================
  console.log('Seeding menu categories...')

  const categories = [
    { name: 'Coffee', displayName: 'قهوة', sortOrder: 1 },
    { name: 'ArabicCoffee', displayName: 'قهوة عربية', sortOrder: 2 },
    { name: 'Accessories', displayName: 'إكسسوارات', sortOrder: 3 },
  ]

  const createdCategories: Record<string, any> = {}

  for (const category of categories) {
    const created = await prisma.menuCategory.upsert({
      where: { name: category.name },
      update: { displayName: category.displayName, sortOrder: category.sortOrder },
      create: category,
    })
    createdCategories[category.name] = created
  }

  console.log('✅ Menu categories seeded')

  // ============================================================================
  // 3. MENU ITEMS (Default Coffee Products)
  // ============================================================================
  console.log('Seeding menu items...')

  const menuItems = [
    // Coffee Category
    {
      name: 'almade_coffee_classic',
      displayNameAr: 'قهوة العميد كلاسيك',
      description: 'Classic Alameed coffee blend',
      categoryId: createdCategories['Coffee'].id,
      priceType: 'weighted',
      pricesByWeight: JSON.stringify({
        '250g': 7.0,
        '500g': 12.0,
        '1kg': 22.0,
      }),
      sortOrder: 1,
    },
    {
      name: 'almade_coffee_premium',
      displayNameAr: 'قهوة العميد بريميوم',
      description: 'Premium Alameed coffee blend',
      categoryId: createdCategories['Coffee'].id,
      priceType: 'weighted',
      pricesByWeight: JSON.stringify({
        '250g': 9.0,
        '500g': 16.0,
        '1kg': 29.0,
      }),
      sortOrder: 2,
    },
    {
      name: 'almade_coffee_decaf',
      displayNameAr: 'قهوة العميد بدون كافيين',
      description: 'Decaffeinated Alameed coffee',
      categoryId: createdCategories['Coffee'].id,
      priceType: 'weighted',
      pricesByWeight: JSON.stringify({
        '250g': 10.0,
        '500g': 18.0,
        '1kg': 32.0,
      }),
      sortOrder: 3,
    },

    // Arabic Coffee Category
    {
      name: 'almade_arabic_blend',
      displayNameAr: 'قهوة عربية العميد',
      description: 'Traditional Arabic coffee blend',
      categoryId: createdCategories['ArabicCoffee'].id,
      priceType: 'weighted',
      pricesByWeight: JSON.stringify({
        '250g': 8.0,
        '500g': 14.0,
        '1kg': 25.0,
      }),
      sortOrder: 1,
    },

    // Accessories Category
    {
      name: 'almade_cups_50',
      displayNameAr: 'كاسات ورقية 50',
      description: 'Paper cups - pack of 50',
      categoryId: createdCategories['Accessories'].id,
      priceType: 'fixed',
      priceFixed: 3.0,
      pricesByWeight: null,
      sortOrder: 1,
    },
  ]

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { name: item.name },
      update: {
        displayNameAr: item.displayNameAr,
        description: item.description,
        categoryId: item.categoryId,
        priceType: item.priceType,
        priceFixed: item.priceFixed,
        pricesByWeight: item.pricesByWeight,
        sortOrder: item.sortOrder,
      },
      create: item,
    })
  }

  console.log('✅ Menu items seeded')

  // ============================================================================
  // 4. ADMIN SETTINGS
  // ============================================================================
  console.log('Seeding admin settings...')

  const settings = [
    { key: 'currency', value: 'JOD' },
    { key: 'tax_rate', value: '0' },
    { key: 'tax_enabled', value: 'false' },
  ]

  for (const setting of settings) {
    await prisma.adminSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }

  console.log('✅ Admin settings seeded')

  console.log('🎉 Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
