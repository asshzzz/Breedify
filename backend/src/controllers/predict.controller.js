// src/controllers/predict.controller.js
import dotenv from "dotenv";
dotenv.config();

export const predictBreed = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No image file uploaded",
      });
    }

    const imageBase64 = req.file.buffer.toString("base64");

    console.log("📤 Calling Roboflow API...");

    const response = await fetch(
      "https://serverless.roboflow.com/asheer/workflows/detect-and-classify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: process.env.ROBOFLOW_API_KEY,
          inputs: {
            image: { type: "base64", value: imageBase64 },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Roboflow API Error:", response.status, errorText);
      return res.status(response.status).json({
        success: false,
        error: "Roboflow API error",
        details: errorText,
      });
    }

    const result = await response.json();
    
    console.log("📥 Full Response:", JSON.stringify(result, null, 2));

    // ✅ EXTRACT BREED FROM CLASSIFICATION_PREDICTIONS
    let breed = null;
    let confidence = null;

    // Method 1: Check classification_predictions array
    if (result.classification_predictions && Array.isArray(result.classification_predictions)) {
      console.log("🔍 Found classification_predictions array");
      
      const classificationOutput = result.classification_predictions[0];
      if (classificationOutput && classificationOutput.predictions) {
        
        // Check if predictions is an object with 'top' field
        if (classificationOutput.predictions.top) {
          breed = classificationOutput.predictions.top;
          confidence = classificationOutput.predictions.confidence;
          console.log("✅ Breed from 'top' field:", breed, confidence);
        }
        // Check if predictions is an array
        else if (Array.isArray(classificationOutput.predictions.predictions)) {
          const prediction = classificationOutput.predictions.predictions[0];
          breed = prediction.class;
          confidence = prediction.confidence;
          console.log("✅ Breed from predictions array:", breed, confidence);
        }
      }
    }

    // Method 2: Check outputs array (fallback)
    if (!breed && result.outputs && Array.isArray(result.outputs)) {
      console.log("🔍 Searching in outputs array...");
      
      for (const output of result.outputs) {
        // Check for classification_predictions
        if (output.classification_predictions && Array.isArray(output.classification_predictions)) {
          const classOutput = output.classification_predictions[0];
          if (classOutput && classOutput.predictions) {
            breed = classOutput.predictions.top || classOutput.predictions.predictions?.[0]?.class;
            confidence = classOutput.predictions.confidence || classOutput.predictions.predictions?.[0]?.confidence;
            if (breed) {
              console.log("✅ Breed found in outputs:", breed, confidence);
              break;
            }
          }
        }
        
        // Check regular predictions
        if (!breed && output.predictions && Array.isArray(output.predictions)) {
          const prediction = output.predictions[0];
          if (prediction.class && prediction.class !== "cow") {
            breed = prediction.class;
            confidence = prediction.confidence;
            console.log("✅ Breed from predictions:", breed, confidence);
            break;
          }
        }
      }
    }

    // ❌ Final check
    if (!breed) {
      console.error("❌ Could not extract breed");
      return res.status(500).json({
        success: false,
        error: "Could not extract breed from API response",
        fullResponse: result
      });
    }

    // ✅ SUCCESS
    console.log("✅ Successfully detected breed:", breed);
    
    return res.status(200).json({
      success: true,
      data: {
        breed: breed,
        confidence: confidence ? (confidence * 100).toFixed(2) : "N/A",
        message: `Detected: ${breed}${
          confidence ? ` with ${(confidence * 100).toFixed(2)}% confidence` : ""
        }`,
      },
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};