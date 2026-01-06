# 🔍 AI Fake Review Detector

> **Stop trusting fake reviews!** This AI-powered tool analyzes product reviews and identifies suspicious patterns, helping you make informed buying decisions.

## 🎯 What Problem Does This Solve?

**Fake reviews are everywhere.** Studies show that up to 30% of online reviews are fake, costing consumers billions in poor purchasing decisions. This Actor helps you:

- ✅ Identify fake and suspicious reviews instantly
- ✅ Get a trust score for any product
- ✅ Understand suspicious patterns in reviews
- ✅ Make confident buying decisions

## 🚀 Features

| Feature | Description |
|---------|-------------|
| **AI-Powered Analysis** | Uses GPT to understand context and detect sophisticated fake reviews |
| **Pattern Detection** | Identifies common fake review patterns (repetition, excessive punctuation, generic praise) |
| **Trust Score** | Get a 0-100 trust score for the product |
| **Detailed Breakdown** | See which specific reviews are likely fake and why |
| **Works Anywhere** | Analyze reviews from any e-commerce site or paste reviews directly |

## 📊 Sample Output

```json
{
  "totalReviewsAnalyzed": 50,
  "summary": {
    "trustScore": 72,
    "fakePercentage": 24,
    "fakeCount": 12,
    "genuineCount": 38,
    "suspiciousPatterns": [
      "Excessive exclamation marks",
      "Generic superlatives",
      "Repetitive word patterns"
    ],
    "buyerRecommendation": "⚠️ Mixed reviews detected. Read carefully before purchasing."
  },
  "reviews": [
    {
      "reviewNumber": 1,
      "verdict": "LIKELY FAKE",
      "confidence": 85,
      "reason": "Excessive punctuation and generic praise without specific details"
    }
  ]
}
```

## 🛠️ How to Use

### Option 1: Analyze by URL
Simply paste the product URL and the Actor will scrape and analyze the reviews.

```json
{
  "productUrl": "https://www.amazon.com/product/example",
  "maxReviews": 50
}
```

### Option 2: Analyze Custom Reviews
Paste reviews directly for analysis:

```json
{
  "reviews": [
    {"text": "This product is amazing! Best purchase ever!"},
    {"text": "Decent product. Works as described but shipping was slow."},
    {"text": "BEST EVER!!! BUY NOW!!! AMAZING!!! 5 STARS!!!"}
  ]
}
```

## 📈 Use Cases

- **Online Shoppers**: Verify product reviews before buying
- **E-commerce Businesses**: Monitor competitor review authenticity
- **Market Researchers**: Analyze review quality across products
- **Brand Managers**: Detect fake reviews on your products
- **Journalists**: Investigate review fraud

## 🔬 How It Works

1. **Data Collection**: Scrapes reviews from the provided URL or accepts direct input
2. **Pattern Analysis**: Checks for common fake review indicators:
   - Excessive punctuation (!!!)
   - ALL CAPS text
   - Repetitive words
   - Generic superlatives without details
   - Unusually short positive reviews
3. **AI Analysis**: Uses GPT to understand context and detect sophisticated fakes
4. **Scoring**: Calculates trust score and fake percentage
5. **Recommendations**: Provides actionable buyer recommendations

## ⚙️ Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `productUrl` | String | No | URL of product page to analyze |
| `reviews` | Array | No | Direct array of reviews to analyze |
| `openaiApiKey` | String | No | OpenAI API key for AI analysis |
| `maxReviews` | Integer | No | Max reviews to analyze (default: 50) |

## 📤 Output Schema

The Actor outputs a comprehensive analysis including:

- **Trust Score**: 0-100 rating of review authenticity
- **Fake Percentage**: Percentage of reviews detected as fake
- **Individual Verdicts**: Each review marked as FAKE or GENUINE
- **Confidence Scores**: How confident the AI is in each verdict
- **Suspicious Patterns**: Common fake patterns found
- **Buyer Recommendation**: Actionable advice for shoppers

## 💡 Tips for Best Results

1. **More reviews = Better accuracy**: Analyze at least 20-30 reviews
2. **Use AI mode**: Provide OpenAI API key for best results
3. **Check the patterns**: Look at which patterns were detected
4. **Trust the score**: Trust scores above 70 are generally safe

## 🔒 Privacy & Ethics

- This tool is for informational purposes only
- We don't store or share any review data
- Use responsibly and ethically
- Results are probabilistic, not definitive

## 🤝 Support

Having issues? Found a bug? Have suggestions?

- Open an issue on the Actor page
- Contact via Apify Discord

## 📜 License

ISC License - Free to use for personal and commercial purposes.

---

**Made with ❤️ for smarter online shopping**

*Stop getting fooled by fake reviews. Make informed decisions.*
