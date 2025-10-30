"use client"

import { useState, useMemo } from "react"

const ALL_MONTHS = [
  { id: 'jan', label: 'يناير' },
  { id: 'feb', label: 'فبراير' },
  { id: 'mar', label: 'مارس' },
  { id: 'apr', label: 'أبريل' },
  { id: 'may', label: 'مايو' },
  { id: 'jun', label: 'يونيو' },
  { id: 'jul', label: 'يوليو' },
  { id: 'aug', label: 'أغسطس' },
  { id: 'sep', label: 'سبتمبر' },
  { id: 'oct', label: 'أكتوبر' },
  { id: 'nov', label: 'نوفمبر' },
  { id: 'dec', label: 'ديسمبر' },
]

export default function PaymobCheckoutPage() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [parentPhone, setParentPhone] = useState("")
  const [selectedMonths, setSelectedMonths] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const PRICE_PER_MONTH = Number(process.env.NEXT_PUBLIC_PRICE_PER_MONTH_EGP ?? process.env.PRICE_PER_MONTH_EGP ?? 50)

  const total = useMemo(() => selectedMonths.length * PRICE_PER_MONTH, [selectedMonths.length, PRICE_PER_MONTH])

  function toggleMonth(id: string) {
    setSelectedMonths((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!selectedMonths.length) return setError('الرجاء اختيار شهر واحد على الأقل')
    setLoading(true)
    try {
      const res = await fetch('/api/purchases/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, phone, parent_phone: parentPhone, months: selectedMonths }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || JSON.stringify(j) || 'Create failed')

      if (j.iframeUrl && j.claim) {
        // Open Paymob iframe in a new window to avoid iframe sandbox issues
        window.open(j.iframeUrl, '_blank', 'noopener')

        // Poll status by claim until paid, then finalize locally
        const claim = j.claim
        const start = Date.now()
        const timeoutMs = 1000 * 60 * 10 // 10 minutes

        while (Date.now() - start < timeoutMs) {
          // eslint-disable-next-line no-await-in-loop
          const st = await fetch(`/api/purchases/status?claim=${encodeURIComponent(claim)}`)
          // eslint-disable-next-line no-await-in-loop
          const sj = await st.json()
          if (sj?.ok && sj.status === 'paid') {
            // finalize: call complete endpoint which will create session and set cookie
            // eslint-disable-next-line no-await-in-loop
            const completeRes = await fetch('/api/purchases/complete', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ claim }),
            })
            // eslint-disable-next-line no-await-in-loop
            const completeJson = await completeRes.json()
            if (completeRes.ok && completeJson?.redirect) {
              window.location.href = completeJson.redirect
              return
            }
            break
          }
          // wait 3 seconds
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 3000))
        }
        setError('Timed out waiting for payment confirmation. If you paid, contact support.')
      } else {
        throw new Error('No iframe URL or claim returned')
      }
    } catch (err: any) {
      setError(err?.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <div className="bg-white dark:bg-zinc-900 shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-2">احصل على حساب - الدفع</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">اختر الشهور التي ترغب بالاشتراك في فيديوهاتها ثم اضغط "ادفع الآن".</p>
        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">اسم الطالب</label>
              <input className="w-full mt-1 p-3 border rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">موبايل الطالب</label>
              <input className="w-full mt-1 p-3 border rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">موبايل ولي الأمر (اختياري)</label>
              <input className="w-full mt-1 p-3 border rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">السعر للشهر الواحد</label>
              <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{PRICE_PER_MONTH} EGP</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">اختر الشهور</label>
            <div className="grid grid-cols-3 gap-2">
              {ALL_MONTHS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleMonth(m.id)}
                  className={`text-sm p-2 rounded-lg border ${selectedMonths.includes(m.id) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">المجموع</div>
              <div className="text-2xl font-bold">{total} EGP</div>
            </div>
            <div>
              <button className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow dark:bg-blue-500 dark:hover:bg-blue-600" disabled={loading}>{loading ? 'جاري الإعداد...' : 'ادفع الآن'}</button>
            </div>
          </div>

          {error && <div className="text-red-600 dark:text-red-400">{error}</div>}
        </form>
      </div>
      <p className="mt-6 text-sm text-gray-600">بعد الدفع ستتم إعادة توجيهك لإكمال إنشاء الحساب واختيار اسم المستخدم وكلمة المرور والصف.</p>
    </main>
  )
}
