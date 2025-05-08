const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/tiniurls', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortCode: String,
});

const Url = mongoose.model('Url', urlSchema);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create short URL
app.post('/shorten', async (req, res) => {
  try {
    const { originalUrl } = req.body;
    const shortCode = shortid.generate();
    const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;

    await Url.create({ originalUrl, shortCode });

    res.json({ shortUrl });
  } catch (err) {
    res.status(500).json({ error: 'Server error while shortening URL' });
  }
});

// Redirect to original URL
app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const entry = await Url.findOne({ shortCode });

    if (entry) {
      res.redirect(entry.originalUrl);
    } else {
      res.status(404).send('Short URL not found.');
    }
  } catch (err) {
    res.status(500).send('Server error during redirection.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
