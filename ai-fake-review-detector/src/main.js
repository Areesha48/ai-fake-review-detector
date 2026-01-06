import { Actor } from 'apify';
import { CheerioCrawler } from 'crawlee';
import OpenAI from 'openai';

// Initialize the Actor
await Actor.init();

// Get input
const input = await Actor.getInput() ?? {};
const {
    productUrl = '',
    reviews = [],
    openaiApiKey = process.env.OPENAI_API_KEY,
    maxReviews = 50
} = input;

console.log('🔍 AI Fake Review Detector Starting...');
console.log(`📦 Product URL: ${productUrl}`);

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: openaiApiKey,
});

// Store for scraped reviews
let scrapedReviews = reviews.length > 0 ? reviews : [];

// If URL provided, scrape reviews
if (productUrl && scrapedReviews.length === 0) {
    console.log('🕷️ Scraping reviews from URL...');
    
    const crawler = new CheerioCrawler({
        maxRequestsPerCrawl: 5,
        async requestHandler({ request, $, enqueueLinks }) {
            console.log(`Processing: ${request.url}`);
            
            // Generic review selectors (works for many e-commerce sites)
            const reviewSelectors = [
                '.review-text',
                '.review-body',
                '.review-content',
                '[data-hook="review-body"]',
                '.customer-review',
                '.product-review',
                '.user-review',
                '.comment-text',
                '.review p',
                '.review-description'
            ];
            
            for (const selector of reviewSelectors) {
                $(selector).each((i, el) => {
                    if (scrapedReviews.length < maxReviews) {
                        const text = $(el).text().trim();
                        if (text && text.length > 20) {
                            scrapedReviews.push({
                                text: text.substring(0, 500),
                                source: 'scraped'
                            });
                        }
                    }
                });
            }
            
            // Also try to get rating if available
            const ratingSelectors = [
                '.rating',
                '.star-rating',
                '[data-hook="review-star-rating"]',
                '.review-rating'
            ];
            
            console.log(`Found ${scrapedReviews.length} reviews so far`);
        },
    });

    try {
        await crawler.run([productUrl]);
    } catch (error) {
        console.log('⚠️ Could not scrape URL, using provided reviews or sample data');
    }
}

// If still no reviews, use sample for demo
if (scrapedReviews.length === 0) {
    console.log('📝 Using sample reviews for demonstration...');
    scrapedReviews = [
        { text: "This product is amazing! Best purchase ever! 5 stars! Highly recommend to everyone! Buy it now!", source: "sample" },
        { text: "I've been using this for 3 months now. The quality is decent for the price. Battery life could be better but overall satisfied with my purchase.", source: "sample" },
        { text: "BEST PRODUCT EVER!!! BUY NOW!!! AMAZING!!! 5 STARS!!! PERFECT!!!", source: "sample" },
        { text: "Received the item last week. Packaging was good. The product works as described. Took a star off because shipping was slow.", source: "sample" },
        { text: "Great great great! Love love love! Best best best! Amazing amazing amazing! Perfect perfect perfect!", source: "sample" },
        { text: "Not bad for the price. I was skeptical at first but it does what it says. The instructions could be clearer though.", source: "sample" },
        { text: "Excellent product excellent service excellent quality excellent everything! 5 stars!", source: "sample" },
        { text: "Used this for my home office setup. It's functional but nothing special. Does the job adequately.", source: "sample" }
    ];
}

console.log(`📊 Analyzing ${scrapedReviews.length} reviews with AI...`);

// Analyze reviews with AI
async function analyzeReviews(reviews) {
    const reviewTexts = reviews.map((r, i) => `Review ${i + 1}: "${r.text}"`).join('\n');
    
    const prompt = `You are an expert at detecting fake product reviews. Analyze these reviews and identify which ones are likely fake or suspicious.

${reviewTexts}

For each review, determine:
1. Is it likely FAKE or GENUINE?
2. Confidence score (0-100%)
3. Reason for your assessment

Also provide:
- Overall fake review percentage
- Trust score for this product (0-100)
- Key suspicious patterns found
- Recommendations for buyers

Respond in this exact JSON format:
{
    "reviews": [
        {
            "reviewNumber": 1,
            "verdict": "FAKE" or "GENUINE",
            "confidence": 85,
            "reason": "explanation"
        }
    ],
    "summary": {
        "totalReviews": number,
        "fakeCount": number,
        "genuineCount": number,
        "fakePercentage": number,
        "trustScore": number,
        "suspiciousPatterns": ["pattern1", "pattern2"],
        "buyerRecommendation": "recommendation text"
    }
}`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4.1-nano',
            messages: [
                { role: 'system', content: 'You are a fake review detection expert. Always respond with valid JSON only.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 2000
        });

        const content = response.choices[0].message.content;
        
        // Try to parse JSON from response
        try {
            // Find JSON in response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (parseError) {
            console.log('⚠️ Could not parse AI response as JSON');
        }
        
        // Return raw analysis if JSON parsing fails
        return {
            rawAnalysis: content,
            summary: {
                totalReviews: reviews.length,
                trustScore: 50,
                buyerRecommendation: "Analysis completed - see raw results"
            }
        };
        
    } catch (error) {
        console.error('❌ AI Analysis Error:', error.message);
        
        // Fallback: Basic pattern-based detection
        return performBasicAnalysis(reviews);
    }
}

// Fallback basic analysis without AI
function performBasicAnalysis(reviews) {
    const results = reviews.map((review, index) => {
        const text = review.text.toLowerCase();
        let fakeScore = 0;
        const reasons = [];
        
        // Check for fake review patterns
        if (text.includes('!!!') || (text.match(/!/g) || []).length > 3) {
            fakeScore += 20;
            reasons.push('Excessive exclamation marks');
        }
        
        if (text.toUpperCase() === text && text.length > 20) {
            fakeScore += 25;
            reasons.push('ALL CAPS text');
        }
        
        if (/best|amazing|perfect|excellent/i.test(text) && text.split(' ').length < 15) {
            fakeScore += 15;
            reasons.push('Generic superlatives with short length');
        }
        
        // Repetitive words
        const words = text.split(' ');
        const uniqueWords = new Set(words);
        if (words.length > 5 && uniqueWords.size / words.length < 0.5) {
            fakeScore += 30;
            reasons.push('Repetitive word patterns');
        }
        
        // Very short reviews with only positive words
        if (text.length < 50 && /great|love|best|amazing|perfect/i.test(text)) {
            fakeScore += 15;
            reasons.push('Suspiciously short positive review');
        }
        
        // Detailed reviews are usually genuine
        if (text.length > 150 && text.includes('.') && /but|however|although|though/i.test(text)) {
            fakeScore -= 20;
            reasons.push('Detailed with balanced opinion (likely genuine)');
        }
        
        const isFake = fakeScore >= 30;
        
        return {
            reviewNumber: index + 1,
            text: review.text.substring(0, 100) + '...',
            verdict: isFake ? 'LIKELY FAKE' : 'LIKELY GENUINE',
            confidence: Math.min(95, Math.max(30, 50 + fakeScore)),
            reasons: reasons.length > 0 ? reasons : ['No suspicious patterns detected']
        };
    });
    
    const fakeCount = results.filter(r => r.verdict === 'LIKELY FAKE').length;
    const fakePercentage = Math.round((fakeCount / reviews.length) * 100);
    const trustScore = Math.max(0, 100 - fakePercentage - 10);
    
    return {
        reviews: results,
        summary: {
            totalReviews: reviews.length,
            fakeCount: fakeCount,
            genuineCount: reviews.length - fakeCount,
            fakePercentage: fakePercentage,
            trustScore: trustScore,
            suspiciousPatterns: [
                'Excessive punctuation',
                'Generic superlatives',
                'Repetitive patterns',
                'Unusually short reviews'
            ],
            buyerRecommendation: trustScore >= 70 
                ? '✅ Reviews appear mostly genuine. Safe to trust.'
                : trustScore >= 40 
                    ? '⚠️ Mixed reviews detected. Read carefully before purchasing.'
                    : '❌ High fake review percentage. Be cautious!'
        }
    };
}

// Run analysis
let analysisResult;
try {
    analysisResult = await analyzeReviews(scrapedReviews);
} catch (error) {
    console.log('Using fallback analysis...');
    analysisResult = performBasicAnalysis(scrapedReviews);
}

// Prepare final output
const output = {
    productUrl: productUrl || 'N/A (reviews provided directly)',
    analyzedAt: new Date().toISOString(),
    totalReviewsAnalyzed: scrapedReviews.length,
    ...analysisResult,
    metadata: {
        actorVersion: '1.0.0',
        analysisMethod: analysisResult.rawAnalysis ? 'AI-powered (GPT)' : 'Pattern-based + AI',
        disclaimer: 'This analysis is for informational purposes only. Results are based on pattern recognition and AI analysis.'
    }
};

console.log('\n📊 ANALYSIS COMPLETE!');
console.log(`✅ Total Reviews: ${output.totalReviewsAnalyzed}`);
console.log(`🎯 Trust Score: ${output.summary?.trustScore || 'N/A'}/100`);
console.log(`⚠️ Fake Percentage: ${output.summary?.fakePercentage || 'N/A'}%`);

// Save results
await Actor.pushData(output);

// Set output for API users
await Actor.setValue('OUTPUT', output);

console.log('\n✨ Results saved! Check the Dataset tab for full analysis.');

await Actor.exit();
