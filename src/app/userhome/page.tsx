"use client";
import Link from "next/link";
import Profile from "../../components/Profile";
  
export default function Page() {

  return (
    <div className="bg-gray-900 p-6 rounded-lg w-full text-center">
      <Link className="text-orange-200" href="/toptracks">Play</Link>
      <Profile></Profile>
  </div>);
}
