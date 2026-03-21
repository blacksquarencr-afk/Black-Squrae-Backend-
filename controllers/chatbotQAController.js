import ChatbotQA from "../models/chatbotQA.js";
import Lead from "../models/Lead.js";

// ====================== ADD Q&A ======================
export const addQA = async (req, res) => {
  try {
    const { question, answer, keywords, category, priority } = req.body;

    // Validation
    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: "Question and answer are required",
      });
    }

    // Determine who is creating
    const createdBy = req.admin?.id || req.employee?._id;
    const createdByType = req.admin ? 'Admin' : 'Employee';

    // Create new Q&A
    const newQA = new ChatbotQA({
      question,
      answer,
      keywords: keywords || [],
      category: category || "general",
      priority: priority || 0,
      createdBy,
      createdByType,
    });

    await newQA.save();

    return res.status(201).json({
      success: true,
      message: "Q&A added successfully",
      data: newQA,
    });
  } catch (error) {
    console.error("Add Q&A Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add Q&A",
      error: error.message,
    });
  }
};

// ====================== GET ALL Q&A (ADMIN) ======================
export const getAllQA = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, isActive, search } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } },
        { keywords: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const qas = await ChatbotQA.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await ChatbotQA.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: qas,
      pagination: {
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        totalQAs: count,
        hasNext: page * limit < count,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get Q&A Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Q&A",
    });
  }
};

// ====================== GET SINGLE Q&A ======================
export const getQAById = async (req, res) => {
  try {
    const { id } = req.params;

    const qa = await ChatbotQA.findById(id);

    if (!qa) {
      return res.status(404).json({
        success: false,
        message: "Q&A not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: qa,
    });
  } catch (error) {
    console.error("Get Q&A Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Q&A",
    });
  }
};

// ====================== UPDATE Q&A ======================
export const updateQA = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, keywords, category, priority, isActive } = req.body;

    const qa = await ChatbotQA.findById(id);

    if (!qa) {
      return res.status(404).json({
        success: false,
        message: "Q&A not found",
      });
    }

    // Update fields
    if (question) qa.question = question;
    if (answer) qa.answer = answer;
    if (keywords) qa.keywords = keywords;
    if (category) qa.category = category;
    if (priority !== undefined) qa.priority = priority;
    if (isActive !== undefined) qa.isActive = isActive;

    await qa.save();

    return res.status(200).json({
      success: true,
      message: "Q&A updated successfully",
      data: qa,
    });
  } catch (error) {
    console.error("Update Q&A Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update Q&A",
    });
  }
};

// ====================== DELETE Q&A ======================
export const deleteQA = async (req, res) => {
  try {
    const { id } = req.params;

    const qa = await ChatbotQA.findByIdAndDelete(id);

    if (!qa) {
      return res.status(404).json({
        success: false,
        message: "Q&A not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Q&A deleted successfully",
    });
  } catch (error) {
    console.error("Delete Q&A Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete Q&A",
    });
  }
};

// ====================== CHATBOT - ASK QUESTION (PUBLIC) ======================
export const askChatbot = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    // Search for matching Q&A using text search and keyword matching
    const searchWords = question.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);

    // Try exact text search first
    let qa = await ChatbotQA.findOne({
      $text: { $search: question },
      isActive: true
    }).sort({ priority: -1, score: { $meta: "textScore" } });

    // If no exact match, try keyword matching
    if (!qa && searchWords.length > 0) {
      qa = await ChatbotQA.findOne({
        keywords: { $in: searchWords },
        isActive: true
      }).sort({ priority: -1, usageCount: -1 });
    }

    // If still no match, try partial question match
    if (!qa) {
      qa = await ChatbotQA.findOne({
        question: { $regex: searchWords.join('|'), $options: 'i' },
        isActive: true
      }).sort({ priority: -1 });
    }

    if (!qa) {
      return res.status(200).json({
        success: true,
        found: false,
        message: "I'm sorry, I don't have an answer to that question yet. Please contact our support team for assistance.",
        suggestions: await getPopularQuestions(),
      });
    }

    // Increment usage count
    qa.usageCount += 1;
    await qa.save();

    return res.status(200).json({
      success: true,
      found: true,
      data: {
        question: qa.question,
        answer: qa.answer,
        category: qa.category,
      },
    });
  } catch (error) {
    console.error("Chatbot Ask Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process question",
    });
  }
};

// Helper function to get popular questions
async function getPopularQuestions() {
  try {
    const popular = await ChatbotQA.find({ isActive: true })
      .sort({ usageCount: -1, priority: -1 })
      .limit(5)
      .select('question category');

    return popular.map(qa => ({
      question: qa.question,
      category: qa.category
    }));
  } catch (error) {
    return [];
  }
}

// ====================== GET CATEGORIES ======================
export const getCategories = async (req, res) => {
  try {
    const categories = await ChatbotQA.distinct('category', { isActive: true });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get Categories Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

// ====================== GET POPULAR QUESTIONS ======================
export const getPopularQuestionsRoute = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const popular = await ChatbotQA.find({ isActive: true })
      .sort({ usageCount: -1, priority: -1 })
      .limit(parseInt(limit))
      .select('question answer category usageCount');

    return res.status(200).json({
      success: true,
      data: popular,
    });
  } catch (error) {
    console.error("Get Popular Questions Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch popular questions",
    });
  }
};

// ====================== CHATBOT - CAPTURE VERIFIED LEAD ======================
export const captureChatbotLead = async (req, res) => {
  try {
    const { clientPhone, clientName, initialQuery } = req.body;

    if (!clientPhone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    // Nayi Lead Backend me save karein
    const newLead = new Lead({
      clientName: clientName || "Chatbot Visitor",
      clientPhone: clientPhone,
      status: "pending",
      priority: "medium",
      // Agar chahiye toh chatbot ki query ko remarks ya notes me save kar sakte hain
    });

    await newLead.save();

    return res.status(201).json({
      success: true,
      message: "Lead captured successfully from Chatbot",
      data: newLead
    });
  } catch (error) {
    console.error("Capture Chatbot Lead Error:", error);
    return res.status(500).json({ success: false, message: "Failed to capture lead" });
  }
};
