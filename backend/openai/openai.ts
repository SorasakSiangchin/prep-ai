import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

export const generateQuestions = async (
  industry: string,
  topic: string,
  type: string,
  role: string,
  numOfQuestions: number,
  duration: number,
  difficulty: string
) => {
  const tokensPerQuestion = 500;

  // กำหนด max ของ token ตามจำนวนคำถาม
  const maxTokens = tokensPerQuestion * numOfQuestions;

  const promt = `
    Generate total "${numOfQuestions}" "${difficulty}" "${type}" interview questions for the topic "${topic}" in the "${industry}" industry.
    The interview is for a candidate applying for the role of "${role}" and total duration of interview is "${duration}" minutes.
    
    **Ensure the following:**
    - The questions are well-balanced, including both open-ended and specific questions.
    - Each question is designed to evaluate a specific skill or knowledge area relevant to the role.
    - The questions are clear, concise and engaging for the candidate.
    - The questions are suitable for a "${difficulty}" interview in the "${industry}" industry.
    - Ensure the questions are directly aligned with "${difficulty}" responsibilities and expertise in "${role}".
    
    **Instructions:**
    - Always follow same format for questions.
    - Provide all question without any prefix.
    - No question number or bullet points or hypen - is required.
    `;

  const question_system_content =
    "You are expert in generating questions tailored to specific roles, industries, experience levels and topic. You responses should be professional, concise and well-structured. ";

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      // role: "system" ใช้กำหนดให้ model มีแนวทางการตอบในลักษณะที่เราต้องการ
      {
        role: "system",
        content: question_system_content,
      },
      // role: "user" เป็นข้อความที่ผู้ใช้ส่งเข้ามาหรือแอปพลิเคชันที่ต้องการถามคำถาม
      {
        role: "user",
        content: promt,
      },
    ],
    // กำหนดจำนวน token สูงสุดที่โมเดลจะใช้ในการตอบกลับข้อความ (completion) ซึ่งช่วยควบคุมความยาวของ output ที่ได้รับ
    max_completion_tokens: maxTokens,

    // ควบคุมระดับความสุ่มของผลลัพธ์ที่โมเดลสร้าง ยิ่งค่าสูง (ใกล้ 1) โมเดลจะตอบแบบสุ่มและสร้างสรรค์มากขึ้น ในขณะที่ค่าสูงต่ำจะทำให้ผลลัพธ์มีความแน่นอนและคาดเดาได้มากกว่า
    temperature: 0.8,
  });

  const content = response?.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Failed to generate questions.");
  }

  const questions = content
    .trim()
    .split("\n")
    .filter((q) => q)
    .map((q) => ({
      question: q,
    }));

  return questions;
};

function extractScoresAndSuggestion(content: string) {
  // ถ้า string มีค่า "Overall score=8", ผลลัพธ์ที่ได้จาก .match() จะเป็น array ที่ประกอบด้วยข้อมูลที่จับคู่ เช่น
  // Index 0: "Overall score=8" (ข้อความที่เจอทั้งหมด)
  // Index 1: "8" (ตัวเลขที่จับตาม capturing group)

  const overAllScoreMatch = content.match(/Overall score=(\d+)/);
  const relevanceScoreMatch = content.match(/Relevance score=(\d+)/);
  const clarityScoreMatch = content.match(/Clarity score=(\d+)/);
  const completenessScoreMatch = content.match(/Completeness score=(\d+)/);
  const suggestionsMatch = content.match(/Suggestions=(.*)/);

  const overAllScore = overAllScoreMatch ? overAllScoreMatch[1] : "0";
  const relevanceScore = relevanceScoreMatch ? relevanceScoreMatch[1] : "0";
  const clarityScore = clarityScoreMatch ? clarityScoreMatch[1] : "0";
  const completenessScore = completenessScoreMatch
    ? completenessScoreMatch[1]
    : "0";
  const suggestion = suggestionsMatch ? suggestionsMatch[1] : "";

  return {
    overallScore: parseInt(overAllScore),
    relevance: parseInt(relevanceScore),
    clarity: parseInt(clarityScore),
    completeness: parseInt(completenessScore),
    suggestion,
  };
}

// function สำหรับการประเมินคำตอบ
export const evaluateAnswer = async (question: string, answer: string) => {
  const answerPrompt = `
    Evaluate the following answer to the question based on the evaluation criteria and provide the scores for relevance, clarity, and completeness, followed by suggestions in text format.
    
    **Evaluation Criteria:**
        1. Overall Score: Provide an overall score out of 10 based on the quality of the answer.
        2. Relevance: Provide a score out of 10 based on how relevant the answer is to the question.
        3. Clarity: Provide a score out of 10 based on how clear and easy to understand the explanation is.
        4. Completeness: Provide a score out of 10 based on how well the answer covers all aspects of the question.
        5. Suggestions: Provide any suggestions or improvements to the answer in text.

    **Question:** ${question}
    **Answer:** ${answer}

    **Instructions:**
        - Always follow same format for providing scores and suggestions.
        - Provide the score only like "Overall score=5", "Relevance score=7", "Clarity =9", "Completeness score=1", for following:
            - Overall score
            - Relevance score
            - Clarity score
            - Completeness score
        -Provide text only for following only like "Suggestions=your_answer_here":  
            - Suggestions or improved answer in text.
    `;

  const answer_system_content =
    "You are an expert evaluator with a strong understanding of assessing answers to interview questions.";

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      // role: "system" ใช้กำหนดให้ model มีแนวทางการตอบในลักษณะที่เราต้องการ
      {
        role: "system",
        content: answer_system_content,
      },
      // role: "user" เป็นข้อความที่ผู้ใช้ส่งเข้ามาหรือแอปพลิเคชันที่ต้องการถามคำถาม
      {
        role: "user",
        content: answerPrompt,
      },
    ],
    // กำหนดจำนวน token สูงสุดที่โมเดลจะใช้ในการตอบกลับข้อความ (completion) ซึ่งช่วยควบคุมความยาวของ output ที่ได้รับ
    max_completion_tokens: 500,

    // ควบคุมระดับความสุ่มของผลลัพธ์ที่โมเดลสร้าง ยิ่งค่าสูง (ใกล้ 1) โมเดลจะตอบแบบสุ่มและสร้างสรรค์มากขึ้น ในขณะที่ค่าสูงต่ำจะทำให้ผลลัพธ์มีความแน่นอนและคาดเดาได้มากกว่า
    temperature: 0.8,
  });

  const content = response?.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Failed to generate questions.");
  }

  const result = extractScoresAndSuggestion(content);

  return {
    overallScore: result.overallScore,
    relevance: result.relevance,
    clarity: result.clarity,
    completeness: result.completeness,
    suggestion: result.suggestion,
  };
};
