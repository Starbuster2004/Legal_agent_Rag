import requests
import time
from config import cfg

def chat(prompt: str, max_tokens: int = 2048) -> str:
    body = {'model': cfg.LLM_MODEL, 'messages':[{'role':'user','content':prompt}], 'max_tokens': max_tokens}
    
    # Try with retries and exponential backoff
    for attempt in range(3):
        try:
            r = requests.post('https://openrouter.ai/api/v1/chat/completions',
                              headers={
                                  'Authorization': f'Bearer {cfg.OPENROUTER_API_KEY}',
                                  'Content-Type': 'application/json',
                                  'HTTP-Referer': 'http://localhost:3000', # Optional, for including your app on openrouter.ai rankings.
                                  'X-Title': 'Legal Agent RAG', # Optional. Shows in rankings on openrouter.ai.
                              }, 
                              json=body, 
                              timeout=60)
            r.raise_for_status()
            j = r.json()
            return j.get('choices',[{}])[0].get('message',{}).get('content','')
        except requests.exceptions.RequestException as e:
            if attempt < 2:
                time.sleep(2 ** attempt)  # Wait 1s, then 2s, then 4s
                continue
            return f"Error calling OpenRouter API after {attempt+1} attempts: {str(e)}. Please check: 1) Internet connection, 2) API key validity at https://openrouter.ai/keys"
