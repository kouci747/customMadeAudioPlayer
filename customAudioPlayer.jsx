import { FaPlay, FaPause, FaList } from 'react-icons/fa';
import { FaCirclePlay } from 'react-icons/fa6';
import { IoPlaySkipForward, IoPlaySkipBackSharp } from 'react-icons/io5';
import { FaRandom } from 'react-icons/fa';
import { TfiLoop } from 'react-icons/tfi';
import { FaPauseCircle } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import songsAPI from '@/apis/songs.api';

const MediaPlayer = () => {
  const [tracks, setTracks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioTime, setCurrentAudioTime] = useState(0);
  const [selectedTrackCFurl, setSelectedTrackCFurl] = useState(
    tracks[0]?.CFurl
  );
  const [selectedTrackTitle, setSelectedTrackTitle] = useState(
    tracks[0]?.title
  );
  const audioRef = useRef(new Audio());

  useEffect(() => {
    audioRef.current = new Audio(selectedTrackCFurl || '');
    console.log('audioRef.current', audioRef.current);
  }, [selectedTrackCFurl]);

  useEffect(() => {
    //getsongsAPI();
    const getsongsAPI = async () => {
      try {
        const myResponse = await songsAPI.getSongs().then((response) => {
          //console.log('mes chansons coté front', response);
          return response;
        });
        setTracks(myResponse);
        setSelectedTrackCFurl(myResponse[0]?.CFurl); //set the first to be mounted right after the fetch is completed to avoid that fucking undefined error
      } catch (error) {
        console.error(error);
      }
    };
    getsongsAPI();
  }, []);

  useEffect(() => {
    console.log('the tracks are', tracks);
    console.log('the first track in the list is', tracks[0]?.CFurl);
    console.log('the currently selected track is', selectedTrackCFurl);
  }, [selectedTrackCFurl, tracks]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    setCurrentAudioTime(0);
  };

  const handleNext = () => {
    const currentIndex = tracks.findIndex(
      (track) => track.CFurl === selectedTrackCFurl
    );
    const currentTitle = tracks.findIndex(
      (track) => track.title === selectedTrackTitle
    );
    const nextIndex = (currentIndex + 1) % tracks.length;
    setSelectedTrackCFurl(tracks[nextIndex]?.CFurl);
    setSelectedTrackTitle(tracks[nextIndex]?.title);
    audioRef.current.pause();
  };

  useEffect(() => {
    console.log('selectedTrackCFurl', selectedTrackCFurl);
  }, [selectedTrackCFurl]);

  const handlePrevious = () => {
    const currentIndex = tracks.findIndex(
      (track) => track.CFurl === selectedTrackCFurl
    );
    // Calculate the previous index, considering the possibility of negative values
    const previousIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    setSelectedTrackCFurl(tracks[previousIndex]?.CFurl);
    setSelectedTrackTitle(tracks[previousIndex]?.title);
    audioRef.current.pause();
  };

  useEffect(() => {
    //const audio = audioRef.current;
    const handleTimeUpdate = () => {
      setCurrentAudioTime(audioRef.current.currentTime);
    };
    const intervalId = setInterval(() => {
      handleTimeUpdate();
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  //console.log('la state tracks', tracks[0]?.title);

  useEffect(() => {
    const audio = audioRef.current;

    if (isPlaying) {
      audioRef.current.play();
      //console.log(audioRef.current.currentTime, 'currentAudioTime');
    } else {
      audioRef.current.pause();
    }

    if (isPlaying && currentAudioTime >= audio.duration) {
      setCurrentAudioTime(0);
      setIsPlaying(false);
    }

    // console.log('audio arreté à la seconde: ', audio.currentTime);
    // console.log('l audio dure: ', audio.duration);
    //setCurrentAudioTime(audio.currentTime); //LA CAUSE DU PROBLEME DE PERFORMANCE
  }, [isPlaying, audioRef.current.currentTime]);

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="bg-blue-800 justify-center max-h-full flex flex-col items-center">
      {/* {tracks.map((track) => {
        <div key={track._id}>
          <h1>{track.title}</h1>
        </div>;
      })} */}
      <div className="w-full flex justify-center items-center space-x-4">
        <FaRandom className="text-white hover:text-blue-500 cursor-pointer transition duration-300 transform hover:scale-110" />
        <IoPlaySkipBackSharp
          size={20}
          onClick={handlePrevious}
          className="text-white hover:text-blue-500 cursor-pointer transition duration-300 transform hover:scale-110"
        />
        {isPlaying ? (
          <FaPauseCircle
            size={40}
            onClick={handlePlayPause}
            className="text-white hover:text-blue-500 cursor-pointer transition duration-300 transform hover:scale-110"
          />
        ) : (
          <FaCirclePlay
            size={40}
            onClick={handlePlayPause}
            className="text-white hover:text-blue-500 cursor-pointer transition duration-300 transform hover:scale-220"
          />
        )}
        <IoPlaySkipForward
          size={20}
          onClick={handleNext}
          className="text-white hover:text-blue-500 cursor-pointer transition duration-300 transform hover:scale-110"
        />
        <TfiLoop
          color="white"
          className="text-white hover:text-blue-500 cursor-pointer transition duration-300 transform hover:scale-110"
        />
      </div>
      <div className="flex justify-between w-full">
        <div>
          <h2>{formatTime(audioRef.current.currentTime)}</h2>
        </div>
        <div>
          <h2>
            {selectedTrackTitle ? selectedTrackTitle : 'no audio selected'}
          </h2>
        </div>
        <div>
          <h2>{formatTime(audioRef.current.duration)}</h2>
        </div>
        {/* <div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            onChange={(e) => {
              audioRef.current.volume = e.target.value;
            }}
          />
        </div> */}
      </div>
      <input
        type="range"
        value={audioRef.current.currentTime}
        min="0"
        max={audioRef.current.duration}
        // step="1"
        onChange={(e) => {
          const newTime = parseFloat(e.target.value);
          setCurrentAudioTime(newTime);
          audioRef.current.currentTime = newTime;
        }}
        className="w-full"
      />
    </div>
  );
};

export default MediaPlayer;
