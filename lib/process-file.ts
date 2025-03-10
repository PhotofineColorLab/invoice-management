"use server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import type { CategoryData } from "@/app/types/data-types";

export async function processFile(file: File): Promise<CategoryData> {
  try {
    // Convert file to base64
    const fileBuffer = await file.arrayBuffer();
    const fileBase64 = Buffer.from(fileBuffer).toString("base64");
    const mimeType = file.type;

    // Prepare the prompt for the AI - make it more explicit about JSON format
    const prompt = `
        Analyze this document and extract information into three categories.
        
        Your response MUST be a valid JSON object with exactly this structure:
        {
          "invoices": [ array of invoice objects ],
          "products": [ array of product objects ],
          "customers": [ array of customer objects ]
        }
        
        DO NOT include any explanations, markdown formatting, or text before or after the JSON.
        ONLY return the JSON object and nothing else.
        
        For each category, extract the following:
        
        1. INVOICES: Extract all invoice details including invoice number, date, due date, vendor, customer, amount, status, and payment terms.
        
        2. PRODUCTS: Extract all product details including name, SKU/ID, description, price, and quantity.
        
        3. CUSTOMERS: Extract all customer details including name, email, phone, address, and customer ID.
        
        If a field is not present in the document, omit it from the JSON.
        If a category has no items, include an empty array for that category.
        
        Example of the EXACT format I expect:
        {
          "invoices": [
            {
              "invoiceNumber": "INV-001",
              "date": "2023-05-15",
              "vendor": "ABC Company",
              "customer": "XYZ Corp",
              "amount": 1250.00,
              "status": "Paid"
            }
          ],
          "products": [
            {
              "name": "Widget Pro",
              "sku": "WP-123",
              "price": 49.99,
              "quantity": 10
            }
          ],
          "customers": [
            {
              "name": "XYZ Corp",
              "email": "contact@xyzcorp.com",
              "phone": "555-123-4567"
            }
          ]
        }
      `;

    // Call the AI model
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "file",
              data: Buffer.from(fileBuffer),
              mimeType,
            },
          ],
        },
      ],
    });

    // Extract JSON from the response - handle potential text before/after JSON
    let jsonData: CategoryData;
    try {
      // First try direct parsing
      jsonData = JSON.parse(text) as CategoryData;
    } catch (error) {
      // If direct parsing fails, try to extract JSON from the text
      console.log(
        "Direct parsing failed, attempting to extract JSON from text"
      );

      // Look for JSON object pattern
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          jsonData = JSON.parse(jsonMatch[0]) as CategoryData;
        } catch (innerError) {
          console.error("Failed to parse extracted JSON:", innerError);
          throw new Error("Failed to parse the document data");
        }
      } else {
        // If no JSON pattern found, create empty structure
        console.error("No JSON pattern found in response");
        console.log("AI Response:", text);
        jsonData = { invoices: [], products: [], customers: [] };
      }
    }

    // Ensure all arrays exist and return
    return {
      invoices: jsonData.invoices || [],
      products: jsonData.products || [],
      customers: jsonData.customers || [],
    };
  } catch (error) {
    console.error("Error processing file:", error);
    throw new Error("Failed to process the document");
  }
}
