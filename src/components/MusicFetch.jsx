"use client";

import { useState, useEffect, useRef } from "react";
import * as SpotifyAPI from "../app/utils/spotifyApi";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link } from "lucide-react";

export default function MusicFetch() {
  const [topTracks, setTopTracks] = useState(null);
  const [playTracks, setPlayTracks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUri, setCurrentUri] = useState(0);
  const [controllerReady, setcontrollerReady] = useState(false);
  const [optionsTracks, setOptionsTracks] = useState();
  const [selection, setSelection] = useState(false);
  const [optionChosen, setOptionChosen] = useState(false);
  const [score, setScore] = useState(0);
  const [lastTrack, setLastTrack] = useState(false);
  const [displayResults, setDisplayResults] = useState(false);
  const embedRef = useRef(null);
  const controllerRef = useRef(null);

  const client = process.env.SP_ID;

  useEffect(() => {
    async function init() {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (!code) {
          SpotifyAPI.redirectToAuthCodeFlow(client);
        } else {
          const accessToken = await SpotifyAPI.getAccessToken(client, code);
          const tracks = await SpotifyAPI.fetchTracks(accessToken);
          setPlayTracks(tracks);
          let shuffledTracks = tracks.items
            .map((value) => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value).slice(1, 11);
          if (!ignore) {
            setTopTracks(shuffledTracks);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
        setLoading(false);
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

  function handleClick() {
    controllerRef.current.play();
    setTimeout(() => {
      controllerRef.current.pause();
    }, 4000);
    shuffleOptions();
    setIsPlaying(true);
  }

  function shuffleOptions() {
    let randomTracks = topTracks
      .filter((track) => track.id != topTracks[currentUri].id)
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
      .slice(1, 4);

    let newRandomTracks = [...randomTracks, topTracks[currentUri]]
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    setOptionsTracks(newRandomTracks);
  }

  function handleNext() {
    if (lastTrack) {
      setDisplayResults(true);
    } else {
      setCurrentUri(currentUri + 1);
      controllerRef.current.loadUri(
        `spotify:track:${topTracks[currentUri + 1].id}`
      );
      setIsPlaying(false);
      setSelection(false);
      setcontrollerReady(false);
      setTimeout(() => {
        setcontrollerReady(true);
      }, 3000);
      
    }
  }

  function handleSelection(e) {
    setSelection(true);

    if (topTracks.length === topTracks.indexOf(topTracks[currentUri]) + 1) {
      setLastTrack(true);
    }

    if (e.target.value === topTracks[currentUri].id) {
      setOptionChosen(true);
      setScore(score + 1);
    } else {
      setOptionChosen(false);
    }

    
  }

  return (
    <div>
      {loading && <p>Loading your top tracks...</p>}
      {error && <p>Error: {error}</p>}
      {topTracks && (
        <div>
          <h1>Top Tracks</h1>
          <div className="relative w-64 h-64">
            <div className="absolute top-0 left-0 w-64 h-64 z-10 bg-black"></div>
            <div className="absolute top-0 left-0 w-64 h-64 z-0">
              <div ref={embedRef} id="embed-iframe"></div>
            </div>
            {displayResults ? (
              <div className="flex flex-col justify-center items-center gap-9 w-64 absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] h-8 z-20">
                <span className="text-white text-center" >You did great! You do know your top songs</span>
                <AlertDialog className="block absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-8 h-8 z-20">
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">Get Results</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Score</AlertDialogTitle>
                      <AlertDialogDescription>You got {score} correct answers!</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <a href={"https://musicapp-phi-drab.vercel.app/"}><AlertDialogAction>
                    Play Again
                      </AlertDialogAction></a>
                      <AlertDialogCancel>
                       Close
                      </AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : isPlaying ? (
              <div
                className={
                  selection
                    ? "hidden"
                    : "absolute top-[5%] left-0 w-64 h-64 z-20 grid"
                }
              >
                {optionsTracks.map((track) => (
                  <AlertDialog key={track.id}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={handleSelection}
                        value={track.id}
                        autoFocus="false"
                      >
                        {track.artists.map((artist) => artist.name).join(", ")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      {optionChosen ? (
                        <AlertDialogTitle>Right Answer!!</AlertDialogTitle>
                      ) : (
                        <AlertDialogTitle>Sorry, wrong answer</AlertDialogTitle>
                      )}
                      <AlertDialogDescription>
                        <iframe
                          style={{ borderRadius: "12px" }}
                          src={`https://open.spotify.com/embed/track/${topTracks[currentUri].id}?utm_source=generator&theme=0`}
                          width="100%"
                          height="152"
                          frameBorder="0"
                          allowFullScreen=""
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                        ></iframe>
                        <span>This is your number {playTracks.items.indexOf(topTracks[currentUri]) + 1 } Top Track</span>
                      </AlertDialogDescription>
                      <AlertDialogFooter>
                        <AlertDialogAction asChild>
                          {lastTrack ? (
                            <Button
                              type="button"
                              onClick={handleNext}
                              autoFocus="false"
                            >
                              Close
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              onClick={handleNext}
                              autoFocus="false"
                            >
                              Next Song
                            </Button>
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ))}
              </div>
            ) : controllerReady ? (
              <Button
                className={
                  isPlaying
                    ? "hidden"
                    : "block absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-8 h-8 z-20"
                }
                onClick={handleClick}
                autoFocus="false"
              >
                Play
              </Button>
            ) : (
              <p
                className="block absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-8 h-8 z-20"
                autoFocus="false"
              >
                Loading...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
