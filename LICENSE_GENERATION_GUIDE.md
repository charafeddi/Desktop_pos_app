# License Generation Guide - POS Desktop Application

## 🔑 How to Generate License Keys

### Method 1: Using the License Generator Script (Recommended)

#### Step 1: Navigate to Project Directory
```bash
cd Desktop_pos_app
```

#### Step 2: Run the License Generator
```bash

```

#### Step 3: Follow the Interactive Prompts

The script will ask you for:

1. **Customer Email** - The email address of the customer
   ```
   Customer Email: customer@example.com
   ```

2. **Customer Name** - The name of the customer
   ```
   Customer Name: John Doe
   ```

3. **Number of Devices** - How many devices can use this license (default: 1)
   ```
   Number of Devices (default: 1): 3
   ```

4. **Package Type** - Choose the package tier
   ```
   Package Types:
   1. Basic ($299)
   2. Professional ($449)
   3. Enterprise ($699)
   Package Type (1/2/3, default: 2): 2
   ```

5. **Expiry Date** (Optional) - Set an expiration date
   ```
   Set Expiry Date? (y/n, default: n): y
   Expiry Date (YYYY-MM-DD): 2025-12-31
   ```

#### Step 4: License Generated!

The script will display:
```
=== LICENSE GENERATED ===

License Key: XXXX-XXXX-XXXX-XXXX-XXXX
Customer: John Doe
Email: customer@example.com
Package: professional
Devices: 3
Expiry: 2025-12-31

========================
```

#### Step 5: Save License (Optional)

The script will ask:
```
Save to licenses.txt? (y/n, default: y): y
```

If you choose 'y', the license will be saved to `licenses.txt` in the project root.

---

## 📋 Package Types

### 1. Basic Package ($299)
- Single device activation
- Core POS features
- Basic reporting
- Email support

### 2. Professional Package ($449) - **Recommended**
- Up to 3 device activations
- All POS features
- Advanced analytics
- Cloud sync
- Priority support

### 3. Enterprise Package ($699)
- Unlimited device activations
- All features
- Custom integrations
- Dedicated support
- Training included

---

## 🔧 Manual License Generation (Advanced)

If you need to generate licenses programmatically:

### Create a Node.js Script

```javascript
const LicenseGenerator = require('./backend/utils/licenseGenerator');

const licenseGen = new LicenseGenerator();

const licenseData = {
  customerEmail: 'customer@example.com',
  deviceCount: 3,
  packageType: 'professional',
  expiryDate: '2025-12-31' // Optional
};

const licenseKey = licenseGen.generate(licenseData);
console.log('License Key:', licenseKey);
```

### Run Your Script
```bash
node your-script.js
```

---

## 📝 License File Format

Licenses are saved in `licenses.txt` as JSON:

```json
[
  {
    "generated": "2024-01-07T12:00:00.000Z",
    "licenseKey": "XXXX-XXXX-XXXX-XXXX-XXXX",
    "customerEmail": "customer@example.com",
    "deviceCount": 3,
    "packageType": "professional",
    "expiryDate": "2025-12-31"
  }
]
```

---

## 🎯 License Activation Process

### For Customers:

1. **Install the POS Application**
   - Run the installer
   - Launch the application

2. **Enter License Key**
   - On first launch, a license activation screen appears
   - Enter the license key provided
   - Enter customer email
   - Enter customer name

3. **Activate**
   - Click "Activate License"
   - The app validates the license
   - If valid, the app unlocks and is ready to use

### License Validation

The system checks:
- ✅ License key format is valid
- ✅ License key matches customer email
- ✅ Device count not exceeded
- ✅ License not expired (if expiry date set)
- ✅ Device fingerprint recorded

---

## 🔄 License Management

### Check License Status

In the app:
1. Go to **Settings** → **License**
2. View current license information:
   - License key
   - Customer email
   - Package type
   - Devices activated
   - Expiry date (if applicable)

### Deactivate License

To move license to another device:
1. Go to **Settings** → **License**
2. Click **Deactivate License**
3. Confirm deactivation
4. Use the same license key on the new device

---

## 🛠️ Troubleshooting

### Issue: "License key is invalid"

**Solution:**
- Check that the license key is entered correctly
- Ensure no extra spaces
- Verify the customer email matches

### Issue: "Maximum devices reached"

**Solution:**
- Deactivate license on an unused device
- Or upgrade to a higher package tier
- Or purchase additional device licenses

### Issue: "License has expired"

**Solution:**
- Contact support for license renewal
- Generate a new license with extended expiry date

### Issue: Script won't run

**Solution:**
```bash
# Make sure you're in the project directory
cd Desktop_pos_app

# Check if Node.js is installed
node --version

# If not installed, install Node.js from nodejs.org

# Run the script
node scripts/generate-license.js
```

---

## 📊 License Database

Licenses are stored in the SQLite database:

**Table:** `licenses`

**Columns:**
- `id` - Auto-increment ID
- `license_key` - The license key
- `license_id` - Unique license identifier
- `customer_email` - Customer's email
- `customer_name` - Customer's name
- `device_count` - Number of allowed devices
- `package_type` - Package tier (basic/professional/enterprise)
- `device_fingerprint` - Unique device identifier
- `activated_at` - Activation timestamp
- `expiry_date` - Expiration date (nullable)
- `is_active` - Active status (1 or 0)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

---

## 🔐 Security Notes

1. **Keep License Keys Secure**
   - Don't share license keys publicly
   - Store `licenses.txt` securely
   - Don't commit `licenses.txt` to version control

2. **Device Fingerprinting**
   - Each device has a unique fingerprint
   - Prevents license sharing across unlimited devices
   - Based on hardware identifiers

3. **License Validation**
   - Licenses are validated on app startup
   - Invalid licenses prevent app usage
   - Expired licenses show warning and block features

---

## 📞 Support

For license-related issues:
- Email: support@yourcompany.com
- Documentation: See `ARCHITECTURE.md` for technical details
- License Generator: `scripts/generate-license.js`

---

## 🎁 Example: Generate Multiple Licenses

To generate multiple licenses quickly, create a script:

```javascript
// bulk-generate-licenses.js
const LicenseGenerator = require('./backend/utils/licenseGenerator');
const fs = require('fs');

const licenseGen = new LicenseGenerator();

const customers = [
  { email: 'customer1@example.com', name: 'Customer 1', devices: 1, package: 'basic' },
  { email: 'customer2@example.com', name: 'Customer 2', devices: 3, package: 'professional' },
  { email: 'customer3@example.com', name: 'Customer 3', devices: 10, package: 'enterprise' }
];

const licenses = customers.map(customer => {
  const licenseKey = licenseGen.generate({
    customerEmail: customer.email,
    deviceCount: customer.devices,
    packageType: customer.package
  });
  
  return {
    generated: new Date().toISOString(),
    licenseKey,
    customerEmail: customer.email,
    customerName: customer.name,
    deviceCount: customer.devices,
    packageType: customer.package
  };
});

fs.writeFileSync('bulk-licenses.json', JSON.stringify(licenses, null, 2));
console.log(`Generated ${licenses.length} licenses!`);
```

Run it:
```bash
node bulk-generate-licenses.js
```

---

## ✅ Quick Reference

| Task | Command |
|------|---------|
| **Generate License** | `node scripts/generate-license.js` |
| **View Licenses** | Check `licenses.txt` file |
| **Activate License** | Launch app → Enter license key |
| **Deactivate License** | Settings → License → Deactivate |
| **Check License Status** | Settings → License |

---

**Last Updated:** January 2024
**Version:** 1.0.0
