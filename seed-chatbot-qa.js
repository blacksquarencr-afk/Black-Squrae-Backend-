import mongoose from "mongoose";
import dotenv from "dotenv";
import ChatbotQA from "./models/chatbotQA.js";

dotenv.config();

const chatbotQAData = [
  {
    question: "Hi, Hello, Hey",
    answer: "Hello 👋 Welcome to our Real Estate Support. How can I help you today?",
    keywords: ["hi", "hello", "hey", "greetings", "good morning", "good evening"],
    category: "greeting",
    priority: 100
  },
  {
    question: "I want to buy a property",
    answer: "Sure! We can help you buy residential and commercial properties. What type of property are you looking for?",
    keywords: ["buy", "purchase", "acquire", "invest", "buying"],
    category: "buying",
    priority: 90
  },
  {
    question: "I want to rent a property",
    answer: "We have multiple rental properties available. Please tell us your preferred location and budget.",
    keywords: ["rent", "lease", "rental", "tenant", "renting"],
    category: "renting",
    priority: 90
  },
  {
    question: "What is the price range?",
    answer: "Property prices vary based on location, size, and amenities. Please share your budget and preferred area.",
    keywords: ["price", "cost", "budget", "expensive", "cheap", "affordable", "rates"],
    category: "pricing",
    priority: 85
  },
  {
    question: "What locations do you have?",
    answer: "Great choice 🏙️ We have multiple properties available in various locations. Are you looking to buy or rent?",
    keywords: ["location", "area", "city", "noida", "delhi", "gurgaon", "greater noida", "faridabad", "ghaziabad", "place", "where"],
    category: "location",
    priority: 85
  },
  {
    question: "Can I schedule a site visit?",
    answer: "You can schedule a site visit 🏠. Please share your preferred date and time.",
    keywords: ["site visit", "visit", "inspection", "see property", "viewing", "tour", "show"],
    category: "site-visit",
    priority: 80
  },
  {
    question: "Do you provide home loan assistance?",
    answer: "Yes, we assist with home loans and EMI options through leading banks. Would you like a loan consultation?",
    keywords: ["loan", "emi", "home loan", "finance", "bank", "mortgage", "funding"],
    category: "financing",
    priority: 75
  },
  {
    question: "What documents are required?",
    answer: "Required documents usually include ID proof, address proof, income proof, and property documents.",
    keywords: ["documents", "papers", "legal", "documentation", "requirements", "needed papers"],
    category: "documentation",
    priority: 70
  },
  {
    question: "Can I talk to an agent?",
    answer: "Our property expert will contact you shortly. Please share your phone number.",
    keywords: ["agent", "broker", "contact", "representative", "expert", "consultant", "talk to someone"],
    category: "contact",
    priority: 95
  },
  {
    question: "What are your office hours?",
    answer: "Our office hours are Monday to Saturday, 10:00 AM – 7:00 PM.",
    keywords: ["office hours", "timing", "working hours", "open", "closed", "schedule", "availability"],
    category: "general",
    priority: 60
  },
  {
    question: "Thank you",
    answer: "You're welcome 😊 Let me know if you need help with any property.",
    keywords: ["thank", "thanks", "thank you", "appreciate", "grateful"],
    category: "gratitude",
    priority: 50
  },
  {
    question: "Goodbye",
    answer: "Thank you for visiting! 👋 Have a great day.",
    keywords: ["bye", "goodbye", "see you", "later", "exit"],
    category: "farewell",
    priority: 50
  },
  {
    question: "What types of properties do you have?",
    answer: "We offer residential properties (apartments, villas, plots) and commercial properties (offices, shops, warehouses). What are you interested in?",
    keywords: ["types", "kind", "property type", "residential", "commercial", "apartment", "villa", "plot"],
    category: "property-types",
    priority: 80
  },
  {
    question: "Do you have 2BHK apartments?",
    answer: "Yes, we have 2BHK, 3BHK, and 4BHK apartments available. Please share your preferred location and budget.",
    keywords: ["2bhk", "3bhk", "4bhk", "bedroom", "bhk", "flat size"],
    category: "property-types",
    priority: 75
  },
  {
    question: "What amenities are available?",
    answer: "Our properties offer amenities like parking, security, gym, swimming pool, clubhouse, and more. Specific amenities vary by property.",
    keywords: ["amenities", "facilities", "features", "parking", "gym", "pool", "security", "clubhouse"],
    category: "amenities",
    priority: 70
  }
];

const seedChatbotQA = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_CONN);
    console.log("✅ MongoDB Connected");

    // Clear existing data (optional - comment out if you want to keep existing data)
    await ChatbotQA.deleteMany({});
    console.log("🗑️  Cleared existing chatbot Q&A data");

    // Insert new data
    const inserted = await ChatbotQA.insertMany(chatbotQAData);
    console.log(`✅ Successfully seeded ${inserted.length} chatbot Q&A entries`);

    // Display inserted data
    console.log("\n📋 Inserted Q&A:");
    inserted.forEach((qa, index) => {
      console.log(`\n${index + 1}. Category: ${qa.category}`);
      console.log(`   Question: ${qa.question}`);
      console.log(`   Keywords: ${qa.keywords.join(", ")}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding chatbot Q&A:", error);
    process.exit(1);
  }
};

seedChatbotQA();
