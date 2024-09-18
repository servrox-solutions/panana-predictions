// "use client";

// import { useState } from "react";

// import { Input } from "@/components/ui/input";

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Search } from "lucide-react";
// import { sampleMarkets, tradingPairs } from "@/lib/constants";
// import { MarketCard } from "./market-card";
// import { AvailableMarket } from "@/lib/get-available-markets";

// export interface MarketOrganizerProps {
//   markets: AvailableMarket[];
// }

// export function MarketOrganizer({ markets }: MarketOrganizerProps) {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedPair, setSelectedPair] = useState<string | null>(null);
//   const [markets] = useState(sampleMarkets);

//   const filteredMarkets = markets.filter(
//     (market) =>
//       market.key.toLowerCase().includes(searchTerm.toLowerCase()) &&
//       (!selectedPair || market.tradingPair === selectedPair)
//   );

//   return (
//     <div className="container mx-auto p-4 space-y-6">
//       {/* <h1 className="text-2xl font-bold">Markets</h1> */}
//       <div className="flex space-x-4">
//         <div className="relative flex-grow">
//           <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search markets..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-8"
//           />
//         </div>
//         <Select
//           onValueChange={(value) =>
//             setSelectedPair(value === "all" ? null : value)
//           }
//         >
//           <SelectTrigger className="w-[180px]">
//             <SelectValue placeholder="Select pair" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Pairs</SelectItem>
//             {tradingPairs.map((pair) => (
//               <SelectItem key={pair} value={pair}>
//                 {pair}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//         {filteredMarkets.map((market) => (
//           <MarketCard key={market.key} market={market} />
//         ))}
//       </div>
//       {filteredMarkets.length === 0 && (
//         <p className="text-center text-muted-foreground">No markets found</p>
//       )}
//     </div>
//   );
// }
