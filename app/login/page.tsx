import SiteHeader from "@/components/site-header"
import Link from "next/link"
import LoginForm from "@/components/login-form"

export default function LoginPage() {
  return (
    <main>
      <SiteHeader />
      <section className="relative flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950 dark:via-zinc-950 dark:to-teal-950">
        <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-8 px-4 py-12 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-semibold">Login to El-helal</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {
                "Use the username and password sent to you by your teacher. If you don’t have a username or password, you can get one by contacting your teacher."
              }
            </p>
            <div className="mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                                  <Link
                    href="https://wa.me/201503860035"
                    className="text-sm underline"
                  >
                                    لو عندك اي مشاكل في التسجيل او الدفع اضغط هنا لتتواصل معنا ❤️
                                  </Link>
                <Link
                  href="/paymob/checkout"
                  className="mt-3 inline-block rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 sm:mt-0"
                >
                  احصل على حساب
                </Link>
              </div>
            </div>
          </div>

          <LoginForm />
        </div>
      </section>
    </main>
  )
}
