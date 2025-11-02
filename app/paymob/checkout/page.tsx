"use client"

import { useState, useMemo, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const ALL_MONTHS = [
  { id: 1, label: 'يناير' },
  { id: 2, label: 'فبراير' },
  { id: 3, label: 'مارس' },
  { id: 4, label: 'أبريل' },
  { id: 5, label: 'مايو' },
  { id: 6, label: 'يونيو' },
  { id: 7, label: 'يوليو' },
  { id: 8, label: 'أغسطس' },
  { id: 9, label: 'سبتمبر' },
  { id: 10, label: 'أكتوبر' },
  { id: 11, label: 'نوفمبر' },
  { id: 12, label: 'ديسمبر' },
]

export default function PaymobCheckoutPage() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [parentPhone, setParentPhone] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [grade, setGrade] = useState<number | null>(null)
  const [teachers, setTeachers] = useState<any[]>([])
  const [teacherId, setTeacherId] = useState<string | null>(null)
  const [selectedMonths, setSelectedMonths] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/teachers')
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.length === 0) {
          setError("No teachers found. Please contact support.")
          return
        }
        setTeachers(data)
        if (data.length === 1) {
          setTeacherId(data[0].id)
        }
      })
  }, [])

  const PRICE_PER_MONTH = Number(process.env.NEXT_PUBLIC_PRICE_PER_MONTH_EGP ?? process.env.PRICE_PER_MONTH_EGP ?? 50)

  const total = useMemo(() => selectedMonths.length * PRICE_PER_MONTH, [selectedMonths.length, PRICE_PER_MONTH])

  function toggleMonth(id: number) {
    setSelectedMonths((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!teacherId) {
      setError("Please select a teacher.")
      return
    }
    if (!selectedMonths.length) return setError('الرجاء اختيار شهر واحد على الأقل')
    setLoading(true)
    try {
      const res = await fetch('/api/purchases/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, phone, parent_phone: parentPhone, months: selectedMonths, username, password, grade, teacher_id: teacherId, student_type: 'online' }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || JSON.stringify(j) || 'Create failed')

      if (j.iframeUrl) {
        // Redirect the user to the Paymob payment page
        window.location.href = j.iframeUrl
      } else {
        throw new Error('No iframe URL returned from server')
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">اسم المستخدم</label>
              <input className="w-full mt-1 p-3 border rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">كلمة المرور</label>
              <input className="w-full mt-1 p-3 border rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <Label>Grade</Label>
              <Select value={grade?.toString() ?? ""} onValueChange={(v) => setGrade(Number.parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">First year</SelectItem>
                  <SelectItem value="2">Second year</SelectItem>
                  <SelectItem value="3">Third year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {teachers.length > 1 && (
              <div>
                <Label>Teacher</Label>
                <Select value={teacherId?.toString() ?? ""} onValueChange={(v) => setTeacherId(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
              <button className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow dark:bg-blue-500 dark:hover:bg-blue-600" disabled={loading || !teacherId}>{loading ? 'جاري الإعداد...' : 'ادفع الآن'}</button>
            </div>
          </div>

          {error && <div className="text-red-600 dark:text-red-400">{error}</div>}
        </form>
      </div>
      <p className="mt-6 text-sm text-gray-600">بعد الدفع ستتم إعادة توجيهك لإكمال إنشاء الحساب واختيار اسم المستخدم وكلمة المرور والصف.</p>
    </main>
  )
}
