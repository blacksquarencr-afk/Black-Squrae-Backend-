import xlsx from 'xlsx';

// Sample data for manual inquiries
const sampleData = [
  {
    'S_No': 1,
    'Client Name': 'Rajesh Kumar',
    'Contact Number': '+919876543210',
    'Client Code': 'CL001',
    'Project Code': 'PR001',
    'Product Type': 'Apartment',
    'Location': 'Noida',
    'Date': '2026-02-10',
    'Case Status': 'Open',
    'Source': 'Website',
    'Major Comments': 'Interested in 3BHK apartment',
    'Address': 'Sector 62, Noida',
    'Week/Action Taken': 'Week One',
    'Action Plan': 'Schedule site visit',
    'Reference By': 'Direct'
  },
  {
    'S_No': 2,
    'Client Name': 'Priya Sharma',
    'Contact Number': '+919876543211',
    'Client Code': 'CL002',
    'Project Code': 'PR002',
    'Product Type': 'Villa',
    'Location': 'Greater Noida',
    'Date': '2026-02-11',
    'Case Status': 'Week One',
    'Source': 'Referral',
    'Major Comments': 'Looking for luxury villa',
    'Address': 'Sector 150, Greater Noida',
    'Week/Action Taken': 'Week One',
    'Action Plan': 'Send property brochure',
    'Reference By': 'John Doe'
  },
  {
    'S_No': 3,
    'Client Name': 'Amit Patel',
    'Contact Number': '+919876543212',
    'Client Code': 'CL003',
    'Project Code': 'PR003',
    'Product Type': 'Plot',
    'Location': 'Central Noida',
    'Date': '2026-02-12',
    'Case Status': 'Week Two',
    'Source': 'Facebook',
    'Major Comments': 'Interested in residential plot',
    'Address': 'Sector 75, Noida',
    'Week/Action Taken': 'Week Two',
    'Action Plan': 'Send location details',
    'Reference By': 'Social Media'
  },
  {
    'S_No': 4,
    'Client Name': 'Sneha Reddy',
    'Contact Number': '+919876543213',
    'Client Code': 'CL004',
    'Project Code': 'PR001',
    'Product Type': 'Apartment',
    'Location': 'Noida West',
    'Date': '2026-02-13',
    'Case Status': 'Open',
    'Source': 'Walk-in',
    'Major Comments': 'Budget constraint discussion needed',
    'Address': 'Sector 121, Noida',
    'Week/Action Taken': '',
    'Action Plan': 'Financial consultation',
    'Reference By': 'Direct'
  },
  {
    'S_No': 5,
    'Client Name': 'Vikram Singh',
    'Contact Number': '+919876543214',
    'Client Code': 'CL005',
    'Project Code': 'PR004',
    'Product Type': 'Commercial',
    'Location': 'Yamuna Expressway',
    'Date': '2026-02-14',
    'Case Status': 'Closed',
    'Source': 'Email',
    'Major Comments': 'Deal finalized',
    'Address': 'Plot 45, Yamuna Expressway',
    'Week/Action Taken': 'Closed',
    'Action Plan': 'Documentation complete',
    'Reference By': 'Email Campaign'
  },
  {
    'S_No': 6,
    'Client Name': 'Anjali Mehta',
    'Contact Number': '+919876543215',
    'Client Code': 'CL006',
    'Project Code': 'PR002',
    'Product Type': 'Villa',
    'Location': 'Greater Noida',
    'Date': '2026-02-15',
    'Case Status': 'Unassigned',
    'Source': 'Phone',
    'Major Comments': 'New inquiry pending assignment',
    'Address': 'Sector 10, Greater Noida',
    'Week/Action Taken': '',
    'Action Plan': 'Initial contact',
    'Reference By': 'Cold Call'
  },
  {
    'S_No': 7,
    'Client Name': 'Ravi Gupta',
    'Contact Number': '+919876543216',
    'Client Code': 'CL007',
    'Project Code': 'PR005',
    'Product Type': 'Apartment',
    'Location': 'Noida',
    'Date': '2026-02-16',
    'Case Status': 'Week One',
    'Source': 'Google Ads',
    'Major Comments': '2BHK requirement, urgent',
    'Address': 'Sector 137, Noida',
    'Week/Action Taken': 'Week One',
    'Action Plan': 'Send property options',
    'Reference By': 'Online Ad'
  },
  {
    'S_No': 8,
    'Client Name': 'Neha Kapoor',
    'Contact Number': '+919876543217',
    'Client Code': 'CL008',
    'Project Code': 'PR001',
    'Product Type': 'Apartment',
    'Location': 'Central Noida',
    'Date': '2026-02-17',
    'Case Status': 'Open',
    'Source': 'Instagram',
    'Major Comments': 'First time buyer',
    'Address': 'Sector 50, Noida',
    'Week/Action Taken': '',
    'Action Plan': 'Buyer orientation session',
    'Reference By': 'Social Media'
  }
];

// Create workbook and worksheet
const workbook = xlsx.utils.book_new();
const worksheet = xlsx.utils.json_to_sheet(sampleData);

// Add worksheet to workbook
xlsx.utils.book_append_sheet(workbook, worksheet, 'Manual Inquiries');

// Write to file
xlsx.writeFile(workbook, 'sample_manual_inquiries.xlsx');

console.log('✅ Sample Excel file created: sample_manual_inquiries.xlsx');
console.log('📊 Total records:', sampleData.length);
console.log('📁 You can now use this file to test the bulk upload API');
