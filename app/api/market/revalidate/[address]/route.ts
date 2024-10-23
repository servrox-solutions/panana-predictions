import type { NextApiRequest, NextApiResponse } from 'next'
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
 
type ResponseData = {
  message: string
}
 
export async function POST(req: NextRequest, context: { params: Promise<{ address: string }> }) {

    const address = (await context.params).address;
    revalidatePath('/markets');
    revalidatePath('/eventmarkets');
    revalidatePath(`/markets/${address}`);
    revalidatePath(`/eventmarkets/${address}`);
    revalidatePath('/dashboard');
    console.log(`revalidated /markets /eventmarkets /marekts/${address} /eventmarkets/${address} /dashboard`);
    return NextResponse.json({ error: 'Revalidation succeeded.' }, { status: 200 });
}



