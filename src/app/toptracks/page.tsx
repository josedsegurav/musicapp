"use client";
import MusicFetch from "../../components/MusicFetch";
import Link from "next/link";

import { useEffect, useState } from "react";
import * as SpotifyAPI from "../utils/spotifyApi";

export default function Page() {
//   const [profileInfo, setProfileInfo] = useState(null);

//   useEffect(() => {
//     async function init() {
//       try {
//         let token = localStorage.getItem("access_token");

//         const profile = await SpotifyAPI.getProfile(token);
//         console.log(profile);

//         if (!ignore) {
//           setProfileInfo(profile);
//         }
//       } catch (err) {
//         console.error("Error:", err);
//         // setError(err.message);
//       }
//     }
//     let ignore = false;
//     init();
//     return () => {
//       ignore = true;
//     };
//   }, []);

  return (
    <div>
        <Link className="text-orange-200" href="/dashboard">Profile</Link>
      <MusicFetch></MusicFetch>
    </div>
  );
}
