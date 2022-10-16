import React, {useRef, useState, useCallback, useEffect } from 'react'
import styles from "./Camera.module.css"

const CAPTURE_OPTIONS = {
    audio: false,
    video: { facingMode: "environment" },
};

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (!videoRef) {
      return
    }
    navigator.mediaDevices.getUserMedia(CAPTURE_OPTIONS)
      .then(stream => {
        if (videoRef.current) {
          let video = videoRef.current
          video.srcObject = stream
        }
      })
  }, [videoRef])

  function togglePlay() {
    // setAspectRatio(videoRef.current.videoHeight, videoRef.current.videoWidth);

    if (videoRef.current) {
        console.log("Playing Video")
    }
    else {
      console.log("Video ref is null")!
    }
  }

  return (
    <video ref={videoRef} className={styles.camera} muted autoPlay/>
  );
}

function useCardRatio(initialRatio: number) {
  const [aspectRatio, setAspectRatio] = useState(initialRatio);

  const calculateRatio = useCallback((height: number, width: number) => {
    if (height && width) {
      const isLandscape = height <= width;
      const ratio = isLandscape ? width / height : height / width;

      setAspectRatio(ratio);
    }
  }, []);

  return [aspectRatio, calculateRatio];
}

