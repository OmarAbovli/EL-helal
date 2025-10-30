import { NextResponse } from 'next/server'
import { sql } from '@/server/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Paymob Webhook: Received body', JSON.stringify(body, null, 2));

    // Paymob sends different shapes, try to extract order id
    const orderId = body?.order?.id ?? body?.order_id ?? body?.data?.id ?? null
    console.log('Paymob Webhook: Extracted orderId', orderId);

    if (!orderId) {
      console.error('Paymob Webhook: Missing order_id in payload');
      return NextResponse.json({ ok: false, error: 'missing_order_id' }, { status: 400 })
    }

    // Heuristics to detect paid
    const success = body?.success ?? body?.obj?.success ?? body?.is_paid ?? false
    console.log('Paymob Webhook: Extracted success status', success);

    if (success) {
      console.log(`Paymob Webhook: Payment successful for orderId ${orderId}. Updating purchase status.`);
      await sql`
        UPDATE purchases SET status = 'paid', paid_at = NOW()
        WHERE paymob_order_id = ${String(orderId)} OR paymob_order_id = ${String(orderId)}
      `
      console.log(`Paymob Webhook: Purchase status updated for orderId ${orderId}.`);
    } else {
      console.log(`Paymob Webhook: Payment not successful for orderId ${orderId}. Status: ${success}`);
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Paymob Webhook: Caught error', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
