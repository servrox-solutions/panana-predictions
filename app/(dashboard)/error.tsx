'use client' // Error components must be Client Components

import { Button } from '@/components/ui/button'
import { useEffect } from 'react'
import Image from 'next/Image';
import { Card } from '@/components/ui/card';


export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <Card className="flex flex-col justify-center w-full items-center gap-4 max-w-[500px] margin-auto absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
            <Image width="300" height="300" src="/mr_peeltos.png" alt="Mr_Peeltos" />
            <h2 className="font-bold text-xl text-center">Ups, this should not have happened.</h2>
            <Button
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
            >
                Try again
            </Button>
        </Card>
    )
}