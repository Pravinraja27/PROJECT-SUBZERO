import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# --- 1. GLOBAL MODEL TRAINING ---
try:
    df = pd.read_csv('phishing-data.csv')
    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(df['text'])
    y = df['label']
    model = LogisticRegression()
    model.fit(X, y)
    print("--- AI Model (v5 - Bait/Action/Topic) Trained Successfully ---")
except FileNotFoundError:
    print("ERROR: phishing-data.csv not found.")
    model = None

# --- 2. THE NEW, SMARTER ANALYSIS FUNCTION ---
def analyze_email(text):
    if model is None:
        return {"risk_level": "GRAY", "reason_text": "Error: AI model not loaded."}

    text_lower = text.lower()
    
    # --- STEP 1: "SAFETY WORD" CHECK ---
    # If the page is clearly informational, classify as SAFE and stop.
    safe_words = [
        "what is phishing", "learn about", "cybersecurity news", 
        "article by", "blog post", "tutorial", "guide to", 
        "how to spot", "definition of"
    ]
    for safe_word in safe_words:
        if safe_word in text_lower:
            return {
                "risk_level": "GREEN",
                "reason_text": f"This page appears to be a safe, informational article (mentions '{safe_word}')."
            }

    # --- STEP 2: "BAIT, ACTION, & TOPIC" CHECK ---
    # We now have 3 categories. A "RED" alert needs a Bait + Action.
    
    bait_score = 0
    action_score = 0
    topic_score = 0 # NEW CATEGORY
    ai_score = 0
    reasons = []

    # BAIT WORDS (Create Urgency/Fear)
    if "account suspended" in text_lower:
        bait_score = 3
        reasons.append("'account suspended'")
    if "urgent" in text_lower:
        bait_score = 1
        reasons.append("'urgent'")
    if "action required" in text_lower:
        bait_score = 1 # Downgraded to a low-risk trigger
        reasons.append("'action required'")
    if "unusual sign-in" in text_lower:
        bait_score = 3
        reasons.append("'unusual sign-in'")

    # ACTION WORDS (The "Trap" - asking for a direct, high-risk click)
    if "verify your account" in text_lower:
        action_score = 3
        reasons.append("'verify your account'")
    if "log in immediately" in text_lower:
        action_score = 3
        reasons.append("'log in immediately'")
    if "secure your account now" in text_lower:
        action_score = 3
        reasons.append("'secure your account now'")
    
    # TOPIC WORDS (Suspicious, but not an action. "password" is here now)
    if "password" in text_lower:
        topic_score = 1
        reasons.append("'password'")
    if "invoice" in text_lower:
        topic_score = 1
        reasons.append("'invoice'")
    if "payment" in text_lower:
        topic_score = 1
        reasons.append("'payment'")

    # AI Model (Just one vote)
    try:
        text_vector = vectorizer.transform([text])
        prediction = model.predict(text_vector)[0]
        if prediction == "PHISHING":
            ai_score = 1
            reasons.append("AI model suspicious")
    except:
        pass # Ignore model failure
    
    # --- STEP 3: FINAL SCORING ---
    
    total_score = 0
    
    # High-Risk: Must have both BAIT and ACTION.
    if bait_score > 0 and action_score > 0:
        total_score = 5 # Automatic RED alert
        reasons.append("Contains high-risk Bait + Action combo.")
    else:
        # Otherwise, just add up the individual scores
        total_score = bait_score + action_score + topic_score + ai_score

    reason_text = ". ".join(reasons)

    # A "RED" alert now requires a score of 5 (a true Bait+Action combo)
    if total_score >= 5:
        return {
            "risk_level": "RED",
            "reason_text": f"Danger: {reason_text or 'This page contains a high-risk combination of threats.'}"
        }
    # A "YELLOW" alert is for any other suspicious combination
    if total_score > 0:
        return {
            "risk_level": "YELLOW",
            "reason_text": f"Caution: {reason_text or 'This page contains suspicious keywords.'}"
        }

    # If score is 0
    return {
        "risk_level": "GREEN",
        "reason_text": "This page appears to be safe."
    }
    # --- ADD THIS NEW FUNCTION TO THE END OF model.py ---

# This function uses heuristics (patterns) to check a URL string
def analyze_url(url_string):
    risk_score = 0
    reasons = []

    # Make sure we have a string to check
    if not isinstance(url_string, str) or not url_string.strip():
        return {"risk_level": "GRAY", "reason_text": "No URL provided."}

    # Normalize the URL
    url_lower = url_string.lower().strip()

    # --- Heuristic Checks ---

    # 1. Check for HTTPS (the most basic check)
    if not url_lower.startswith("https://"):
        risk_score += 1
        reasons.append("Does not use HTTPS.")

    # 2. Check for suspicious Top-Level Domains (TLDs)
    suspicious_tlds = [
        ".xyz", ".top", ".info", ".biz", ".live", ".gq", ".loan", ".work"
    ]
    if any(tld in url_lower for tld in suspicious_tlds):
        risk_score += 2
        reasons.append("Uses a TLD often associated with spam.")

    # 3. Check for keywords in combination with suspicious TLDs
    login_keywords = ["login", "secure", "account", "verify", "password", "bank"]
    if any(kw in url_lower for kw in login_keywords) and any(tld in url_lower for tld in suspicious_tlds):
        risk_score += 3 # High risk
        reasons.append("Combines login keywords with a suspicious TLD.")
        
    # 4. Check for URL-shortener-like-patterns (often used to hide destinations)
    if "bit.ly" in url_lower or "t.co" in url_lower or "tinyurl" in url_lower:
        risk_score += 1
        reasons.append("Uses a URL shortener. Be cautious.")
        
    # 5. Check for special characters in the domain part
    if "@" in url_lower.split("/")[2]: # [2] gets the domain part
        risk_score += 3
        reasons.append("Contains an '@' symbol in the domain (a common trick).")

    # --- Final Scoring ---
    reason_text = " ".join(reasons)

    if risk_score >= 4:
        return {
            "risk_level": "RED",
            "reason_text": f"High Risk. {reason_text or 'This URL has multiple phishing indicators.'}"
        }
    if risk_score > 0:
        return {
            "risk_level": "YELLOW",
            "reason_text": f"Caution. {reason_text or 'This URL has suspicious properties.'}"
        }

    # If score is 0
    return {
        "risk_level": "GREEN",
        "reason_text": "This URL appears to be safe."
    }