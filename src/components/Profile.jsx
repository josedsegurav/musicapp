"use client";

import { useEffect, useState, useRef } from "react";
import * as SpotifyAPI from "../app/utils/spotifyApi";
import Image from "next/image";
import { Button } from "@/components/ui/button";
  
export default function Profile() {

const [error, setError] = useState(null);

const [profileInfo, setProfileInfo] = useState(null);
const [artistsInfo, setartistsInfo] = useState(null);
const [topTracks, setTopTracks] = useState(null);
const [controllerReady, setcontrollerReady] = useState(false);
const [loading, setLoading] = useState(true);
const [currentUri, setCurrentUri] = useState(0);
const embedRef = useRef(null);
const controllerRef = useRef(null);

useEffect(() => {
  async function init() {
    try {
      let token = localStorage.getItem("access_token");

      const profile = await SpotifyAPI.getProfile(token);
      const artists = await SpotifyAPI.getArtists(token);
      const tracks = await SpotifyAPI.fetchTracks(token);
      console.log(artists.items);
      console.log(tracks.items);

      if (!ignore) {
        setProfileInfo(profile);
        setartistsInfo(artists.items);
        setTopTracks(tracks.items);
        setLoading(false);
      }
    } catch (err) {
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

useEffect(() => {
  if (!topTracks || topTracks.length === 0 || !embedRef.current) {
    return; // Don't proceed if data isn't available yet
  }
  console.log('passed');
  window.onSpotifyIframeApiReady = (IFrameAPI) => {
    const options = {
      width: "100%",
      height: "200",
      uri: `spotify:track:${topTracks[currentUri].id}`,
    };

    IFrameAPI.createController(
      embedRef.current,
      options,
      (EmbedController) => {
        controllerRef.current = EmbedController;
        controllerRef.current.addListener("ready", () => {
          setcontrollerReady(true);
          console.log("ready");
        });
      }
    );
  };
}, [topTracks]);

return (
  <div className="bg-gray-900 p-6 rounded-lg w-full text-center">
    
    {error && <p className="text-red-500">Error: {error}</p>}
    {profileInfo && (
      <div className="space-y-4 flex flex-col items-center w-full">
        <h1 className="text-2xl font-bold text-orange-400 mb-4">
          Hi {profileInfo.display_name}
        </h1>

        <div className="mb-6">
          <div className="rounded-full overflow-hidden border-2 border-orange-500 shadow-lg shadow-orange-500/30">
            <Image
              alt={profileInfo.display_name}
              width={profileInfo.images[1].width}
              height={profileInfo.images[1].height}
              src={profileInfo.images[1].url}
              className="object-cover"
            />
          </div>
        </div>

        {artistsInfo && (
          <div className="w-full mb-8">
            <h2 className="text-xl font-bold text-orange-400 mb-4">
              Top Artists
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {artistsInfo.map((artist) => (
                <div
                  key={artist.id}
                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition duration-300"
                >
                  <div className="flex justify-center mb-2">
                    <div className="rounded-full overflow-hidden border border-orange-600">
                      <Image
                        alt={artist.name}
                        width={artist.images[2].width}
                        height={artist.images[2].height}
                        src={artist.images[2].url}
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <h3
                    className="text-white font-medium truncate"
                    key={artist.name}
                  >
                    {artist.name}
                  </h3>
                </div>
              ))}
            </div>
            
            
          </div>
        )}

        {topTracks && (
          <div className="w-full">
            {loading ? <div><p>Loading...</p></div> : 
            <div className="cols-8">
              <div ref={embedRef} id="embed-iframe"></div>
            </div> }
            <Button onClick={() => {
              setCurrentUri(currentUri - 1);
              controllerRef.current.loadUri(`spotify:track:${topTracks[currentUri - 1].id}`)
            }}>Previous</Button>
            <Button onClick={() => {
              setCurrentUri(currentUri + 1);
              controllerRef.current.loadUri(`spotify:track:${topTracks[currentUri + 1].id}`)
              }}>Next</Button>
            <h2 className="text-xl font-bold text-orange-400 mb-4">
              Top Tracks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {topTracks.map((track) => (
                <div
                  key={track.id}
                  className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition duration-300 flex items-center"
                >
                  <div
                    className="flex-1 text-left ml-2"
                    onClick={() => 
                      controllerRef.current.loadUri(track.uri)
                    }
                  >
                    <h3 className="text-white font-medium truncate">
                      {track.name}
                    </h3>
                    <p className="text-gray-400 text-sm truncate">
                      {track.artists[0].name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);
}