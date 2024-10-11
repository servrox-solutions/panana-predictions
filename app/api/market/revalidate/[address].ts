import type { NextApiRequest, NextApiResponse } from 'next'
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
 
type ResponseData = {
  message: string
}
 
export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    console.log('param', JSON.stringify(searchParams))
    const param = searchParams.get("address");
    console.log(param)

    const address = '0x0';
    revalidatePath('/markets');
    revalidatePath('/eventmarkets');
    revalidatePath(`/markets/${address}`);
    revalidatePath(`/eventmarkets/${address}`);
    revalidatePath('/dashboard');
    console.log(`revalidated /markets /eventmarkets /marekts/${address} /eventmarkets/${address} /dashboard`);
    return NextResponse.json({ error: 'Revalidation succeeded.' }, { status: 200 });
    // res.({ message: 'revalidation succeeded.' });
    // res.status(200).json({ message: 'revalidation succeeded.' });
}



