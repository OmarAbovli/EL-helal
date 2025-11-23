'use server'

import * as fs from 'fs'
import * as path from 'path'

// Load .env.local manually - simpler approach
function loadEnvLocal() {
  try {
    const envLocalPath = path.resolve(process.cwd(), '.env.local')
    console.log('📂 Looking for .env.local at:', envLocalPath)
    
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, 'utf8')
      console.log('📄 File content:', content)
      
      // Parse manually
      const lines = content.split('\n')
      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=')
          const value = valueParts.join('=').trim()
          if (key && value) {
            process.env[key.trim()] = value
            console.log(`✅ Set ${key.trim()} = ${value.substring(0, 10)}...`)
          }
        }
      }
    } else {
      console.log('❌ .env.local file does not exist')
    }
  } catch (error) {
    console.error('❌ Failed to load .env.local:', error)
  }
}

// Load on module initialization
loadEnvLocal()

// ملف اختبار للتحقق من GROQ API KEY

export async function testGroqKey() {
  // TEMPORARY: Hardcoded API key for testing
  const apiKey = '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'
  
  console.log('=================================')
  console.log('🔍 Testing GROQ API Key (HARDCODED)')
  console.log('=================================')
  console.log('Key exists:', !!apiKey)
  console.log('Key length:', apiKey?.length || 0)
  console.log('Key starts with "gsk_":', apiKey?.startsWith('gsk_') || false)
  console.log('First 10 chars:', apiKey?.substring(0, 10) || 'N/A')
  console.log('Last 5 chars:', apiKey?.substring(apiKey.length - 5) || 'N/A')
  console.log('=================================')
  
  if (!apiKey) {
    return {
      success: false,
      error: 'GROQ_API_KEY not found',
    }
  }
  
  if (!apiKey.startsWith('gsk_')) {
    return {
      success: false,
      error: 'API key does not start with "gsk_"',
      firstChars: apiKey.substring(0, 20),
    }
  }
  
  // اختبار API call فعلي
  try {
    console.log('📡 Testing actual API call...')
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'user', content: 'Say "Hello"' }
        ],
        max_tokens: 10,
      }),
    })
    
    console.log('Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', errorText)
      return {
        success: false,
        error: `API returned ${response.status}: ${errorText}`,
      }
    }
    
    const data = await response.json()
    console.log('✅ API call successful!')
    
    return {
      success: true,
      message: 'API key is valid and working!',
      response: data.choices[0]?.message?.content,
    }
  } catch (error) {
    console.error('Test error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
