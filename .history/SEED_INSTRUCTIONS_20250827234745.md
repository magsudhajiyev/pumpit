# Database Seeding Instructions

This guide will help you populate the database with dummy products to test the promotion flow.

## 🚀 Quick Start

1. **Make sure your database is set up:**
   ```bash
   pnpm db:push
   ```

2. **Run the seed script:**
   ```bash
   pnpm db:seed
   ```

## 📊 What Gets Created

The seed script will create:

### 👥 **10 Dummy Users**
- Each with 50 starting credits
- Realistic names and email addresses
- Usernames for identification

### 🛠️ **10 Dummy Products**
- **TaskFlow Pro** - Task management SaaS
- **Newsletter Ninja** - Newsletter platform
- **CodeCraft Studio** - AI code generation tool
- **DesignHub** - Collaborative design platform
- **Startup Weekly** - Startup newsletter
- **Analytics Pro** - Analytics dashboard (Paid)
- **DevTools Kit** - Developer tools collection
- **Growth Hacker** - Growth hacking newsletter
- **CloudSync** - Cloud storage solution
- **Product Hunt Daily** - Product Hunt digest

### 📈 **Sample Promotions**
- 2 verified promotions (X and Reddit)
- 1 pending promotion (LinkedIn)
- Tracking links for verified promotions

## 🧪 Testing the Promotion Flow

After seeding, you can:

1. **Sign up/Login** with any email
2. **Go to Dashboard** → **Promote**
3. **Browse available products** in the dropdown
4. **Create promotions** for different platforms
5. **Test verification** (currently simulated)

## 🔄 Re-seeding

To clear and re-seed the database:

```bash
# Clear existing data (optional)
pnpm db:push:force

# Run seed again
pnpm db:seed
```

## 📝 Product Categories

The dummy products include:
- **SaaS** (4 products) - Software as a Service
- **NEWSLETTER** (4 products) - Email newsletters
- **TOOL** (2 products) - Developer tools

## 💰 Promotion Types

- **RECIPROCAL** (9 products) - Free, earn credits by promoting
- **PAID** (1 product) - Analytics Pro ($99.99)

## 🎯 Testing Scenarios

1. **Create a promotion** for any product
2. **Select different platforms** (X, Reddit, LinkedIn, ProductHunt)
3. **Write promotion content** with the provided templates
4. **Submit for verification** (simulated for now)
5. **Earn credits** (10 credits per verified promotion)

## 🔧 Customization

To modify the dummy data, edit `packages/database/src/seed.ts`:
- Add more products
- Change user details
- Modify promotion content
- Adjust credit amounts

## 🚨 Important Notes

- All products are set to **ACTIVE** status for testing
- Verification is **simulated** (always returns success)
- Users start with **50 credits** each
- Products are **excluded from their owner's promotion list**

---

**Happy testing! 🎉** 