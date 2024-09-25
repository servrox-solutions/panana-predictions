import AptUsdChart from "@/components/apt-usd-chart";

export default function Market({ params }: { params: { address: string } }) {
  return (
    <>
      <h1>Market Page</h1>
      <p className="break-words">{params.address}</p>
      <AptUsdChart />
    </>
  );
}
