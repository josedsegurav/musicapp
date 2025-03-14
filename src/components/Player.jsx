import { useEffect, useState } from "react";

export default function Player({ tracks, currentTrack, optionsTracks }) {
  const [tracksButtons, setTracksButtons] = useState(optionsTracks);

  useEffect(() => {
    setTracksButtons(currentTrack, ...tracksButtons);
    tracksButtons
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }, [currentTrack]);

  console.log(tracksButtons + "player component");

  return (
    <div>
      {tracksButtons.map((track) => (
        <button key={track.id}>
          {track.artists.map((artist) => artist.name).join(", ")}
        </button>
      ))}
    </div>
  );
}
