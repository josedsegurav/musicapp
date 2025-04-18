import Link from "next/link";
import Profile from "../../components/Profile";
  
export default function Page() {

  return (
    <div>
      <Link className="text-orange-200" href="/toptracks">Play</Link>
      <Profile></Profile>
  </div>
  );
}
