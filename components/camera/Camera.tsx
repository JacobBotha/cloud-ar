import React, {useRef, useState, useCallback, useEffect } from 'react'
import styles from "./Camera.module.css"

const CAPTURE_OPTIONS = {
    audio: false,
    video: { facingMode: "environment" },
};

type CameraProps = {
  setRef?: (video: HTMLVideoElement) => void;
  setAsspectRatio?: (ratio: number) => void;
}

export default function Camera(props: CameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoSettings, setVideoSettings] = useState<MediaTrackSettings | null>(null);

  useEffect(() => {
    if (!videoRef) {
      return
    }
    navigator.mediaDevices.getUserMedia(CAPTURE_OPTIONS)
      .then(stream => {
        if (videoRef.current) {
          let video = videoRef.current;
          video.srcObject = stream;
          setVideoSettings(stream.getVideoTracks()[0].getSettings());
        }
      })

    if (props.setRef && videoRef.current) {
      props.setRef(videoRef.current);
    }

    if (props.setAsspectRatio && videoSettings) {
      if (videoSettings.aspectRatio) { 
        props.setAsspectRatio(videoSettings.aspectRatio)
      } else if(videoSettings.width && videoSettings.height) {
        props.setAsspectRatio(videoSettings.width / videoSettings.height);
      }
    }
  }, [videoRef])

  return (
    <video ref={videoRef} className={styles.camera} muted autoPlay hidden/>
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

