import { buildDataset, Dataset } from "@chartcross/engine";
import rawSongs from "../../../data/songs.json";
import rawArtists from "../../../data/artists.json";

export const dataset: Dataset = buildDataset(rawSongs, rawArtists);
