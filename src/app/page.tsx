"use client";

import Link from "next/link";
import * as SpotifyAPI from "../app/utils/spotifyApi";
import { useState, useEffect } from "react";

export default function Home() {
  // const [topTracks, setTopTracks] = useState(null);
  // const [playTracks, setPlayTracks] = useState(null);
  // const [profileInfo, setProfileInfo] = useState(null);
  const [error, setError] = useState(null);

  const client = process.env.SP_ID;
  useEffect(() => {
    async function init() {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (!code) {
          SpotifyAPI.redirectToAuthCodeFlow(client);
        } else {
          if (!ignore) {
         const token = await SpotifyAPI.getAccessToken(client, code);
         return token;
        }
          // const profile = await SpotifyAPI.getProfile(accessToken);
          // const tracks = await SpotifyAPI.fetchTracks(accessToken);
          // setPlayTracks(tracks);
          // let shuffledTracks = tracks.items
          //   .map((value: any) => ({ value, sort: Math.random() }))
          //   .sort((a: any, b: any) => a.sort - b.sort)
          //   .map(({ value }: any) => value)
          //   .slice(1, 11);

          //     setProfileInfo(profile);
          //     setTopTracks(shuffledTracks);
          //     setLoading(false);
          //   }


      }

      } catch (err: any) {
        console.error("Error:", err);
        setError(err.message);
      }
    }
    let ignore = false;
    init();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="">
      {error && <p className="text-red-500">Error: {error}</p>}
      <main className="flex flex-col justify-center h-screen items-center">
        <h1 className="text-orange-200">Top Tracks</h1>
        <Link className="text-orange-200" href="/userhome">Profile</Link>
        <Link className="text-orange-200" href="/toptracks">Play</Link>
      </main>
    </div>
  );
}
