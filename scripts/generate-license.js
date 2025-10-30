#!/usr/bin/env node
/**
 * License Key Generator Script
 * Run this to generate license keys for your customers
 * 
 * Usage: node scripts/generate-license.js
 */

const LicenseGenerator = require('../backend/utils/licenseGenerator');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const licenseGen = new LicenseGenerator();

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function generateLicense() {
  console.log('\n=== POS System License Generator ===\n');

  try {
    // Get customer information
    const customerEmail = await question('Customer Email: ');
    const customerName = await question('Customer Name: ');
    const deviceCount = await question('Number of Devices (default: 1): ') || '1';
    
    console.log('\nPackage Types:');
    console.log('1. Basic ($299)');
    console.log('2. Professional ($449)');
    console.log('3. Enterprise ($699)');
    const packageChoice = await question('Package Type (1/2/3, default: 2): ') || '2';
    
    const packageTypes = {
      '1': 'basic',
      '2': 'professional',
      '3': 'enterprise'
    };
    const packageType = packageTypes[packageChoice] || 'professional';

    // Optional expiry date
    const hasExpiry = await question('Set Expiry Date? (y/n, default: n): ') || 'n';
    let expiryDate = null;
    if (hasExpiry.toLowerCase() === 'y') {
      expiryDate = await question('Expiry Date (YYYY-MM-DD): ');
    }

    // Generate license
    const licenseData = {
      customerEmail: customerEmail.trim(),
      deviceCount: parseInt(deviceCount) || 1,
      packageType: packageType,
      expiryDate: expiryDate || null
    };

    const licenseKey = licenseGen.generate(licenseData);

    console.log('\n=== LICENSE GENERATED ===\n');
    console.log('License Key:', licenseKey);
    console.log('License ID:', licenseData.licenseId || 'Generated on activation');
    console.log('Customer:', customerName);
    console.log('Email:', customerEmail);
    console.log('Package:', packageType);
    console.log('Devices:', deviceCount);
    if (expiryDate) {
      console.log('Expiry:', expiryDate);
    }
    console.log('\n========================\n');

    // Save to file
    const save = await question('Save to licenses.txt? (y/n, default: y): ') || 'y';
    if (save.toLowerCase() === 'y') {
      const fs = require('fs');
      const licenseRecord = {
        generated: new Date().toISOString(),
        licenseKey,
        ...licenseData
      };
      
      let licenses = [];
      if (fs.existsSync('licenses.txt')) {
        licenses = JSON.parse(fs.readFileSync('licenses.txt', 'utf8'));
      }
      licenses.push(licenseRecord);
      fs.writeFileSync('licenses.txt', JSON.stringify(licenses, null, 2));
      console.log('License saved to licenses.txt\n');
    }

    // Continue?
    const again = await question('Generate another license? (y/n): ');
    if (again.toLowerCase() === 'y') {
      await generateLicense();
    }

  } catch (error) {
    console.error('Error generating license:', error);
  } finally {
    rl.close();
  }
}

generateLicense();

