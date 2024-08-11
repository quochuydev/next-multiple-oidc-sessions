import Home from "@/ui/Home";

export default async function Page({ params }: { params: { index: string } }) {
  console.log(`debug:params`, params);
  return <Home />;
}
