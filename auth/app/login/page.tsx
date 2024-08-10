import Login from "@/ui/Login";

export default async function Page({
  searchParams,
}: {
  searchParams: {
    returnUrl: string;
  };
}) {
  const { returnUrl } = searchParams;

  return <Login returnUrl={returnUrl} />;
}
