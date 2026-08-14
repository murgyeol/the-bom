export interface Track {
  id: string;
  order: number;
  title: string;
  artist: string;
  filename: string;
  objectKey: string;
  duration: number;
  format: "wav" | "mp3";
  size: number;
}

export interface PublicTrack extends Omit<Track, "objectKey"> {
  streamUrl: string;
}

