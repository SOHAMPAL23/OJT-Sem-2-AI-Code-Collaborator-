const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/compile', async (req, res) => {
  const { language, version = 'latest', code, stdin = '' } = req.body;
  console.log(req.body)
  try {
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language,
      version,
      files: [{ content: code }],
      stdin
    });   
    res.json(response.data);
  } catch (error) {
    console.error('Compile error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Compilation failed', details: error.response?.data || error.message });
  }
});

module.exports = router;
