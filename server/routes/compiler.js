const express = require('express');
const axios = require('axios');
const router = express.Router();

// Language mapping for Piston API (these names are usually stable)
const PISTON_LANGUAGE_MAP = {
  javascript: 'javascript',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
  typescript: 'typescript',
  ruby: 'ruby'
};

// Version mapping for Piston API - UPDATED WITH SPECIFIC VERSIONS
// These are common, recent versions. If you still face issues,
// verify these against Piston's /runtimes endpoint.
const PISTON_VERSION_MAP = {
  javascript: '18.15.0', // A common Node.js version
  python: '3.10.0',     // A common Python 3 version
  java: '15.0.2',       // A common Java version
  cpp: '10.2.0',        // A common C++ GCC version
  typescript: '4.9.5',  // A common TypeScript version
  ruby: '3.0.0'         // A common Ruby version
};

router.post('/compile', async (req, res) => {
  // Destructure the expected fields from the request body
  const { language, version, code, stdin = '' } = req.body;
  
  // Log incoming request for debugging purposes
  console.log('Compile request received:', {
    language,
    version,
    codeLength: code?.length, // Safely check code length
    hasStdin: !!stdin // Check if stdin is provided
  });

  // --- Crucial Validation Check ---
  // This is where the 400 error originated if 'language' or 'code' were missing
  if (!language || !code) {
    return res.status(400).json({ 
      error: 'Missing required fields', 
      details: 'Language and code are required in the request body' 
    });
  }

  // Map the incoming language to Piston's expected format
  const pistonLanguage = PISTON_LANGUAGE_MAP[language];
  if (!pistonLanguage) {
    return res.status(400).json({ 
      error: 'Unsupported language', 
      details: `Language '${language}' is not supported by the compiler API` 
    });
  }

  // Determine the Piston version to use
  // Prioritize the version from the request, otherwise use our map, fallback to 'latest' if all else fails
  const pistonVersion = version || PISTON_VERSION_MAP[language] || 'latest';

  try {
    // Construct the request payload for the Piston API
    const pistonRequest = {
      language: pistonLanguage,
      version: pistonVersion,
      files: [{ 
        name: getFileName(language), // Helper function to get appropriate file name
        content: code 
      }],
      stdin: stdin,
      args: [], // Optional arguments for the program
      compile_timeout: 10000, // 10 seconds for compilation
      run_timeout: 3001,      // 3.001 seconds for execution (Piston's default max is 3s)
      compile_memory_limit: -1, // No limit
      run_memory_limit: -1      // No limit
    };

    console.log('Sending to Piston:', {
      language: pistonLanguage,
      version: pistonVersion,
      fileName: getFileName(language),
      requestedVersion: pistonVersion // Log the actual version being sent
    });

    // Make the POST request to the Piston execution API
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', pistonRequest);
    
    // Log the raw response from Piston for in-depth debugging
    console.log('Piston response:', JSON.stringify(response.data, null, 2));

    // Transform Piston's response into a more consistent and user-friendly format
    const transformedResponse = {
      language: pistonLanguage,
      version: response.data.version, // Use the version confirmed by Piston
      run: {
        stdout: response.data.run?.stdout || '', // Standard output
        stderr: response.data.run?.stderr || '', // Standard error
        output: response.data.run?.stdout || response.data.run?.stderr || '', // Combined output
        signal: response.data.run?.signal || null, // Signal that terminated the process
        code: response.data.run?.code || 0 // Exit code
      },
      compile: response.data.compile || null // Compilation details (if any)
    };

    // If there's a compilation error, prioritize it in the output
    if (response.data.compile && response.data.compile.stderr) {
      transformedResponse.run.output = `Compilation Error:\n${response.data.compile.stderr}`;
    }

    // Send the transformed response back to the frontend
    res.json(transformedResponse);
    
  } catch (error) {
    // Error handling for issues with the Piston API request
    console.error('Piston API error:', error.response?.data || error.message);
    
    // Specific error handling based on HTTP status codes from Piston
    if (error.response?.status === 400) {
      return res.status(400).json({ 
        error: 'Invalid request to compiler service', 
        details: error.response.data?.message || 'Bad request to Piston API (check your code/input)'
      });
    }
    
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded', 
        details: 'Too many requests to the external compiler API. Please wait a moment.'
      });
    }

    // Generic 500 error for other unexpected issues
    res.status(500).json({ 
      error: 'Compilation service unavailable or internal server error', 
      details: error.response?.data || error.message 
    });
  }
});

// Helper function to get appropriate file name based on language
function getFileName(language) {
  const fileNames = {
    javascript: 'main.js',
    python: 'main.py',
    java: 'Main.java',
    cpp: 'main.cpp',
    typescript: 'main.ts',
    ruby: 'main.rb'
  };
  return fileNames[language] || 'main.txt'; // Default to .txt if language is unknown
}

// Additional route to get available languages and versions from Piston
// This is useful for populating dropdowns or informing users about supported languages
router.get('/languages', async (req, res) => {
  try {
    const response = await axios.get('https://emkc.org/api/v2/piston/runtimes');
    res.json(response.data); // Returns an array of supported runtimes
  } catch (error) {
    console.error('Failed to fetch languages from Piston API:', error.message);
    res.status(500).json({ error: 'Failed to fetch available languages from compiler service' });
  }
});

module.exports = router;
