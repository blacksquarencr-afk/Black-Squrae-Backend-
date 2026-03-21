import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const testSMS = async () => {
  try {
    const phone = process.argv[2] || '9876543210'; // Get phone from command line
    const otp = Math.floor(1000 + Math.random() * 9000);
    const smsMessage = `Your OTP for login is ${otp}. Valid for 5 minutes. - Black Square`;
    
    console.log('🔧 Testing SMS Configuration');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Phone Number:', phone);
    console.log('OTP:', otp);
    console.log('Message:', smsMessage);
    console.log('API Key:', process.env.RENFLAIR_API_KEY ? '✓ Found' : '✗ Missing');
    console.log('SMS URL:', process.env.RENFLAIR_SMS_URL || '✗ Missing');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (!process.env.RENFLAIR_API_KEY || !process.env.RENFLAIR_SMS_URL) {
      console.error('❌ Missing environment variables!');
      console.log('\nPlease check your .env file has:');
      console.log('RENFLAIR_API_KEY=your_api_key');
      console.log('RENFLAIR_SMS_URL=https://sms.renflair.in/V1.php');
      process.exit(1);
    }
    
    const smsUrl = `${process.env.RENFLAIR_SMS_URL}?Key=${process.env.RENFLAIR_API_KEY}&Phone=${phone}&Message=${encodeURIComponent(smsMessage)}`;
    
    console.log('📤 Sending SMS...\n');
    console.log('Full URL (with masked key):');
    console.log(smsUrl.replace(process.env.RENFLAIR_API_KEY, '***KEY***'));
    console.log('');
    
    const response = await axios.get(smsUrl, { 
      timeout: 15000,
      validateStatus: () => true // Accept any status
    });
    
    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Data:', response.data);
    console.log('');
    
    if (response.status === 200) {
      console.log('✅ SMS API call succeeded!');
      
      // Check response content for success indicators
      const responseText = JSON.stringify(response.data).toLowerCase();
      if (responseText.includes('success') || responseText.includes('sent')) {
        console.log('✅ SMS appears to be sent successfully');
      } else if (responseText.includes('error') || responseText.includes('fail')) {
        console.log('⚠️  SMS API returned error:', response.data);
      } else {
        console.log('⚠️  Unexpected response format. Check with Renflair documentation.');
      }
    } else {
      console.log('❌ SMS API call failed with status:', response.status);
    }
    
  } catch (error) {
    console.error('\n❌ Error sending SMS:');
    console.error('Message:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received from server');
      console.error('Check your internet connection and SMS API URL');
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out. SMS service may be slow or unavailable.');
    }
  }
};

console.log('🧪 Renflair SMS Test Script');
console.log('Usage: node test-sms.mjs [phone_number]');
console.log('Example: node test-sms.mjs 919876543210\n');

testSMS();
