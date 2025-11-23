'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { testGroqKey } from '@/server/test-groq-key'

export default function TestKeyPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleTest = async () => {
    setLoading(true)
    try {
      const res = await testGroqKey()
      setResult(res)
      console.log('Test result:', res)
    } catch (error) {
      console.error('Error:', error)
      setResult({ error: 'Failed to test' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>🔑 Test Groq API Key</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleTest} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Testing...' : 'Test API Key'}
          </Button>

          {result && (
            <div className="mt-4">
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p>هذه الصفحة للاختبار فقط. افتح Console (F12) لرؤية التفاصيل.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
