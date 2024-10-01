'use client';
import { cn } from '@/lib/utils'
import { ChevronsUp, ChevronsDown } from 'lucide-react'
import { Button } from './ui/button';

export const UpDownButtons = () => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <Button
                    className="group w-full font-semibold bg-gradient-to-r from-positive-1 to-positive-2 transition-all hover:to-green-500 text-white relative"
                // onClick={() => setBet("up")}
                >
                    <span className="z-10">Bet Up</span>
                    <ChevronsUp className="ml-2 h-4 w-4" />
                    <span
                        className={cn(
                            "absolute bottom-0 right-1 -mb-1 text-lg group-hover:text-4xl text-white/30",
                            // upWinFactor > downWinFactor ? "animate-pulse" : ""
                        )}
                    >
                        {/* &times;{upWinFactor.toFixed(2)} */}
                    </span>
                </Button>
            </div>

            <div className="flex-shrink flex flex-row flex-nowrap text-xs space-x-2 mx-2">
                {/* button spaceing */}
            </div>

            <div className="flex-1">
                <Button
                    className={`group w-full font-semibold bg-gradient-to-r from-negative-1 to-negative-2 transition-all hover:to-red-500 text-white relative`}
                // onClick={() => setBet("down")}
                >
                    <span className="z-10">Bet Down</span>
                    <ChevronsDown className="ml-2 h-4 w-4" />
                    <span
                        className={cn(
                            "absolute bottom-0 right-1 -mb-1 text-lg group-hover:text-4xl text-white/30",
                            // downWinFactor > upWinFactor ? "animate-pulse" : ""
                        )}
                    >
                        {/* &times;{downWinFactor.toFixed(2)} */}
                    </span>
                </Button>
            </div>
        </div>
    )
}