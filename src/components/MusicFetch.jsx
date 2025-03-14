"use client";

import { useState, useEffect, useRef } from "react";
import * as SpotifyAPI from "../app/utils/spotifyApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function MusicFetch() {
  const [topTracks, setTopTracks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUri, setCurrentUri] = useState(0);
  const [controllerReady, setcontrollerReady] = useState(false);
  const [optionsTracks, setOptionsTracks] = useState();
  const [selection, setSelection] = useState(false);
  const [optionChosen, setOptionChosen] = useState(false);
  const [score, setScore] = useState(0);
  const [lastTrack, setLastTrack] =useState(false);
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
          let shuffledTracks = tracks.items
            .map((value) => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
          setTopTracks(shuffledTracks);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
        setLoading(false);
      }
    }
    init();
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
    console.log(controllerRef.current);
    controllerRef.current.play();
    setTimeout(() => {
      controllerRef.current.pause();
    }, 7000);
    shuffleOptions();
    setIsPlaying(true);
    console.log(optionsTracks);
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
    if(lastTrack){
      
    }else{
      setCurrentUri(currentUri + 1);
      controllerRef.current.loadUri(
        `spotify:track:${topTracks[currentUri + 1].id}`
      );
      setIsPlaying(false);
      setSelection(false);
    }
    
  }

  function handleSelection(e) {
    console.log(topTracks.indexOf(topTracks[currentUri])+1)

    if(topTracks.length === (topTracks.indexOf(topTracks[currentUri])+1)){
      setLastTrack(true);
} 
    
        if (e.target.value === topTracks[currentUri].id) {
            setSelection(true);
            setOptionChosen(true);
            setScore(score + 1);
         
          }else {
            setSelection(true);
            setOptionChosen(false);
               
    }
    if (e.target.value === topTracks[currentUri].id) {
      setSelection(true);
      setOptionChosen(true);
      setScore(score + 1);
    } else {
      setSelection(true);
      setOptionChosen(false);
    }
  }

  console.log(selection);

  return (
    <div>
      {loading && <p>Loading your top tracks...</p>}
      {error && <p>Error: {error}</p>}
      {topTracks && (
        <div>
          <h1>Top Tracks</h1>
          <strong>{topTracks[currentUri].name}</strong>
          <div className="relative w-64 h-64">
            <div className="absolute top-0 left-0 w-64 h-64 z-10 bg-black"></div>
            <div className="absolute top-0 left-0 w-64 h-64 z-0">
              <div ref={embedRef} id="embed-iframe"></div>
            </div>
            {controllerReady ? (
              <Button
                className={
                  isPlaying
                    ? "hidden"
                    : "block absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-8 h-8 z-20"
                }
                onClick={handleClick}
              >
                Play
              </Button>
            ) : (
              <p className="block absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-8 h-8 z-20">
                Loading...
              </p>
            )}
            {isPlaying ? (
              <div
                className={
                  selection
                    ? "hidden"
                    : "absolute top-[5%] left-0 w-64 h-64 z-20 grid"
                }
              >
                {optionsTracks.map((track) => (
                  <Dialog key={track.id}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={handleSelection}
                        value={track.id}
                      >
                        {track.artists.map((artist) => artist.name).join(", ")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      {optionChosen ? (
                        <DialogTitle>Right Answer!!</DialogTitle>
                      ) : (
                        <DialogTitle>Sorry, wrong answer</DialogTitle>
                      )}
                      <DialogFooter>
                        <DialogClose asChild>
                          {lastTrack ? <Button type="button" onClick={handleNext}>
                          Close
                          </Button> : <Button type="button" onClick={handleNext}>
                          Next Song
                          </Button>} 
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            ) : (
              <></>
            )}
            {/* {selection ? (
              <div>
                {optionChosen ? (
                  <span>Right Answer!!</span>
                ) : (
                  <span>Sorry, wrong answer</span>
                )}
              </div>
            ) : (
              <></>
            )} */}
          </div>
        </div>
      )}
    </div>
  );
}
